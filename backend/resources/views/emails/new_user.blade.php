<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Akun Anda Telah Dibuat</title>
</head>
<body style="margin:0; padding:0; background:#F3F6FA; font-family:Arial, Helvetica, sans-serif; color:#1F2937;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%; background:#F3F6FA; padding:32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="width:100%; max-width:640px; background:#FFFFFF; border-radius:14px; overflow:hidden; box-shadow:0 12px 32px rgba(15, 23, 42, 0.12);">
                    <tr>
                        <td style="background:#0C4B7D; padding:34px 28px; text-align:center; color:#FFFFFF;">
                            <div style="font-size:46px; line-height:1; margin-bottom:14px;">&#128272;</div>
                            <h1 style="margin:0; font-size:28px; line-height:1.25; font-weight:800; color:#FFFFFF;">
                                Akun Anda Telah Dibuat
                            </h1>
                            <p style="margin:10px 0 0; font-size:15px; line-height:1.5; color:#D9ECFA; font-weight:600;">
                                Dashboard RKM Monitor Pelindo
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:32px 34px 10px; background:#FFFFFF;">
                            <p style="margin:0 0 16px; font-size:16px; line-height:1.7; color:#334155;">
                                Halo <strong style="color:#0F172A;">{{ $userData['name'] }}</strong>,
                                Akun Anda telah berhasil dibuat oleh Admin. Berikut informasi login akun Anda:
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:0 34px 26px; background:#FFFFFF;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%; border-collapse:collapse; border:1px solid #DCE4EF; border-radius:10px; overflow:hidden;">
                                <tr>
                                    <td style="width:34%; padding:15px 18px; background:#F8FAFC; border-bottom:1px solid #DCE4EF; color:#64748B; font-size:14px; font-weight:700;">
                                        Username
                                    </td>
                                    <td style="padding:15px 18px; border-bottom:1px solid #DCE4EF; color:#2563EB; font-size:15px; font-weight:800;">
                                        {{ $userData['nip'] }}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:15px 18px; background:#F8FAFC; border-bottom:1px solid #DCE4EF; color:#64748B; font-size:14px; font-weight:700;">
                                        Password
                                    </td>
                                    <td style="padding:15px 18px; border-bottom:1px solid #DCE4EF; color:#DC2626; font-size:15px; font-weight:800;">
                                        {{ $userData['password'] }}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:15px 18px; background:#F8FAFC; color:#64748B; font-size:14px; font-weight:700;">
                                        Role
                                    </td>
                                    <td style="padding:15px 18px; color:#0F172A; font-size:15px; font-weight:800;">
                                        {{ $userData['role'] }}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:0 34px 34px; background:#FFFFFF;">
                            <div style="background:#EFF6FF; border:1px solid #BFDBFE; border-radius:10px; padding:14px 16px;">
                                <p style="margin:0; font-size:13px; line-height:1.6; color:#1E3A8A;">
                                    Demi keamanan, segera ganti password setelah berhasil login pertama kali.
                                </p>
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td style="background:#F8FAFC; padding:18px 28px; text-align:center; border-top:1px solid #E2E8F0;">
                            <p style="margin:0; font-size:12px; line-height:1.5; color:#94A3B8;">
                                Email ini dikirim otomatis oleh RKM Monitor Dashboard System.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
