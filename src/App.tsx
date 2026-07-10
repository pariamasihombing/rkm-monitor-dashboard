import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RKM from "./pages/RKM";
import NonRKM from "./pages/NonRKM";
import WeeklyMonitoring from "./pages/WeeklyMonitoring";
import ProgramDetail from "./pages/ProgramDetail";
import TahapanDetail from "./pages/TahapanDetail";
import PICDashboard from "./pages/PICDashboard";
import PICRKM from "./pages/PICRKM";
import PICNonRKM from "./pages/PICNonRKM";
import PICWeeklyMonitoring from "./pages/PICWeeklyMonitoring";
import PICAmbahProgram from "./pages/PICAmbahProgram";
import PICAmbahSubtask from "./pages/PICAmbahSubtask";
import PICAmbahTahapan from "./pages/PICAmbahTahapan";
import PICProgramDetail from "./pages/PICProgramDetail";
import PICTahapanDetail from "./pages/PICTahapanDetail";
import PICEditProgram from "./pages/PICEditProgram";
import PICEditTahapan from "./pages/PICEditTahapan";
import PICEditSubtask from "./pages/PICEditSubtask";
import SubtaskDetail from "./pages/SubtaskDetail";
import ManageUsers from "./pages/ManageUsers";
import PengaturanAkun from "./pages/PengaturanAkun";
import { canManage } from "./utils/rbac";

/** Route guard: hanya Admin dan PIC yang boleh mengakses Kelola Akun. */
function ProtectedManageUsers() {
  return canManage() ? <ManageUsers /> : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/rkm" element={<RKM />} />
        <Route path="/non-rkm" element={<NonRKM />} />
        <Route path="/weekly-monitoring" element={<WeeklyMonitoring />} />
        <Route path="/program-detail" element={<ProgramDetail />} />
        <Route path="/tahapan-detail" element={<TahapanDetail />} />
        <Route path="/subtask-detail" element={<SubtaskDetail />} />
        <Route path="/manage-users" element={<ProtectedManageUsers />} />
        <Route path="/pengaturan-akun" element={<PengaturanAkun />} />
        <Route path="/pic-dashboard" element={<PICDashboard />} />
        <Route path="/pic-rkm" element={<PICRKM />} />
        <Route path="/pic-non-rkm" element={<PICNonRKM />} />
        <Route path="/pic-weekly-monitoring" element={<PICWeeklyMonitoring />} />
        <Route path="/pic-tambah-program" element={<PICAmbahProgram />} />
        <Route path="/pic-tambah-subtask" element={<PICAmbahSubtask />} />
        <Route path="/pic-tambah-tahapan" element={<PICAmbahTahapan />} />
        <Route path="/pic-program-detail" element={<PICProgramDetail />} />
        <Route path="/pic-tahapan-detail" element={<PICTahapanDetail />} />
        <Route path="/pic-edit-program" element={<PICEditProgram />} />
        <Route path="/pic-edit-tahapan" element={<PICEditTahapan />} />
        <Route path="/pic-edit-subtask" element={<PICEditSubtask />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
