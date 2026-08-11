<?php

namespace App\Http\Controllers;

use App\Models\Subtask;
use App\Models\Program;
use Carbon\Carbon;
use Illuminate\Http\Request;

class WeeklyMonitoringController extends Controller
{
    /**
     * Default empty response structure untuk fallback saat error.
     */
    private function emptyResponse(): array
    {
        return [
            'metrics' => [
                'dueThisWeek'       => 0,
                'completedThisWeek' => 0,
                'overdueCarryover'  => 0,
                'newlyStarted'      => 0,
            ],
            'tasks' => [],
            'overdueBehindTasks' => [],
        ];
    }

    /**
     * Returns metrics summary + task list for the Weekly Monitoring page.
     */
    public function index(Request $request)
    {
        try {
            // ============================================================
            // 1. TANGKAP & PARSE PARAMETER FILTER
            // ============================================================
            $startDate = $request->filled('start_date')
                ? Carbon::parse($request->start_date)->startOfDay()
                : Carbon::now()->startOfWeek();

            $endDate = $request->filled('end_date')
                ? Carbon::parse($request->end_date)->endOfDay()
                : Carbon::now()->endOfWeek();

            $programId = $request->program_id;
            $status    = $request->status;
            $search    = $request->search;

            // ============================================================
            // 2. BASE QUERY — filter program, status, search (TANPA tanggal)
            // ============================================================
            $baseQuery = Subtask::with(['stage.program', 'status']);
            $programBaseQuery = Program::with('status')->whereDoesntHave('stages.subtasks');

            // Filter by program_id
            if (!empty($programId) && $programId !== 'All') {
                $baseQuery->whereHas('stage.program', function ($q) use ($programId) {
                    $q->where('id_program', $programId);
                });
                $programBaseQuery->where('id_program', $programId);
            }

            // Filter by status name
            if (!empty($status) && $status !== 'All') {
                $baseQuery->whereHas('status', function ($q) use ($status) {
                    $q->where('name', $status);
                });
                $programBaseQuery->whereHas('status', function ($q) use ($status) {
                    $q->where('name', $status);
                });
            }

            // Filter by subtask name search
            if (!empty($search)) {
                $baseQuery->where(function ($q) use ($search) {
                    $q->where('name', 'LIKE', '%' . $search . '%')
                        ->orWhereHas('stage.program', function ($programQuery) use ($search) {
                            $programQuery->where('name', 'LIKE', '%' . $search . '%');
                        });
                });
                $programBaseQuery->where('name', 'LIKE', '%' . $search . '%');
            }

            // ============================================================
            // 3. HITUNG METRIK (clone dari $baseQuery, filter tanggal di sini)
            // ============================================================

            // dueThisWeek: plan_finish jatuh dalam rentang minggu ini
            $dueThisWeek = (clone $baseQuery)
                ->whereBetween('plan_finish', [
                    $startDate->toDateString(),
                    $endDate->toDateString(),
                ])
                ->count();

            // completedThisWeek: status Done DAN updated_at dalam minggu ini
            $completedThisWeek = (clone $baseQuery)
                ->where('id_status', 3)
                ->whereBetween('updated_at', [
                    $startDate->toDateTimeString(),
                    $endDate->toDateTimeString(),
                ])
                ->count();

            $completedProgramWithoutSubtask = (clone $programBaseQuery)
                ->where('id_status', 3)
                ->whereBetween('updated_at', [
                    $startDate->toDateTimeString(),
                    $endDate->toDateTimeString(),
                ])
                ->count();

            $completedThisWeek += $completedProgramWithoutSubtask;

            // overdueCarryover: plan_finish < start_date DAN belum selesai
            $overdueCarryover = (clone $baseQuery)
                ->where('plan_finish', '<', $startDate->toDateString())
                ->where('id_status', '!=', 3)
                ->count();

            // newlyStarted: plan_start jatuh dalam rentang minggu ini
            $newlyStarted = (clone $baseQuery)
                ->whereBetween('plan_start', [
                    $startDate->toDateString(),
                    $endDate->toDateString(),
                ])
                ->count();

            // ============================================================
            // 4. DATA TABEL — Daftar subtask yang Due This Week
            // ============================================================
            $tasks = (clone $baseQuery)
                ->whereBetween('plan_finish', [
                    $startDate->toDateString(),
                    $endDate->toDateString(),
                ])
                ->where('id_status', '!=', 3)
                ->orderBy('plan_finish', 'asc')
                ->get()
                ->map(fn ($subtask) => $this->formatTask($subtask));

            $today = Carbon::now()->startOfDay();
            $overdueBehindTasks = (clone $baseQuery)
                ->where('id_status', '!=', 3)
                ->orderBy('plan_finish', 'asc')
                ->get()
                ->filter(function ($subtask) use ($today) {
                    $actual = $this->actualProgressFromStatus($subtask);
                    $expected = $this->expectedProgressFromTimeline($subtask, $today);
                    $deadline = $subtask->plan_finish ? Carbon::parse($subtask->plan_finish)->startOfDay() : null;
                    $isOverdue = $deadline && $deadline->lt($today);

                    return $isOverdue || $actual < $expected;
                })
                ->values()
                ->map(function ($subtask) use ($today) {
                    $task = $this->formatTask($subtask);
                    $deadline = $subtask->plan_finish ? Carbon::parse($subtask->plan_finish)->startOfDay() : null;
                    $actual = $task['actualProgress'];
                    $expected = $this->expectedProgressFromTimeline($subtask, $today);
                    $isOverdue = $deadline && $deadline->lt($today);

                    return array_merge($task, [
                        'expectedProgress' => $expected,
                        'gapProgress'      => max(0, $expected - $actual),
                        'daysLate'         => $isOverdue ? $deadline->diffInDays($today) : 0,
                        'alertType'        => $isOverdue ? 'Overdue' : 'Behind',
                    ]);
                });

            // ============================================================
            // 5. RETURN JSON
            // ============================================================
            return response()->json([
                'metrics' => [
                    'dueThisWeek'       => $dueThisWeek,
                    'completedThisWeek' => $completedThisWeek,
                    'overdueCarryover'  => $overdueCarryover,
                    'newlyStarted'      => $newlyStarted,
                ],
                'tasks' => $tasks,
                'overdueBehindTasks' => $overdueBehindTasks,
            ]);

        } catch (\Exception $e) {
            return response()->json(array_merge($this->emptyResponse(), [
                '_error' => config('app.debug') ? $e->getMessage() : null,
            ]));
        }
    }

    private function actualProgressFromStatus($subtask): int
    {
        if ((int) ($subtask->id_status ?? 0) === 3) {
            return 100;
        }

        if ((int) ($subtask->id_status ?? 0) === 2) {
            return (int) (($subtask->actual_progress ?? 0) > 0 ? $subtask->actual_progress : 50);
        }

        return (int) ($subtask->actual_progress ?? 0);
    }

    private function expectedProgressFromTimeline($task, Carbon $today): int
    {
        if (empty($task->plan_start) || empty($task->plan_finish)) {
            return 0;
        }

        $start = Carbon::parse($task->plan_start)->startOfDay();
        $finish = Carbon::parse($task->plan_finish)->startOfDay();

        if ($today->lt($start)) {
            return 0;
        }

        if ($today->gte($finish)) {
            return 100;
        }

        $totalDays = max(1, $start->diffInDays($finish) + 1); // Inklusif
        $elapsedDays = max(0, $start->diffInDays($today) + 1); // Inklusif

        return (int) round(($elapsedDays / $totalDays) * 100);
    }

    private function formatTask($subtask): array
    {
        return [
            'id'             => $subtask->id_subtask,
            'programId'      => optional($subtask->stage?->program)->id_program ?? null,
            'programName'    => optional($subtask->stage?->program)->name ?? '-',
            'stageName'      => optional($subtask->stage)->name ?? '-',
            'subtaskName'    => $subtask->name,
            'deadline'       => $subtask->plan_finish,
            'status'         => optional($subtask->status)->name ?? '-',
            'actualProgress' => $this->actualProgressFromStatus($subtask),
        ];
    }
}
