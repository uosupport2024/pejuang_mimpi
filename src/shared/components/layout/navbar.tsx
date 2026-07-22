import { Bell, ChevronDown, User, Lock, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { useRouter } from "@/shared/router/router";
import { fetchProfileAPI } from "@/features/tunas/api/absensi";
import { THEME_COLORS } from "@/shared/constants/colors";

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
  const [tenantName, setTenantName] = useState<string>("");

  useEffect(() => {
    fetchProfileAPI()
      .then((profile) => {
        if (profile && profile.tenant && profile.tenant.name) {
          setTenantName(profile.tenant.name);
        } else {
          setTenantName("Pejuang Mimpi");
        }
      })
      .catch((err) => {
        console.error("Failed to load tenant info for navbar:", err);
        setTenantName("Pejuang Mimpi");
      });
  }, []);

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
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      {/* Title & Breadcrumbs on the left */}
      <div className="flex flex-col text-left">
        {/* Page Title */}
        <h1 className="text-base font-bold text-white tracking-tight leading-tight drop-shadow-xs">
          {title}
        </h1>
        {/* Breadcrumbs (under title) */}
        <div className="flex items-center gap-1.5 text-[10px] font-medium text-white/70 select-none mt-0.5">
          {breadcrumbs.map((crumb, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              {idx === breadcrumbs.length - 1 ? (
                <span className="text-white/90 font-semibold">{crumb.label}</span>
              ) : (
                <Link
                  to={crumb.path}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {crumb.label}
                </Link>
              )}
              {idx < breadcrumbs.length - 1 && (
                <span className="text-white/40 font-normal">/</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Profile widget and icons */}
      <div className="flex items-center justify-end gap-2.5 self-end md:self-auto">
        <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white shadow-xs cursor-pointer backdrop-blur-xs transition-colors">
          <Bell className="w-3.5 h-3.5" />
        </button>
        {/* Tenant Information Badge (Sawah Pertumbuhan Green) */}
        {tenantName && (
          <div
            style={{ backgroundColor: THEME_COLORS.hex.sawahPertumbuhan }}
            className="hidden md:flex items-center gap-1 px-3 py-1 rounded-full text-white text-[9px] font-bold tracking-wide uppercase max-w-[160px] shadow-xs shrink-0 select-none border border-white/20"
          >
            <span className="truncate">{tenantName}</span>
          </div>
        )}

        {/* Dropdown Container */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2.5 pl-1 pr-3 py-1 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full border border-white/15 shadow-xs transition-all cursor-pointer select-none text-white active:scale-98"
          >
            <div
              style={{ backgroundColor: THEME_COLORS.hex.primary }}
              className="w-7 h-7 rounded-full text-white text-[11px] font-extrabold flex items-center justify-center shrink-0 shadow-xs ring-1 ring-white/20"
            >
              {user.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
            </div>
            <div className="text-left hidden sm:flex flex-col justify-center min-w-0 gap-0.5 py-0.5">
              <h4 className="text-[11px] font-bold text-white leading-none truncate max-w-[120px]">
                {user.name}
              </h4>
              <p className="text-[9px] text-white/70 font-medium leading-none">{user.role}</p>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-white/70 ml-0.5 transition-transform duration-200 ${isOpen ? "rotate-180 text-white" : ""}`} />
          </button>

          {/* Premium Dropdown Menu */}
          {isOpen && (
            <div className="absolute right-0 mt-2.5 w-56 bg-white/95 backdrop-blur-xl border border-zinc-200/60 rounded-2xl shadow-2xl z-50 p-2 text-zinc-800 transition-all animate-in fade-in zoom-in-95 duration-150">
              {/* User Summary Box (Symmetrical Flex Center) */}
              <div
                style={{ backgroundColor: `${THEME_COLORS.hex.leftBg}` }}
                className="px-3 py-2.5 mb-1.5 rounded-xl border border-[#e0542c]/15 flex items-center gap-3"
              >
                <div
                  style={{ backgroundColor: THEME_COLORS.hex.primary }}
                  className="w-9 h-9 rounded-full text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs my-auto"
                >
                  {user.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                </div>
                <div className="min-w-0 flex-1 flex flex-col justify-center text-left my-auto gap-1">
                  <h5 style={{ color: THEME_COLORS.hex.textDark }} className="text-xs font-bold truncate leading-none">{user.name}</h5>
                  <p style={{ color: THEME_COLORS.hex.textMuted }} className="text-[10px] font-medium truncate leading-none">{user.role}</p>
                </div>
              </div>

              {/* Menu Options with Theme Colors */}
              <button
                onClick={() => { setIsOpen(false); navigate("Profile"); }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-zinc-700 hover:text-[#1f2937] hover:bg-[#5C8A90]/10 transition-all cursor-pointer text-left group"
              >
                <div
                  style={{ backgroundColor: `${THEME_COLORS.hex.airKehidupan}15`, color: THEME_COLORS.hex.airKehidupan }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
                >
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold text-[11px]">Profil Saya</span>
              </button>

              <button
                onClick={() => { setIsOpen(false); alert("Fitur Ubah Sandi segera hadir!"); }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-zinc-700 hover:text-[#1f2937] hover:bg-[#F2B233]/10 transition-all cursor-pointer text-left group"
              >
                <div
                  style={{ backgroundColor: `${THEME_COLORS.hex.padiKemakmuran}25`, color: "#916715" }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
                >
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold text-[11px]">Ubah Sandi</span>
              </button>

              <div className="my-1 border-t border-zinc-100" />

              <button
                onClick={() => { setIsOpen(false); onLogout?.(); }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium hover:bg-[#e0542c]/10 transition-all cursor-pointer text-left group"
                style={{ color: THEME_COLORS.hex.primary }}
              >
                <div
                  style={{ backgroundColor: `${THEME_COLORS.hex.primary}15`, color: THEME_COLORS.hex.primary }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-[11px]">Keluar Akun</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

