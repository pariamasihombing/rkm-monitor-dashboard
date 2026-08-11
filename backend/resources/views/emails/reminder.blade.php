<!DOCTYPE html>
<html>
<head>
    <title>Reminder: Program {{ $program['title'] ?? 'Unknown' }} is {{ strtoupper($program['status'] ?? 'OVERDUE') }}</title>
</head>
<body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <h2>Pemberitahuan Status Program</h2>
    <p>Yth. Bapak/Ibu,</p>
    
    <p>Melalui email ini kami informasikan bahwa terdapat program yang memerlukan perhatian dan tindak lanjut segera. Berikut adalah detail program tersebut:</p>
    
    <table style="width: 100%; max-width: 600px; border-collapse: collapse; margin-top: 15px; margin-bottom: 20px;">
        <tr>
            <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold; width: 35%;">Nama Program</td>
            <td style="padding: 10px; border: 1px solid #ddd;">{{ $program['title'] ?? 'N/A' }}</td>
        </tr>
        <tr>
            <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Status Saat Ini</td>
            <td style="padding: 10px; border: 1px solid #ddd; color: {{ strtoupper($program['status'] ?? '') == 'OVERDUE' ? '#E9004A' : '#F15300' }}; font-weight: bold;">
                {{ strtoupper($program['status'] ?? 'OVERDUE') }}
            </td>
        </tr>
        <tr>
            <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Tenggat Waktu (Deadline)</td>
            <td style="padding: 10px; border: 1px solid #ddd;">{{ $program['date'] ?? $program['deadline'] ?? '-' }}</td>
        </tr>
        <tr>
            <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">PIC</td>
            <td style="padding: 10px; border: 1px solid #ddd;">{{ $program['pic'] ?? '-' }}</td>
        </tr>
    </table>
    
    <p>Harap segera berkoordinasi dengan tim terkait untuk menindaklanjuti program yang saat ini berstatus <strong>{{ strtoupper($program['status'] ?? 'OVERDUE') }}</strong>.</p>
    
    <p>Terima kasih atas perhatian dan kerjasamanya.</p>
    
    <br/>
    <p style="font-size: 12px; color: #888;">
        Email ini dikirimkan secara otomatis oleh sistem RKM Monitor Dashboard. Mohon untuk tidak membalas pesan ini.
    </p>
</body>
</html>
