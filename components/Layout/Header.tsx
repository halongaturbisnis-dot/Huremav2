import React from 'react';
import { Menu, UserCircle } from 'lucide-react';
import { AuthUser } from '../../types';
import { googleDriveService } from '../../services/googleDriveService';

interface HeaderProps {
  activeTab: string;
  onMenuClick: () => void;
  user: AuthUser;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onMenuClick, user }) => {
  const getPageTitle = () => {
    switch (activeTab) {
      case 'location': return 'Manajemen Lokasi';
      case 'account': return 'Manajemen Akun';
      case 'schedule': return 'Manajemen Jadwal';
      case 'document': return 'Repositori Dokumen Digital';
      case 'presence': return 'Presensi & Kehadiran Karyawan';
      case 'overtime': return 'Presensi Lembur';
      case 'submission': return 'Manajemen Pengajuan & Workflow';
      case 'dashboard': return 'Beranda';
      case 'settings': return 'Pengaturan';
      case 'kpi': return 'Key Performance Indicator';
      case 'key_activity': return 'Key Activities';
      case 'sales_report': return 'Sales Report & Geotagging';
      case 'dispensation': return 'Dispensasi Presensi';
      case 'admin_dispensation': return 'Antrean Dispensasi';
      case 'attendance_report': return 'Laporan Kehadiran';
      case 'finance_report': return 'Laporan Finance';
      case 'report': return 'Laporan & Analitik';
      case 'master_app': return 'Master Aplikasi';
      default: return activeTab;
    }
  };

  return (
    <header className="h-16 border-b border-gray-100 flex items-center justify-between px-4 md:px-8 bg-white sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 hover:bg-gray-100 rounded" onClick={onMenuClick}>
          <Menu size={20} />
        </button>
        <h2 className="text-lg font-semibold capitalize text-gray-700">
          {getPageTitle()}
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end hidden sm:flex">
          <span className="text-xs font-bold text-gray-800">{user.full_name}</span>
          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{user.internal_nik}</span>
        </div>
        <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100 overflow-hidden flex items-center justify-center text-[#006E62] font-bold">
          {user.photo_google_id ? (
            <img src={googleDriveService.getFileUrl(user.photo_google_id)} alt="" className="w-full h-full object-cover" />
          ) : (
            <UserCircle size={24} />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;