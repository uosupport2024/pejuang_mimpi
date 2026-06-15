import { Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";
import logoWhite from "@/assets/logo/logo-white.png";
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
    isExpanded,
    setIsExpanded,
    formatDate,
    formatTime,
    formatRupiah,
  } = useHeaderBanner();

  return (
    <div className="-mt-6 -mx-5 relative">
      {/* Header Banner Card */}
      <div className={`w-full bg-gradient-to-b from-[#e0542c] to-[#ff7e5a] text-white rounded-t-none rounded-b-[40px] shadow-lg shadow-[#e0542c]/25 border-b border-white/10 flex flex-col transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? "p-6 pt-7 pb-6 max-h-[300px]" : "p-6 pt-6 pb-5 max-h-[112px]"
        }`}>
        {/* Glow overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent pointer-events-none rounded-b-[40px]" />

        {/* Content with Logo + Greeting & Name on left, Date & Time on right (collapsible) */}
        <div className={`transition-all duration-300 ease-in-out overflow-hidden flex justify-between items-center z-10 relative ${isExpanded ? "max-h-[80px] opacity-100 mb-3.5" : "max-h-0 opacity-0 mb-0 pointer-events-none"
          }`}>
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

        {/* Footer Block (collapsible) */}
        <div className={`transition-all duration-300 ease-in-out overflow-hidden flex flex-col gap-2 ${isExpanded ? "max-h-[80px] opacity-100 mt-3.5" : "max-h-0 opacity-0 mt-0 pointer-events-none"
          }`}>
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

      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-5 z-20 w-12 h-5 rounded-t-none rounded-b-lg bg-[#ff7e5a] hover:bg-[#e0542c] border border-white/20 text-white flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md shadow-black/10 group"
        title={isExpanded ? "Sembunyikan Detail" : "Tampilkan Detail"}
      >
        {isExpanded ? (
          <ChevronUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
        )}
      </button>
    </div>
  );
}
