<?php

namespace App\Http\Controllers;

use App\Models\Stage;
use Illuminate\Http\Request;

class StageController extends Controller
{
    public function store(Request $request)
    {
        $this->validate($request, [
            'id_program' => 'required|exists:programs,id_program',
            'name' => 'required',
            'id_status' => 'required|exists:statuses,id_status',
            'plan_start' => 'required|date',
            'plan_finish' => 'required|date',
        ], [
            'id_program.required' => 'ID Program harus diisi.',
            'id_program.exists' => 'ID Program tidak ditemukan.',
            'name.required' => 'Nama tahapan harus diisi.',
            'id_status.required' => 'Status harus dipilih.',
            'id_status.exists' => 'Status yang dipilih tidak valid.',
            'plan_start.required' => 'Tanggal mulai harus diisi.',
            'plan_start.date' => 'Format tanggal mulai tidak valid.',
            'plan_finish.required' => 'Tanggal selesai harus diisi.',
            'plan_finish.date' => 'Format tanggal selesai tidak valid.',
        ]);

        $stage = Stage::create($request->all());
        
        return response()->json($stage, 201);
    }

    public function update(Request $request, $id)
    {
        $stage = Stage::find($id);

        if (!$stage) {
            return response()->json(['message' => 'Tahapan tidak ditemukan.'], 404);
        }

        $this->validate($request, [
            'name' => 'string',
            'id_status' => 'exists:statuses,id_status',
            'plan_start' => 'date',
            'plan_finish' => 'date',
        ], [
            'name.string' => 'Nama tahapan harus berupa teks.',
            'id_status.exists' => 'Status yang dipilih tidak valid.',
            'plan_start.date' => 'Format tanggal mulai tidak valid.',
            'plan_finish.date' => 'Format tanggal selesai tidak valid.',
        ]);

        $stage->update($request->all());
        return response()->json($stage);
    }

    public function show($id)
    {
        $stage = Stage::with(['status', 'subtasks.status', 'program'])->find($id);

        if (!$stage) {
            return response()->json(['message' => 'Stage not found'], 404);
        }

        return response()->json($stage);
    }

    public function destroy($id)
    {
        $stage = Stage::find($id);

        if (!$stage) {
            return response()->json(['message' => 'Stage not found'], 404);
        }

        $stage->delete();
        return response()->json(['message' => 'Stage deleted successfully']);
    }
}
