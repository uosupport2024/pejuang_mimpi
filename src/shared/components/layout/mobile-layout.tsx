import { type ReactNode, useState, useEffect } from "react";
import { useRouter } from "@/shared/router/router";
import logoWhite from "@/assets/logo/logo-white.png";
import { SmartHome, Box, MedalStar, User, InfoCircle } from "@solar-icons/react";
import { MobileGuidanceTour } from "./mobile-guidance";
import { isMenuEnabled, subscribePermissions } from "@/shared/utils/tenant-permissions";
import { useTenantBranding } from "@/shared/hooks/use-tenant-branding";
import { THEME_COLORS, buildCssBackground } from "@/shared/constants/colors";

interface MobileLayoutProps {
  children: ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  const { currentRoute, navigate } = useRouter();
  const { sidebarBg, sidebarBgStyle, buttonColor } = useTenantBranding();
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [, setPermissionTick] = useState(0);

  useEffect(() => {
    return subscribePermissions(() => {
      setPermissionTick((t) => t + 1);
    });
  }, []);

  useEffect(() => {
    const completed = localStorage.getItem("mobile_guidance_completed");
    if (!completed) {
      const timer = setTimeout(() => {
        setIsTourOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Define all available tabs
  const allTabs = [
    { key: "MobileHome", label: "Sangkar", icon: SmartHome, isCenterButton: false },
    { key: "MobileLumbung", label: "Pakan", icon: Box, isCenterButton: false },
    { key: "MobileAyamku", label: "Ayamku", icon: logoWhite, isCenterButton: true },
    { key: "MobilePakan", label: "Tunas", icon: MedalStar, isCenterButton: false },
    { key: "MobileProfile", label: "Induk", icon: User, isCenterButton: false },
  ] as const;

  // Filter only tabs that are currently enabled for this tenant
  const activeTabs = allTabs.filter((tab) => isMenuEnabled(tab.key));

  // Find index of current active route within the enabled tabs array
  const activeIndex = activeTabs.findIndex((tab) => tab.key === currentRoute);

  const handleStepChange = (index: number) => {
    if (activeTabs[index]) {
      navigate(activeTabs[index].key as any);
    }
  };

  const isTabRoute = currentRoute === "MobileHome" || 
                     currentRoute === "MobileLumbung" || 
                     currentRoute === "MobileAyamku" || 
                     currentRoute === "MobilePakan" || 
                     currentRoute === "MobileProfile";

  return (
    <div className="w-full min-h-screen bg-zinc-950 flex justify-center font-sans antialiased overflow-hidden">
      {/* Clean centered mobile view (no device chassis frame, full screen height) */}
      <div className="w-full max-w-[480px] h-[100dvh] bg-[#F7F3EB] shadow-2xl flex flex-col relative overflow-hidden">
        
        {/* Scrollable Main Content */}
        <div className="flex-1 overflow-y-auto scrollbar-none pt-6 px-5">
          {children}
          {/* Spacer to guarantee scrolling clearance of bottom navigation */}
          {isTabRoute && <div className="h-32 w-full shrink-0" />}
        </div>

        {/* Bottom Tab Bar Navigation */}
        {isTabRoute && activeTabs.length > 0 && (
          <div
            style={sidebarBgStyle}
            className="absolute bottom-0 left-0 right-0 h-[74px] pb-3 pt-1 border-t border-white/10 px-2 flex items-center justify-around z-30"
          >
            <div className="w-full max-w-[440px] flex items-center justify-between relative h-full">
              
              {/* Sliding Active Pill */}
              {activeIndex >= 0 && !activeTabs[activeIndex]?.isCenterButton && (
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-14 h-12 rounded-2xl transition-all duration-300 ease-out shadow-md shadow-black/20 z-0"
                  style={{ 
                    left: `calc(${(activeIndex + 0.5) * (100 / activeTabs.length)}% - 1.75rem)`,
                    background: buildCssBackground(buttonColor, THEME_COLORS.hex.primary)
                  }}
                />
              )}

              {/* Render dynamic active tabs */}
              {activeTabs.map((tab) => {
                const isActive = currentRoute === tab.key;
                
                if (tab.isCenterButton) {
                  return (
                    <div 
                      key={tab.key}
                      style={{ width: `${100 / activeTabs.length}%` }} 
                      className="relative z-20 flex items-center justify-center h-full"
                    >
                      <button
                        onClick={() => navigate("MobileAyamku")}
                        style={{
                          background: buildCssBackground(buttonColor, THEME_COLORS.hex.primary),
                          borderColor: typeof sidebarBg === "string" ? sidebarBg : THEME_COLORS.hex.navBg
                        }}
                        className="relative z-10 w-14 h-14 -translate-y-4 rounded-full flex items-center justify-center shadow-lg shadow-black/30 border-4 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer group"
                      >
                        <img 
                          src={logoWhite} 
                          alt="Logo White" 
                          className="w-8 h-8 object-contain transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-6deg]" 
                        />
                      </button>
                    </div>
                  );
                }

                const IconComponent = tab.icon;

                return (
                  <button
                    key={tab.key}
                    onClick={() => navigate(tab.key as any)}
                    style={{ width: `${100 / activeTabs.length}%` }}
                    className={`relative z-10 h-12 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${
                      isActive ? "text-white font-bold" : "text-zinc-300 hover:text-white"
                    }`}
                  >
                    <IconComponent size={20} weight={isActive ? "Bold" : "Linear"} />
                    <span className="text-[10px] font-semibold capitalize mt-0.5 tracking-wide text-white">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Floating Help Button — disembunyikan di page Ayamku */}
        {isTabRoute && !isTourOpen && currentRoute !== "MobileAyamku" && (
          <button
            onClick={() => setIsTourOpen(true)}
            style={sidebarBgStyle}
            className="absolute bottom-22 right-4 w-9 h-9 rounded-full backdrop-blur-xs border border-white/10 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer z-50"
          >
            <InfoCircle size={18} weight="Bold" />
          </button>
        )}

      {/* Mobile Guidance Tour Overlay */}
      <MobileGuidanceTour isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} onStepChange={handleStepChange} />

      </div>
    </div>
  );
}
