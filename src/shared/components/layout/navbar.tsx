import { Bell, HelpCircle, ChevronDown, User, Lock, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { useRouter } from "@/shared/router/router";

interface NavbarProps {
  user: {
    name: string;
    role: string;
  };
  onLogout?: () => void;
}

export function Navbar({ user, onLogout }: NavbarProps) {
  const { navigate } = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const pathname = location.pathname;

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

  // Generate page title and breadcrumbs dynamically
  const getHeaderInfo = () => {
    const segments = pathname.split("/").filter(Boolean);
    const capitalize = (s: string) => {
      if (!s) return "";
      return s.charAt(0).toUpperCase() + s.slice(1);
    };

    let title = "Dashboard";
    const breadcrumbs = [
      { label: "Home", path: "/dashboard" }
    ];

    if (segments.length > 0) {
      const pathMap: Record<string, string> = {
        dashboard: "Dashboard",
        pegawai: "Pegawai",
        tambah: "Tambah Pegawai",
        edit: "Edit Pegawai",
        absensi: "Absensi",
        "absensi-hari-ini": "Absensi Hari Ini",
        cuti: "Cuti & Izin",
        keuangan: "Keuangan",
        overtime: "Overtime",
        shift: "Shift",
        reimbursement: "Reimbursement",
        recruitment: "Recruitment",
        onboarding: "Onboarding",
        appraisal: "Appraisal",
        training: "Training",
        document: "Document",
        announcement: "Announcement",
        divisi: "Divisi",
        lokasi: "Lokasi",
        profile: "Profil Saya",
      };

      const lastSegment = segments[segments.length - 1];
      if (segments.includes("pegawai") && segments.includes("tambah")) {
        title = "Tambah Pegawai";
      } else if (segments.includes("pegawai") && segments.includes("edit")) {
        title = "Edit Pegawai";
      } else if (segments.includes("lokasi") && segments.includes("tambah")) {
        title = "Tambah Lokasi";
      } else if (segments.includes("lokasi") && segments.includes("edit")) {
        title = "Edit Lokasi";
      } else {
        title = pathMap[lastSegment] || capitalize(lastSegment);
      }

      let currentPath = "";
      segments.forEach((seg) => {
        currentPath += `/${seg}`;
        let label = pathMap[seg] || capitalize(seg);
        if (seg === "tambah") label = "Tambah";
        if (seg === "edit") label = "Edit";
        breadcrumbs.push({
          label,
          path: currentPath
        });
      });
    } else {
      breadcrumbs.push({ label: "Dashboard", path: "/dashboard" });
    }

    return { title, breadcrumbs };
  };

  const { title, breadcrumbs } = getHeaderInfo();

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      {/* Title & Breadcrumbs on the left */}
      <div className="flex flex-col text-left">
        {/* Page Title */}
        <h1 className="text-lg font-extrabold text-gray-800 tracking-tight leading-tight">
          {title}
        </h1>
        {/* Breadcrumbs (under title) */}
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 select-none mt-0.5">
          {breadcrumbs.map((crumb, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              {idx === breadcrumbs.length - 1 ? (
                <span className="text-gray-400">{crumb.label}</span>
              ) : (
                <Link
                  to={crumb.path}
                  className="hover:text-[#e0542c] transition-colors cursor-pointer"
                >
                  {crumb.label}
                </Link>
              )}
              {idx < breadcrumbs.length - 1 && (
                <span className="text-gray-300 font-normal">/</span>
              )}
            </div>
          ))}
        </div>
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
                onClick={() => { setIsOpen(false); navigate("Profile"); }}
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
