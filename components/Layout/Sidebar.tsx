import React, { useState, useEffect } from 'react';
import { 
  MapPin, LayoutDashboard, Settings, Users, 
  CalendarClock, Files, ChevronDown, ChevronRight, 
  Menu as MenuIcon, ChevronLeft, Database, Fingerprint, LogOut, Timer, ClipboardCheck, Plane, Calendar, ClipboardList, Heart, Target, BarChart3, CheckSquare, AlertTriangle, Video, Megaphone, Receipt, Trophy, Wallet, ShieldCheck, Activity
} from 'lucide-react';
import { authService } from '../../services/authService';
import { financeService } from '../../services/financeService';
import { dispensationService } from '../../services/dispensationService';
import Swal from 'sweetalert2';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }) => {
  const [isMasterOpen, setIsMasterOpen] = useState(true);
  const [isPerformanceOpen, setIsPerformanceOpen] = useState(false);
  const [isFinanceOpen, setIsFinanceOpen] = useState(false);
  const [isPresenceOpen, setIsPresenceOpen] = useState(true);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [unreadReimbursements, setUnreadReimbursements] = useState(0);
  const [unreadCompensations, setUnreadCompensations] = useState(0);
  const [unreadDispensations, setUnreadDispensations] = useState(0);
  const user = authService.getCurrentUser();

  useEffect(() => {
    if (user?.role === 'admin') {
      const fetchUnread = async () => {
        try {
          const [reimburseCount, compensationCount, dispensationCount] = await Promise.all([
            financeService.getUnreadCount(),
            financeService.getUnreadCompensationCount(),
            dispensationService.getUnreadCount()
          ]);
          setUnreadReimbursements(reimburseCount);
          setUnreadCompensations(compensationCount);
          setUnreadDispensations(dispensationCount);
        } catch (error) {
          console.error('Error fetching unread counts:', error);
        }
      };
      fetchUnread();
      // Refresh every 1 minute
      const interval = setInterval(fetchUnread, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Logout?',
      text: "Anda harus masuk kembali untuk mengakses data.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#006E62',
      confirmButtonText: 'Ya, Keluar'
    });

    if (result.isConfirmed) {
      authService.logout();
    }
  };

  const NavItem = ({ id, icon: Icon, label, indent = false, badge }: { id: any, icon: any, label: string, indent?: boolean, badge?: number }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 w-full mb-1 ${
        activeTab === id 
          ? 'bg-[#006E62] text-white shadow-md' 
          : 'text-gray-600 hover:bg-gray-100'
      } ${indent && !isCollapsed ? 'ml-4 w-[calc(100%-1rem)]' : ''}`}
      title={isCollapsed ? label : ''}
    >
      <div className="relative shrink-0">
        <Icon size={20} />
        {badge !== undefined && badge > 0 && isCollapsed && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
        )}
      </div>
      {!isCollapsed && (
        <div className="flex items-center justify-between flex-1 overflow-hidden">
          <span className="font-medium text-sm truncate">{label}</span>
          {badge !== undefined && badge > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {badge}
            </span>
          )}
        </div>
      )}
    </button>
  );

  return (
    <aside 
      className={`hidden md:flex flex-col border-r border-gray-100 bg-white sticky top-0 h-screen transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex items-center justify-between p-4 mb-4">
        {!isCollapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 bg-[#006E62] rounded flex items-center justify-center text-white font-bold italic shrink-0">H</div>
            <h1 className="text-xl font-bold tracking-tight text-[#006E62] truncate">HUREMA</h1>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 bg-[#006E62] rounded flex items-center justify-center text-white font-bold italic mx-auto">H</div>
        )}
      </div>
      
      <nav className="flex-1 px-3 overflow-y-auto scrollbar-none">
        {user?.role !== 'admin' && <NavItem id="dashboard" icon={LayoutDashboard} label="Beranda" />}
        
        {/* Master Menu Group */}
        {(user?.role === 'admin' || user?.is_hr_admin) && (
          <div className="mt-4">
            <button 
              onClick={() => setIsMasterOpen(!isMasterOpen)}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 w-full mb-1 text-gray-600 hover:bg-gray-100`}
              title={isCollapsed ? 'Master' : ''}
            >
              <Database size={20} className="shrink-0 text-gray-400" />
              {!isCollapsed && (
                <div className="flex items-center justify-between flex-1 overflow-hidden">
                  <span className="font-medium text-sm truncate">Master</span>
                  {isMasterOpen ? <ChevronDown size={16} className="text-gray-300" /> : <ChevronRight size={16} className="text-gray-300" />}
                </div>
              )}
            </button>
            
            {(isMasterOpen || isCollapsed) && (
              <div className={`mt-1 overflow-hidden transition-all duration-300 ${isCollapsed ? '' : 'max-h-96'}`}>
                {user?.role === 'admin' && (
                  <>
                    <NavItem id="master_app" icon={Database} label="Master Aplikasi" indent />
                    <NavItem id="admin_settings" icon={ShieldCheck} label="Pengaturan Admin" indent />
                  </>
                )}
                <NavItem id="location" icon={MapPin} label="Data Lokasi" indent />
                <NavItem id="schedule" icon={CalendarClock} label="Manajemen Jadwal" indent />
                <NavItem id="account" icon={Users} label="Akun" indent />
              </div>
            )}
          </div>
        )}

        {/* Performance Menu Group */}
        {(user?.role === 'admin' || user?.is_performance_admin) && (
          <div className="mt-4">
            <button 
              onClick={() => setIsPerformanceOpen(!isPerformanceOpen)}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 w-full mb-1 text-gray-600 hover:bg-gray-100`}
              title={isCollapsed ? 'Performance' : ''}
            >
              <BarChart3 size={20} className="shrink-0 text-gray-400" />
              {!isCollapsed && (
                <div className="flex items-center justify-between flex-1 overflow-hidden">
                  <span className="font-medium text-sm truncate">Performance</span>
                  {isPerformanceOpen ? <ChevronDown size={16} className="text-gray-300" /> : <ChevronRight size={16} className="text-gray-300" />}
                </div>
              )}
            </button>
            
            {(isPerformanceOpen || isCollapsed) && (
              <div className={`mt-1 overflow-hidden transition-all duration-300 ${isCollapsed ? '' : 'max-h-96'}`}>
                <NavItem id="kpi" icon={Target} label="Key Performance Indicator" indent />
                <NavItem id="key_activity" icon={CheckSquare} label="Key Activities" indent />
                <NavItem id="sales_report" icon={MapPin} label="Sales Report" indent />
              </div>
            )}
          </div>
        )}

        <div className="mt-4">
          {(user?.role === 'admin' || user?.is_performance_admin) && (
            <>
              <NavItem id="employee_of_the_period" icon={Trophy} label="Employee of The Period" />
              <NavItem id="feedback" icon={ClipboardList} label="Feedback Pegawai" />
              <NavItem id="lapor" icon={AlertTriangle} label="Lapor Pelanggaran" />
              <NavItem id="rapat" icon={Video} label="Notulensi Rapat" />
              <NavItem id="pengumuman" icon={Megaphone} label="Pengumuman" />
            </>
          )}
        </div>

        {/* Finance Menu Group */}
        {(user?.role === 'admin' || user?.is_finance_admin) && (
          <div className="mt-4">
            <button 
              onClick={() => setIsFinanceOpen(!isFinanceOpen)}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 w-full mb-1 text-gray-600 hover:bg-gray-100`}
              title={isCollapsed ? 'Finance' : ''}
            >
              <div className="relative shrink-0">
                <Receipt size={20} className="text-gray-400" />
                {unreadReimbursements > 0 && isCollapsed && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
                )}
              </div>
              {!isCollapsed && (
                <div className="flex items-center justify-between flex-1 overflow-hidden">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-medium text-sm">Finance</span>
                    {(unreadReimbursements > 0 || unreadCompensations > 0) && (
                      <span className="bg-red-500 text-white text-[8px] font-bold px-1 rounded-full">NEW</span>
                    )}
                  </div>
                  {isFinanceOpen ? <ChevronDown size={16} className="text-gray-300" /> : <ChevronRight size={16} className="text-gray-300" />}
                </div>
              )}
            </button>
            
            {(isFinanceOpen || isCollapsed) && (
              <div className={`mt-1 overflow-hidden transition-all duration-300 ${isCollapsed ? '' : 'max-h-96'}`}>
                <NavItem id="salary_scheme" icon={Receipt} label="Master Skema Gaji" indent />
                {(user?.role === 'admin' || user?.is_finance_admin) && (
                  <>
                    <NavItem id="salary_adjustment" icon={Receipt} label="Kustom Gaji" indent />
                    <NavItem id="payroll" icon={Receipt} label="Payroll" indent />
                  </>
                )}
                {user?.role !== 'admin' && <NavItem id="my_payslip" icon={Receipt} label="Slip Gaji Saya" indent />}
                <NavItem id="reimbursement" icon={Receipt} label="Reimburse" indent badge={(user?.role === 'admin' || user?.is_finance_admin) ? unreadReimbursements : undefined} />
                <NavItem id="early_salary" icon={Receipt} label="Ambil Gaji Awal" indent />
                {(user?.role === 'admin' || user?.is_finance_admin) && (
                  <NavItem id="compensation" icon={Receipt} label="Kompensasi" indent badge={unreadCompensations} />
                )}
              </div>
            )}
          </div>
        )}

        {/* Laporan Menu Group */}
        {(user?.role === 'admin' || user?.is_hr_admin || user?.is_finance_admin) && (
          <div className="mt-4">
            <button 
              onClick={() => setIsReportOpen(!isReportOpen)}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 w-full mb-1 text-gray-600 hover:bg-gray-100`}
              title={isCollapsed ? 'Laporan' : ''}
            >
              <BarChart3 size={20} className="shrink-0 text-gray-400" />
              {!isCollapsed && (
                <div className="flex items-center justify-between flex-1 overflow-hidden">
                  <span className="font-medium text-sm truncate">Laporan</span>
                  {isReportOpen ? <ChevronDown size={16} className="text-gray-300" /> : <ChevronRight size={16} className="text-gray-300" />}
                </div>
              )}
            </button>
            
            {(isReportOpen || isCollapsed) && (
              <div className={`mt-1 overflow-hidden transition-all duration-300 ${isCollapsed ? '' : 'max-h-96'}`}>
                {(user?.role === 'admin' || user?.is_hr_admin) && (
                  <>
                    <NavItem id="employee_report" icon={BarChart3} label="Laporan Karyawan" indent />
                    <NavItem id="attendance_report" icon={Fingerprint} label="Laporan Kehadiran" indent />
                  </>
                )}
                {(user?.role === 'admin' || user?.is_finance_admin) && (
                  <NavItem id="finance_report" icon={Wallet} label="Laporan Finance" indent />
                )}
              </div>
            )}
          </div>
        )}

        {/* Presence & Dispensation Group */}
        <div className="mt-4">
          <button 
            onClick={() => setIsPresenceOpen(!isPresenceOpen)}
            className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 w-full mb-1 text-gray-600 hover:bg-gray-100`}
            title={isCollapsed ? 'Presensi' : ''}
          >
            <div className="relative shrink-0">
              <Fingerprint size={20} className="text-gray-400" />
              {unreadDispensations > 0 && isCollapsed && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
              )}
            </div>
            {!isCollapsed && (
              <div className="flex items-center justify-between flex-1 overflow-hidden">
                <div className="flex items-center gap-2 truncate">
                  <span className="font-medium text-sm">Presensi</span>
                  {unreadDispensations > 0 && (
                    <span className="bg-red-500 text-white text-[8px] font-bold px-1 rounded-full">NEW</span>
                  )}
                </div>
                {isPresenceOpen ? <ChevronDown size={16} className="text-gray-300" /> : <ChevronRight size={16} className="text-gray-300" />}
              </div>
            )}
          </button>
          
          {(isPresenceOpen || isCollapsed) && (
            <div className={`mt-1 overflow-hidden transition-all duration-300 ${isCollapsed ? '' : 'max-h-96'}`}>
              {user?.role !== 'admin' && (
                <>
                  <NavItem id="presence" icon={Fingerprint} label="Presensi Reguler" indent />
                  <NavItem id="overtime" icon={Timer} label="Presensi Lembur" indent />
                  <NavItem id="dispensation" icon={ClipboardList} label="Dispensasi Presensi" indent />
                </>
              )}
              {(user?.role === 'admin' || user?.is_hr_admin) && (
                <>
                  <NavItem id="daily_monitoring" icon={Activity} label="Pemantauan Harian" indent />
                  <NavItem id="admin_dispensation" icon={ClipboardList} label="Antrean Dispensasi" indent badge={unreadDispensations} />
                </>
              )}
            </div>
          )}
        </div>

        <div className="mt-4">
          {user?.role !== 'admin' && (
            <>
              <NavItem id="leave" icon={Plane} label="Libur Mandiri" />
              <NavItem id="annual_leave" icon={Calendar} label="Cuti Tahunan" />
              <NavItem id="permission" icon={ClipboardList} label="Izin" />
              {user?.gender === 'Perempuan' && (
                <NavItem id="maternity_leave" icon={Heart} label="Cuti Melahirkan" />
              )}
            </>
          )}
          <NavItem id="submission" icon={ClipboardCheck} label="Pengajuan" />
          <NavItem id="document" icon={Files} label="Dokumen Digital" />
          {user?.role !== 'admin' && <NavItem id="settings" icon={Settings} label="Pengaturan" />}
        </div>
      </nav>

      <div className="p-4 border-t border-gray-50 space-y-2">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-50 rounded-md transition-all font-medium text-sm"
          title={isCollapsed ? 'Keluar' : ''}
        >
          <LogOut size={20} className="shrink-0" />
          {!isCollapsed && <span>Keluar</span>}
        </button>
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center p-2 text-gray-400 hover:bg-gray-100 rounded-md transition-all"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;