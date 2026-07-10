/**
 * RBAC helpers — aturan hak akses aplikasi.
 *
 * - Admin: akses penuh (Kelola Akun, tambah/edit/hapus data).
 * - Guest: read-only (hanya melihat, tanpa menu Kelola Akun & tanpa tombol aksi CRUD).
 */

const FULL_ACCESS_ROLES = ["Admin"];

/** Role pengguna yang sedang login, dibaca dari localStorage. */
export function getUserRole(): string {
  return localStorage.getItem("userRole") || "Guest";
}

/** Apakah role boleh mengelola data (tambah/edit/hapus) & mengakses Kelola Akun? */
export function canManage(): boolean {
  return FULL_ACCESS_ROLES.includes(getUserRole());
}

