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

            // Filter by program_id
            if (!empty($programId) && $programId !== 'All') {
                $baseQuery->whereHas('stage.program', function ($q) use ($programId) {
                    $q->where('id_program', $programId);
                });
            }

            // Filter by status name
            if (!empty($status) && $status !== 'All') {
                $baseQuery->whereHas('status', function ($q) use ($status) {
                    $q->where('name', $status);
                });
            }

            // Filter by subtask name search
            if (!empty($search)) {
                $baseQuery->where('name', 'LIKE', '%' . $search . '%');
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

            // completedThisWeek: actual_progress = 100 DAN updated_at dalam minggu ini
            $completedThisWeek = (clone $baseQuery)
                ->where('actual_progress', 100)
                ->whereBetween('updated_at', [
                    $startDate->toDateTimeString(),
                    $endDate->toDateTimeString(),
                ])
                ->count();

            // overdueCarryover: plan_finish < start_date DAN belum selesai
            $overdueCarryover = (clone $baseQuery)
                ->where('plan_finish', '<', $startDate->toDateString())
                ->where('actual_progress', '<', 100)
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
                ->orderBy('plan_finish', 'asc')
                ->get()
                ->map(function ($subtask) {
                    return [
                        'id'             => $subtask->id_subtask,
                        'programId'      => optional($subtask->stage?->program)->id_program ?? null,
                        'programName'    => optional($subtask->stage?->program)->name ?? '-',
                        'stageName'      => optional($subtask->stage)->name ?? '-',
                        'subtaskName'    => $subtask->name,
                        'deadline'       => $subtask->plan_finish,
                        'status'         => optional($subtask->status)->name ?? '-',
                        'actualProgress' => $subtask->actual_progress ?? 0,
                    ];
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
            ]);

        } catch (\Exception $e) {
            return response()->json(array_merge($this->emptyResponse(), [
                '_error' => config('app.debug') ? $e->getMessage() : null,
            ]));
        }
    }
}
