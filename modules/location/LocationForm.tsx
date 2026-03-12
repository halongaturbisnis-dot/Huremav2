
import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Save, MapPin, Navigation } from 'lucide-react';
import { LocationInput } from '../../types';
import { googleDriveService } from '../../services/googleDriveService';

declare var L: any;

interface LocationFormProps {
  onClose: () => void;
  onSubmit: (data: LocationInput) => void;
  initialData?: Partial<LocationInput>;
}

const LocationForm: React.FC<LocationFormProps> = ({ onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<LocationInput>({
    name: initialData?.name || '',
    location_type: initialData?.location_type || 'Kantor',
    address: initialData?.address || '',
    city: initialData?.city || '',
    province: initialData?.province || '',
    zip_code: initialData?.zip_code || '',
    phone: initialData?.phone || '',
    latitude: initialData?.latitude || 0,
    longitude: initialData?.longitude || 0,
    radius: initialData?.radius || 100,
    description: initialData?.description || '',
    image_google_id: initialData?.image_google_id || '',
  });

  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    const defaultLat = formData.latitude || -6.200000;
    const defaultLng = formData.longitude || 106.816666;

    if (!mapRef.current) {
      mapRef.current = L.map('map-container').setView([defaultLat, defaultLng], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);

      markerRef.current = L.marker([defaultLat, defaultLng], { draggable: true }).addTo(mapRef.current);

      markerRef.current.on('dragend', function (event: any) {
        const position = event.target.getLatLng();
        updateCoords(position.lat, position.lng);
      });

      mapRef.current.on('click', function (e: any) {
        const { lat, lng } = e.latlng;
        markerRef.current.setLatLng([lat, lng]);
        updateCoords(lat, lng);
      });

      if (!initialData) {
        detectGPS();
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const detectGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          updateCoords(latitude, longitude);
          if (mapRef.current) {
            mapRef.current.setView([latitude, longitude], 17);
            markerRef.current.setLatLng([latitude, longitude]);
          }
        },
        (error) => { console.error("GPS Error: ", error); },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  };

  const updateCoords = async (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await response.json();
      if (data && data.address) {
        const addr = data.display_name || '';
        const city = data.address.city || data.address.town || data.address.city_district || '';
        const province = data.address.state || '';
        const zip = data.address.postcode || '';
        
        setFormData(prev => ({
          ...prev,
          address: addr,
          city: city,
          province: province,
          zip_code: zip
        }));
      }
    } catch (err) { console.error("Reverse Geotag Error:", err); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    try {
      setUploading(true);
      await new Promise(resolve => setTimeout(resolve, 400));
      const fileId = await googleDriveService.uploadFile(file);
      setFormData(prev => ({ ...prev, image_google_id: fileId }));
    } catch (error) {
      console.error(error);
      setPreviewUrl(null);
      alert('Gagal mengunggah gambar');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white rounded-md shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0">
          <h3 className="text-base font-bold text-[#006E62]">
            {initialData ? 'Ubah Lokasi' : 'Tambah Lokasi Baru'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Jenis Lokasi</label>
              <select
                name="location_type"
                value={formData.location_type}
                onChange={handleChange}
                className="w-full px-2 py-1.5 text-[13px] border border-gray-200 rounded focus:ring-1 focus:ring-[#006E62] focus:border-[#006E62] outline-none bg-gray-50"
              >
                <option value="Kantor">Kantor</option>
                <option value="Gudang">Gudang</option>
                <option value="Proyek">Proyek</option>
                <option value="Toko">Toko</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Nama Lokasi</label>
              <input
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="cth: Kantor Pusat Jakarta"
                className="w-full px-2 py-1.5 text-[13px] border border-gray-200 rounded focus:ring-1 focus:ring-[#006E62] focus:border-[#006E62] outline-none bg-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Peta Geotag</label>
              <button 
                type="button"
                onClick={detectGPS}
                className="flex items-center gap-1 text-[9px] font-bold text-[#006E62] hover:underline"
              >
                <Navigation size={10} /> DETEKSI POSISI
              </button>
            </div>
            <div id="map-container" className="mb-1 border border-gray-200 rounded shadow-sm"></div>
            <div className="flex gap-4">
              <div className="text-[9px] text-gray-400 font-mono">LAT: {formData.latitude.toFixed(6)}</div>
              <div className="text-[9px] text-gray-400 font-mono">LNG: {formData.longitude.toFixed(6)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-3 space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Alamat Lengkap</label>
              <input
                required
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-2 py-1.5 text-[13px] border border-gray-200 rounded focus:ring-1 focus:ring-[#006E62] focus:border-[#006E62] outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Kota</label>
              <input
                required
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-2 py-1.5 text-[13px] border border-gray-200 rounded focus:ring-1 focus:ring-[#006E62] focus:border-[#006E62] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Provinsi</label>
              <input
                name="province"
                value={formData.province}
                onChange={handleChange}
                className="w-full px-2 py-1.5 text-[13px] border border-gray-200 rounded focus:ring-1 focus:ring-[#006E62] focus:border-[#006E62] outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Kode Pos</label>
              <input
                name="zip_code"
                value={formData.zip_code}
                onChange={handleChange}
                className="w-full px-2 py-1.5 text-[13px] border border-gray-200 rounded focus:ring-1 focus:ring-[#006E62] focus:border-[#006E62] outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Telepon</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-2 py-1.5 text-[13px] border border-gray-200 rounded focus:ring-1 focus:ring-[#006E62] focus:border-[#006E62] outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Radius (m)</label>
              <input
                type="number"
                name="radius"
                value={formData.radius}
                onChange={handleChange}
                className="w-full px-2 py-1.5 text-[13px] border border-gray-200 rounded focus:ring-1 focus:ring-[#006E62] focus:border-[#006E62] outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Foto Lokasi (Google Drive)</label>
            <div className="flex items-center gap-4 p-2 border border-gray-100 rounded-md bg-gray-50">
              {previewUrl || formData.image_google_id ? (
                <div className="w-16 h-16 rounded border border-gray-200 overflow-hidden relative group shrink-0">
                  <img 
                    src={previewUrl || googleDriveService.getFileUrl(formData.image_google_id!)} 
                    alt="Preview" 
                    className={`w-full h-full object-cover ${uploading ? 'opacity-40 animate-pulse' : ''}`}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <label className="cursor-pointer text-white p-2">
                      <Upload size={14} />
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                    </label>
                  </div>
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-[#006E62] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              ) : (
                <label className={`w-16 h-16 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer hover:border-[#006E62] hover:bg-white transition-all shrink-0 ${uploading ? 'animate-pulse' : ''}`}>
                  <Upload className="text-gray-400 mb-1" size={14} />
                  <span className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter">{uploading ? 'UPLOADING' : 'UPLOAD'}</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                </label>
              )}
              <div className="flex-1">
                <p className="text-[11px] text-gray-600 font-medium">Gambar Lokasi</p>
                <p className="text-[9px] text-gray-400 italic">ID GDrive: {formData.image_google_id || 'Belum diunggah'}</p>
              </div>
            </div>
          </div>
        </form>

        <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors uppercase">
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={uploading}
            className={`flex items-center gap-2 bg-[#006E62] text-white px-6 py-2 rounded-md hover:bg-[#005a50] transition-colors shadow-md text-xs font-bold uppercase ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Save size={14} /> Simpan Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationForm;
