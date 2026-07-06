<?php

namespace App\Http\Controllers;

class DashboardController extends Controller
{
    protected $progressService;

    public function __construct(\App\Services\ProgressService $progressService)
    {
        $this->progressService = $progressService;
    }

    public function index(\Illuminate\Http\Request $request)
    {
        // ============================================================
        // DEFAULT RESPONSE — dikembalikan jika terjadi error apapun
        // ============================================================
        $emptyResponse = [
            'totalProgram'      => 0,
            'totalTask'         => 0,
            'onTrack'           => 0,
            'behindExpected'    => 0,
            'overdue'           => 0,
            'dueSoon'           => 0,
            'chartData'         => [
                'trendChart'      => ['labels' => [], 'expected' => [], 'actual' => []],
                'statusBreakdown' => ['labels' => [], 'values'  => [], 'colors' => []],
            ],
            'targetAchievement' => ['actualProgress' => 0, 'expectedProgress' => 0, 'gap' => 0],
            'alerts'            => [],
        ];

        try {
            // ============================================================
            // 1. BASE QUERY — eager-load semua relasi yang dibutuhkan
            // ============================================================
            $query = \App\Models\Program::with([
                'status',
                'pics',
                'stages.subtasks',
            ]);

            // ============================================================
            // 2. FILTER STATUS
            // ============================================================
            if ($request->filled('status') && $request->status !== 'All') {
                $query->whereHas('status', function ($q) use ($request) {
                    $q->where('name', $request->status);
                });
            }

            // ============================================================
            // 3. FILTER PIC
            // ============================================================
            if ($request->filled('pic') && $request->pic !== 'All') {
                $keyword = $request->pic;
                $query->where(function($q) use ($keyword) {
                    $q->whereHas('pics', function ($q2) use ($keyword) {
                        $q2->where('name', 'LIKE', '%' . $keyword . '%');
                    })->orWhere('pic', 'LIKE', '%' . $keyword . '%');
                });
            }

            // ============================================================
            // 4. FILTER SEARCH
            // ============================================================
            if ($request->filled('search')) {
                $query->where('name', 'LIKE', '%' . $request->search . '%');
            }

            // ============================================================
            // 4B. FILTER DATE
            // ============================================================
            if ($request->filled('date')) {
                $query->where('plan_start', '<=', $request->date)
                      ->where('plan_finish', '>=', $request->date);
            }

            // ============================================================
            // 5. EKSEKUSI QUERY
            // ============================================================
            $programs = $query->get();

            // ============================================================
            // 6. HITUNG METRIK
            // ============================================================
            $today        = \Carbon\Carbon::today();
            $totalProgram = $programs->count();
            $totalTask    = 0;
            $onTrack      = 0;
            $behindExpected = 0;
            $overdue      = 0;
            $dueSoon      = 0;

            foreach ($programs as $program) {

                // --- Hitung overall_progress program (rata-rata subtask) ---
                $subtaskCount    = 0;
                $progressSum     = 0;

                foreach ($program->stages ?? [] as $stage) {
                    foreach ($stage->subtasks ?? [] as $subtask) {
                        $subtaskCount++;
                        $totalTask++;
                        $progressSum += (int) ($subtask->actual_progress ?? 0);
                    }
                }

                $overallProgress = $subtaskCount > 0
                    ? (int) round($progressSum / $subtaskCount)
                    : 0;

                // --- Hitung expected_progress berdasarkan posisi hari ini di timeline ---
                $planStart  = $program->plan_start  ? \Carbon\Carbon::parse($program->plan_start)  : null;
                $planFinish = $program->plan_finish  ? \Carbon\Carbon::parse($program->plan_finish) : null;

                $expectedProgress = 0;
                if ($planStart && $planFinish && $planFinish->gt($planStart)) {
                    $totalDays   = $planStart->diffInDays($planFinish);
                    $elapsedDays = $planStart->diffInDays($today, false); // negatif jika belum mulai
                    $elapsedDays = max(0, min($elapsedDays, $totalDays));
                    $expectedProgress = (int) round(($elapsedDays / $totalDays) * 100);
                }

                $isDone = $overallProgress >= 100;

                // --- Kategorisasi Alarm ---
                if ($isDone) {
                    // Program selesai → On Track, tidak overdue/behind
                    $onTrack++;
                } elseif ($planFinish && $today->gt($planFinish)) {
                    // Batas waktu sudah lewat, belum selesai → Overdue
                    $overdue++;
                } elseif ($planFinish && $today->diffInDays($planFinish, false) <= 7 && $today->lte($planFinish)) {
                    // Dalam 7 hari ke depan → Due Soon
                    $dueSoon++;
                } elseif ($overallProgress >= $expectedProgress) {
                    // Progress aktual ≥ ekspektasi → On Track
                    $onTrack++;
                } else {
                    // Progress aktual < ekspektasi → Behind Expected
                    $behindExpected++;
                }

                // Simpan hasil kalkulasi ke objek untuk dipakai di getAlerts()
                $program->_overallProgress  = $overallProgress;
                $program->_expectedProgress = $expectedProgress;
                $program->_planFinish       = $planFinish;
                $program->_isDone           = $isDone;
            }

            // ============================================================
            // 7. FILTER ALARM (di memory, setelah hitung)
            // ============================================================
            if ($request->filled('alarm') && $request->alarm !== 'All') {
                $alarmFilter = $request->alarm; // e.g. 'On Track', 'Overdue', 'Behind Expected', 'Due Soon'

                $programs = $programs->filter(function ($program) use ($alarmFilter, $today) {
                    $isDone        = $program->_isDone;
                    $planFinish    = $program->_planFinish;
                    $overallProg   = $program->_overallProgress;
                    $expectedProg  = $program->_expectedProgress;

                    if ($alarmFilter === 'On Track') {
                        return $isDone
                            || (
                                $planFinish && !$today->gt($planFinish)
                                && ($today->diffInDays($planFinish, false) > 7)
                                && $overallProg >= $expectedProg
                            );
                    }
                    if ($alarmFilter === 'Behind Expected') {
                        return !$isDone && $planFinish && !$today->gt($planFinish)
                            && ($today->diffInDays($planFinish, false) > 7)
                            && $overallProg < $expectedProg;
                    }
                    if ($alarmFilter === 'Overdue') {
                        return !$isDone && $planFinish && $today->gt($planFinish);
                    }
                    if ($alarmFilter === 'Due Soon') {
                        return !$isDone && $planFinish
                            && $today->diffInDays($planFinish, false) <= 7
                            && $today->lte($planFinish);
                    }
                    return true;
                });

                // Recalculate totals setelah alarm filter
                $totalProgram   = $programs->count();
                $onTrack        = 0; $behindExpected = 0; $overdue = 0; $dueSoon = 0;
                $totalTask      = 0;
                foreach ($programs as $program) {
                    foreach ($program->stages ?? [] as $stage) {
                        $totalTask += $stage->subtasks ? $stage->subtasks->count() : 0;
                    }
                }
            // Re-assign sesuai filter
                if ($alarmFilter === 'On Track')        $onTrack       = $totalProgram;
                if ($alarmFilter === 'Behind Expected') $behindExpected = $totalProgram;
                if ($alarmFilter === 'Overdue')         $overdue       = $totalProgram;
                if ($alarmFilter === 'Due Soon')        $dueSoon       = $totalProgram;
            }

            // ============================================================
            // 8. CALCULATE TARGET ACHIEVEMENT
            // ============================================================
            $totalActualProgress = 0;
            $totalExpectedProgress = 0;
            $programCount = $programs->count();

            foreach ($programs as $program) {
                $totalActualProgress += $program->_overallProgress ?? 0;
                $totalExpectedProgress += $program->_expectedProgress ?? 0;
            }

            $avgActualProgress = $programCount > 0 ? round($totalActualProgress / $programCount, 1) : 0;
            $avgExpectedProgress = $programCount > 0 ? round($totalExpectedProgress / $programCount, 1) : 0;
            $gap = round($avgActualProgress - $avgExpectedProgress, 1);

            $targetAchievement = [
                'actualProgress' => $avgActualProgress,
                'expectedProgress' => $avgExpectedProgress,
                'gap' => $gap,
            ];

            // ============================================================
            // 9. CALCULATE STATUS BREAKDOWN
            // ============================================================
            $statusCounts = [];
            foreach ($programs as $program) {
                $statusName = optional($program->status)->name ?? 'Not Started';
                if (!isset($statusCounts[$statusName])) {
                    $statusCounts[$statusName] = 0;
                }
                $statusCounts[$statusName]++;
            }

            $statusLabels = [];
            $statusValues = [];
            $statusColors = [];
            $colorMap = [
                'Done' => '#009E6D',
                'On Progress' => '#2196F3',
                'Not Started' => '#9CA3AF',
                'Hold' => '#F59E0B',
            ];

            foreach ($statusCounts as $label => $count) {
                $statusLabels[] = $label;
                $statusValues[] = $count;
                $statusColors[] = $colorMap[$label] ?? '#9CA3AF';
            }

            $statusBreakdown = [
                'labels' => $statusLabels,
                'values' => $statusValues,
                'colors' => $statusColors,
            ];

            // ============================================================
            // 10. CALCULATE TREND CHART (6 Months)
            // ============================================================
            $trendLabels = [];
            $trendExpected = [];
            $trendActual = [];

            for ($i = 5; $i >= 0; $i--) {
                $monthDate = (clone $today)->subMonths($i);
                $monthLabel = $monthDate->format('M'); // 'Jan', 'Feb', dst

                // Programs that started in this month
                $programsInMonth = $programs->filter(function ($p) use ($monthDate) {
                    if (!$p->plan_start) return false;
                    $ps = \Carbon\Carbon::parse($p->plan_start);
                    return $ps->year == $monthDate->year && $ps->month == $monthDate->month;
                });

                $countInMonth = $programsInMonth->count();
                $avgAct = 0;
                $avgExp = 0;

                if ($countInMonth > 0) {
                    $avgAct = round($programsInMonth->avg('_overallProgress'), 1);
                    $avgExp = round($programsInMonth->avg('_expectedProgress'), 1);
                }

                $trendLabels[] = $monthLabel;
                $trendExpected[] = $avgExp;
                $trendActual[] = $avgAct;
            }

            $trendChart = [
                'labels' => $trendLabels,
                'expected' => $trendExpected,
                'actual' => $trendActual,
            ];

            // ============================================================
            // 11. RETURN RESPONSE LENGKAP
            // ============================================================
            return response()->json([
                'totalProgram'      => $totalProgram,
                'totalTask'         => $totalTask,
                'onTrack'           => $onTrack,
                'behindExpected'    => $behindExpected,
                'overdue'           => $overdue,
                'dueSoon'           => $dueSoon,
                'chartData'         => [
                    'trendChart'      => $trendChart,
                    'statusBreakdown' => $statusBreakdown,
                ],
                'targetAchievement' => $targetAchievement,
                'alerts'            => $this->getAlerts($programs, $today),
            ]);

        } catch (\Exception $e) {
            return response()->json(array_merge($emptyResponse, [
                '_error' => config('app.debug') ? $e->getMessage() : null,
            ]));
        }
    }

    private function getAlerts($programs, \Carbon\Carbon $today = null)
    {
        $today  = $today ?? \Carbon\Carbon::today();
        $alerts = [];

        foreach ($programs as $program) {
            $isDone     = $program->_isDone     ?? false;
            $planFinish = $program->_planFinish ?? null;

            // Masuk alerts jika: overdue, due soon, atau behind expected
            $isOverdue  = !$isDone && $planFinish && $today->gt($planFinish);
            $isDueSoon  = !$isDone && $planFinish
                && $today->diffInDays($planFinish, false) <= 7
                && $today->lte($planFinish);
            $isBehind   = !$isDone && !$isOverdue && !$isDueSoon
                && (($program->_overallProgress ?? 0) < ($program->_expectedProgress ?? 0));

            if ($isOverdue || $isDueSoon || $isBehind) {
                $alarmLabel = $isOverdue ? 'OVERDUE' : ($isDueSoon ? 'DUE_SOON' : 'BEHIND_EXPECTED');

                $alerts[] = [
                    'id'        => $program->id_program ?? $program->id,
                    'programId' => $program->id_program ?? $program->id,
                    'title'     => $program->name,
                    'status'    => $alarmLabel,
                    'date'      => $planFinish
                        ? $planFinish->format('d M Y')
                        : '-',
                ];
            }
        }

        return array_slice($alerts, 0, 10);
    }
}
