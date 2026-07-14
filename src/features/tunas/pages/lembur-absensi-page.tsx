import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Camera, RefreshCw, X } from "lucide-react";
import { useRouter } from "@/shared/router/router";
import { useTunas } from "../hooks/use-tunas";
import { toast } from "sonner";
import { fetchProfileAPI, fetchLokasiAPI, fetchOvertimeStatusAPI, postOvertimeMasukAPI, postOvertimePulangAPI } from "../api/absensi";
import patternBg from "@/assets/bg/pattern-background.png";

// Import react-leaflet and leaflet
import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Set default icon for all markers
L.Marker.prototype.options.icon = DefaultIcon;

// Custom styled HTML marker icons using L.divIcon
const userIcon = L.divIcon({
  className: "custom-user-marker",
  html: `<div style="position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">
    <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background-color: rgba(242, 178, 51, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
    <div style="position: relative; width: 14px; height: 14px; border-radius: 50%; background-color: #d2911b; border: 2.5px solid #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.25);"></div>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

const officeIcon = L.divIcon({
  className: "custom-office-marker",
  html: `<div style="position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">
    <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background-color: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3);"></div>
    <div style="position: relative; width: 12px; height: 12px; border-radius: 50%; background-color: #dc2626; border: 2px solid #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.25);"></div>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

// Helper component to center and zoom map when coordinates change
function ChangeMapView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom]);
  return null;
}

// Helper to convert base64 data to File object
function dataURLtoFile(dataurl: string, filename: string): File {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

interface ProfileData {
  id: number;
  name: string;
  email: string;
  telepon: string | null;
  lokasi_id: number;
  shift?: any;
  tenant?: {
    id: number;
    name: string;
    slug?: string;
  };
}

interface LokasiData {
  id: number;
  nama_lokasi: string;
  lat_kantor: string;
  long_kantor: string;
  radius: string;
}

export function MobileLemburAbsensiPage() {
  const { navigate } = useRouter();
  const { coords } = useTunas();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [cameraError, setCameraError] = useState<boolean>(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [lokasiDetail, setLokasiDetail] = useState<LokasiData | null>(null);
  const [activeLembur, setActiveLembur] = useState<any>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isCheckOut = activeLembur && activeLembur.jam_keluar === null;
  const isLemburFinished = activeLembur && activeLembur.jam_keluar !== null;

  // Haversine formula to calculate distance between two coordinates in meters
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const isFetched = useRef(false);

  // Load profile, location detail & overtime status
  useEffect(() => {
    if (isFetched.current) return;
    isFetched.current = true;

    const getProfileAndLemburStatus = async () => {
      try {
        const profileData = await fetchProfileAPI();
        setProfile(profileData);

        const lemburStatus = await fetchOvertimeStatusAPI();
        setActiveLembur(lemburStatus.active_lembur);

        if (profileData && profileData.lokasi_id) {
          try {
            const matchedLokasi = await fetchLokasiAPI(profileData.lokasi_id);
            setLokasiDetail(matchedLokasi);
          } catch (err) {
            console.error("Gagal memuat detail lokasi:", err);
          }
        }
      } catch (err) {
        console.error("Gagal memuat data lembur:", err);
      }
    };

    getProfileAndLemburStatus();
  }, []);

  // Update distance dynamically when user coordinates or office coordinates change
  useEffect(() => {
    if (coords && lokasiDetail) {
      const officeLat = parseFloat(lokasiDetail.lat_kantor);
      const officeLng = parseFloat(lokasiDetail.long_kantor);
      if (!isNaN(officeLat) && !isNaN(officeLng)) {
        const dist = calculateDistance(
          coords.latitude,
          coords.longitude,
          officeLat,
          officeLng
        );
        setDistance(dist);
      }
    }
  }, [coords, lokasiDetail]);

  const startCamera = async () => {
    setCameraError(false);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Gagal mengakses kamera:", err);
      setCameraError(true);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  // Start/stop camera when modal state changes
  useEffect(() => {
    if (isCameraModalOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isCameraModalOpen]);

  // Hook camera video srcObject when stream or videoRef resolves
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, isCameraModalOpen]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        // Flip horizontal for mirrored selfie view
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL("image/jpeg");
        setCapturedImage(dataUrl);
        setIsCameraModalOpen(false);
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setIsCameraModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!capturedImage) {
      toast.error("Silakan ambil gambar/foto terlebih dahulu.");
      return;
    }

    if (isOutsideRadius) {
      toast.error("Anda berada di luar radius lokasi kerja.");
      return;
    }

    setIsSubmitting(true);
    try {
      const imageFile = dataURLtoFile(capturedImage, `selfie_lembur_${Date.now()}.jpg`);
      const formData = new FormData();

      const now = new Date();
      const timeString = now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      });

      if (!isCheckOut) {
        // Masuk Lembur
        formData.append("lat_masuk", lat.toString());
        formData.append("long_masuk", lng.toString());
        formData.append("foto_jam_masuk", imageFile);

        const res = await postOvertimeMasukAPI(formData);
        toast.success(`Berhasil Masuk Lembur pada pukul ${timeString}`);
        setActiveLembur(res.data || res);
      } else {
        // Pulang Lembur
        formData.append("lat_keluar", lat.toString());
        formData.append("long_keluar", lng.toString());
        formData.append("foto_jam_keluar", imageFile);

        const res = await postOvertimePulangAPI(activeLembur.id, formData);
        toast.success(`Berhasil Pulang Lembur pada pukul ${timeString}`);
        setActiveLembur(res.data || res);
      }

      setCapturedImage(null);
      navigate("MobileLemburHistory");
    } catch (err: any) {
      console.error("Gagal memproses absensi lembur:", err);
      toast.error(err.message || "Gagal memproses absensi lembur, silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Map coordinates fallback if loading
  const lat = coords?.latitude ?? -6.2000;
  const lng = coords?.longitude ?? 106.8166;

  const allowedRadius = lokasiDetail ? (parseFloat(lokasiDetail.radius) || 100) : 100;
  const isOutsideRadius = distance !== null && distance > allowedRadius;

  return (
    <div className="space-y-4">
      {/* Redesigned Premium Header Bar with Pattern Background */}
      <div className="relative -mx-5 -mt-6 mb-4 overflow-hidden rounded-b-2xl bg-[#e0542c] text-white">
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `url(${patternBg})`,
            backgroundSize: "150px 150px",
            backgroundRepeat: "repeat"
          }}
        />
        <div className="relative z-10 flex items-center justify-between px-6 pt-7 pb-20 gap-3.5">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => {
                stopCamera();
                navigate("MobileLumbung");
              }}
              className="p-2 hover:bg-white/10 active:scale-95 rounded-full transition-all cursor-pointer text-white border border-white/10 bg-white/5 backdrop-blur-xs"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold tracking-widest uppercase text-white/70 leading-none">Absen Lembur</span>
              <h1 className="text-base font-bold tracking-tight text-white mt-1.5 leading-none">
                {isCheckOut ? "Pulang Lembur" : "Masuk Lembur"}
              </h1>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg bg-white/10 text-white">
              Overtime
            </span>
          </div>
        </div>
      </div>

      {/* Main Form Content */}
      <div className="space-y-4 pt-1 pb-6 relative z-10">

        {/* User Profile Info Card */}
        {profile ? (
          <div className="bg-[#f5f4ed] rounded-2xl p-4 text-zinc-800 flex items-center justify-between gap-3.5 -mt-18 relative z-10 mx-1">
            <div className="flex flex-col text-left flex-1 min-w-0">
              <span className="text-[9px] font-bold tracking-wider uppercase text-zinc-400 leading-none">
                Detail Karyawan
              </span>
              <span className="text-sm font-bold tracking-tight text-zinc-800 mt-1.5 leading-none truncate">
                {profile.name}
              </span>
              <span className="text-[10px] text-zinc-500 mt-1 leading-none truncate font-medium">
                {profile.email}
              </span>
            </div>
            <div className="flex flex-col items-end shrink-0">
              <span className="text-[9px] font-bold tracking-wider uppercase text-zinc-400 leading-none">
                Perusahaan
              </span>
              <span className="text-xs font-bold text-zinc-800 mt-1.5 leading-none">
                {profile.tenant?.name || "Default Company"}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 -mt-18 relative z-10 mx-1 animate-pulse flex items-center justify-between gap-4 h-16">
            <div className="space-y-2 flex-1">
              <div className="h-3 bg-zinc-200 rounded w-1/3" />
              <div className="h-4 bg-zinc-200 rounded w-2/3" />
            </div>
            <div className="h-8 bg-zinc-200 rounded w-16" />
          </div>
        )}

        {/* Live Map Box */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden mx-1 p-2">
          <div className="rounded-xl overflow-hidden h-48 w-full relative z-0">
            {lokasiDetail ? (
              <MapContainer
                center={[lat, lng]}
                zoom={16}
                scrollWheelZoom={false}
                zoomControl={false}
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[lat, lng]} icon={userIcon} />
                <Marker
                  position={[parseFloat(lokasiDetail.lat_kantor), parseFloat(lokasiDetail.long_kantor)]}
                  icon={officeIcon}
                />
                <Circle
                  center={[parseFloat(lokasiDetail.lat_kantor), parseFloat(lokasiDetail.long_kantor)]}
                  radius={parseFloat(lokasiDetail.radius) || 100}
                  pathOptions={{
                    color: "#dc2626",
                    fillColor: "#dc2626",
                    fillOpacity: 0.08,
                    weight: 1.5,
                    dashArray: "4 4"
                  }}
                />
                <ChangeMapView center={[lat, lng]} zoom={16} />
              </MapContainer>
            ) : (
              <div className="w-full h-full bg-zinc-50 flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-6 h-6 text-zinc-400 animate-spin" />
                <span className="text-xs text-zinc-400 font-semibold">Memuat peta lokasi...</span>
              </div>
            )}
          </div>

          {/* Location details & accuracy footer */}
          <div className="px-2.5 py-3 flex items-center justify-between gap-4 text-left border-t border-zinc-100 mt-2">
            <div className="space-y-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 leading-none">
                Lokasi Presensi
              </span>
              <p className="text-xs font-bold text-zinc-800 leading-tight">
                {lokasiDetail?.nama_lokasi || "Memuat lokasi..."}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 leading-none">
                Jarak ke Kantor
              </span>
              <p className="text-xs font-bold text-[#e0542c] leading-tight">
                {distance !== null ? `${Math.round(distance)} meter` : "Menghitung..."}
              </p>
            </div>
          </div>
        </div>

        {/* Camera capture & Image preview area */}
        <div className="mx-1">
          {capturedImage ? (
            <div className="bg-white rounded-2xl border border-zinc-200/80 p-3 flex flex-col items-center gap-3 relative">
              <div className="w-full h-64 rounded-xl overflow-hidden relative bg-zinc-900 border border-zinc-100 flex items-center justify-center">
                <img src={capturedImage} alt="Captured Selfie" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={retakePhoto}
                  className="absolute bottom-3.5 right-3.5 px-3 py-1.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider rounded-lg flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Foto Ulang
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              disabled={isLemburFinished}
              onClick={() => setIsCameraModalOpen(true)}
              className={`w-full bg-white border border-zinc-200/80 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 shadow-xs transition-all active:scale-[0.99] border-dashed text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50/50 cursor-pointer ${isLemburFinished ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <div className="w-12 h-12 rounded-full bg-[#e0542c]/10 text-[#e0542c] flex items-center justify-center">
                <Camera className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-zinc-800">
                  {isLemburFinished ? "Anda Sudah Selesai Lembur" : "Ambil Foto Selfie"}
                </p>
                <p className="text-[10px] text-zinc-400 font-medium">
                  {isLemburFinished ? "Absen lembur hari ini telah tuntas." : "Selfie verifikasi kehadiran lembur."}
                </p>
              </div>
            </button>
          )}
        </div>

        {/* Submit Button */}
        {!isLemburFinished && (
          <div className="px-1 pt-2">
            <button
              type="button"
              disabled={!capturedImage || isSubmitting || isOutsideRadius}
              onClick={handleSubmit}
              className={`w-full py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all active:scale-[0.98] cursor-pointer ${
                !capturedImage || isOutsideRadius
                  ? "bg-zinc-300 shadow-none cursor-not-allowed"
                  : "bg-gradient-to-tr from-[#e0542c] to-[#ff7e5a] shadow-[#e0542c]/20 hover:shadow-lg hover:shadow-[#e0542c]/30"
              }`}
            >
              {isSubmitting ? "Memproses..." : isCheckOut ? "Konfirmasi Pulang Lembur" : "Konfirmasi Masuk Lembur"}
            </button>
            {isOutsideRadius && (
              <p className="text-[10px] text-rose-500 font-bold text-center mt-2.5">
                Anda berada di luar jangkauan radius lokasi kantor untuk melakukan presensi lembur.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Selfie Camera Modal */}
      {isCameraModalOpen && (
        <div className="fixed inset-0 z-100 bg-black flex flex-col justify-between p-4">
          <div className="flex items-center justify-between text-white pt-2 px-1">
            <span className="text-xs font-bold uppercase tracking-wider">Verifikasi Wajah</span>
            <button
              type="button"
              onClick={() => setIsCameraModalOpen(false)}
              className="p-1.5 bg-white/10 rounded-full hover:bg-white/20 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="w-full flex-1 flex items-center justify-center py-4">
            <div className="w-full max-w-sm aspect-[3/4] rounded-2xl overflow-hidden relative bg-zinc-900 border border-white/10">
              {cameraError ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-white px-6 text-center gap-3">
                  <X className="w-8 h-8 text-rose-500" />
                  <p className="text-sm font-bold">Kamera Gagal Diakses</p>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Pastikan Anda telah memberikan izin akses kamera untuk situs ini.
                  </p>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]" // mirror view
                  />
                  <div className="absolute inset-0 border-[3px] border-[#e0542c]/30 rounded-2xl pointer-events-none m-4" />
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 pb-6">
            {!cameraError && (
              <button
                type="button"
                onClick={capturePhoto}
                className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center active:scale-90 transition-all cursor-pointer shadow-lg bg-[#e0542c]"
              >
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#e0542c]">
                  <Camera className="w-5 h-5" />
                </div>
              </button>
            )}
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wide">
              Posisikan Wajah Anda di Tengah Frame
            </span>
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}
    </div>
  );
}
