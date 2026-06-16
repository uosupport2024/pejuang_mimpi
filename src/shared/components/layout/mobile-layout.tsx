import { type ReactNode } from "react";
import { useRouter } from "@/shared/router/router";
import logoWhite from "@/assets/logo/logo-white.png";
import { SmartHome, Box, MedalStar, User } from "@solar-icons/react";

interface MobileLayoutProps {
  children: ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  const { currentRoute, navigate } = useRouter();

  const getRouteIndex = () => {
    switch (currentRoute) {
      case "MobileHome": return 0;
      case "MobileLumbung": return 1;
      case "MobilePakan": return 3;
      case "MobileProfile": return 4;
      default: return 0;
    }
  };

  const activeIndex = getRouteIndex();

  return (
    <div className="w-full min-h-screen bg-zinc-950 flex justify-center font-sans antialiased overflow-hidden">
      {/* Clean centered mobile view (no device chassis frame, full screen height) */}
      <div className="w-full max-w-[480px] h-screen bg-[#f4f5f7] shadow-2xl flex flex-col relative overflow-hidden">
        
        {/* Scrollable Main Content */}
        <div className="flex-1 overflow-y-auto pt-6 pb-20 px-5">
          {children}
        </div>

        {/* Flat Bottom Tab Navigation Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#1e2a4a] flex items-center z-40 border-t border-white/5 px-2">
          
          <div className="relative w-full grid grid-cols-5 items-center justify-items-center">
            
            {/* Sliding Highlight Square */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 h-12 w-14 bg-gradient-to-tr from-[#e0542c] to-[#ff7e5a] border border-white/10 rounded-xl shadow-sm shadow-black/10 transition-all duration-300 ease-out z-0"
              style={{ 
                left: `calc(${activeIndex * 20}% + (20% - 3.5rem) / 2)`
              }}
            />

            {/* Tab 1: Home (Sangkar) */}
            <button
              onClick={() => navigate("MobileHome")}
              className={`relative z-10 w-14 h-12 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${
                currentRoute === "MobileHome" ? "text-white font-bold" : "text-zinc-400 hover:text-zinc-300"
              }`}
            >
              <SmartHome size={20} weight={currentRoute === "MobileHome" ? "Bold" : "Linear"} />
              <span className="text-[9px] font-semibold capitalize mt-0.5 tracking-wide">Sangkar</span>
            </button>

            {/* Tab 2: Lumbung (Tunas) */}
            <button
              onClick={() => navigate("MobileLumbung")}
              className={`relative z-10 w-14 h-12 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${
                currentRoute === "MobileLumbung" ? "text-white font-bold" : "text-zinc-400 hover:text-zinc-300"
              }`}
            >
              <Box size={20} weight={currentRoute === "MobileLumbung" ? "Bold" : "Linear"} />
              <span className="text-[9px] font-semibold capitalize mt-0.5 tracking-wide">Tunas</span>
            </button>

            {/* Tab 3: Centered Check-in (White Chicken Logo) */}
            <div className="relative z-20 flex items-center justify-center w-14 h-14 -translate-y-4">
              <button
                onClick={() => alert("Fitur Presensi Masuk / Pulang dengan Pengenalan Wajah (Face Recognition) segera hadir!")}
                className="relative z-10 w-14 h-14 rounded-full bg-gradient-to-tr from-[#e0542c] to-[#ff7e5a] flex items-center justify-center shadow-md shadow-black/25 border-4 border-[#1e2a4a] hover:scale-115 active:scale-95 hover:rotate-6 transition-all duration-300 cursor-pointer group"
              >
                <img 
                  src={logoWhite} 
                  alt="Logo White" 
                  className="w-8 h-8 object-contain transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-6deg]" 
                />
              </button>
            </div>

            {/* Tab 4: E-Learning */}
            <button
              onClick={() => navigate("MobilePakan")}
              className={`relative z-10 w-14 h-12 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${
                currentRoute === "MobilePakan" ? "text-white font-bold" : "text-zinc-400 hover:text-zinc-300"
              }`}
            >
              <MedalStar size={20} weight={currentRoute === "MobilePakan" ? "Bold" : "Linear"} />
              <span className="text-[9px] font-semibold capitalize mt-0.5 tracking-wide">E-Learning</span>
            </button>

            {/* Tab 5: Profile (Sarang) */}
            <button
              onClick={() => navigate("MobileProfile")}
              className={`relative z-10 w-14 h-12 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${
                currentRoute === "MobileProfile" ? "text-white font-bold" : "text-zinc-400 hover:text-zinc-300"
              }`}
            >
              <User size={20} weight={currentRoute === "MobileProfile" ? "Bold" : "Linear"} />
              <span className="text-[9px] font-semibold capitalize mt-0.5 tracking-wide">Sarang</span>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
