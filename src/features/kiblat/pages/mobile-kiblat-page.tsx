import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { useRouter } from "@/shared/router/router";
import { THEME_COLORS } from "@/shared/constants/colors";

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

export function MobileKiblatPage() {
  const { navigate } = useRouter();

  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: DEFAULT_LAT,
    lng: DEFAULT_LNG,
  });
  const [cityName, setCityName] = useState<string>("Kota Bogor");
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [hasVibrated, setHasVibrated] = useState<boolean>(false);
  const lastVibrateTime = useRef<number>(0);

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

  // Sensor Kompas
  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    let heading: number | null = null;

    if ((e as any).webkitCompassHeading != null) {
      heading = (e as any).webkitCompassHeading;
    } else if (e.alpha != null) {
      heading = (360 - e.alpha) % 360;
    }

    if (heading !== null) {
      setDeviceHeading(heading);
    }
  }, []);

  useEffect(() => {
    const win = window as any;

    if (
      win.DeviceOrientationEvent &&
      typeof win.DeviceOrientationEvent.requestPermission === "function"
    ) {
      win.DeviceOrientationEvent.requestPermission()
        .then((perm: string) => {
          if (perm === "granted") {
            win.addEventListener("deviceorientation", handleOrientation);
          }
        })
        .catch(() => {});
    } else {
      if ("ondeviceorientationabsolute" in win) {
        win.addEventListener("deviceorientationabsolute", handleOrientation);
      } else if ("ondeviceorientation" in win) {
        win.addEventListener("deviceorientation", handleOrientation);
      }
    }

    return () => {
      win.removeEventListener("deviceorientation", handleOrientation);
      win.removeEventListener("deviceorientationabsolute", handleOrientation);
    };
  }, [handleOrientation]);

  // Selisih antara arah hadap HP (heading) dengan arah kiblat (qiblaBearing)
  // diff > 0 berarti kiblat berada di kanan, diff < 0 berarti kiblat berada di kiri
  const rawDiff = ((qiblaBearing - deviceHeading + 540) % 360) - 180;
  const absDiff = Math.abs(rawDiff);
  const isAligned = absDiff <= 3.5;

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

  // Sudut rotasi piringan kompas: dial berputar berlawanan arah heading
  const dialRotation = -deviceHeading;

  // Sudut Ka'bah pada piringan kompas adalah qiblaBearing
  // Maka pada layar, posisi Ka'bah relatif terhadap puncak (12 o'clock) adalah rawDiff
  const needleAngle = rawDiff;

  return (
    <div
      className="min-h-screen flex flex-col justify-between select-none relative overflow-x-hidden"
      style={{
        backgroundColor: THEME_COLORS.hex.leftBg, // "#f5f4ed"
        backgroundImage: `
          linear-gradient(to right, rgba(31, 41, 55, 0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(31, 41, 55, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: "22px 22px",
      }}
    >
      {/* Header Bar */}
      <div className="pt-8 px-5 pb-4 flex items-center justify-between relative z-10">
        {/* Tombol Back Bulat Putih Khas Gambar 2 */}
        <button
          type="button"
          onClick={handleBack}
          className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-stone-200/70 flex items-center justify-center text-stone-700 hover:bg-stone-50 active:scale-95 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-stone-800 stroke-[2.2]" />
        </button>

        {/* Title Center */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
          <h1
            style={{ color: THEME_COLORS.hex.textDark }}
            className="text-lg font-black tracking-tight leading-none font-sans"
          >
            Kiblat
          </h1>
          <p className="text-[11px] font-semibold text-stone-500 mt-1.5 leading-none">
            {cityName} → Makkah • {Math.round(qiblaBearing)}° Barat Laut
          </p>
        </div>

        {/* Spacer kanan agar judul tepat di tengah */}
        <div className="w-10" />
      </div>

      {/* Main Analog Compass Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-2 my-auto">
        <div className="relative w-[300px] h-[300px] flex items-center justify-center">
          {/* Ring Luar Bezel Warna Sand/Krem Hangat */}
          <div
            className="absolute inset-0 rounded-full border-[18px] shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
            style={{
              borderColor: "#ebdcc4",
              backgroundColor: "#ebdcc4",
            }}
          />

          {/* Penanda Arah HP (Segitiga Hitam di Puncak 12 o'clock) */}
          <div className="absolute top-[3px] left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none">
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[9px] border-t-stone-800" />
          </div>

          {/* Dial Lingkaran Kompas yang Berputar Mengikuti Orientasi HP */}
          <div
            className="relative w-[264px] h-[264px] rounded-full bg-[#fdfbf7] border-2 border-stone-800 overflow-hidden shadow-inner flex items-center justify-center"
            style={{
              transform: `rotate(${dialRotation}deg)`,
              transition: "transform 0.12s cubic-bezier(0.1, 0.9, 0.2, 1)",
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
            <span className="absolute right-4 text-[10px] font-bold text-stone-400">
              T
            </span>
            <span className="absolute bottom-4 text-[10px] font-bold text-stone-400">
              S
            </span>
            <span className="absolute left-4 text-[10px] font-bold text-stone-400">
              B
            </span>

            {/* Ikon Ka'bah 3D Isometric Mini di Pinggir Dial pada Derajat Kiblat */}
            <div
              style={{ transform: `rotate(${qiblaBearing}deg)` }}
              className="absolute inset-0 flex justify-center pointer-events-none"
            >
              <div className="flex flex-col items-center -mt-0.5">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-transform duration-200 ${
                    isAligned ? "scale-110" : ""
                  }`}
                  style={{
                    backgroundColor: "#1c1917",
                    border: "1.5px solid #d97706",
                    boxShadow: isAligned
                      ? "0 0 14px rgba(127, 164, 109, 0.8)"
                      : "0 2px 6px rgba(0,0,0,0.25)",
                  }}
                >
                  {/* Pita Kiswah Emas */}
                  <div className="w-full flex flex-col items-center">
                    <div className="w-full h-1 bg-[#fbbf24] border-t border-b border-[#b45309]" />
                    <div className="w-1.5 h-2.5 bg-[#f59e0b] rounded-[1px] mt-1 mr-2 self-end" />
                  </div>
                </div>
              </div>
            </div>

            {/* Poros Tengah Kompas */}
            <div className="w-5 h-5 rounded-full bg-white border-2 border-stone-800 z-20 shadow-sm flex items-center justify-center">
              <div
                style={{
                  backgroundColor: isAligned
                    ? THEME_COLORS.hex.sawahPertumbuhan
                    : THEME_COLORS.hex.primary,
                }}
                className="w-2 h-2 rounded-full transition-colors duration-200"
              />
            </div>
          </div>

          {/* Jarum Kompas Retro Gaya Gambar 2: Menunjuk Langsung ke Ka'bah */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
            style={{
              transform: `rotate(${needleAngle}deg)`,
              transition: "transform 0.12s cubic-bezier(0.1, 0.9, 0.2, 1)",
            }}
          >
            {/* Badan Jarum Kompas */}
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Batang jarum dari pusat mengarah ke atas */}
              <div
                className="absolute bottom-1/2 w-4 origin-bottom flex flex-col items-center"
                style={{ height: "92px" }}
              >
                {/* Ujung runcing jarum */}
                <div
                  className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent transition-colors duration-200"
                  style={{
                    borderBottomWidth: "18px",
                    borderBottomColor: "#1c1917",
                  }}
                />
                {/* Badan jarum berwarna emas/oranye hangat */}
                <div
                  className="w-3 flex-1 border-x-2 border-b-2 border-stone-800 transition-colors duration-200"
                  style={{
                    backgroundColor: isAligned
                      ? THEME_COLORS.hex.sawahPertumbuhan
                      : "#eab308",
                  }}
                />
              </div>

              {/* Ekor jarum pendek ke arah bawah */}
              <div
                className="absolute top-1/2 w-2.5 bg-stone-300 border-x-2 border-b-2 border-stone-800 rounded-b-sm"
                style={{ height: "18px" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Control & Feedback Section */}
      <div className="px-6 pb-8 flex flex-col items-center text-center gap-3 relative z-10">
        {/* Direction Hint Pill Button Khas Gambar 2 */}
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
            : "Putar HP perlahan sampai ikon Ka'bah masuk ke penanda di puncak lingkaran"}
        </p>

        {/* Disclaimer Footer Note */}
        <p className="text-[9.5px] font-normal text-stone-400 mt-2 max-w-xs leading-normal">
          Akurasi kompas bergantung pada sensor perangkat — untuk keperluan penting,
          mohon verifikasi dengan sumber lain.
        </p>
      </div>
    </div>
  );
}
