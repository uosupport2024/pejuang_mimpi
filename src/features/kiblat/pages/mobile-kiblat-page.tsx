import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowLeft, Check, Compass } from "lucide-react";
import { useRouter } from "@/shared/router/router";
import { THEME_COLORS } from "@/shared/constants/colors";
import { useTenantBranding } from "@/shared/hooks/use-tenant-branding";
import patternBg from "@/assets/bg/pattern-background.png";
import kepalaAyam from "@/assets/logo/kepala-ayam.png";

// Koordinat Ka'bah, Masjidil Haram, Makkah
const KAABA_LAT = 21.422487;
const KAABA_LNG = 39.826206;

// Default Indonesia (Jakarta / Bogor) jika GPS belum didapatkan
const DEFAULT_LAT = -6.5971;
const DEFAULT_LNG = 106.806;

// Hitung Sudut Derajat Kiblat dari Utara Sejati
function calculateQiblaBearing(lat: number, lng: number): number {
  const phiK = (KAABA_LAT * Math.PI) / 180;
  const lambdaK = (KAABA_LNG * Math.PI) / 180;
  const phi = (lat * Math.PI) / 180;
  const lambda = (lng * Math.PI) / 180;
  const deltaLambda = lambdaK - lambda;

  const y = Math.sin(deltaLambda);
  const x = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(deltaLambda);
  let qibla = (Math.atan2(y, x) * 180) / Math.PI;
  return Math.round(((qibla + 360) % 360) * 10) / 10;
}

// Marker Ka'bah di Puncak Kompas (12 o'clock)
function KaabaMarker({ isAligned }: { isAligned: boolean }) {
  const { hex } = THEME_COLORS;

  return (
    <div className="flex flex-col items-center pointer-events-none select-none">
      <div
        className={`relative transition-all duration-300 ${
          isAligned
            ? "scale-115 drop-shadow-[0_0_14px_rgba(127,164,109,0.85)]"
            : "drop-shadow-[0_2px_5px_rgba(0,0,0,0.35)]"
        }`}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Badan Ka'bah */}
          <rect
            x="4"
            y="4"
            width="32"
            height="32"
            rx="4"
            fill={hex.textDark}
            stroke="#111827"
            strokeWidth="1.5"
          />
          {/* Garis Atap */}
          <rect x="5" y="5" width="30" height="2" rx="1" fill="#374151" />
          {/* Kiswah Pita Emas (Hizam) */}
          <rect x="4" y="13" width="32" height="5" fill={hex.padiKemakmuran} />
          <line
            x1="4"
            y1="14"
            x2="36"
            y2="14"
            stroke={hex.accent}
            strokeWidth="0.8"
          />
          <line
            x1="4"
            y1="17"
            x2="36"
            y2="17"
            stroke={hex.padiKemakmuranDark}
            strokeWidth="0.6"
          />
          {/* Pintu Ka'bah Emas (Bab al-Ka'bah) */}
          <rect
            x="22"
            y="18"
            width="9"
            height="15"
            rx="1.5"
            fill={hex.padiKemakmuran}
            stroke={hex.padiKemakmuranDark}
            strokeWidth="0.8"
          />
          <rect
            x="24"
            y="20"
            width="5"
            height="11"
            rx="1"
            fill={hex.padiKemakmuranDark}
          />
          <line
            x1="26.5"
            y1="20"
            x2="26.5"
            y2="31"
            stroke={hex.accent}
            strokeWidth="0.6"
          />
        </svg>
      </div>
      {/* Panah Penanda Arah ke Pusat Lingkaran */}
      <div
        className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] -mt-0.5 transition-colors duration-200"
        style={{
          borderTopColor: isAligned ? hex.sawahPertumbuhan : hex.primary,
        }}
      />
    </div>
  );
}

// Jarum Kompas Modern & Elegan dengan Dual-tone Facets & Theme Colors
function CompassNeedle({
  angle,
  isAligned,
}: {
  angle: number;
  isAligned: boolean;
}) {
  const { hex } = THEME_COLORS;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
      style={{
        transform: `rotate(${angle}deg)`,
        transition: "transform 0.08s ease-out",
      }}
    >
      <svg
        width="264"
        height="264"
        viewBox="0 0 264 264"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full transition-all duration-300 ${
          isAligned
            ? "filter drop-shadow-[0_0_12px_rgba(127,164,109,0.7)]"
            : "filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.3)]"
        }`}
      >
        <defs>
          {/* North Left Gradient (Terang) */}
          <linearGradient id="northFacetLeft" x1="0" y1="0" x2="1" y2="0">
            <stop
              offset="0%"
              stopColor={isAligned ? hex.sawahPertumbuhan : hex.padiKemakmuran}
            />
            <stop
              offset="100%"
              stopColor={isAligned ? hex.sawahPertumbuhanDark : hex.apiSemangat}
            />
          </linearGradient>

          {/* North Right Gradient (Bayangan/Depth) */}
          <linearGradient id="northFacetRight" x1="0" y1="0" x2="1" y2="0">
            <stop
              offset="0%"
              stopColor={isAligned ? hex.sawahPertumbuhanDark : hex.primary}
            />
            <stop
              offset="100%"
              stopColor={isAligned ? "#3f5d34" : hex.primaryHover}
            />
          </linearGradient>

          {/* South Left Gradient */}
          <linearGradient id="southFacetLeft" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f5f4ed" />
            <stop offset="100%" stopColor="#e5e4dd" />
          </linearGradient>

          {/* South Right Gradient */}
          <linearGradient id="southFacetRight" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6b7280" />
            <stop offset="100%" stopColor="#4b5563" />
          </linearGradient>
        </defs>

        {/* Jarum Utara (North): Facet Kiri Terang Mengarah ke Ka'bah */}
        <polygon
          points="132,38 125,108 132,132"
          fill="url(#northFacetLeft)"
        />

        {/* Jarum Utara (North): Facet Kanan Berbayang */}
        <polygon
          points="132,38 132,132 139,108"
          fill="url(#northFacetRight)"
        />

        {/* Tulang Tengah Mengkilap */}
        <line
          x1="132"
          y1="40"
          x2="132"
          y2="132"
          stroke={hex.accent}
          strokeOpacity="0.6"
          strokeWidth="0.75"
        />

        {/* Ekor Selatan (South): Facet Kiri */}
        <polygon
          points="132,132 127,150 132,174"
          fill="url(#southFacetLeft)"
        />

        {/* Ekor Selatan (South): Facet Kanan */}
        <polygon
          points="132,132 132,174 137,150"
          fill="url(#southFacetRight)"
        />
      </svg>
    </div>
  );
}

export function MobileKiblatPage() {
  const { navigate } = useRouter();
  const { navbarBgStyle } = useTenantBranding();

  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: DEFAULT_LAT,
    lng: DEFAULT_LNG,
  });
  const [cityName, setCityName] = useState<string>("Kota Bogor");

  // Continuous unwrapped heading to completely prevent 360° flipping/bouncing in CSS transitions
  const [unwrappedHeading, setUnwrappedHeading] = useState<number>(0);
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const unwrappedHeadingRef = useRef<number>(0);
  const hasAbsoluteRef = useRef<boolean>(false);

  // Sensor stability & stationary lock
  const lastRawHRef = useRef<number>(0);
  const stationaryFramesRef = useRef<number>(0);

  const [hasVibrated, setHasVibrated] = useState<boolean>(false);
  const lastVibrateTime = useRef<number>(0);
  const [needsPermission, setNeedsPermission] = useState<boolean>(false);

  // Ambil bearing kiblat berdasarkan lokasi user
  const qiblaBearing = calculateQiblaBearing(coords.lat, coords.lng);

  // Deteksi lokasi via Geolocation API
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
          );
          if (res.ok) {
            const data = await res.json();
            const city =
              data.address?.city ||
              data.address?.town ||
              data.address?.municipality ||
              data.address?.county ||
              data.address?.state ||
              "Lokasi Anda";
            setCityName(city);
          }
        } catch {
          // fallback silently
        }
      },
      () => {
        // Fallback default Bogor/Jakarta
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  // Filter & smoothing heading dengan Stationary Lock untuk menghentikan drifting
  const processHeading = useCallback((rawH: number) => {
    const lastRaw = lastRawHRef.current;
    const rawDiffFromLast = Math.abs(((rawH - lastRaw + 540) % 360) - 180);

    // Deteksi jika perangkat diam / tremor tangan mikro:
    // Jika perubahan sensor sangat kecil (< 0.7°), hitung frame diam
    if (rawDiffFromLast < 0.7) {
      stationaryFramesRef.current += 1;
      // Jika sudah diam stabil selama 4 frame (~60ms), KUNCI jarum agar tidak geser/drift sama sekali!
      if (stationaryFramesRef.current >= 4) {
        return;
      }
    } else {
      stationaryFramesRef.current = 0;
    }
    lastRawHRef.current = rawH;

    const currentUnwrapped = unwrappedHeadingRef.current;
    const currentNorm = ((currentUnwrapped % 360) + 360) % 360;

    // Shortest angular difference between new heading and current heading
    const delta = ((rawH - currentNorm + 540) % 360) - 180;

    // Respon responsif dan instan tanpa delay mengayun panjang
    const smoothingFactor = Math.min(1, Math.max(0.35, Math.abs(delta) / 15));
    const nextUnwrapped = currentUnwrapped + delta * smoothingFactor;

    unwrappedHeadingRef.current = nextUnwrapped;
    setUnwrappedHeading(nextUnwrapped);
    setDeviceHeading(((nextUnwrapped % 360) + 360) % 360);
  }, []);

  // Sensor Kompas
  useEffect(() => {
    const handleAbsolute = (e: any) => {
      let heading: number | null = null;
      if (e.webkitCompassHeading != null) {
        heading = e.webkitCompassHeading;
      } else if (e.alpha != null) {
        // Absolute orientation on Android
        heading = (360 - e.alpha) % 360;
      }

      if (heading !== null) {
        hasAbsoluteRef.current = true;
        processHeading(heading);
      }
    };

    const handleStandard = (e: any) => {
      // Jika sudah menerima sinyal absolute (magnetometer), abaikan event relatif agar gyro tidak drift
      if (hasAbsoluteRef.current) return;

      let heading: number | null = null;
      if (e.webkitCompassHeading != null) {
        heading = e.webkitCompassHeading;
        hasAbsoluteRef.current = true;
      } else if (e.absolute === true && e.alpha != null) {
        heading = (360 - e.alpha) % 360;
        hasAbsoluteRef.current = true;
      } else if (e.alpha != null) {
        // Fallback relative orientation
        heading = (360 - e.alpha) % 360;
      }

      if (heading !== null) {
        processHeading(heading);
      }
    };

    const win = window as any;

    if (
      win.DeviceOrientationEvent &&
      typeof win.DeviceOrientationEvent.requestPermission === "function"
    ) {
      // iOS permission prompt check
      setNeedsPermission(true);
    } else {
      // Pasang listener absolute terlebih dahulu (menggunakan kompas fisik)
      win.addEventListener("deviceorientationabsolute", handleAbsolute, true);
      win.addEventListener("deviceorientation", handleStandard, true);
    }

    return () => {
      win.removeEventListener("deviceorientationabsolute", handleAbsolute, true);
      win.removeEventListener("deviceorientation", handleStandard, true);
    };
  }, [processHeading]);

  const requestCompassPermission = async () => {
    const win = window as any;
    if (
      win.DeviceOrientationEvent &&
      typeof win.DeviceOrientationEvent.requestPermission === "function"
    ) {
      try {
        const res = await win.DeviceOrientationEvent.requestPermission();
        if (res === "granted") {
          setNeedsPermission(false);
          win.addEventListener(
            "deviceorientation",
            (e: any) => {
              const h = e.webkitCompassHeading ?? (e.alpha != null ? (360 - e.alpha) % 360 : null);
              if (h !== null) processHeading(h);
            },
            true
          );
        }
      } catch {
        // user denied or error
      }
    }
  };

  // Selisih antara arah hadap HP (heading) dengan arah kiblat (qiblaBearing)
  // diff > 0 berarti kiblat berada di kanan, diff < 0 berarti kiblat berada di kiri
  const rawDiff = ((qiblaBearing - deviceHeading + 540) % 360) - 180;
  const absDiff = Math.abs(rawDiff);
  const isAligned = absDiff <= 4;

  // Haptic Feedback getar saat pas
  useEffect(() => {
    if (isAligned && !hasVibrated && typeof navigator !== "undefined" && navigator.vibrate) {
      const now = Date.now();
      if (now - lastVibrateTime.current > 3000) {
        navigator.vibrate([60, 40, 60]);
        lastVibrateTime.current = now;
      }
      setHasVibrated(true);
    } else if (!isAligned) {
      setHasVibrated(false);
    }
  }, [isAligned, hasVibrated]);

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate("MobileAyamku");
    }
  };

  // Sudut rotasi piringan kompas berbasis unwrappedHeading agar tidak pernah memutar 360° terbalik
  const dialRotation = -unwrappedHeading;

  // Sudut Jarum Kompas: selalu mengarah ke Kiblat relatif terhadap orientasi HP
  const needleAngle = qiblaBearing - unwrappedHeading;

  return (
    <div
      className="min-h-screen flex flex-col justify-between select-none relative overflow-x-hidden -mt-6 -mx-5 pb-8"
      style={{
        backgroundColor: THEME_COLORS.hex.leftBg,
        backgroundImage: `
          linear-gradient(to right, rgba(31, 41, 55, 0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(31, 41, 55, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: "22px 22px",
      }}
    >
      {/* Header Bar — Biru Batik Rata Kanan-Kiri */}
      <div
        style={navbarBgStyle || { backgroundColor: THEME_COLORS.hex.navBg }}
        className="w-full text-white rounded-t-none rounded-b-[28px] shadow-md relative overflow-hidden mb-3 shrink-0"
      >
        {/* Batik Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `url(${patternBg})`,
            backgroundSize: "180px auto",
            backgroundRepeat: "repeat",
          }}
        />

        <div className="relative z-10 flex items-center justify-between px-5 pt-8 pb-5">
          {/* Tombol Back & Judul (Kiri) */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="p-2 hover:bg-white/15 active:scale-95 rounded-full transition-all cursor-pointer text-white border border-white/20 bg-white/10 backdrop-blur-xs shadow-xs shrink-0"
              title="Kembali"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col text-left">
              <h1 className="text-base font-bold tracking-tight text-white leading-none">
                Arah Kiblat
              </h1>
              <p className="text-[11px] font-medium text-white/80 mt-1.5 leading-none">
                {cityName} → Makkah
              </p>
            </div>
          </div>

          {/* Derajat & Arah Kiblat (Kanan) */}
          <div className="flex flex-col items-end text-right">
            <span className="text-sm font-black text-white leading-none tracking-tight">
              {Math.round(qiblaBearing)}°
            </span>
            <span className="text-[10px] font-semibold text-white/70 mt-1 leading-none">
              Barat Laut
            </span>
          </div>
        </div>
      </div>

      {/* Main Analog Compass Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-4 my-auto">
        <div className="relative w-[300px] h-[300px] flex items-center justify-center">
          {/* Ring Luar Bezel Warna Sand/Krem Hangat */}
          <div
            className="absolute inset-0 rounded-full border-[18px] shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300"
            style={{
              borderColor: isAligned ? THEME_COLORS.hex.sawahPertumbuhan + "33" : "#ebdcc4",
              backgroundColor: isAligned ? THEME_COLORS.hex.sawahPertumbuhan + "15" : "#ebdcc4",
            }}
          />

          {/* Penanda Ka'bah di Puncak 12 o'clock */}
          <div className="absolute top-[2px] left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
            <KaabaMarker isAligned={isAligned} />
          </div>

          {/* Dial Lingkaran Kompas yang Berputar Mengikuti Orientasi HP */}
          <div
            className="relative w-[264px] h-[264px] rounded-full bg-[#fdfbf7] border-2 border-stone-800 overflow-hidden shadow-inner flex items-center justify-center"
            style={{
              transform: `rotate(${dialRotation}deg)`,
              transition: "transform 0.08s ease-out",
            }}
          >
            {/* Garis-garis Tick Derajat di Sepanjang Keliling */}
            {Array.from({ length: 36 }).map((_, i) => {
              const deg = i * 10;
              const isMajor = deg % 90 === 0;
              const isMedium = deg % 30 === 0;
              return (
                <div
                  key={deg}
                  style={{ transform: `rotate(${deg}deg)` }}
                  className="absolute inset-0 flex justify-center pointer-events-none"
                >
                  <div
                    className={`w-[1.5px] ${
                      isMajor
                        ? "h-3.5 bg-stone-800"
                        : isMedium
                        ? "h-2.5 bg-stone-400"
                        : "h-1.5 bg-stone-300"
                    } mt-1`}
                  />
                </div>
              );
            })}

            {/* Titik Mata Angin: U, T, S, B */}
            <span
              style={{ color: THEME_COLORS.hex.primary }}
              className="absolute top-4 text-xs font-black tracking-wider"
            >
              U
            </span>
            <span
              style={{ color: THEME_COLORS.hex.textMuted }}
              className="absolute right-4 text-[10px] font-bold"
            >
              T
            </span>
            <span
              style={{ color: THEME_COLORS.hex.textMuted }}
              className="absolute bottom-4 text-[10px] font-bold"
            >
              S
            </span>
            <span
              style={{ color: THEME_COLORS.hex.textMuted }}
              className="absolute left-4 text-[10px] font-bold"
            >
              B
            </span>
          </div>

          {/* Jarum Kompas Presisi Faceted Modern (Mengarah ke Kiblat) */}
          <CompassNeedle angle={needleAngle} isAligned={isAligned} />

          {/* Poros Titik Tengah: Kepala Ayam Pejuang Mimpi (Tanpa Background) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <img
              src={kepalaAyam}
              alt="Kepala Ayam Pejuang Mimpi"
              className={`w-13 h-13 object-contain select-none transition-all duration-300 ${
                isAligned
                  ? "scale-115 filter drop-shadow-[0_4px_12px_rgba(127,164,109,0.8)]"
                  : "filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.25)]"
              }`}
            />
          </div>
        </div>

        {/* Prompt Izin Sensor untuk iOS Safari jika diperlukan */}
        {needsPermission && (
          <div className="mt-4">
            <button
              type="button"
              onClick={requestCompassPermission}
              style={{ backgroundColor: THEME_COLORS.hex.primary }}
              className="px-4 py-2 hover:opacity-90 text-white rounded-full text-xs font-bold shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Aktifkan Sensor Kompas</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Control & Feedback Section */}
      <div className="px-6 pb-4 flex flex-col items-center text-center gap-3 relative z-10 shrink-0">
        {/* Direction Hint Pill Button */}
        <div
          style={
            isAligned
              ? {
                  backgroundColor: THEME_COLORS.hex.sawahPertumbuhan,
                  color: "#ffffff",
                  borderColor: THEME_COLORS.hex.sawahPertumbuhanDark,
                }
              : {
                  backgroundColor: "#ffffff",
                  color: THEME_COLORS.hex.textDark,
                }
          }
          className="px-6 py-2.5 rounded-full border border-stone-200/80 shadow-md font-bold text-xs tracking-wide flex items-center gap-1.5 transition-all duration-300"
        >
          {isAligned ? (
            <>
              <Check className="w-4 h-4 text-white stroke-[2.5]" />
              <span>Tepat di Arah Kiblat</span>
            </>
          ) : rawDiff < 0 ? (
            <span>‹ Putar ke kiri</span>
          ) : (
            <span>Putar ke kanan ›</span>
          )}
        </div>

        {/* Big Degree Reading */}
        <span
          style={{
            color: isAligned
              ? THEME_COLORS.hex.sawahPertumbuhanDark
              : THEME_COLORS.hex.textDark,
          }}
          className="text-sm font-black tracking-tight"
        >
          {Math.round(absDiff)}°
        </span>

        {/* Instruction Note */}
        <p className="text-[11px] font-medium text-stone-500 max-w-xs leading-relaxed">
          {isAligned
            ? "Alhamdulillah! Posisi ponsel Anda telah tepat menghadap Ka'bah."
            : "Putar HP perlahan sampai jarum kompas mengarah tepat ke Ka'bah di puncak lingkaran"}
        </p>

        {/* Disclaimer Footer Note */}
        <p className="text-[9.5px] font-normal text-stone-400 mt-1 max-w-xs leading-normal">
          Akurasi kompas bergantung pada sensor perangkat — untuk keperluan penting,
          mohon verifikasi dengan sumber lain.
        </p>
      </div>
    </div>
  );
}
