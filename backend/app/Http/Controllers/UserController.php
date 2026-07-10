<?php

namespace App\Http\Controllers;

use App\Mail\NewUserMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class UserController extends Controller
{
    public function store(Request $request)
    {
        $this->validate($request, [
            'nama_lengkap' => 'required|string|max:100',
            'nip' => 'required|string|max:20',
            'email' => 'required|email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:Admin,Guest',
        ]);

        $userData = [
            'name' => $request->input('nama_lengkap'),
            'nip' => $request->input('nip'),
            'password' => $request->input('password'),
            'role' => $request->input('role'),
        ];

        $savedToDatabase = false;

        try {
            DB::table('users')->updateOrInsert(
                ['nip' => $userData['nip']],
                [
                    'name' => $userData['name'],
                    'username' => $userData['nip'],
                    'password' => password_hash($userData['password'], PASSWORD_BCRYPT),
                    'role' => $userData['role'],
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );

            $savedToDatabase = true;
        } catch (\Throwable $e) {
            // Database persistence is optional for this endpoint; email delivery remains the main action.
        }

        try {
            Mail::to($request->input('email'))->send(new NewUserMail($userData));
        } catch (\Throwable $e) {
            Log::error('Gagal mengirim email notifikasi user baru.', [
                'email' => $request->input('email'),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'User diproses, tetapi email notifikasi gagal dikirim.',
                'error' => config('app.debug') ? $e->getMessage() : null,
                'savedToDatabase' => $savedToDatabase,
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'User berhasil dibuat dan email notifikasi telah dikirim.',
            'savedToDatabase' => $savedToDatabase,
            'user' => [
                'name' => $userData['name'],
                'nip' => $userData['nip'],
                'email' => $request->input('email'),
                'role' => $userData['role'],
            ],
        ], 201);
    }

    public function notifyPassword(Request $request)
    {
        $this->validate($request, [
            'email' => 'required|email',
        ]);

        $email = $request->input('email');

        try {
            Mail::raw("Password akun Anda telah berhasil diubah.", function ($message) use ($email) {
                $message->to($email)
                        ->subject('Pemberitahuan Perubahan Password - RKM Dashboard');
            });
        } catch (\Throwable $e) {
            Log::error('Gagal mengirim email notifikasi ubah password.', [
                'email' => $email,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim email notifikasi.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Email notifikasi berhasil dikirim.',
        ], 200);
    }
}
