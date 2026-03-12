
import React from 'react';
import { Bell, Home, Fingerprint, UserCircle } from 'lucide-react';
import { AuthUser } from '../../types';

interface MobileLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  user: AuthUser;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children, activeTab, setActiveTab, user }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col md:hidden">
      {/* Top Header */}
      <header className="h-16 flex items-center justify-between px-6 bg-white sticky top-0 z-40 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#006E62] rounded-lg flex items-center justify-center text-white font-bold italic text-sm">H</div>
          <h1 className="text-lg font-bold text-[#006E62] tracking-tight">HUREMA</h1>
        </div>
        <button className="p-2 text-gray-400 hover:text-[#006E62] transition-colors relative">
          <Bell size={22} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 scrollbar-none">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="h-20 bg-white border-t border-gray-100 flex items-center justify-around px-6 sticky bottom-0 z-40 pb-safe">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`p-3 rounded-2xl transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-[#006E62] text-white shadow-lg shadow-emerald-100 scale-110' : 'text-gray-400'}`}
        >
          <Home size={24} />
        </button>
        
        <button 
          onClick={() => setActiveTab('presence')}
          className={`p-4 rounded-full transition-all duration-300 -mt-10 border-4 border-white ${activeTab === 'presence' ? 'bg-[#006E62] text-white shadow-xl scale-110' : 'bg-white text-[#006E62] shadow-lg'}`}
        >
          <Fingerprint size={28} />
        </button>

        <button 
          onClick={() => setActiveTab('settings')}
          className={`p-3 rounded-2xl transition-all duration-300 ${activeTab === 'settings' ? 'bg-[#006E62] text-white shadow-lg shadow-emerald-100 scale-110' : 'text-gray-400'}`}
        >
          <UserCircle size={24} />
        </button>
      </nav>
    </div>
  );
};

export default MobileLayout;
