import React from "react";
import { ScanFace } from "lucide-react";

interface BiometricScannerOverlayProps {
  isVerifying: boolean;
}

export const BiometricScannerOverlay: React.FC<BiometricScannerOverlayProps> = ({
  isVerifying,
}) => {
  if (!isVerifying) return null;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden select-none">
      <style>{`
        @keyframes biometricLaser {
          0% {
            top: 2%;
            opacity: 0.4;
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            top: 96%;
            opacity: 0.4;
          }
        }
        @keyframes radarSweep {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes meshPulse {
          0%, 100% {
            opacity: 0.82;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.015);
          }
        }
        @keyframes hudBlink {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.9; }
        }
        .animate-laser {
          animation: biometricLaser 2.2s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite alternate;
        }
        .animate-mesh {
          animation: meshPulse 2.8s ease-in-out infinite;
          transform-origin: center center;
        }
        .animate-hud-blink {
          animation: hudBlink 1.4s ease-in-out infinite;
        }
      `}</style>

      {/* Top HUD Telemetry Bar */}
      <div className="w-full flex items-center justify-between text-[9px] font-mono tracking-widest text-cyan-400/90 pt-1 px-2">
        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-semibold uppercase">AI BIOMETRICS v2.4</span>
        </div>
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-cyan-500/30 text-[9px] text-cyan-300">
          <span className="opacity-70">MATCHING:</span>
          <span className="font-bold text-cyan-400 animate-pulse">ANALYZING</span>
        </div>
      </div>

      {/* Center Biometric Target Zone */}
      <div className="relative w-[78vw] h-[54dvh] max-w-[310px] max-h-[420px] flex items-center justify-center my-auto">
        
        {/* 4 Corner Targeting Reticles [ ] */}
        <div className="absolute -top-2 -left-2 w-7 h-7 border-t-[3px] border-l-[3px] border-cyan-400 shadow-[0_0_10px_#22d3ee] rounded-tl-sm" />
        <div className="absolute -top-2 -right-2 w-7 h-7 border-t-[3px] border-r-[3px] border-cyan-400 shadow-[0_0_10px_#22d3ee] rounded-tr-sm" />
        <div className="absolute -bottom-2 -left-2 w-7 h-7 border-b-[3px] border-l-[3px] border-cyan-400 shadow-[0_0_10px_#22d3ee] rounded-bl-sm" />
        <div className="absolute -bottom-2 -right-2 w-7 h-7 border-b-[3px] border-r-[3px] border-cyan-400 shadow-[0_0_10px_#22d3ee] rounded-br-sm" />

        {/* Subtle Oval Boundary Glow */}
        <div className="absolute inset-0 rounded-[48%] border border-cyan-500/30 shadow-[inset_0_0_20px_rgba(6,182,212,0.15)]" />

        {/* Left Side Telemetry Bars (as seen in Image 3) */}
        <div className="absolute -left-10 sm:-left-14 top-1/4 flex flex-col gap-1.5 opacity-75">
          <div className="w-6 h-1 bg-cyan-400/80 rounded-xs shadow-[0_0_6px_#22d3ee]" />
          <div className="w-9 h-1 bg-cyan-400/60 rounded-xs" />
          <div className="w-5 h-1 bg-cyan-400/90 rounded-xs shadow-[0_0_6px_#22d3ee]" />
          <div className="w-8 h-1 bg-cyan-400/50 rounded-xs" />
          <div className="w-4 h-1 bg-cyan-400/70 rounded-xs" />
          <span className="text-[7px] font-mono text-cyan-300 tracking-tighter mt-1">68-PTS</span>
        </div>

        {/* Right Side Telemetry Metrics (as seen in Image 3) */}
        <div className="absolute -right-10 sm:-right-14 top-1/3 flex flex-col items-end gap-1.5 opacity-75">
          {/* Mini pulse wave */}
          <svg className="w-8 h-4 text-cyan-400" viewBox="0 0 32 16" fill="none" stroke="currentColor">
            <path d="M0 8h8l3-6 4 12 3-6h14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="w-7 h-1 bg-cyan-400/80 rounded-xs" />
          <div className="w-5 h-1 bg-cyan-400/50 rounded-xs" />
          <span className="text-[7px] font-mono text-cyan-300 tracking-tighter mt-1">CONF: 98%</span>
        </div>

        {/* Biometric Landmark Wireframe Mesh (Image 3 exact topology) */}
        <div className="w-full h-full p-4 flex items-center justify-center animate-mesh">
          <svg
            viewBox="0 0 240 320"
            className="w-full h-full filter drop-shadow-[0_0_8px_rgba(6,182,212,0.65)]"
            fill="none"
          >
            {/* Triangular & Polygon Facet Fills (subtle semi-transparent cyan glow) */}
            <polygon points="120,40 75,55 120,95" fill="rgba(6,182,212,0.06)" />
            <polygon points="120,40 165,55 120,95" fill="rgba(6,182,212,0.06)" />
            <polygon points="75,55 45,85 70,110" fill="rgba(6,182,212,0.05)" />
            <polygon points="165,55 195,85 170,110" fill="rgba(6,182,212,0.05)" />
            <polygon points="120,95 100,120 120,170" fill="rgba(6,182,212,0.08)" />
            <polygon points="120,95 140,120 120,170" fill="rgba(6,182,212,0.08)" />
            <polygon points="70,110 100,120 75,155" fill="rgba(6,182,212,0.06)" />
            <polygon points="170,110 140,120 165,155" fill="rgba(6,182,212,0.06)" />
            <polygon points="100,120 120,170 100,175" fill="rgba(6,182,212,0.08)" />
            <polygon points="140,120 120,170 140,175" fill="rgba(6,182,212,0.08)" />
            <polygon points="120,170 100,175 120,205" fill="rgba(6,182,212,0.06)" />
            <polygon points="120,170 140,175 120,205" fill="rgba(6,182,212,0.06)" />
            <polygon points="120,205 90,215 120,240" fill="rgba(6,182,212,0.07)" />
            <polygon points="120,205 150,215 120,240" fill="rgba(6,182,212,0.07)" />
            <polygon points="120,240 85,260 120,285" fill="rgba(6,182,212,0.09)" />
            <polygon points="120,240 155,260 120,285" fill="rgba(6,182,212,0.09)" />

            {/* Wireframe Connecting Lines (Teal/Cyan) */}
            <g stroke="#22d3ee" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.85">
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

            {/* Glowing Landmark Nodes (Dots at key biometric vertices) */}
            <g fill="#cffafe" stroke="#06b6d4" strokeWidth="1.5">
              <circle cx="120" cy="40" r="2.5" />
              <circle cx="75" cy="55" r="2.5" />
              <circle cx="165" cy="55" r="2.5" />
              <circle cx="45" cy="85" r="2.5" />
              <circle cx="195" cy="85" r="2.5" />
              <circle cx="120" cy="95" r="3" fill="#ffffff" />
              <circle cx="95" cy="90" r="2.5" />
              <circle cx="145" cy="90" r="2.5" />
              <circle cx="70" cy="110" r="3" fill="#ffffff" />
              <circle cx="170" cy="110" r="3" fill="#ffffff" />
              <circle cx="100" cy="120" r="2.5" />
              <circle cx="140" cy="120" r="2.5" />
              <circle cx="42" cy="135" r="2.5" />
              <circle cx="198" cy="135" r="2.5" />
              <circle cx="75" cy="155" r="2.5" />
              <circle cx="165" cy="155" r="2.5" />
              <circle cx="120" cy="170" r="3.5" fill="#ffffff" />
              <circle cx="100" cy="175" r="2.5" />
              <circle cx="140" cy="175" r="2.5" />
              <circle cx="52" cy="195" r="2.5" />
              <circle cx="188" cy="195" r="2.5" />
              <circle cx="120" cy="205" r="2.5" />
              <circle cx="90" cy="215" r="2.5" />
              <circle cx="150" cy="215" r="2.5" />
              <circle cx="120" cy="225" r="2.5" />
              <circle cx="120" cy="240" r="3" fill="#ffffff" />
              <circle cx="70" cy="245" r="2.5" />
              <circle cx="170" cy="245" r="2.5" />
              <circle cx="85" cy="265" r="2.5" />
              <circle cx="155" cy="265" r="2.5" />
              <circle cx="120" cy="285" r="3.5" fill="#ffffff" />
            </g>
          </svg>
        </div>

        {/* Sweeping Cyan Laser Scanning Line */}
        <div className="absolute left-0 right-0 animate-laser pointer-events-none">
          {/* Laser Core */}
          <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_15px_#22d3ee,0_0_25px_#06b6d4]" />
          {/* Trailing Soft Light Gradient */}
          <div className="w-full h-10 bg-gradient-to-b from-cyan-400/25 via-cyan-500/5 to-transparent blur-[1px]" />
        </div>
      </div>

      {/* Futuristic Bottom Floating HUD Pill */}
      <div className="w-full max-w-xs mb-2 z-30">
        <div className="relative overflow-hidden rounded-2xl bg-black/85 backdrop-blur-xl border border-cyan-500/40 p-4 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(6,182,212,0.25)] flex items-center gap-3.5">
          {/* Pulsing Biometric Radar Icon */}
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-cyan-950/80 border border-cyan-400/40 shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-xl bg-cyan-400/30" />
            <ScanFace className="w-6 h-6 text-cyan-300 relative z-10" />
          </div>

          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white tracking-wide uppercase flex items-center gap-1.5">
                Memindai Wajah
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              </h4>
              <span className="text-[10px] font-mono text-cyan-400 font-semibold">AI MODEL</span>
            </div>
            <p className="text-[11px] text-zinc-300 truncate mt-0.5 font-sans">
              Mencocokkan geometri biometrik...
            </p>

            {/* Glowing Cyber Scanner Line Bar */}
            <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mt-2 relative">
              <div className="h-full bg-gradient-to-r from-cyan-500 via-teal-300 to-cyan-400 rounded-full w-2/3 animate-pulse shadow-[0_0_8px_#22d3ee]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
