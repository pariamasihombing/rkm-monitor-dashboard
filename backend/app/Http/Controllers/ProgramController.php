<?php

namespace App\Http\Controllers;

use App\Models\Program;
use Illuminate\Http\Request;

class ProgramController extends Controller
{
    protected $progressService;

    public function __construct(\App\Services\ProgressService $progressService)
    {
        $this->progressService = $progressService;
    }

    public function index(Request $request)
    {
        // Build base query with eager loading
        $query = Program::with(['status', 'pics', 'stages.status', 'stages.subtasks.status']);

        // === A. Filter Database (sebelum ->get()) ===

        // Filter Status (via relasi status)
        if ($request->filled('status') && $request->status !== 'All') {
            $query->whereHas('status', function ($q) use ($request) {
                $q->where('name', $request->status);
            });
        }

        // Filter PIC (Cek di relasi 'pics' ATAU di kolom 'pic' langsung)
        if ($request->filled('pic') && $request->pic !== 'All') {
            $keyword = $request->pic;
            $query->where(function($q) use ($keyword) {
                $q->whereHas('pics', function ($q2) use ($keyword) {
                    $q2->where('name', 'LIKE', '%' . $keyword . '%');
                })->orWhere('pic', 'LIKE', '%' . $keyword . '%');
            });
        }

        // Filter Search (nama program)
        if ($request->filled('search')) {
            $query->where('name', 'LIKE', '%' . $request->search . '%');
        }

        // Filter Program ID
        if ($request->filled('program_id')) {
            $query->where('id_program', $request->program_id);
        }

        // Filter Date (plan_start <= date <= plan_finish)
        if ($request->filled('date')) {
            $query->where('plan_start', '<=', $request->date)
                  ->where('plan_finish', '>=', $request->date);
        }

        $programs = $query->get();
        
        // === Transform: hitung metrics via ProgressService ===
        $programs->transform(function ($program) {
            $metrics = $this->progressService->calculateMetrics($program, 'program');
            $program->expected_progress = $metrics['expected_progress'];
            $program->actual_progress = $metrics['actual_progress'];
            $program->gap = $metrics['gap'];
            $program->indicator = $metrics['indicator'];

            $program->stages->transform(function ($stage) {
                $stageMetrics = $this->progressService->calculateMetrics($stage, 'stage');
                $stage->expected_progress = $stageMetrics['expected_progress'];
                $stage->actual_progress = $stageMetrics['actual_progress'];
                $stage->gap = $stageMetrics['gap'];
                $stage->indicator = $stageMetrics['indicator'];

                $stage->subtasks->transform(function ($subtask) {
                    $subtaskMetrics = $this->progressService->calculateMetrics($subtask, 'subtask');
                    $subtask->expected_progress = $subtaskMetrics['expected_progress'];
                    $subtask->actual_progress = $subtaskMetrics['actual_progress'];
                    $subtask->gap = $subtaskMetrics['gap'];
                    $subtask->indicator = $subtaskMetrics['indicator'];
                    return $subtask;
                });

                return $stage;
            });

            return $program;
        });

        // === B. Filter Memory (setelah transform, karena indicator dihitung dinamis) ===

        // Filter Alarm (indicator: On Track, Behind, Due Soon, Overdue, Completed)
        if ($request->filled('alarm') && $request->alarm !== 'All') {
            $programs = $programs->filter(function ($program) use ($request) {
                return $program->indicator === $request->alarm;
            });
        }

        return response()->json($programs->values());
    }

    public function show($id)
    {
        // Mengambil detail program beserta tahapan (stages) dan subtasks-nya
        $program = Program::with(['status', 'stages.status', 'stages.subtasks.status'])
            ->find($id);

        if (!$program) {
            return response()->json(['message' => 'Program not found'], 404);
        }

        // Calculate Program Metrics
        $programMetrics = $this->progressService->calculateMetrics($program, 'program');
        $program->expected_progress = $programMetrics['expected_progress'];
        $program->actual_progress = $programMetrics['actual_progress'];
        $program->gap = $programMetrics['gap'];
        $program->indicator = $programMetrics['indicator'];

        // S-Curve Data
        $program->expected_line = $this->progressService->getExpectedLine($program);
        $program->actual_line = \Illuminate\Support\Facades\DB::table('program_progress_logs')
            ->where('id_program', $id)
            ->orderBy('recorded_at', 'asc')
            ->get();

        // Calculate Stage Metrics
        $program->stages->transform(function ($stage) {
            $stageMetrics = $this->progressService->calculateMetrics($stage, 'stage');
            $stage->expected_progress = $stageMetrics['expected_progress'];
            $stage->actual_progress = $stageMetrics['actual_progress'];
            $stage->gap = $stageMetrics['gap'];
            $stage->indicator = $stageMetrics['indicator'];

            // Calculate Subtask Metrics
            $stage->subtasks->transform(function ($subtask) {
                $subtaskMetrics = $this->progressService->calculateMetrics($subtask, 'subtask');
                $subtask->expected_progress = $subtaskMetrics['expected_progress'];
                $subtask->actual_progress = $subtaskMetrics['actual_progress'];
                $subtask->gap = $subtaskMetrics['gap'];
                $subtask->indicator = $subtaskMetrics['indicator'];
                return $subtask;
            });

            return $stage;
        });

        return response()->json($program);
    }

    public function store(Request $request)
    {
        $this->validate($request, [
            'name' => 'required',
            'type' => 'required|in:RKM,Non RKM',
            'id_status' => 'required|exists:statuses,id_status',
            'plan_start' => 'required|date',
            'plan_finish' => 'required|date',
        ], [
            'name.required' => 'Nama program harus diisi.',
            'type.required' => 'Tipe program harus diisi.',
            'type.in' => 'Tipe program harus RKM atau Non RKM.',
            'id_status.required' => 'Status harus dipilih.',
            'id_status.exists' => 'Status yang dipilih tidak valid.',
            'plan_start.required' => 'Tanggal mulai harus diisi.',
            'plan_start.date' => 'Format tanggal mulai tidak valid.',
            'plan_finish.required' => 'Tanggal selesai harus diisi.',
            'plan_finish.date' => 'Format tanggal selesai tidak valid.',
        ]);

        $program = Program::create($request->all());
        return response()->json($program, 201);
    }

    public function update(Request $request, $id)
    {
        $program = Program::find($id);

        if (!$program) {
            return response()->json(['message' => 'Program tidak ditemukan.'], 404);
        }

        $this->validate($request, [
            'name' => 'string',
            'type' => 'in:RKM,Non RKM',
            'id_status' => 'exists:statuses,id_status',
            'plan_start' => 'date',
            'plan_finish' => 'date',
        ], [
            'name.string' => 'Nama program harus berupa teks.',
            'type.in' => 'Tipe program harus RKM atau Non RKM.',
            'id_status.exists' => 'Status yang dipilih tidak valid.',
            'plan_start.date' => 'Format tanggal mulai tidak valid.',
            'plan_finish.date' => 'Format tanggal selesai tidak valid.',
        ]);

        $program->update($request->all());
        return response()->json($program);
    }

    public function destroy($id)
    {
        $program = Program::find($id);

        if (!$program) {
            return response()->json(['message' => 'Program not found'], 404);
        }

        $program->delete();
        return response()->json(['message' => 'Program deleted successfully']);
    }
}
