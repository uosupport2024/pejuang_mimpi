import { type ReactNode, useState, useEffect, useRef } from "react";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";

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
    <div className="w-full h-screen bg-[#f4f5f7] flex flex-col lg:flex-row overflow-hidden font-sans antialiased text-gray-800">
      {/* Left Sidebar */}
      <Sidebar onLogout={onLogout} />

      {/* Right side: Top Navbar + Page Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Navbar inside right panel */}
        <header className={`absolute top-0 left-0 right-0 z-50 shrink-0 transition-all duration-300 ${scrolled
            ? "bg-[#f4f5f7]/40 backdrop-blur-md border-b border-gray-200/50 py-2.5 px-6 md:px-8 shadow-xs"
            : "bg-transparent py-3 px-6 md:px-8"
          }`}>
          <Navbar user={user} onLogout={onLogout} />
        </header>

        {/* Content area: renders active page tab */}
        <main ref={mainRef} className="flex-1 overflow-y-auto px-6 pb-6 pt-[76px] md:px-8 md:pb-8 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}

