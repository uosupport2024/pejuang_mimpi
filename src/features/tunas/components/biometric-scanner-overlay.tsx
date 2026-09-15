import React from "react";
import { ScanFace } from "lucide-react";
import { THEME_COLORS } from "@/shared/constants/colors";

interface BiometricScannerOverlayProps {
  isVerifying: boolean;
}

export const BiometricScannerOverlay: React.FC<BiometricScannerOverlayProps> = ({
  isVerifying,
}) => {
  if (!isVerifying) return null;

  const brandPrimary = THEME_COLORS.hex.primary; // #e0542c
  const brandAccent = THEME_COLORS.hex.accent; // #fee279
  const brandNavBg = THEME_COLORS.hex.navBg; // #1e2a4a

  return (
    <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden select-none">
      <style>{`
        @keyframes brandLaser {
          0% {
            top: 4%;
            opacity: 0.3;
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            top: 94%;
            opacity: 0.3;
          }
        }
        @keyframes brandMeshPulse {
          0%, 100% {
            opacity: 0.85;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.015);
          }
        }
        .animate-brand-laser {
          animation: brandLaser 2.2s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite alternate;
        }
        .animate-brand-mesh {
          animation: brandMeshPulse 2.6s ease-in-out infinite;
          transform-origin: center center;
        }
      `}</style>

      {/* Spacer to push target zone to middle */}
      <div className="h-4" />

      {/* Center Biometric Target Zone */}
      <div className="relative w-[78vw] h-[54dvh] max-w-[300px] max-h-[410px] flex items-center justify-center my-auto">
        
        {/* 4 Corner Targeting Reticles [ ] using brand color */}
        <div
          style={{ borderColor: brandPrimary, boxShadow: `0 0 10px ${brandPrimary}66` }}
          className="absolute -top-2 -left-2 w-6 h-6 border-t-[3px] border-l-[3px] rounded-tl-xs"
        />
        <div
          style={{ borderColor: brandPrimary, boxShadow: `0 0 10px ${brandPrimary}66` }}
          className="absolute -top-2 -right-2 w-6 h-6 border-t-[3px] border-r-[3px] rounded-tr-xs"
        />
        <div
          style={{ borderColor: brandPrimary, boxShadow: `0 0 10px ${brandPrimary}66` }}
          className="absolute -bottom-2 -left-2 w-6 h-6 border-b-[3px] border-l-[3px] rounded-bl-xs"
        />
        <div
          style={{ borderColor: brandPrimary, boxShadow: `0 0 10px ${brandPrimary}66` }}
          className="absolute -bottom-2 -right-2 w-6 h-6 border-b-[3px] border-r-[3px] rounded-br-xs"
        />

        {/* Subtle Oval Boundary using brand primary */}
        <div
          style={{ borderColor: `${brandPrimary}40`, boxShadow: `inset 0 0 20px ${brandPrimary}25` }}
          className="absolute inset-0 rounded-[48%] border"
        />

        {/* Biometric Landmark Wireframe Mesh styled with brand primary & accent */}
        <div className="w-full h-full p-4 flex items-center justify-center animate-brand-mesh">
          <svg
            viewBox="0 0 240 320"
            className="w-full h-full"
            style={{ filter: `drop-shadow(0 0 8px ${brandPrimary}66)` }}
            fill="none"
          >
            {/* Triangular & Polygon Facet Fills (Warm brand primary tint) */}
            <polygon points="120,40 75,55 120,95" fill={`${brandPrimary}15`} />
            <polygon points="120,40 165,55 120,95" fill={`${brandPrimary}15`} />
            <polygon points="75,55 45,85 70,110" fill={`${brandPrimary}10`} />
            <polygon points="165,55 195,85 170,110" fill={`${brandPrimary}10`} />
            <polygon points="120,95 100,120 120,170" fill={`${brandPrimary}18`} />
            <polygon points="120,95 140,120 120,170" fill={`${brandPrimary}18`} />
            <polygon points="70,110 100,120 75,155" fill={`${brandPrimary}12`} />
            <polygon points="170,110 140,120 165,155" fill={`${brandPrimary}12`} />
            <polygon points="100,120 120,170 100,175" fill={`${brandPrimary}16`} />
            <polygon points="140,120 120,170 140,175" fill={`${brandPrimary}16`} />
            <polygon points="120,170 100,175 120,205" fill={`${brandPrimary}14`} />
            <polygon points="120,170 140,175 120,205" fill={`${brandPrimary}14`} />
            <polygon points="120,205 90,215 120,240" fill={`${brandPrimary}15`} />
            <polygon points="120,205 150,215 120,240" fill={`${brandPrimary}15`} />
            <polygon points="120,240 85,260 120,285" fill={`${brandPrimary}18`} />
            <polygon points="120,240 155,260 120,285" fill={`${brandPrimary}18`} />

            {/* Wireframe Connecting Lines (Brand Primary) */}
            <g stroke={brandPrimary} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" opacity="0.9">
              {/* Forehead & Crown */}
              <line x1="120" y1="40" x2="75" y2="55" />
              <line x1="120" y1="40" x2="165" y2="55" />
              <line x1="75" y1="55" x2="45" y2="85" />
              <line x1="165" y1="55" x2="195" y2="85" />
              <line x1="75" y1="55" x2="120" y2="95" />
              <line x1="165" y1="55" x2="120" y2="95" />
              <line x1="45" y1="85" x2="70" y2="110" />
              <line x1="195" y1="85" x2="170" y2="110" />

              {/* Eyebrows & Glabella */}
              <line x1="45" y1="85" x2="95" y2="90" />
              <line x1="95" y1="90" x2="120" y2="95" />
              <line x1="120" y1="95" x2="145" y2="90" />
              <line x1="145" y1="90" x2="195" y2="85" />

              {/* Eye Orbits */}
              <line x1="70" y1="110" x2="95" y2="90" />
              <line x1="70" y1="110" x2="100" y2="120" />
              <line x1="95" y1="90" x2="100" y2="120" />
              <line x1="170" y1="110" x2="145" y2="90" />
              <line x1="170" y1="110" x2="140" y2="120" />
              <line x1="145" y1="90" x2="140" y2="120" />

              {/* Nose Bridge & Pyramid */}
              <line x1="120" y1="95" x2="100" y2="120" />
              <line x1="120" y1="95" x2="140" y2="120" />
              <line x1="100" y1="120" x2="120" y2="170" />
              <line x1="140" y1="120" x2="120" y2="170" />
              <line x1="100" y1="120" x2="100" y2="175" />
              <line x1="140" y1="120" x2="140" y2="175" />
              <line x1="100" y1="175" x2="120" y2="170" />
              <line x1="140" y1="175" x2="120" y2="170" />

              {/* Cheeks & Malar Region */}
              <line x1="45" y1="85" x2="42" y2="135" />
              <line x1="70" y1="110" x2="75" y2="155" />
              <line x1="100" y1="120" x2="75" y2="155" />
              <line x1="42" y1="135" x2="75" y2="155" />
              <line x1="75" y1="155" x2="100" y2="175" />
              <line x1="195" y1="85" x2="198" y2="135" />
              <line x1="170" y1="110" x2="165" y2="155" />
              <line x1="140" y1="120" x2="165" y2="155" />
              <line x1="198" y1="135" x2="165" y2="155" />
              <line x1="165" y1="155" x2="140" y2="175" />

              {/* Mouth & Philtrum */}
              <line x1="100" y1="175" x2="90" y2="215" />
              <line x1="140" y1="175" x2="150" y2="215" />
              <line x1="120" y1="170" x2="120" y2="205" />
              <line x1="90" y1="215" x2="120" y2="205" />
              <line x1="150" y1="215" x2="120" y2="205" />
              <line x1="90" y1="215" x2="120" y2="225" />
              <line x1="150" y1="215" x2="120" y2="225" />

              {/* Lower Jaw & Chin Contour */}
              <line x1="42" y1="135" x2="52" y2="195" />
              <line x1="52" y1="195" x2="90" y2="215" />
              <line x1="52" y1="195" x2="70" y2="245" />
              <line x1="90" y1="215" x2="120" y2="240" />
              <line x1="120" y1="225" x2="120" y2="240" />
              <line x1="70" y1="245" x2="120" y2="240" />
              <line x1="70" y1="245" x2="85" y2="265" />
              <line x1="120" y1="240" x2="85" y2="265" />
              <line x1="85" y1="265" x2="120" y2="285" />

              <line x1="198" y1="135" x2="188" y2="195" />
              <line x1="188" y1="195" x2="150" y2="215" />
              <line x1="188" y1="195" x2="170" y2="245" />
              <line x1="150" y1="215" x2="120" y2="240" />
              <line x1="170" y1="245" x2="120" y2="240" />
              <line x1="170" y1="245" x2="155" y2="265" />
              <line x1="120" y1="240" x2="155" y2="265" />
              <line x1="155" y1="265" x2="120" y2="285" />
            </g>

            {/* Landmark Nodes with Gold Accent & White */}
            <g fill={brandAccent} stroke={brandPrimary} strokeWidth="1.2">
              <circle cx="120" cy="40" r="2.5" />
              <circle cx="75" cy="55" r="2.5" />
              <circle cx="165" cy="55" r="2.5" />
              <circle cx="45" cy="85" r="2.5" />
              <circle cx="195" cy="85" r="2.5" />
              <circle cx="120" cy="95" r="3" fill="#ffffff" stroke={brandPrimary} />
              <circle cx="95" cy="90" r="2.5" />
              <circle cx="145" cy="90" r="2.5" />
              <circle cx="70" cy="110" r="3" fill="#ffffff" stroke={brandPrimary} />
              <circle cx="170" cy="110" r="3" fill="#ffffff" stroke={brandPrimary} />
              <circle cx="100" cy="120" r="2.5" />
              <circle cx="140" cy="120" r="2.5" />
              <circle cx="42" cy="135" r="2.5" />
              <circle cx="198" cy="135" r="2.5" />
              <circle cx="75" cy="155" r="2.5" />
              <circle cx="165" cy="155" r="2.5" />
              <circle cx="120" cy="170" r="3.5" fill="#ffffff" stroke={brandPrimary} />
              <circle cx="100" cy="175" r="2.5" />
              <circle cx="140" cy="175" r="2.5" />
              <circle cx="52" cy="195" r="2.5" />
              <circle cx="188" cy="195" r="2.5" />
              <circle cx="120" cy="205" r="2.5" />
              <circle cx="90" cy="215" r="2.5" />
              <circle cx="150" cy="215" r="2.5" />
              <circle cx="120" cy="225" r="2.5" />
              <circle cx="120" cy="240" r="3" fill="#ffffff" stroke={brandPrimary} />
              <circle cx="70" cy="245" r="2.5" />
              <circle cx="170" cy="245" r="2.5" />
              <circle cx="85" cy="265" r="2.5" />
              <circle cx="155" cy="265" r="2.5" />
              <circle cx="120" cy="285" r="3.5" fill="#ffffff" stroke={brandPrimary} />
            </g>
          </svg>
        </div>

        {/* Sweeping Brand Laser Scanning Line */}
        <div className="absolute left-0 right-0 animate-brand-laser pointer-events-none">
          {/* Laser Core */}
          <div
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${brandAccent} 50%, transparent 100%)`,
              boxShadow: `0 0 12px ${brandPrimary}, 0 0 20px ${brandPrimary}`
            }}
            className="w-full h-[2.5px]"
          />
          {/* Trailing Soft Light Gradient */}
          <div
            style={{
              background: `linear-gradient(180deg, ${brandPrimary}35 0%, ${brandPrimary}08 50%, transparent 100%)`
            }}
            className="w-full h-8 blur-[1px]"
          />
        </div>
      </div>

      {/* Solid Brand Styled Bottom Status Card (Clean, elegant, non-lebay) */}
      <div className="w-full max-w-xs mb-3 z-30">
        <div
          style={{ backgroundColor: brandNavBg }}
          className="rounded-2xl border border-white/15 p-4 shadow-2xl flex items-center gap-3.5"
        >
          {/* Simple Icon with subtle pulse */}
          <div
            style={{ backgroundColor: `${brandPrimary}25`, borderColor: `${brandPrimary}50` }}
            className="relative flex items-center justify-center w-10 h-10 rounded-xl border shrink-0"
          >
            <ScanFace style={{ color: brandAccent }} className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0 text-left">
            <h4 className="text-xs font-semibold text-white tracking-wide">
              Memverifikasi Wajah...
            </h4>
            <p className="text-[11px] text-zinc-300 truncate mt-0.5">
              Mencocokkan dengan profil biometrik
            </p>

            {/* Clean Solid Progress Bar */}
            <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden mt-2 relative">
              <div
                style={{ backgroundColor: brandPrimary }}
                className="h-full rounded-full w-2/3 animate-pulse"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
