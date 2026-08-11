<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\ReminderEmail;

class NotificationController extends Controller
{
    /**
     * Send email reminders for a list of programs.
     * Expected payload: { "programs": [ { "title": "...", "status": "OVERDUE", "picEmail": "...", "vpEmail": "..." } ] }
     */
    public function sendReminders(Request $request)
    {
        $programs = $request->input('programs');

        if (!$programs || !is_array($programs) || count($programs) === 0) {
            return response()->json(['message' => 'No programs to process.'], 200);
        }

        $sentCount = 0;

        foreach ($programs as $program) {
            // picEmail bisa berisi beberapa email dipisahkan koma: "a@x.com,b@x.com"
            $rawPicEmails = $program['picEmail'] ?? 'pic@pelindo.co.id';
            $picEmails = array_filter(array_map('trim', explode(',', $rawPicEmails)));
            $vpEmail = $program['vpEmail'] ?? 'vp@pelindo.co.id';

            // Gabungkan semua penerima (PIC + VP), hilangkan duplikat
            $allRecipients = array_unique(array_merge($picEmails, [$vpEmail]));

            // Note: Make sure MAIL_USERNAME and MAIL_PASSWORD are set in .env
            try {
                Mail::to($allRecipients)->send(new ReminderEmail($program));
                $sentCount++;
            } catch (\Exception $e) {
                // Log error or continue to next
                \Log::error("Failed to send reminder for program: " . ($program['title'] ?? 'Unknown') . ". Error: " . $e->getMessage());
            }
        }

        return response()->json([
            'message' => "Successfully sent $sentCount email reminders.",
            'count' => $sentCount
        ], 200);
    }
}
