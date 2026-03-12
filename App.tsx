import React, { useState, useEffect, Suspense, lazy } from 'react';
import { X, LayoutDashboard, Users, MapPin, CalendarClock, Files, Settings, Database, Fingerprint, Timer, ClipboardCheck, Plane, Calendar, ClipboardList, Heart, Target, CheckSquare, AlertTriangle, Video, Megaphone, Receipt, Trophy, BarChart3, Wallet } from 'lucide-react';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';

// Lazy load modules for performance optimization
const LocationMain = lazy(() => import('./modules/location/LocationMain'));
const AccountMain = lazy(() => import('./modules/account/AccountMain'));
const ScheduleMain = lazy(() => import('./modules/schedule/ScheduleMain'));
const DocumentMain = lazy(() => import('./modules/document/DocumentMain'));
const PresenceMain = lazy(() => import('./modules/presence/PresenceMain'));
const OvertimeMain = lazy(() => import('./modules/overtime/OvertimeMain'));
const SubmissionMain = lazy(() => import('./modules/submission/SubmissionMain'));
const LeaveMain = lazy(() => import('./modules/leave/LeaveMain'));
const AnnualLeaveMain = lazy(() => import('./modules/leave/AnnualLeaveMain'));
const PermissionMain = lazy(() => import('./modules/permission/PermissionMain'));
const MaternityLeaveMain = lazy(() => import('./modules/maternity/MaternityLeaveMain'));
const KPIMain = lazy(() => import('./modules/performance/kpi/KPIMain'));
const KeyActivityMain = lazy(() => import('./modules/performance/key-activity/KeyActivityMain'));
const EmployeeOfThePeriodMain = lazy(() => import('./modules/performance/award/EmployeeOfThePeriodMain'));
const SalesReportMain = lazy(() => import('./modules/performance/sales-report/SalesReportMain'));
const FeedbackMain = lazy(() => import('./modules/feedback/FeedbackMain'));
const LaporMain = lazy(() => import('./modules/lapor/LaporMain'));
const RapatMain = lazy(() => import('./modules/rapat/RapatMain'));
const PengumumanMain = lazy(() => import('./modules/pengumuman/PengumumanMain'));
const SalarySchemeMain = lazy(() => import('./modules/finance/SalarySchemeMain'));
const SalaryAdjustmentMain = lazy(() => import('./modules/finance/SalaryAdjustmentMain'));
const PayrollMain = lazy(() => import('./modules/finance/PayrollMain'));
const MyPayslip = lazy(() => import('./modules/finance/MyPayslip'));
const ReimbursementMain = lazy(() => import('./modules/finance/ReimbursementMain'));
const EarlySalaryMain = lazy(() => import('./modules/finance/EarlySalaryModule'));
const CompensationMain = lazy(() => import('./modules/finance/CompensationMain'));
const DispensationMain = lazy(() => import('./modules/dispensation/DispensationMain'));
const AdminDispensationMain = lazy(() => import('./modules/dispensation/AdminDispensationMain'));
const AttendanceReportMain = lazy(() => import('./modules/report/AttendanceReportMain'));
const ReportMainModule = lazy(() => import('./modules/report/ReportMainModule'));
const FinanceReportMain = lazy(() => import('./modules/report/FinanceReportMain'));
const MasterMain = lazy(() => import('./modules/settings/MasterMain'));
const Login = lazy(() => import('./modules/auth/Login'));

import { authService } from './services/authService';
import { AuthUser } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'location' | 'account' | 'schedule' | 'document' | 'settings' | 'presence' | 'overtime' | 'submission' | 'leave' | 'annual_leave' | 'permission' | 'maternity_leave' | 'master_app' | 'kpi' | 'key_activity' | 'sales_report' | 'feedback' | 'lapor' | 'rapat' | 'pengumuman' | 'salary_scheme' | 'salary_adjustment' | 'payroll' | 'my_payslip' | 'reimbursement' | 'early_salary' | 'compensation' | 'employee_of_the_period' | 'dispensation' | 'admin_dispensation' | 'attendance_report' | 'finance_report'>('presence');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setIsAuthChecking(false);
  }, []);

  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-[#006E62] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="w-12 h-12 border-4 border-[#006E62] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <Login onLoginSuccess={(u) => setUser(u)} />
      </Suspense>
    );
  }

  const NavItemMobile = ({ id, icon: Icon, label, indent = false }: { id: any, icon: any, label: string, indent?: boolean }) => (
    <button
      onClick={() => { setActiveTab(id); setIsMobileMenuOpen(false); }}
      className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 w-full mb-1 ${
        activeTab === id 
          ? 'bg-[#006E62] text-white shadow-md' 
          : 'text-gray-600 hover:bg-gray-100'
      } ${indent ? 'ml-4 w-[calc(100%-1rem)]' : ''}`}
    >
      <Icon size={20} />
      <span className="font-medium text-sm">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex bg-white text-gray-800">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setIsSidebarCollapsed} 
      />

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}
      
      {/* Sidebar Mobile */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white z-50 transform transition-transform duration-300 md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#006E62] rounded flex items-center justify-center text-white font-bold italic">H</div>
              <h1 className="text-xl font-bold text-[#006E62]">HUREMA</h1>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)}><X size={24} className="text-gray-400" /></button>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-none">
            <NavItemMobile id="dashboard" icon={LayoutDashboard} label="Beranda" />
            
            <div className="flex items-center gap-3 px-4 py-3 text-gray-400 mt-2">
              <Database size={20} />
              <span className="font-bold text-[10px] uppercase tracking-widest">Master</span>
            </div>
            <NavItemMobile id="master_app" icon={Database} label="Master Aplikasi" indent />
            <NavItemMobile id="location" icon={MapPin} label="Data Lokasi" indent />
            <NavItemMobile id="schedule" icon={CalendarClock} label="Manajemen Jadwal" indent />
            <NavItemMobile id="account" icon={Users} label="Akun" indent />

            <div className="mt-4">
              <NavItemMobile id="presence" icon={Fingerprint} label="Presensi Reguler" />
              <NavItemMobile id="overtime" icon={Timer} label="Presensi Lembur" />
              <NavItemMobile id="kpi" icon={Target} label="KPI Performance" />
              <NavItemMobile id="key_activity" icon={CheckSquare} label="Key Activities" />
              <NavItemMobile id="employee_of_the_period" icon={Trophy} label="Employee of The Period" />
              <NavItemMobile id="sales_report" icon={MapPin} label="Sales Report" />
              <NavItemMobile id="feedback" icon={ClipboardList} label="Feedback Pegawai" />
              <NavItemMobile id="lapor" icon={AlertTriangle} label="Lapor Pelanggaran" />
              <NavItemMobile id="rapat" icon={Video} label="Notulensi Rapat" />
              <NavItemMobile id="pengumuman" icon={Megaphone} label="Pengumuman" />

              <div className="flex items-center gap-3 px-4 py-3 text-gray-400 mt-2">
                <Receipt size={20} />
                <span className="font-bold text-[10px] uppercase tracking-widest">Finance</span>
              </div>
              <NavItemMobile id="salary_scheme" icon={Receipt} label="Master Skema Gaji" indent />
              {user?.role === 'admin' && (
                <NavItemMobile id="salary_adjustment" icon={Receipt} label="Kustom Gaji" indent />
              )}
              <NavItemMobile id="reimbursement" icon={Receipt} label="Reimburse" indent />
              <NavItemMobile id="early_salary" icon={Receipt} label="Ambil Gaji Awal" indent />
              {user?.role === 'admin' && (
                <NavItemMobile id="compensation" icon={Receipt} label="Kompensasi" indent />
              )}

              <NavItemMobile id="leave" icon={Plane} label="Libur Mandiri" />
              <NavItemMobile id="annual_leave" icon={Calendar} label="Cuti Tahunan" />
              <NavItemMobile id="permission" icon={ClipboardList} label="Izin" />
              {(user?.role === 'admin' || user?.gender === 'Perempuan') && (
                <NavItemMobile id="maternity_leave" icon={Heart} label="Cuti Melahirkan" />
              )}
              <NavItemMobile id="submission" icon={ClipboardCheck} label="Pengajuan" />
              <NavItemMobile id="document" icon={Files} label="Dokumen Digital" />
              <NavItemMobile id="attendance_report" icon={BarChart3} label="Laporan Kehadiran" />
              <NavItemMobile id="finance_report" icon={Wallet} label="Laporan Finance" />
              <NavItemMobile id="settings" icon={Settings} label="Pengaturan" />
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col">
        <Header activeTab={activeTab} onMenuClick={() => setIsMobileMenuOpen(true)} user={user} />

        <div className="p-4 md:p-8 max-w-6xl mx-auto w-full">
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-10 h-10 border-4 border-[#006E62] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Memuat Modul...</p>
            </div>
          }>
            {activeTab === 'location' ? (
              <LocationMain />
            ) : activeTab === 'account' ? (
              <AccountMain />
            ) : activeTab === 'schedule' ? (
              <ScheduleMain />
            ) : activeTab === 'document' ? (
              <DocumentMain />
            ) : activeTab === 'presence' ? (
              <PresenceMain />
            ) : activeTab === 'overtime' ? (
              <OvertimeMain />
            ) : activeTab === 'submission' ? (
              <SubmissionMain />
            ) : activeTab === 'leave' ? (
              <LeaveMain />
            ) : activeTab === 'annual_leave' ? (
              <AnnualLeaveMain />
            ) : activeTab === 'permission' ? (
              <PermissionMain />
            ) : activeTab === 'maternity_leave' ? (
              <MaternityLeaveMain />
            ) : activeTab === 'kpi' ? (
              <KPIMain />
            ) : activeTab === 'key_activity' ? (
              <KeyActivityMain />
            ) : activeTab === 'employee_of_the_period' ? (
              <EmployeeOfThePeriodMain />
            ) : activeTab === 'sales_report' ? (
              <SalesReportMain />
            ) : activeTab === 'feedback' ? (
              <FeedbackMain />
            ) : activeTab === 'lapor' ? (
              <LaporMain />
            ) : activeTab === 'rapat' ? (
              <RapatMain />
            ) : activeTab === 'pengumuman' ? (
              <PengumumanMain user={user} />
            ) : activeTab === 'salary_scheme' ? (
              <SalarySchemeMain />
            ) : activeTab === 'salary_adjustment' ? (
              <SalaryAdjustmentMain />
            ) : activeTab === 'payroll' ? (
              <PayrollMain />
            ) : activeTab === 'my_payslip' ? (
              <MyPayslip />
            ) : activeTab === 'reimbursement' ? (
              <ReimbursementMain />
            ) : activeTab === 'early_salary' ? (
              <EarlySalaryMain />
            ) : activeTab === 'compensation' ? (
              <CompensationMain />
            ) : activeTab === 'dispensation' ? (
              <DispensationMain user={user} />
            ) : activeTab === 'admin_dispensation' ? (
              <AdminDispensationMain user={user} />
            ) : activeTab === 'attendance_report' ? (
              <AttendanceReportMain />
            ) : activeTab === 'finance_report' ? (
              <FinanceReportMain />
            ) : activeTab === 'master_app' ? (
              <MasterMain />
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <p className="font-medium text-sm">Modul "{activeTab}" sedang dalam pengembangan.</p>
              </div>
            )}
          </Suspense>
        </div>
      </main>
    </div>
  );
};

export default App;