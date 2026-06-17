<?php

namespace App\Http\Controllers;

use App\Models\Program;
use Illuminate\Http\Request;

class ProgramController extends Controller
{
    public function index()
    {
        // Mengambil semua program beserta status, tahapan, dan subtask untuk menghitung progress
        $programs = Program::with(['status', 'stages.subtasks'])->get();
        return response()->json($programs);
    }

    public function show($id)
    {
        // Mengambil detail program beserta tahapan (stages) dan subtasks-nya
        $program = Program::with(['status', 'stages.status', 'stages.subtasks.status'])
            ->find($id);

        if (!$program) {
            return response()->json(['message' => 'Program not found'], 404);
        }

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
