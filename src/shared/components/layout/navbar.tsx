import { Bell, ChevronDown, User, Lock, LogOut, FileText, Calendar, Megaphone, Clock, Building2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { useRouter, type RouteType } from "@/shared/router/router";
import { fetchProfileAPI } from "@/features/tunas/api/absensi";
import { THEME_COLORS } from "@/shared/constants/colors";
import { ChangePasswordModal } from "@/shared/components/ui/change-password-modal";

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
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const pathname = location.pathname;
  const [tenantName, setTenantName] = useState<string>("");

  // Live Running Time & Date State
  const [timeState, setTimeState] = useState({
    date: "",
    time: "",
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const dateStr = now.toLocaleDateString("id-ID", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      const timeStr = now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      setTimeState({ date: dateStr, time: `${timeStr} WIB` });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const [notifications, setNotifications] = useState<Array<{
    id: number;
    title: string;
    desc: string;
    time: string;
    unread: boolean;
    type: "leave" | "shift" | "announcement";
    path: RouteType;
  }>>([
    {
      id: 1,
      title: "Pengajuan Cuti Baru",
      desc: "Rizky Kautsar mengajukan Izin Cuti Tahunan.",
      time: "5 menit lalu",
      unread: true,
      type: "leave",
      path: "Leave",
    },
    {
      id: 2,
      title: "Pembaharuan Shift",
      desc: "Jadwal Shift Minggu Depan berhasil diperbarui.",
      time: "1 jam lalu",
      unread: true,
      type: "shift",
      path: "Employee",
    },
    {
      id: 3,
      title: "Pengumuman Manajemen",
      desc: "Pengumuman jam operasional khusus telah terbit.",
      time: "Kemarin",
      unread: false,
      type: "announcement",
      path: "Announcement",
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleNotifClick = (path: RouteType, id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
    setIsNotifOpen(false);
    navigate(path);
  };

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

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
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
        {/* Notification Popover Container */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white shadow-xs cursor-pointer backdrop-blur-xs transition-all relative active:scale-95 flex items-center justify-center"
            title="Pemberitahuan"
          >
            <Bell className="w-3.5 h-3.5" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-[#e0542c] ring-2 ring-[#1e2a4a] animate-pulse" />
            )}
          </button>

          {/* Premium Notification Popup Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-white/95 backdrop-blur-xl border border-zinc-200/60 rounded-2xl shadow-2xl z-50 p-3.5 text-zinc-800 transition-all animate-in fade-in zoom-in-95 duration-150 text-left">
              {/* Popup Header */}
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-zinc-100 px-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black text-gray-900">Pemberitahuan</h4>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[#e0542c]/10 text-[#e0542c] text-[9px] font-black">
                      {unreadCount} Baru
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[10px] font-bold text-[#5C8A90] hover:text-[#3d5d61] cursor-pointer transition-colors"
                  >
                    Tandai Semua Dibaca
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-0.5">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs font-medium text-gray-400">
                    Tidak ada pemberitahuan baru.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotifClick(notif.path, notif.id)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        notif.unread
                          ? "bg-[#e0542c]/5 border-[#e0542c]/20 hover:bg-[#e0542c]/10"
                          : "bg-zinc-50/60 border-zinc-100 hover:bg-zinc-100/80"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          notif.type === "leave"
                            ? "bg-[#e0542c]/10 text-[#e0542c]"
                            : notif.type === "shift"
                            ? "bg-[#5C8A90]/10 text-[#5C8A90]"
                            : "bg-[#F2B233]/10 text-[#F2B233]"
                        }`}
                      >
                        {notif.type === "leave" ? (
                          <FileText className="w-4 h-4" />
                        ) : notif.type === "shift" ? (
                          <Calendar className="w-4 h-4" />
                        ) : (
                          <Megaphone className="w-4 h-4" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h5 className="text-[11px] font-extrabold text-gray-900 truncate">
                            {notif.title}
                          </h5>
                          <span className="text-[9px] font-semibold text-gray-400 shrink-0">
                            {notif.time}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-600 font-medium leading-snug line-clamp-2 mt-0.5">
                          {notif.desc}
                        </p>
                      </div>

                      {notif.unread && (
                        <span className="w-2 h-2 rounded-full bg-[#e0542c] shrink-0 mt-1.5" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        {/* Live Running Date & Clock Widget */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/15 shadow-xs text-white select-none shrink-0">
          <Clock className="w-3.5 h-3.5 text-white/80 shrink-0" />
          <div className="flex items-center gap-1.5 text-left">
            <span className="text-[10.5px] font-black text-white tracking-wider font-mono">
              {timeState.time || "00:00:00 WIB"}
            </span>
            <span className="text-white/30 text-xs font-normal">|</span>
            <span className="text-[9.5px] font-bold text-white/80 tracking-tight">
              {timeState.date}
            </span>
          </div>
        </div>

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
              {/* User Summary Box (Solid Batik Navy Background) */}
              <div className="px-3 py-2.5 mb-1.5 rounded-xl bg-[#1e2a4a] text-white flex items-center gap-3 shadow-xs">
                <div
                  style={{ backgroundColor: THEME_COLORS.hex.primary }}
                  className="w-9 h-9 rounded-full text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs my-auto ring-2 ring-white/20"
                >
                  {user.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                </div>
                <div className="min-w-0 flex-1 flex flex-col justify-center text-left my-auto gap-0.5">
                  <h5 className="text-xs font-extrabold text-white truncate leading-none">{user.name}</h5>
                  <p className="text-[10px] text-white/70 font-medium truncate leading-none mt-0.5">{user.role}</p>
                </div>
              </div>

              {/* Tenant / Organization Info Badge (Solid Sawah Pertumbuhan Green Background) */}
              {tenantName && (
                <div className="px-3 py-2 mb-2 rounded-xl bg-[#7FA46D] text-white flex items-center justify-between text-left shadow-xs">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-white" />
                    <span className="text-[10px] font-extrabold text-white/90 uppercase tracking-wider">Tenant</span>
                  </div>
                  <span className="text-[10px] font-black text-white uppercase tracking-wider truncate max-w-[110px]">
                    {tenantName}
                  </span>
                </div>
              )}

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
                onClick={() => { setIsOpen(false); setIsPasswordModalOpen(true); }}
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

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
}

