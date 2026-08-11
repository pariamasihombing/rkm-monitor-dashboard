<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ReminderEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $program;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($program)
    {
        $this->program = $program;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        $status = strtoupper($this->program['status'] ?? 'OVERDUE');
        $title = $this->program['title'] ?? 'Unknown Program';
        
        return $this->subject("[REMINDER] Program {$title} is {$status}")
                    ->view('emails.reminder');
    }
}
