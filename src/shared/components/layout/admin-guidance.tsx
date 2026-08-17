import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, type RouteType } from "@/shared/router/router";
import { X, ChevronRight, ChevronLeft } from "lucide-react";

interface AdminGuidanceTourProps {
  isOpen: boolean;
  onClose: () => void;
  isSuperAdmin?: boolean;
}

export interface AdminTourStep {
  id: string;
  parentMenu?: string;
  menuName?: string;
  category: string;
  title: string;
  desc: string;
  route?: RouteType;
}

export function AdminGuidanceTour({ isOpen, onClose, isSuperAdmin = false }: AdminGuidanceTourProps) {
  const { navigate } = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  const steps: AdminTourStep[] = [
    {
      id: "dashboard",
      menuName: "Dashboard",
      category: "Utama",
      title: "Dashboard",
      route: "Dashboard",
      desc: "Pantau metrik absensi harian secara real-time, grafik tren kehadiran mingguan, serta antrean permohonan yang menunggu persetujuan.",
    },
    {
      id: "pegawai",
      menuName: "Pegawai",
      category: "Data Master",
      title: "Pegawai",
      route: "Employee",
      desc: "Kelola data master seluruh karyawan, detail kontrak kerja, rekening payroll, serta impor massal data via Excel.",
    },
    {
      id: "shift",
      menuName: "Shift",
      category: "Data Master",
      title: "Shift & Jadwal",
      route: "Shift",
      desc: "Atur konfigurasi jam kerja masuk & pulang, serta pemetaan jadwal shift mingguan ke masing-masing karyawan.",
    },
    {
      id: "divisi",
      menuName: "Divisi",
      category: "Data Master",
      title: "Divisi & Jabatan",
      route: "Organization",
      desc: "Kelola struktur organisasi perusahaan, daftar jabatan, dan penugasan manajer penanggung jawab divisi.",
    },
    {
      id: "lokasi",
      menuName: "Lokasi",
      category: "Data Master",
      title: "Lokasi Kantor",
      route: "Location",
      desc: "Tentukan titik koordinat kantor cabang dan radius batas toleransi geofencing untuk validasi absensi GPS.",
    },
    {
      id: "absensi-rekap",
      parentMenu: "Absensi",
      menuName: "Absensi - Rekap Data",
      category: "Operasional",
      title: "Absensi: Rekap Data",
      route: "Attendance",
      desc: "Laporan rekapitulasi kehadiran karyawan berkala, riwayat presensi beserta foto swafoto, dan ekspor laporan ke Excel/PDF.",
    },
    {
      id: "absensi-hari-ini",
      parentMenu: "Absensi",
      menuName: "Absensi - Absensi Hari Ini",
      category: "Operasional",
      title: "Absensi: Hari Ini",
      route: "AttendanceToday",
      desc: "Monitoring langsung kehadiran seluruh karyawan hari ini secara real-time (hadir, terlambat, izin, maupun belum presensi).",
    },
    {
      id: "lembur",
      menuName: "Lembur",
      category: "Operasional",
      title: "Lembur (Overtime)",
      route: "Overtime",
      desc: "Verifikasi pengajuan lembur dengan bukti foto selfie & lokasi GPS, serta setujui atau tolak lembur staf secara instan.",
    },
    {
      id: "pelatihan",
      menuName: "Pelatihan",
      category: "Operasional",
      title: "Pelatihan & LMS",
      route: "Training",
      desc: "Buat materi kursus bertahap (video, teks, kuis interaktif) dan kelola publikasi pelatihan untuk karyawan.",
    },
    {
      id: "keuangan-rekap",
      parentMenu: "Keuangan",
      menuName: "Keuangan - Rekap Data",
      category: "Layanan",
      title: "Keuangan: Rekap Gaji",
      route: "Payroll",
      desc: "Pengelolaan kalkulasi gaji bulanan karyawan meliputi gaji pokok, tunjangan makan/transport, lembur, kasbon, dan potongan.",
    },
    {
      id: "keuangan-riwayat",
      parentMenu: "Keuangan",
      menuName: "Keuangan - Riwayat",
      category: "Layanan",
      title: "Keuangan: Riwayat",
      route: "PayrollHistory",
      desc: "Arsip riwayat slip gaji digital dan rekam jejak pembayaran payroll karyawan per periode bulan dan tahun.",
    },
    {
      id: "pengajuan-cuti",
      parentMenu: "Pengajuan",
      menuName: "Pengajuan - Cuti & Izin",
      category: "Layanan",
      title: "Pengajuan: Cuti & Izin",
      route: "Leave",
      desc: "Pusat verifikasi dan persetujuan pengajuan cuti tahunan, izin sakit, atau dispensasi khusus beserta pemotongan kuota cuti.",
    },
    {
      id: "pengajuan-koreksi",
      parentMenu: "Pengajuan",
      menuName: "Pengajuan - Absensi",
      category: "Layanan",
      title: "Pengajuan: Koreksi Absen",
      route: "KoreksiAbsenApproval",
      desc: "Persetujuan permohonan koreksi jam masuk atau pulang bagi karyawan yang lupa melakukan presensi di ponsel/kantor.",
    },
    ...(isSuperAdmin
      ? [
          {
            id: "tenant-mapping",
            menuName: "Mapping Tenant",
            category: "Super Admin",
            title: "Mapping Tenant",
            route: "TenantMapping" as RouteType,
            desc: "Kelola konfigurasi multi-tenant, toggle menu aktif/nonaktif per perusahaan, dan atur izin hak akses API (RBAC).",
          },
        ]
      : []),
  ];

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
    }
  }, [isOpen]);

  const currentStep = steps[currentIndex];

  const cardRef = useRef<HTMLDivElement>(null);

  // Auto-expand parent dropdown if step requires it, and update target spotlight rect
  useEffect(() => {
    if (!isOpen) return;

    if (currentStep?.parentMenu) {
      window.dispatchEvent(
        new CustomEvent("open-sidebar-menu", {
          detail: { menuName: currentStep.parentMenu },
        })
      );
    }

    const updateRect = () => {
      if (currentStep?.menuName) {
        const el = document.querySelector(`[data-menu-id="${currentStep.menuName}"]`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          const rect = el.getBoundingClientRect();
          setSpotlightRect({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          });
          return;
        }
      }
      setSpotlightRect(null);
    };

    const timer = setTimeout(updateRect, 80);
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [isOpen, currentIndex, currentStep]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex]);

  if (!isOpen) return null;

  const totalSteps = steps.length;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalSteps - 1;

  const handleNext = () => {
    if (currentIndex < totalSteps - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleClose = () => {
    localStorage.setItem("admin_guidance_completed", "true");
    onClose();
  };

  const handleJumpToMenu = (route?: RouteType) => {
    if (route) {
      navigate(route);
      handleClose();
    }
  };

  // Card Positioning logic: Position directly attached to spotlight menu on desktop
  const isTargetVisible = !!spotlightRect;
  const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;

  let cardStyle: React.CSSProperties = {};
  let arrowTop = 24;

  if (isTargetVisible && spotlightRect && isDesktop) {
    const targetCenterY = spotlightRect.top + spotlightRect.height / 2;
    const cardHeightEst = cardRef.current?.offsetHeight || 260;
    const idealTop = targetCenterY - cardHeightEst / 2;
    // Ensure card has at least 24px padding from top and 32px from bottom taskbar
    const clampedTop = Math.max(20, Math.min(window.innerHeight - cardHeightEst - 32, idealTop));
    const cardLeft = spotlightRect.left + spotlightRect.width + 16;
    
    // Arrow top relative to the card so it always points directly to targetCenterY
    arrowTop = Math.max(20, Math.min(cardHeightEst - 30, targetCenterY - clampedTop - 7));

    cardStyle = {
      position: "fixed",
      top: `${clampedTop}px`,
      left: `${cardLeft}px`,
      margin: 0,
    };
  }

  return (
    <div
      className="fixed inset-0 z-[100] overflow-hidden select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      {/* 1. Spotlight Cutout Overlay over the active Sidebar Menu Item */}
      {isTargetVisible && spotlightRect ? (
        <motion.div
          layout
          className="fixed pointer-events-none transition-all duration-300 ease-out z-[90] rounded-xl border border-white/90 ring-2 ring-[#e0542c] shadow-[0_0_0_9999px_rgba(15,23,42,0.55)]"
          style={{
            top: Math.max(0, spotlightRect.top - 2),
            left: Math.max(0, spotlightRect.left - 2),
            width: spotlightRect.width + 4,
            height: spotlightRect.height + 4,
          }}
          transition={{ type: "spring", stiffness: 350, damping: 32 }}
        />
      ) : (
        <div className="fixed inset-0 bg-slate-900/55 backdrop-blur-xs pointer-events-none" />
      )}

      {/* 2. Floating Card directly attached to the highlighted menu */}
      <div
        className={`fixed inset-0 z-[110] pointer-events-none ${
          isDesktop && isTargetVisible
            ? "block"
            : "flex items-center justify-center p-4"
        }`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            ref={cardRef}
            initial={{ opacity: 0, scale: 0.96, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -6 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            style={isDesktop && isTargetVisible ? cardStyle : undefined}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[370px] max-h-[calc(100vh-48px)] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-5 text-left flex flex-col pointer-events-auto relative"
          >
            {/* Arrow seamlessly pointing from Card's left edge to the highlighted menu */}
            {isTargetVisible && isDesktop && (
              <div
                style={{ top: `${arrowTop}px` }}
                className="absolute -left-2 w-0 h-0 border-y-[7px] border-y-transparent border-r-[8px] border-r-white drop-shadow-xs pointer-events-none"
              />
            )}

            {/* Top Bar: High Contrast Category Badge + Step Counter + Close */}
            <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200/70 text-[10.5px] font-bold uppercase tracking-wider text-slate-800">
                  {currentStep.category}
                </span>
                <span className="text-slate-400 text-xs font-bold">•</span>
                <span className="text-xs font-bold text-slate-700">
                  {currentIndex + 1} dari {totalSteps}
                </span>
              </div>

              <button
                onClick={handleClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Tutup (Esc)"
              >
                <X size={15} />
              </button>
            </div>

            {/* Menu Title (High Contrast & Clear) */}
            <h3 className="text-base font-extrabold text-slate-950 tracking-tight mb-1.5">
              {currentStep.title}
            </h3>

            {/* High-legibility, Crisp Description */}
            <p className="text-[13px] text-slate-800 leading-relaxed font-medium mb-4">
              {currentStep.desc}
            </p>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-1">
              {/* Left: Skip / Jump Link */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClose}
                  className="text-xs font-bold text-slate-600 hover:text-slate-950 transition-colors cursor-pointer"
                >
                  Lewati
                </button>
                {currentStep.route && (
                  <>
                    <span className="text-slate-300 text-xs">•</span>
                    <button
                      onClick={() => handleJumpToMenu(currentStep.route)}
                      className="text-xs font-extrabold text-[#e0542c] hover:underline cursor-pointer"
                    >
                      Buka
                    </button>
                  </>
                )}
              </div>

              {/* Right: Prev & Next Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrev}
                  disabled={isFirst}
                  className={`p-1.5 rounded-lg border border-slate-300 text-slate-750 transition-colors ${
                    isFirst
                      ? "opacity-30 cursor-not-allowed"
                      : "hover:bg-slate-100 cursor-pointer active:scale-95 text-slate-800 font-bold"
                  }`}
                  title="Sebelumnya"
                >
                  <ChevronLeft size={14} />
                </button>

                <button
                  onClick={handleNext}
                  className="px-3.5 py-1.5 rounded-lg bg-[#1e2a4a] hover:bg-[#2b3c67] text-white text-xs font-bold flex items-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  <span>{isLast ? "Selesai" : "Lanjut"}</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
