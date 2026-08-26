import { type ReactNode, useState, useEffect, useRef } from "react";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { FetchProgressBar } from "./fetch-progress-bar";
import { AdminGuidanceTour } from "./admin-guidance";
import patternBg from "@/assets/bg/pattern-background.png";

import { useTenantBranding } from "@/shared/hooks/use-tenant-branding";
import { THEME_COLORS } from "@/shared/constants/colors";

interface DashboardLayoutProps {
  user: {
    name: string;
    role: string;
    email?: string;
  };
  onLogout: () => void;
  children: ReactNode;
}

export function DashboardLayout({ user, onLogout, children }: DashboardLayoutProps) {
  const { mainColor } = useTenantBranding();
  const navbarBg = mainColor || THEME_COLORS.hex.navBg;
  const [scrolled, setScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mainElement = mainRef.current;
    if (!mainElement) return;

    const handleScroll = () => {
      if (mainElement.scrollTop > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    mainElement.addEventListener("scroll", handleScroll);
    return () => {
      mainElement.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Check if admin onboarding guidance was already completed
  useEffect(() => {
    const completed = localStorage.getItem("admin_guidance_completed");
    if (!completed) {
      const timer = setTimeout(() => {
        setIsTourOpen(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const isSuperAdmin = user.email?.toLowerCase() === "admin@gmail.com";

  return (
    <div className="admin-dashboard w-full h-screen bg-[#F7F3EB] flex flex-col lg:flex-row overflow-hidden font-sans antialiased text-gray-800">
      {/* Fixed Full-Width Top Fetch Loading Progress Bar */}
      <FetchProgressBar />

      {/* Left Sidebar (Desktop Fixed & Mobile Off-Canvas Drawer) */}
      <Sidebar user={user} isMobileOpen={isMobileOpen} onCloseMobile={() => setIsMobileOpen(false)} />

      {/* Right side: Top Navbar + Page Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Navbar inside right panel with dynamic sidebar background color */}
        <header
          style={{ backgroundColor: navbarBg }}
          className={`sticky top-0 z-40 shrink-0 transition-all duration-300 text-white border-b border-white/10 px-3 sm:px-6 py-2 shadow-sm ${
            scrolled ? "bg-opacity-95 backdrop-blur-md shadow-md" : ""
          }`}
        >
          {/* Subtle Scaled Batik Pattern Overlay */}
          <div
            className="absolute inset-0 opacity-12 pointer-events-none overflow-hidden"
            style={{
              backgroundImage: `url(${patternBg})`,
              backgroundSize: "160px auto",
              backgroundRepeat: "repeat",
            }}
          />

          <div className="relative z-10">
            <Navbar 
              user={user} 
              onLogout={onLogout} 
              onToggleMobileMenu={() => setIsMobileOpen((prev) => !prev)}
              onOpenTour={() => setIsTourOpen(true)}
            />
          </div>
        </header>

        {/* Content area: balanced responsive padding */}
        <main ref={mainRef} className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-4 sm:space-y-6">
          {children}
        </main>
      </div>

      {/* Interactive Admin Onboarding Guidance Tour Modal */}
      <AdminGuidanceTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        isSuperAdmin={isSuperAdmin}
      />
    </div>
  );
}


