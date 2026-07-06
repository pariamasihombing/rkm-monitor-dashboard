<?php

namespace App\Services;

use Carbon\Carbon;

class ProgressService
{
    /**
     * Calculate all metrics for a Program, Stage, or Subtask.
     * 
     * @param mixed $item The model instance
     * @param string $type 'program', 'stage', or 'subtask'
     * @return array
     */
    public function calculateMetrics($item, $type)
    {
        $now = Carbon::now();
        $planStart = Carbon::parse($item->plan_start);
        $planFinish = Carbon::parse($item->plan_finish);

        // 1. Expected Progress
        // Rumus: (Elapsed Time / Total Duration) * 100
        $totalDuration = $planStart->diffInDays($planFinish);
        $elapsedTime = $planStart->diffInDays($now, false);

        if ($now->lt($planStart)) {
            $expectedProgress = 0;
        } elseif ($now->gt($planFinish)) {
            $expectedProgress = 100;
        } else {
            $expectedProgress = $totalDuration > 0 ? ($elapsedTime / $totalDuration) * 100 : 100;
        }
        $expectedProgress = min(100, max(0, $expectedProgress));

        // 2. Actual Progress (Bottom-Up)
        $actualProgress = 0;
        if ($type === 'subtask') {
            $actualProgress = $item->actual_progress;
            // Force override jadi 100 jika status_id = 'Done' (ID 3)
            if ($item->id_status == 3 || (isset($item->status) && $item->status->name === 'Done')) {
                $actualProgress = 100;
            }
        } elseif ($type === 'stage') {
            $subtasks = $item->subtasks;
            if ($subtasks && $subtasks->count() > 0) {
                $totalActual = 0;
                foreach ($subtasks as $subtask) {
                    $metrics = $this->calculateMetrics($subtask, 'subtask');
                    $totalActual += $metrics['actual_progress'];
                }
                $actualProgress = $totalActual / $subtasks->count();
            }
        } elseif ($type === 'program') {
            $stages = $item->stages;
            if ($stages && $stages->count() > 0) {
                $totalActual = 0;
                foreach ($stages as $stage) {
                    $metrics = $this->calculateMetrics($stage, 'stage');
                    $totalActual += $metrics['actual_progress'];
                }
                $actualProgress = $totalActual / $stages->count();
            }
        }

        // 3. Gap
        // Rumus: Actual Progress - Expected Progress
        $gap = $actualProgress - $expectedProgress;

        // 4. Indicator
        $indicator = $this->determineIndicator($actualProgress, $expectedProgress, $planFinish, $gap);

        return [
            'expected_progress' => round($expectedProgress, 2),
            'actual_progress' => round($actualProgress, 2),
            'gap' => round($gap, 2),
            'indicator' => $indicator
        ];
    }

    /**
     * Determine status indicator based on priorities.
     */
    private function determineIndicator($actual, $expected, $planFinish, $gap)
    {
        $now = Carbon::now();

        // Priority 1: Completed
        if ($actual >= 100) {
            return "Completed";
        }

        // Priority 2: Overdue
        if ($now->gt($planFinish) && $actual < 100) {
            return "Overdue";
        }

        // Priority 3: Due Soon (<= 7 days)
        $daysToFinish = $now->diffInDays($planFinish, false);
        if ($daysToFinish <= 7 && $daysToFinish >= 0) {
            return "Due Soon";
        }

        // Priority 4: Behind
        if ($gap < 0) {
            return "Behind Expected";
        }

        // Default: On Track
        return "On Track";
    }

    /**
     * Generate Expected Line data for S-Curve.
     */
    public function getExpectedLine($program)
    {
        $planStart = Carbon::parse($program->plan_start);
        $planFinish = Carbon::parse($program->plan_finish);
        
        // Interval per minggu
        $currentDate = $planStart->copy();
        $expectedLine = [];
        $week = 0;

        while ($currentDate->lte($planFinish)) {
            $totalDuration = $planStart->diffInDays($planFinish);
            $elapsedTime = $planStart->diffInDays($currentDate);
            
            $progress = $totalDuration > 0 ? ($elapsedTime / $totalDuration) * 100 : 100;
            
            $expectedLine[] = [
                'week' => $week,
                'date' => $currentDate->toDateString(),
                'expected_progress' => round(min(100, $progress), 2)
            ];

            if ($currentDate->equalTo($planFinish)) break;
            
            $currentDate->addWeek();
            if ($currentDate->gt($planFinish)) {
                $currentDate = $planFinish->copy();
            }
            $week++;
        }
        
        return $expectedLine;
    }
}
