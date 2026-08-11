import { apiUrl } from "./api";
// KAMUS DATA EMAIL (Lookup Table)
// Anda bisa menambahkan nama PIC/VP dan email aslinya di sini.
const emailDictionary: Record<string, string> = {
  "Pariama Valentino": "pariamavalentino391@gmail.com",
  "Reza": "REZAHIDAYAT@PELINDO.CO.ID",
  "VP Surya": "REZAHIDAYAT@PELINDO.CO.ID",
  "Hendra": "HENDRA@PELINDO.CO.ID",
  "Raghi": "RDKRISWANDI@PELINDO.CO.ID",
  "VP Joni": "JILYAS@PELINDO.CO.ID"
};

// Fungsi bantuan untuk mencari email dari nama di kamus
const findEmailByName = (name: string, fallback: string) => {
  // Mencari nama di kamus, jika tidak ketemu, gunakan fallback
  return emailDictionary[name] || fallback;
};

export const sendReminders = async (programs: any[]) => {
  const targetPrograms = programs.filter(p => {
    const status = (p.programStatus || p.status || "").toUpperCase();
    return status === "OVERDUE" || status === "DUE SOON";
  });

  if (targetPrograms.length === 0) {
    console.log("[EMAIL API] Tidak ada program yang Overdue atau Due Soon untuk dikirim.");
    return 0;
  }

  try {
    const programsWithEmails = targetPrograms.map(p => {
      // Format pic: "Reza | Hendra, Raghi | VP Joni"
      // Bagian sebelum | pertama = PIC Utama
      // Bagian setelah | terakhir = VP
      const rawPic: string = p.pic || "";
      const segments = rawPic.split("|").map((s: string) => s.trim());

      const picUtama = segments[0] || "";      // "Reza"
      const vpSegment = segments[segments.length - 1] || ""; // "VP Joni"

      // Cari email di kamus untuk PIC Utama
      const picEmail = p.picEmail
        || findEmailByName(picUtama, "pic@pelindo.co.id");

      // Cari email di kamus untuk VP
      const vpEmail = p.vpEmail
        || findEmailByName(vpSegment, "vp@pelindo.co.id");

      console.log(`[EMAIL] Program: ${p.title || p.name} | PIC Utama: "${picUtama}" → ${picEmail} | VP: "${vpSegment}" → ${vpEmail}`);

      return { ...p, picEmail, vpEmail };
    });

    const response = await fetch(apiUrl("/api/reminders/send"), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ programs: programsWithEmails })
    });

    const result = await response.json();
    console.log("[EMAIL API SUCCESS]", result.message);
    return result.count || 0;
  } catch (error) {
    console.error("[EMAIL API ERROR] Gagal mengirim email:", error);
    return 0;
  }
};
