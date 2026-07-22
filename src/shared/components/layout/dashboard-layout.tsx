import { type ReactNode, useState, useEffect, useRef } from "react";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { FetchProgressBar } from "./fetch-progress-bar";
import patternBg from "@/assets/bg/pattern-background.png";

interface DashboardLayoutProps {
  user: {
    name: string;
    role: string;
  };
  onLogout: () => void;
  children: ReactNode;
}

export function DashboardLayout({ user, onLogout, children }: DashboardLayoutProps) {
  const [scrolled, setScrolled] = useState(false);
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

  return (
    <div className="admin-dashboard w-full h-screen bg-[#F7F3EB] flex flex-col lg:flex-row overflow-hidden font-sans antialiased text-gray-800">
      {/* Fixed Full-Width Top Fetch Loading Progress Bar */}
      <FetchProgressBar />

      {/* Left Sidebar */}
      <Sidebar />

      {/* Right side: Top Navbar + Page Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Navbar inside right panel with subtle batik navy styling */}
        <header
          className={`absolute top-0 left-0 right-0 z-50 shrink-0 transition-all duration-300 bg-[#1e2a4a] text-white border-b border-white/10 px-5 py-1.5 shadow-sm ${
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
            <Navbar user={user} onLogout={onLogout} />
          </div>
        </header>

        {/* Content area: renders active page tab */}
        <main ref={mainRef} className="flex-1 overflow-y-auto px-6 pb-6 pt-[88px] space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}

