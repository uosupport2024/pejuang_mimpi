import { Eye, EyeOff } from "lucide-react";
import logoWhite from "@/assets/logo/logo-white.png";
import patternBg from "@/assets/bg/pattern-background.png";
import { useHeaderBanner } from "../hooks/use-header-banner";
import type { SangkarUser } from "../types/sangkar.type";

interface HeaderBannerProps {
  user: SangkarUser;
}

export function HeaderBanner({ user }: HeaderBannerProps) {
  const {
    currentTime,
    showBalance,
    setShowBalance,
    formatDate,
    formatTime,
    formatRupiah,
  } = useHeaderBanner();

  return (
    <div className="-mt-6 -mx-5 relative">
      {/* Header Banner Card - Solid background color matching Navigation Bottom Bar (#1e2a4a) */}
      <div className="w-full bg-[#1e2a4a] text-white rounded-t-none rounded-b-[40px] shadow-lg shadow-[#1e2a4a]/20 border-b border-white/10 flex flex-col p-6 pt-7 pb-6 relative overflow-hidden">
        {/* Background Pattern - Repeating and subtle (15% opacity) */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `url(${patternBg})`,
            backgroundSize: "150px 150px",
            backgroundRepeat: "repeat"
          }}
        />

        {/* Content with Logo + Greeting & Name on left, Date & Time on right */}
        <div className="flex justify-between items-center z-10 relative mb-3.5">
          {/* Left: Logo & User Info */}
          <div className="flex items-center gap-3.5">
            <img src={logoWhite} alt="Logo" className="w-12 h-12 object-contain" />
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-extrabold tracking-wider uppercase text-white/90 leading-none">Selamat Bekerja</span>
              <span className="text-lg font-black tracking-tight text-white mt-1.5 leading-none">{user.name}</span>
            </div>
          </div>

          {/* Right: Date & Time */}
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-bold text-white/85 tracking-wide leading-none">{formatDate(currentTime)}</span>
            <span className="text-base font-black tracking-tight text-white mt-1.5 leading-none">{formatTime(currentTime)}</span>
          </div>
        </div>

        {/* Total Kekayaan Kamu Section - Always visible */}
        <div className="z-10 relative flex flex-col text-left">
          <div className="flex justify-between items-center w-full mb-1.5">
            <span className="text-xs font-semibold text-white/80 tracking-wide">Total Kekayaan Kamu</span>
            <button
              type="button"
              onClick={() => setShowBalance(!showBalance)}
              className="text-white/85 hover:text-white p-0.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
          <span className="text-2xl font-black tracking-tight -mt-0.5">
            {showBalance ? formatRupiah(7000000) : "Rp ••••••••"}
          </span>
        </div>

        {/* Footer Block */}
        <div className="flex flex-col gap-2 mt-3.5 z-10 relative">
          {/* Divider line */}
          <div className="h-[1px] bg-white/15 w-full" />

          {/* Bulan Ini Akan Mendapatkan Footer */}
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-white/80">Bulan ini akan mendapatkan</span>
            <span className="font-black text-right">
              {showBalance ? formatRupiah(3500000) : "Rp ••••••••"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
