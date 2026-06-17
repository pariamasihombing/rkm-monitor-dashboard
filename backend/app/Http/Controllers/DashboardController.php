<?php

namespace App\Http\Controllers;

class DashboardController extends Controller
{
    public function index()
    {
        return response()->json([
            'totalProgram' => 24,
            'totalTask' => 156,
            'onTrack' => 24,
            'behindExpected' => 24,
            'overdue' => 24,
            'dueSoon' => 24,
            'chartData' => [
                'trendChart' => [
                    'labels' => ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
                    'expected' => [10, 20, 35, 50, 65, 75],
                    'actual' => [15, 25, 40, 55, 65, 70],
                ],
                'statusBreakdown' => [
                    'labels' => ["Done", "On Progress", "Not Started", "Hold"],
                    'values' => [45, 30, 15, 10],
                    'colors' => ["#4CAF50", "#2196F3", "#FF9800", "#9C27B0"],
                ],
            ],
            'targetAchievement' => [
                'actualProgress' => 68,
                'expectedProgress' => 75,
                'gap' => -7,
            ],
        ]);
    }
}
