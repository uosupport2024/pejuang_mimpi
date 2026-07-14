import { useState, useEffect } from "react";
import { MapPin, Navigation } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/shared/router/router";
import { useLocation } from "react-router-dom";
import { updateLocation, fetchLocationById } from "../api/location";
import { FormField } from "@/shared/components/ui/form-field";
import { Skeleton } from "@/shared/components/ui/skeleton";

// Leaflet imports
import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const officeIcon = L.divIcon({
  className: "custom-office-marker",
  html: `<div style="position: relative; display: flex; align-items: center; justify-content: center; width: 16px; height: 16px;">
    <div style="position: relative; width: 12px; height: 12px; border-radius: 50%; background-color: #7FA46D; border: 2px solid #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.25);"></div>
  </div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

function ChangeMapView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom]);
  return null;
}

export function LocationEditPage() {
  const { navigate } = useRouter();
  const location = useLocation();
  const [locationId] = useState<number | undefined>(() => location.state?.locationId);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const [formData, setFormData] = useState({
    nama_lokasi: "",
    keterangan: "Office",
    radius: 100,
    lat_kantor: "",
    long_kantor: "",
  });

  useEffect(() => {
    if (!locationId) {
      toast.error("ID lokasi tidak ditemukan");
      navigate("Location");
      return;
    }

    const loadLocationDetails = async () => {
      try {
        setLoading(true);
        const data = await fetchLocationById(locationId);
        setFormData({
          nama_lokasi: data.nama_lokasi,
          keterangan: data.keterangan || "Office",
          radius: Number(data.radius) || 100,
          lat_kantor: data.lat_kantor || "",
          long_kantor: data.long_kantor || "",
        });
      } catch (err: any) {
        toast.error(err.message || "Gagal memuat detail lokasi");
        navigate("Location");
      } finally {
        setLoading(false);
      }
    };

    loadLocationDetails();
  }, [locationId]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Browser Anda tidak mendukung Geolocation");
      return;
    }

    setGettingLocation(true);
    toast.info("Mengambil koordinat GPS Anda saat ini...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          lat_kantor: position.coords.latitude.toString(),
          long_kantor: position.coords.longitude.toString(),
        }));
        setGettingLocation(false);
        toast.success("Berhasil mengambil koordinat lokasi Anda!");
      },
      (error) => {
        setGettingLocation(false);
        console.error(error);
        toast.error("Gagal mendeteksi lokasi. Pastikan izin GPS aktif.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationId) return;

    if (!formData.nama_lokasi.trim()) {
      toast.error("Nama lokasi harus diisi");
      return;
    }
    if (!formData.lat_kantor.trim() || !formData.long_kantor.trim()) {
      toast.error("Koordinat latitude & longitude harus diisi");
      return;
    }
    if (formData.radius <= 0) {
      toast.error("Radius harus lebih besar dari 0");
      return;
    }

    try {
      setSubmitting(true);
      await updateLocation(locationId, formData);
      toast.success("Lokasi berhasil diupdate");
      navigate("Location");
    } catch (err: any) {
      toast.error(err.message || "Gagal mengupdate lokasi");
    } finally {
      setSubmitting(false);
    }
  };

  // Map preview coordinates config
  const mapLat = parseFloat(formData.lat_kantor);
  const mapLng = parseFloat(formData.long_kantor);
  const isValidCoords = !isNaN(mapLat) && !isNaN(mapLng);
  const finalCenter: [number, number] = isValidCoords ? [mapLat, mapLng] : [-6.200000, 106.816666];

  if (loading) {
    return (
      <div className="w-full space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Form Skeleton */}
          <div className="lg:col-span-2 bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-28" />
              </div>
            </div>
          </div>
          {/* Right Map Skeleton */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4 min-h-[360px]">
            <div className="space-y-3 flex-1 flex flex-col">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-2.5 w-24" />
                </div>
              </div>
              <Skeleton className="flex-1 min-h-[220px] rounded-xl w-full" />
            </div>
            <Skeleton className="h-9 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Full Width col-12 style stacked */}
        <div className="lg:col-span-2 bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <FormField
                label="Nama Lokasi Kantor"
                type="text"
                required
                value={formData.nama_lokasi}
                onChange={(e) => setFormData({ ...formData, nama_lokasi: e.target.value })}
                placeholder="Contoh: Kantor Cabang Bandung"
              />

              <FormField
                label="Keterangan / Tipe"
                type="select"
                value={formData.keterangan}
                onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                options={[
                  { value: "Office", label: "Office" },
                  { value: "Patroli", label: "Patroli" },
                ]}
              />

              <FormField
                label="Radius Kantor (Meter)"
                type="number"
                required
                value={formData.radius}
                onChange={(e) => setFormData({ ...formData, radius: Number(e.target.value) })}
                placeholder="Contoh: 100"
              />

              <FormField
                label="Latitude"
                type="text"
                required
                value={formData.lat_kantor}
                onChange={(e) => setFormData({ ...formData, lat_kantor: e.target.value })}
                placeholder="Contoh: -6.200000"
              />

              <FormField
                label="Longitude"
                type="text"
                required
                value={formData.long_kantor}
                onChange={(e) => setFormData({ ...formData, long_kantor: e.target.value })}
                placeholder="Contoh: 106.816666"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate("Location")}
                className="px-4 py-2 text-xs font-bold text-gray-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-xs font-bold text-white bg-[#7FA46D] hover:bg-[#6e935d] rounded-lg shadow-sm shadow-[#7FA46D]/15 transition-colors cursor-pointer disabled:opacity-50"
              >
                {submitting ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </div>

        {/* Right side: Map location preview */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3 flex-1 flex flex-col">
            <div className="flex items-center gap-2 text-gray-800">
              <div className="w-8 h-8 bg-emerald-50 text-[#7FA46D] rounded-lg flex items-center justify-center">
                <Navigation size={16} />
              </div>
              <div>
                <h2 className="text-xs font-bold">Pratinjau Peta Lokasi</h2>
                <p className="text-[9px] text-gray-500">Live preview lokasi presensi</p>
              </div>
            </div>

            {/* Map Container */}
            <div className="flex-1 min-h-[260px] rounded-xl overflow-hidden border border-zinc-200/60 relative z-10">
              <MapContainer
                center={finalCenter}
                zoom={isValidCoords ? 18 : 10}
                zoomControl={true}
                attributionControl={false}
                style={{ width: "100%", height: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <ChangeMapView center={finalCenter} zoom={isValidCoords ? 18 : 10} />
                
                {isValidCoords && (
                  <>
                    <Marker position={[mapLat, mapLng]} icon={officeIcon} />
                    {formData.radius > 0 && (
                      <Circle
                        center={[mapLat, mapLng]}
                        radius={formData.radius}
                        pathOptions={{
                          color: "#7FA46D",
                          fillColor: "#7FA46D",
                          fillOpacity: 0.15
                        }}
                      />
                    )}
                  </>
                )}
              </MapContainer>
              
              {!isValidCoords && (
                <div className="absolute inset-0 bg-black/5 backdrop-blur-xs flex items-center justify-center z-[400] p-4 text-center">
                  <span className="text-[10px] font-bold text-gray-700 bg-white/95 px-3.5 py-2 rounded-xl shadow-xs border border-zinc-200/80">
                    Masukkan koordinat untuk melihat lokasi
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            disabled={gettingLocation}
            onClick={handleGetCurrentLocation}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-[#7FA46D] bg-[#7FA46D]/10 hover:bg-[#7FA46D]/20 rounded-xl border border-dashed border-[#7FA46D]/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <MapPin size={16} />
            {gettingLocation ? "Mendeteksi..." : "Ambil Lokasi Saat Ini"}
          </button>
        </div>
      </div>
    </div>
  );
}
