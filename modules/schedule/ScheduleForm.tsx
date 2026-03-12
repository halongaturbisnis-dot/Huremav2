
import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Clock, Calendar, Users, MapPin, Check, ChevronDown } from 'lucide-react';
import { ScheduleInput, Location, Account } from '../../types';
import { locationService } from '../../services/locationService';
import { accountService } from '../../services/accountService';

interface ScheduleFormProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({ onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<any>({
    name: initialData?.name || '',
    type: initialData?.type || 1,
    tolerance_minutes: initialData?.tolerance_minutes || 0,
    tolerance_checkin_minutes: initialData?.tolerance_checkin_minutes || 0,
    start_date: initialData?.start_date || '',
    end_date: initialData?.end_date || '',
    excluded_account_ids: initialData?.excluded_account_ids || [],
    rules: initialData?.rules || [],
    location_ids: initialData?.location_ids || []
  });

  const [locations, setLocations] = useState<Location[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeTab, setActiveTab] = useState<'info' | 'toleransi' | 'rules' | 'locations' | 'exclusions'>('info');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showExclusionDropdown, setShowExclusionDropdown] = useState(false);

  const locationRef = useRef<HTMLDivElement>(null);
  const exclusionRef = useRef<HTMLDivElement>(null);

  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  useEffect(() => {
    locationService.getAll().then(setLocations);
    accountService.getAll().then(accs => setAccounts(accs as Account[]));
    
    if (!initialData) {
      // Init default rules for type 1
      const initialRules = days.map((_, idx) => ({
        day_of_week: idx,
        check_in_time: '08:00',
        check_out_time: '17:00',
        is_holiday: idx === 0 || idx === 6 // Sun & Sat holiday by default
      }));
      setFormData(prev => ({ ...prev, rules: initialRules }));
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) setShowLocationDropdown(false);
      if (exclusionRef.current && !exclusionRef.current.contains(event.target as Node)) setShowExclusionDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const parsedValue = (name === 'type' || name === 'tolerance_minutes' || name === 'tolerance_checkin_minutes') ? parseInt(value) || 0 : value;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: parsedValue };
      
      // LOGIKA AUTO-RESET: Jika ganti ke Tipe 3, nolkan toleransi & rules
      if (name === 'type' && parsedValue === 3) {
        newData.tolerance_minutes = 0;
        newData.tolerance_checkin_minutes = 0;
        newData.rules = [];
        // Jika sedang di tab Toleransi atau Rules, pindah ke Info
        if (activeTab === 'toleransi' || activeTab === 'rules') setActiveTab('info');
      } else if (name === 'type' && parsedValue !== 3 && prev.type === 3) {
        // Balikin rules default jika pindah dari Tipe 3 ke kerja
        newData.rules = days.map((_, idx) => ({
          day_of_week: idx,
          check_in_time: '08:00',
          check_out_time: '17:00',
          is_holiday: idx === 0 || idx === 6
        }));
      }

      return newData;
    });
  };

  const handleRuleChange = (idx: number, field: string, value: any) => {
    const newRules = [...formData.rules];
    newRules[idx] = { ...newRules[idx], [field]: value };
    setFormData(prev => ({ ...prev, rules: newRules }));
  };

  const toggleLocation = (id: string) => {
    setFormData(prev => ({
      ...prev,
      location_ids: prev.location_ids.includes(id) 
        ? prev.location_ids.filter(lid => lid !== id)
        : [...prev.location_ids, id]
    }));
  };

  const toggleExclusion = (id: string) => {
    setFormData(prev => ({
      ...prev,
      excluded_account_ids: prev.excluded_account_ids.includes(id)
        ? prev.excluded_account_ids.filter(aid => aid !== id)
        : [...prev.excluded_account_ids, id]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi Tanggal untuk Tipe Periodik
    if ((formData.type === 3 || formData.type === 4) && (!formData.start_date || !formData.end_date)) {
      alert('Tanggal Mulai dan Selesai wajib diisi untuk tipe jadwal ini.');
      return;
    }

    onSubmit(formData);
  };

  const filteredAccounts = accounts.filter(acc => 
    formData.location_ids.length === 0 || (acc.location_id && formData.location_ids.includes(acc.location_id))
  );

  // LOGIKA TABS DINAMIS
  const tabs = [
    { id: 'info', label: 'Informasi' },
  ];

  if (formData.type !== 3) {
    tabs.push({ id: 'toleransi', label: 'Toleransi' });
    tabs.push({ id: 'rules', label: 'Aturan Jam' });
  }

  tabs.push({ id: 'locations', label: 'Lokasi' });

  if (formData.type === 3 || formData.type === 4) {
    tabs.push({ id: 'exclusions', label: 'Pengecualian' });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white rounded-md shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#006E62]">
              {initialData ? 'Ubah Jadwal' : 'Tambah Jadwal Baru'}
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Konfigurasi Jam & Lokasi</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/50 overflow-x-auto">
           {tabs.map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id ? 'border-[#006E62] text-[#006E62] bg-white' : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.label}
              </button>
           ))}
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'info' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Nama Jadwal</label>
                <input 
                  required 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  placeholder="cth: Office Hour Pusat"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-[#006E62] outline-none" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Tipe Jadwal</label>
                <select name="type" value={formData.type} onChange={handleChange} className="w-full px-3 py-2 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-[#006E62] outline-none">
                  <option value={1}>1. Hari Kerja (Fixed)</option>
                  <option value={2}>2. Shift Kerja (Uniform)</option>
                  <option value={3}>3. Libur Khusus (Overriding)</option>
                  <option value={4}>4. Hari Kerja Khusus</option>
                </select>
              </div>

              {formData.type >= 3 && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-orange-50 border border-orange-100 rounded animate-in slide-in-from-top duration-200 mt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-orange-600 uppercase">Mulai Tanggal</label>
                    <input type="date" required name="start_date" value={formData.start_date} onChange={handleChange} className="w-full px-3 py-2 text-xs border border-orange-200 rounded outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-orange-600 uppercase">Sampai Tanggal</label>
                    <input type="date" required name="end_date" value={formData.end_date} onChange={handleChange} className="w-full px-3 py-2 text-xs border border-orange-200 rounded outline-none" />
                  </div>
                </div>
               )}
            </div>
          )}

          {activeTab === 'toleransi' && formData.type !== 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Toleransi Datang (Menit)</label>
                  <input type="number" name="tolerance_checkin_minutes" value={formData.tolerance_checkin_minutes} onChange={handleChange} className="w-full px-3 py-2 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-[#006E62] outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Toleransi Pulang (Menit)</label>
                  <input type="number" name="tolerance_minutes" value={formData.tolerance_minutes} onChange={handleChange} className="w-full px-3 py-2 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-[#006E62] outline-none" />
                </div>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-100 rounded">
                 <p className="text-[10px] text-blue-700 font-medium">Batas waktu keterlambatan datang dan batas akhir presensi pulang setelah jam kerja berakhir.</p>
              </div>
            </div>
          )}

          {activeTab === 'rules' && formData.type !== 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
                 <div className="space-y-2">
                   <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Tentukan Hari & Jam Kerja</p>
                   {days.map((day, idx) => (
                      <div key={idx} className={`flex items-center gap-4 p-3 rounded border ${formData.rules[idx]?.is_holiday ? 'bg-rose-50 border-rose-100 opacity-60' : 'bg-white border-gray-100'}`}>
                         <div className="w-20 shrink-0 text-[11px] font-bold text-gray-700">{day}</div>
                         <div className="flex-1 flex items-center gap-4">
                            <input type="time" disabled={formData.rules[idx]?.is_holiday} value={formData.rules[idx]?.check_in_time} onChange={(e) => handleRuleChange(idx, 'check_in_time', e.target.value)} className="flex-1 px-2 py-1 text-xs border rounded disabled:bg-transparent" />
                            <span className="text-gray-300">-</span>
                            <input type="time" disabled={formData.rules[idx]?.is_holiday} value={formData.rules[idx]?.check_out_time} onChange={(e) => handleRuleChange(idx, 'check_out_time', e.target.value)} className="flex-1 px-2 py-1 text-xs border rounded disabled:bg-transparent" />
                         </div>
                         <label className="flex items-center gap-2 cursor-pointer shrink-0">
                            <input type="checkbox" checked={formData.rules[idx]?.is_holiday} onChange={(e) => handleRuleChange(idx, 'is_holiday', e.target.checked)} className="rounded border-gray-300 text-[#006E62]" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Libur</span>
                         </label>
                      </div>
                   ))}
                 </div>
            </div>
          )}

          {activeTab === 'locations' && (
            <div className="animate-in fade-in duration-200">
               <p className="text-[10px] font-bold text-gray-400 uppercase mb-4">Pilih Lokasi yang Terpengaruh Jadwal Ini</p>
               
               <div className="relative" ref={locationRef}>
                  <div 
                    onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded flex items-center justify-between cursor-pointer bg-white"
                  >
                    <span className="text-gray-600 truncate">
                       {formData.location_ids.length === 0 
                         ? '-- Pilih Lokasi (Enumlist) --' 
                         : `${formData.location_ids.length} Lokasi Terpilih`}
                    </span>
                    <ChevronDown size={14} className="text-gray-400" />
                  </div>

                  {showLocationDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded shadow-xl max-h-60 overflow-y-auto p-2">
                       {locations.map(loc => (
                          <div 
                            key={loc.id}
                            onClick={() => toggleLocation(loc.id)}
                            className={`flex items-center gap-2 p-2 rounded cursor-pointer text-xs hover:bg-gray-50 ${
                              formData.location_ids.includes(loc.id) ? 'bg-emerald-50 text-[#006E62] font-bold' : 'text-gray-600'
                            }`}
                          >
                             <div className={`w-4 h-4 border rounded flex items-center justify-center ${
                               formData.location_ids.includes(loc.id) ? 'bg-[#006E62] border-[#006E62] text-white' : 'border-gray-300'
                             }`}>
                                {formData.location_ids.includes(loc.id) && <Check size={10} />}
                             </div>
                             {loc.name}
                          </div>
                       ))}
                    </div>
                  )}
               </div>

               <div className="mt-4 flex flex-wrap gap-2">
                  {formData.location_ids.map((lid: string) => {
                    const loc = locations.find(l => l.id === lid);
                    return loc ? (
                      <span key={lid} className="px-2 py-1 bg-emerald-50 text-[#006E62] text-[10px] font-bold rounded flex items-center gap-1 border border-emerald-100">
                        {loc.name}
                        <X size={10} className="cursor-pointer" onClick={() => toggleLocation(lid)} />
                      </span>
                    ) : null;
                  })}
               </div>
            </div>
          )}

          {activeTab === 'exclusions' && (
            <div className="animate-in fade-in duration-200">
               <div className="bg-blue-50 p-4 border border-blue-100 rounded mb-4">
                  <p className="text-[10px] text-blue-700 font-medium">Pilih user di bawah untuk MENGECEUALIKAN mereka dari jadwal tipe ini.</p>
               </div>
               
               <div className="relative" ref={exclusionRef}>
                  <div 
                    onClick={() => setShowExclusionDropdown(!showExclusionDropdown)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded flex items-center justify-between cursor-pointer bg-white"
                  >
                    <span className="text-gray-600 truncate">
                       {formData.excluded_account_ids.length === 0 
                         ? '-- Pilih User Dikecualikan (Enumlist) --' 
                         : `${formData.excluded_account_ids.length} User Terpilih`}
                    </span>
                    <ChevronDown size={14} className="text-gray-400" />
                  </div>

                  {showExclusionDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded shadow-xl max-h-60 overflow-y-auto p-2">
                       {filteredAccounts.length === 0 ? (
                         <p className="text-[10px] text-gray-400 p-2 text-center italic">Tidak ada user tersedia di lokasi terpilih.</p>
                       ) : (
                         filteredAccounts.map(acc => (
                            <div 
                              key={acc.id}
                              onClick={() => toggleExclusion(acc.id)}
                              className={`flex items-center gap-2 p-2 rounded cursor-pointer text-xs hover:bg-gray-50 ${
                                formData.excluded_account_ids.includes(acc.id) ? 'bg-rose-50 text-rose-600 font-bold' : 'text-gray-600'
                              }`}
                            >
                               <div className={`w-4 h-4 border rounded flex items-center justify-center ${
                                 formData.excluded_account_ids.includes(acc.id) ? 'bg-rose-500 border-rose-500 text-white' : 'border-gray-300'
                               }`}>
                                  {formData.excluded_account_ids.includes(acc.id) && <Check size={10} />}
                               </div>
                               <div>
                                 <p className="leading-tight">{acc.full_name}</p>
                                 <p className="text-[9px] font-normal opacity-70">{(acc as any).location?.name || 'Tanpa Lokasi'}</p>
                               </div>
                            </div>
                         ))
                       )}
                    </div>
                  )}
               </div>

               <div className="mt-4 flex flex-wrap gap-2">
                  {formData.excluded_account_ids.map((aid: string) => {
                    const acc = accounts.find(a => a.id === aid);
                    return acc ? (
                      <span key={aid} className="px-2 py-1 bg-rose-50 text-rose-600 text-[10px] font-bold rounded flex items-center gap-1 border border-rose-100">
                        {acc.full_name}
                        <X size={10} className="cursor-pointer" onClick={() => toggleExclusion(aid)} />
                      </span>
                    ) : null;
                  })}
               </div>
            </div>
          )}
        </form>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">Batal</button>
          <button 
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-[#006E62] text-white px-8 py-2 rounded shadow-md hover:bg-[#005a50] transition-all text-xs font-bold uppercase"
          >
            <Save size={14} /> Simpan Jadwal
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleForm;
