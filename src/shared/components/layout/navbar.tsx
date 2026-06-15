import { Search, Bell, HelpCircle, ChevronDown, User, Lock, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface NavbarProps {
  user: {
    name: string;
    role: string;
  };
  onLogout?: () => void;
}

export function Navbar({ user, onLogout }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      {/* Search input in the middle */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-4 inset-y-0 my-auto w-4.5 h-4.5 text-gray-400" />
        <input
          type="text"
          placeholder="Search product"
          className="w-full pl-11 pr-12 py-2 bg-white border border-transparent rounded-full text-xs placeholder:text-gray-400 text-gray-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#e0542c]/10 focus:border-[#e0542c]"
        />
        <span className="absolute right-4 inset-y-0 my-auto h-fit text-[10px] text-gray-400 font-mono select-none">
          K ⌘
        </span>
      </div>

      {/* Profile widget and icons */}
      <div className="flex items-center justify-end gap-3 self-end md:self-auto">
        <button className="p-2.5 rounded-full bg-white hover:bg-gray-50 border border-transparent text-gray-500 shadow-xs cursor-pointer">
          <Bell className="w-4 h-4" />
        </button>
        <button className="p-2.5 rounded-full bg-white hover:bg-gray-50 border border-transparent text-gray-500 shadow-xs cursor-pointer">
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Dropdown Container */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-3 pl-3 border border-gray-100 hover:border-gray-200 bg-white rounded-full py-1.5 pr-4 pl-1.5 shadow-xs cursor-pointer transition-all select-none"
          >
            <div className="w-8 h-8 rounded-full bg-[#e0542c] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
            </div>
            <div className="text-left hidden sm:flex flex-col justify-center min-w-0">
              <h4 className="text-xs font-bold text-gray-900 leading-tight truncate">
                {user.name}
              </h4>
              <p className="text-[10px] text-gray-400 leading-tight mt-0.5">{user.role}</p>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 ml-1 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute right-0 mt-1.5 w-44 bg-white border border-gray-100 rounded-xl shadow-md z-50 py-1 transition-all">
              <button
                onClick={() => { setIsOpen(false); alert("Fitur Profile segera hadir!"); }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer text-left"
              >
                <User className="w-3.5 h-3.5 text-gray-400" />
                Profile
              </button>
              <button
                onClick={() => { setIsOpen(false); alert("Fitur Ubah Sandi segera hadir!"); }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer text-left"
              >
                <Lock className="w-3.5 h-3.5 text-gray-400" />
                Ubah Sandi
              </button>
              <div className="border-t border-gray-100/60 my-0.5" />
              <button
                onClick={() => { setIsOpen(false); onLogout?.(); }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold text-rose-600 hover:bg-rose-50/50 transition-colors cursor-pointer text-left"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

