<?php

namespace App\Http\Controllers;

use App\Models\Subtask;
use Illuminate\Http\Request;

class SubtaskController extends Controller
{
    public function show($id)
    {
        $subtask = Subtask::with(['stage', 'status'])->find($id);

        if (!$subtask) {
            return response()->json(['message' => 'Subtask not found'], 404);
        }

        return response()->json($subtask);
    }

    public function store(Request $request)
    {
        $this->validate($request, [
            'id_stage' => 'required|exists:stages,id_stage',
            'name' => 'required',
            'deliverable' => 'nullable',
            'id_status' => 'required|exists:statuses,id_status',
            'plan_start' => 'required',
            'plan_finish' => 'required',
            'file' => 'nullable|file|max:102400', // Max 100MB
        ], [
            'id_stage.required' => 'ID Tahapan harus diisi.',
            'id_stage.exists' => 'ID Tahapan tidak ditemukan di database.',
            'name.required' => 'Nama subtask harus diisi.',
            'id_status.required' => 'Status harus dipilih.',
            'id_status.exists' => 'Status yang dipilih tidak valid.',
            'plan_start.required' => 'Tanggal mulai harus diisi.',
            'plan_finish.required' => 'Tanggal selesai harus diisi.',
            'file.max' => 'Ukuran file maksimal adalah 100MB.',
        ]);

        $data = $request->all();

        // Handle date format DD/MM/YYYY if provided
        foreach (['plan_start', 'plan_finish'] as $field) {
            if ($request->has($field)) {
                $dateStr = $request->input($field);
                if (preg_match('/^\d{2}\/\d{2}\/\d{4}$/', $dateStr)) {
                    $parts = explode('/', $dateStr);
                    $data[$field] = "{$parts[2]}-{$parts[1]}-{$parts[0]}";
                }
            }
        }

        // Handle File Upload
        if ($request->hasFile('file')) {
            try {
                $file = $request->file('file');
                $uploadPath = base_path('public/uploads');
                
                // Ensure uploads directory exists and is writable
                if (!file_exists($uploadPath)) {
                    mkdir($uploadPath, 0755, true);
                }
                
                if (!is_writable($uploadPath)) {
                    chmod($uploadPath, 0755);
                }
                
                $fileName = time() . '_' . $file->getClientOriginalName();
                
                // Attempt to move the file
                if (!$file->move($uploadPath, $fileName)) {
                    throw new \Exception('Failed to move uploaded file to destination directory');
                }
                
                $data['file'] = $fileName;
            } catch (\Exception $e) {
                return response()->json([
                    'error' => 'File upload error: ' . $e->getMessage(),
                    'file' => 'Gagal mengunggah file. ' . $e->getMessage()
                ], 422);
            }
        }

        $subtask = Subtask::create($data);
        // Reload status relationship
        $subtask->load('status');
        return response()->json($subtask, 201);
    }

    public function update(Request $request, $id)
    {
        $subtask = Subtask::find($id);

        if (!$subtask) {
            return response()->json(['message' => 'Subtask tidak ditemukan.'], 404);
        }

        $this->validate($request, [
            'name' => 'string',
            'deliverable' => 'nullable',
            'id_status' => 'exists:statuses,id_status',
            'plan_start' => 'nullable',
            'plan_finish' => 'nullable',
            'file' => 'nullable|file|max:102400',
        ], [
            'name.string' => 'Nama subtask harus berupa teks.',
            'id_status.exists' => 'Status yang dipilih tidak valid.',
            'file.max' => 'Ukuran file maksimal adalah 100MB.',
        ]);

        $data = $request->all();

        // Handle date format DD/MM/YYYY if provided
        foreach (['plan_start', 'plan_finish'] as $field) {
            if ($request->has($field)) {
                $dateStr = $request->input($field);
                if (preg_match('/^\d{2}\/\d{2}\/\d{4}$/', $dateStr)) {
                    $parts = explode('/', $dateStr);
                    $data[$field] = "{$parts[2]}-{$parts[1]}-{$parts[0]}";
                }
            }
        }

        // Handle File Upload
        if ($request->hasFile('file')) {
            try {
                // Delete old file if exists
                if ($subtask->file && file_exists(base_path('public/uploads/' . $subtask->file))) {
                    unlink(base_path('public/uploads/' . $subtask->file));
                }

                $file = $request->file('file');
                $uploadPath = base_path('public/uploads');
                
                // Ensure uploads directory exists and is writable
                if (!file_exists($uploadPath)) {
                    mkdir($uploadPath, 0755, true);
                }
                
                if (!is_writable($uploadPath)) {
                    chmod($uploadPath, 0755);
                }
                
                $fileName = time() . '_' . $file->getClientOriginalName();
                
                // Attempt to move the file
                if (!$file->move($uploadPath, $fileName)) {
                    throw new \Exception('Failed to move uploaded file to destination directory');
                }
                
                $data['file'] = $fileName;
            } catch (\Exception $e) {
                return response()->json([
                    'error' => 'File upload error: ' . $e->getMessage(),
                    'file' => 'Gagal mengunggah file. ' . $e->getMessage()
                ], 422);
            }
        }

        $subtask->update($data);
        $subtask->load('status');
        return response()->json($subtask);
    }

    public function destroy($id)
    {
        $subtask = Subtask::find($id);

        if (!$subtask) {
            return response()->json(['message' => 'Subtask not found'], 404);
        }

        $subtask->delete();
        return response()->json(['message' => 'Subtask deleted successfully']);
    }
}
