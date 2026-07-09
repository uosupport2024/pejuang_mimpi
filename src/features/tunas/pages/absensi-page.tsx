import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Camera, RefreshCw, CheckCircle, X } from "lucide-react";
import { useRouter } from "@/shared/router/router";
import { useTunas } from "../hooks/use-tunas";
import { toast } from "sonner";
import { fetchProfileAPI, fetchLokasiAPI, fetchJadwalHariIniAPI, postAbsenMasukAPI, postAbsenPulangAPI } from "../api/absensi";
import patternBg from "@/assets/bg/pattern-background.png";
import { AttendanceHistory } from "../components/attendance-history";

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
    <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background-color: rgba(59, 130, 246, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
    <div style="position: relative; width: 14px; height: 14px; border-radius: 50%; background-color: #2563eb; border: 2.5px solid #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.25);"></div>
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
  today_schedule?: any;
  shift?: any;
}

interface LokasiData {
  id: number;
  nama_lokasi: string;
  lat_kantor: string;
  long_kantor: string;
  radius: string;
}

export function MobileAbsensiPage() {
  const { navigate } = useRouter();
  const { coords, isCheckedIn } = useTunas();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [cameraError, setCameraError] = useState<boolean>(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [lokasiDetail, setLokasiDetail] = useState<LokasiData | null>(null);
  const [todayJadwal, setTodayJadwal] = useState<any>(null);
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(true);
  const [distance, setDistance] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isCheckOut = isCheckedIn;

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

  // Load profile, location detail & today's shift schedule
  useEffect(() => {
    if (isFetched.current) return;
    isFetched.current = true;

    const getProfileLocationAndJadwal = async () => {
      try {
        const profileData = await fetchProfileAPI();
        setProfile(profileData);

        // Try extracting today's schedule from profile response first
        if (profileData && profileData.today_schedule) {
          const schedule = { ...profileData.today_schedule };
          if (!schedule.Shift && !schedule.shift && profileData.shift) {
            schedule.Shift = profileData.shift;
          }
          setTodayJadwal(schedule);
        } else if (profileData && profileData.shift) {
          // If shift is directly in profile, create a virtual schedule object containing the shift
          setTodayJadwal({
            id: profileData.today_schedule?.id || 1, // Fallback ID
            lock_location: profileData.today_schedule?.lock_location ?? 1,
            Shift: profileData.shift,
            shift: profileData.shift
          });
        } else {
          // Fallback to fetch from /jadwal endpoint
          const todayISO = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD local date
          try {
            const jadwalList = await fetchJadwalHariIniAPI(todayISO);
            if (jadwalList && jadwalList.length > 0) {
              setTodayJadwal(jadwalList[0]);
            }
          } catch (err) {
            console.error("Gagal memuat jadwal hari ini:", err);
          }
        }

        if (profileData && profileData.lokasi_id) {
          try {
            const matchedLokasi = await fetchLokasiAPI(profileData.lokasi_id);
            setLokasiDetail(matchedLokasi);
          } catch (err) {
            console.error("Gagal memuat detail lokasi:", err);
          }
        }
      } catch (err) {
        console.error("Gagal memuat profil:", err);
      } finally {
        setIsProfileLoading(false);
      }
    };

    getProfileLocationAndJadwal();
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

    if (!todayJadwal) {
      toast.error("Jadwal shift Anda untuk hari ini tidak ditemukan.");
      return;
    }

    setIsSubmitting(true);
    try {
      const imageFile = dataURLtoFile(capturedImage, `selfie_${Date.now()}.jpg`);
      const formData = new FormData();
      formData.append("id", todayJadwal.id.toString());

      const now = new Date();
      const timeString = now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      });

      if (!isCheckOut) {
        // Absen Masuk
        formData.append("lat_absen", lat.toString());
        formData.append("long_absen", lng.toString());
        formData.append("foto_jam_absen", imageFile);
        if (todayJadwal.lock_location != 1) {
          formData.append("keterangan_masuk", "Absen Masuk Mobile");
        }
        await postAbsenMasukAPI(formData);

        toast.success(`Berhasil melakukan Absen Masuk pada pukul ${timeString}`);
      } else {
        // Absen Pulang
        formData.append("lat_pulang", lat.toString());
        formData.append("long_pulang", lng.toString());
        formData.append("foto_jam_pulang", imageFile);
        if (todayJadwal.lock_location != 1) {
          formData.append("keterangan_pulang", "Absen Pulang Mobile");
        }
        await postAbsenPulangAPI(formData);

        toast.success(`Berhasil melakukan Absen Pulang pada pukul ${timeString}`);
      }

      navigate("MobileLumbung");
    } catch (err: any) {
      console.error("Gagal memproses absensi:", err);
      toast.error(err.message || "Gagal melakukan absensi, silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Map coordinates fallback if loading
  const lat = coords?.latitude ?? -6.2000;
  const lng = coords?.longitude ?? 106.8166;

  const allowedRadius = lokasiDetail ? (parseFloat(lokasiDetail.radius) || 100) : 100;

  // lock_location is enforced only for check-in (absen masuk) when value is '1' or 1
  const isLocationLocked = todayJadwal ? (parseInt(todayJadwal.lock_location) === 1) : true;
  const isOutsideRadius = !isCheckOut && isLocationLocked && distance !== null && distance > allowedRadius;

  return (
    <div className="space-y-4">
      {/* Redesigned Premium Header Bar with Pattern Background */}
      <div className="relative -mx-5 -mt-6 mb-4 overflow-hidden rounded-b-2xl bg-[#1e2a4a] text-white">
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
              <span className="text-[10px] font-bold tracking-widest uppercase text-white/70 leading-none">Presensi Karyawan</span>
              <h1 className="text-base font-bold tracking-tight text-white mt-1.5 leading-none">
                {isCheckOut ? "Absensi Pulang" : "Absensi Masuk"}
              </h1>
            </div>
          </div>

          {/* Shift Badge on the Right */}
          <div className="text-right">
            {todayJadwal ? (
              (todayJadwal.Shift || todayJadwal.shift) ? (
                (() => {
                  const sObj = todayJadwal.Shift || todayJadwal.shift;
                  return (
                    <div className="bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-white text-left inline-flex flex-col min-w-[85px]">
                      <span className="text-[10px] font-bold uppercase tracking-wide leading-none">{sObj.nama || "Shift"}</span>
                      <span className="text-xs font-semibold text-white/80 mt-1.5 leading-none">
                        {sObj.jam_masuk?.substring(0, 5)} - {sObj.jam_keluar?.substring(0, 5)}
                      </span>
                    </div>
                  );
                })()
              ) : (
                <span className="text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg bg-white/10 text-white/70">
                  No Shift
                </span>
              )
            ) : isProfileLoading ? (
              <span className="text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg bg-white/10 text-white/40 animate-pulse">
                Loading...
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg bg-white/10 text-white/40">
                Off
              </span>
            )}
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
                {lokasiDetail?.nama_lokasi || "Menghubungkan Lokasi..."}
              </span>
            </div>

            {/* Check-In/Out Action Button on the Right */}
            <div className="shrink-0">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!capturedImage || isSubmitting || isOutsideRadius || !todayJadwal}
                className={`px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] ${!capturedImage || isOutsideRadius || !todayJadwal
                  ? "bg-zinc-200 text-zinc-400 cursor-not-allowed border border-zinc-300/40"
                  : "bg-[#e0542c] hover:bg-[#c23f1b] text-white shadow-xs cursor-pointer"
                  }`}
              >
                {isSubmitting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : !todayJadwal ? (
                  <span>No Shift</span>
                ) : isOutsideRadius ? (
                  <span>Luar Radius</span>
                ) : (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{isCheckOut ? "Absen Pulang" : "Absen Masuk"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : isProfileLoading ? (
          <div className="bg-[#f5f4ed] rounded-2xl p-4 text-zinc-400 text-xs text-center border border-zinc-200 animate-pulse">
            Memuat profil karyawan...
          </div>
        ) : null}

        {/* Grid 2 Columns for Foto and Map */}
        <div className="grid grid-cols-2 gap-3.5 w-full items-stretch">

          {/* Column 1: Camera / Avatar Card */}
          <div className="bg-white rounded-2xl p-4 text-zinc-800 border border-zinc-200/60 flex flex-col items-center justify-between gap-4 min-h-[220px]">
            <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-400 w-full text-left">Foto Absensi</span>

            <div className="relative flex flex-col items-center justify-center my-auto">
              {capturedImage ? (
                <div className="relative">
                  <img
                    src={capturedImage}
                    alt="Avatar Absen"
                    className="w-28 h-28 rounded-full object-cover border-2 border-[#e0542c]"
                  />
                  <button
                    onClick={retakePhoto}
                    className="absolute bottom-1 right-1 p-2 rounded-full bg-white border border-zinc-200 shadow-xs text-[#e0542c] hover:bg-zinc-50 active:scale-95 transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCameraModalOpen(true)}
                  className="w-28 h-28 rounded-full bg-zinc-50 border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center text-zinc-400 hover:bg-zinc-100 hover:border-zinc-300 transition-all active:scale-95 cursor-pointer group"
                >
                  <Camera className="w-7 h-7 text-zinc-400 group-hover:scale-105 transition-transform" />
                  <span className="text-[9px] font-bold uppercase mt-1.5 tracking-wider text-zinc-400">Ambil Foto</span>
                </button>
              )}
            </div>

            <div className="h-2"></div>
          </div>

          {/* Column 2: Direct Map (No Card Wrapper) */}
          <div className="rounded-2xl overflow-hidden border border-zinc-200/60 relative min-h-[220px] z-10">
            <MapContainer
              center={[lat, lng]}
              zoom={18}
              zoomControl={false}
              attributionControl={false}
              dragging={false}
              doubleClickZoom={false}
              scrollWheelZoom={false}
              boxZoom={false}
              keyboard={false}
              touchZoom={false}
              style={{ width: "100%", height: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <ChangeMapView center={[lat, lng]} zoom={18} />
              {/* User Marker */}
              <Marker position={[lat, lng]} icon={userIcon} />

              {/* Office Marker & Radius Circle */}
              {lokasiDetail && (
                (() => {
                  const officeLat = parseFloat(lokasiDetail.lat_kantor);
                  const officeLng = parseFloat(lokasiDetail.long_kantor);
                  const radius = parseFloat(lokasiDetail.radius) || 100;
                  if (!isNaN(officeLat) && !isNaN(officeLng)) {
                    return (
                      <>
                        <Marker position={[officeLat, officeLng]} icon={officeIcon} />
                        <Circle
                          center={[officeLat, officeLng]}
                          radius={radius}
                          pathOptions={{
                            color: "#e0542c",
                            fillColor: "#e0542c",
                            fillOpacity: 0.15
                          }}
                        />
                      </>
                    );
                  }
                  return null;
                })()
              )}
            </MapContainer>

            {/* Small Floating Distance Badge on Map */}
            {lokasiDetail && distance !== null && (
              <div className="absolute bottom-2 left-2 z-[400] bg-white/90 backdrop-blur-xs px-2.5 py-1.5 rounded-xl border border-zinc-200/80 text-[8px] font-bold flex flex-col text-left shadow-sm">
                <span className="text-zinc-700 truncate max-w-[100px]">{lokasiDetail.nama_lokasi} ({Math.round(distance)}m)</span>
                <span className={`uppercase mt-0.5 ${distance <= allowedRadius ? "text-[#516b46]" : "text-[#C54117]"}`}>
                  {distance <= allowedRadius ? "● Dalam Radius" : "● Luar Radius"}
                </span>
              </div>
            )}
          </div>
        </div>



        {/* Attendance History Section */}
        <AttendanceHistory />
      </div>

      {/* Camera Stream Dialog Modal - Full Screen Native App Style */}
      {isCameraModalOpen && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col justify-between overflow-hidden animate-in fade-in duration-200">

          {/* Floating Top Header */}
          <div className="absolute top-0 left-0 right-0 p-5 bg-gradient-to-b from-black/80 to-transparent z-10 flex items-center justify-between text-white">
            <span className="text-sm font-bold tracking-wider uppercase drop-shadow-md">Ambil Foto Selfie</span>
            <button
              type="button"
              onClick={() => setIsCameraModalOpen(false)}
              className="p-2 bg-black/25 hover:bg-black/45 rounded-full transition-colors cursor-pointer text-white border border-white/10 backdrop-blur-xs"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Full Screen Video Stream View */}
          <div className="w-full h-full bg-black relative flex items-center justify-center">
            {cameraError ? (
              <div className="text-center p-6 text-white max-w-xs z-10">
                <p className="text-sm text-rose-500 font-bold mb-2">Kamera Tidak Dapat Diakses</p>
                <p className="text-xs text-zinc-400">Silakan aktifkan akses kamera pada perangkat Anda untuk melakukan absensi.</p>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1] absolute inset-0 z-0"
                />

                {/* Face Silhouette Guide Overlay (Mask effect) */}
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
                  <div className="w-[65vw] h-[45dvh] max-w-[260px] max-h-[340px] rounded-[50%] border-4 border-dashed border-white/60 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] relative"></div>
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest mt-6 bg-black/60 px-4 py-2 rounded-full backdrop-blur-xs shadow-md">
                    Posisikan Wajah di Area Oval
                  </span>
                </div>
              </>
            )}
            {/* Hidden canvas for capturing frame */}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Floating Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-6 pb-10 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10 flex flex-col items-center justify-center">
            {/* Shutter Button (Center) */}
            {!cameraError && (
              <button
                type="button"
                onClick={capturePhoto}
                className="w-18 h-18 rounded-full bg-gradient-to-tr from-[#e0542c] to-[#ff7e5a] flex items-center justify-center shadow-2xl active:scale-90 hover:scale-105 transition-all cursor-pointer border-4 border-white"
              >
                <Camera className="w-6 h-6 text-white" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
