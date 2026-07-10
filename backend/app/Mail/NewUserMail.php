<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;

class NewUserMail extends Mailable
{
    public array $userData;

    public function __construct(array $userData)
    {
        $this->userData = $userData;
    }

    public function build(): self
    {
        return $this
            ->subject('Akun RKM Monitor Anda Telah Dibuat')
            ->view('emails.new_user')
            ->with([
                'userData' => $this->userData,
            ]);
    }
}
