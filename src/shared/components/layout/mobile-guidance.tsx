import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SmartHome, Box, MedalStar, User } from "@solar-icons/react";
import logoWhite from "@/assets/logo/logo-white.png";
import { isMenuEnabled } from "@/shared/utils/tenant-permissions";

interface MobileGuidanceTourProps {
  isOpen: boolean;
  onClose: () => void;
  onStepChange: (index: number) => void;
  activeTabs?: Array<{ key: string; label: string; icon: any; isCenterButton: boolean }>;
}

const TAB_TOUR_METADATA: Record<string, { title: string; icon: any; desc: string }> = {
  MobileHome: {
    title: "Sangkar (Beranda)",
    icon: SmartHome,
    desc: "Dashboard utama Anda untuk memantau Celengan impian, berkas di Loker, serta pengumuman penting perusahaan dalam satu layar terintegrasi."
  },
  MobileLumbung: {
    title: "Pakan (Kehadiran & Lowongan)",
    icon: Box,
    desc: "Menu pencatatan kerja mandiri! Lakukan absen masuk/pulang harian, pantau lembur, serta temukan info rekrutmen atau lowongan internal (Pakan)."
  },
  MobileAyamku: {
    title: "Ayamku (Karakter & Misi)",
    icon: null,
    desc: "Avatar ayam virtual personal Anda! Kumpulkan poin dengan menyelesaikan misi harian, naikkan tingkat level, dan dandani ayam Anda dengan aksesori premium."
  },
  MobilePakan: {
    title: "Tunas (Pembelajaran)",
    icon: MedalStar,
    desc: "Pusat peningkatan keahlian (E-Learning). Ikuti materi pelatihan terstruktur, tonton video tutorial, dan kumpulkan poin edukasi resmi."
  },
  MobileProfile: {
    title: "Induk (Profil & Berkas)",
    icon: User,
    desc: "Kelola informasi pribadi kepegawaian Anda. Ajukan cuti/izin, perbarui rekening bank payroll secara instan, dan tunjukkan kartu identitas digital Anda."
  }
};

export function MobileGuidanceTour({ isOpen, onClose, onStepChange, activeTabs }: MobileGuidanceTourProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  const allDefaultTabs = [
    { key: "MobileHome", label: "Sangkar", icon: SmartHome, isCenterButton: false },
    { key: "MobileLumbung", label: "Pakan", icon: Box, isCenterButton: false },
    { key: "MobileAyamku", label: "Ayamku", icon: logoWhite, isCenterButton: true },
    { key: "MobilePakan", label: "Tunas", icon: MedalStar, isCenterButton: false },
    { key: "MobileProfile", label: "Induk", icon: User, isCenterButton: false },
  ];

  const currentTabs = activeTabs && activeTabs.length > 0
    ? activeTabs
    : allDefaultTabs.filter((tab) => isMenuEnabled(tab.key));

  const steps = currentTabs.map((tab, idx) => {
    const meta = TAB_TOUR_METADATA[tab.key] || {
      title: tab.label,
      icon: tab.icon,
      desc: `Menu ${tab.label} aplikasi Pejuang Mimpi.`
    };
    return {
      ...meta,
      key: tab.key,
      isCenterButton: tab.isCenterButton,
      targetIndex: idx
    };
  });

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setMounted(true);
      onStepChange(0); // Sync initial route
    } else {
      setMounted(false);
    }
  }, [isOpen]);

  if (!isOpen || !mounted || steps.length === 0) return null;

  const currentStep = steps[currentIndex] || steps[0];

  const handleNext = () => {
    if (currentIndex < steps.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      onStepChange(nextIdx);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      onStepChange(prevIdx);
    }
  };

  const handleComplete = () => {
    localStorage.setItem("mobile_guidance_completed", "true");
    onClose();
  };

  // Determine dynamic highlight coordinates matching dynamic activeTabs layout
  const tabCount = steps.length;
  const tabWidthPercent = 100 / tabCount;
  const isCenterTab = Boolean(currentStep?.isCenterButton);

  const highlightLeft = `calc(${(currentIndex + 0.5) * tabWidthPercent}% - 1.75rem)`;
  const highlightBottom = isCenterTab ? "26px" : "14px";
  const highlightWidth = "3.5rem"; // 56px
  const highlightHeight = isCenterTab ? "3.5rem" : "3rem";
  const highlightRadius = isCenterTab ? "9999px" : "16px";
  const arrowLeft = `calc(${(currentIndex + 0.5) * tabWidthPercent}% - 12px)`;

  return (
    <div 
      className="absolute inset-0 z-50 bg-transparent flex flex-col justify-end overflow-hidden pointer-events-auto"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        handleComplete();
      }}
    >
      {/* Wrapper matching the navbar bottom layout */}
      <div className="absolute bottom-0 left-2 right-2 top-0 pointer-events-none">
        {/* Spotlight highlight over the active tab */}
        <motion.div
          layout
          className="absolute pointer-events-none transition-all duration-300 ease-out z-40 border-2 border-[#ff7e5a] shadow-[0_0_0_9999px_rgba(9,9,11,0.65),_0_0_20px_rgba(255,126,90,0.65)]"
          style={{ 
            left: highlightLeft,
            bottom: highlightBottom,
            width: highlightWidth,
            height: highlightHeight,
            borderRadius: highlightRadius,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />

        {/* Speech Bubble Arrow pointing to the highlighted tab */}
        <motion.div
          layout
          className="absolute bottom-[75px] z-45 pointer-events-none"
          style={{
            left: arrowLeft,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <svg className="w-6 h-3 text-[#121c35] fill-current drop-shadow-md" viewBox="0 0 24 12">
            <path d="M0 0 L12 12 L24 0 Z" />
          </svg>
        </motion.div>
      </div>


      {/* Floating Guidance Card */}
      <div 
        className="relative z-50 px-4 pb-20 w-full"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the card
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full bg-gradient-to-b from-[#1e2a4a] to-[#121c35] text-white border border-white/10 rounded-[28px] p-5 shadow-[0_15px_30px_rgba(0,0,0,0.5)] flex flex-col relative text-left"
          >
            {/* Step Counter & Info Badge */}
            <div className="flex justify-between items-center mb-3.5">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#ff7e5a] bg-[#ff7e5a]/10 px-2.5 py-1 rounded-full border border-[#ff7e5a]/10">
                Panduan Sistem
              </span>
              <span className="text-[10px] font-bold text-zinc-400">
                {currentIndex + 1} dari {steps.length}
              </span>
            </div>

            {/* Menu Title with Custom Icon */}
            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#e0542c] to-[#ff7e5a] flex items-center justify-center shadow-md border border-white/10 shrink-0">
                {currentStep.icon ? (
                  <currentStep.icon size={22} weight="Bold" className="text-white" />
                ) : (
                  <img src={logoWhite} alt="Ayamku Logo" className="w-6 h-6 object-contain" />
                )}
              </div>
              <h3 className="text-sm font-extrabold tracking-tight text-white leading-none">
                {currentStep.title}
              </h3>
            </div>

            {/* Menu Description */}
            <p className="text-[11px] text-zinc-350 font-semibold leading-relaxed mb-5 pr-1">
              {currentStep.desc}
            </p>

            {/* Divider */}
            <div className="h-[1px] bg-white/10 w-full mb-4" />

            {/* Actions Bar */}
            <div className="flex items-center justify-between">
              {/* Skip Button */}
              <button
                type="button"
                onClick={handleComplete}
                className="text-[11px] font-extrabold text-zinc-400 hover:text-white transition-colors cursor-pointer select-none"
              >
                Lewati Tur
              </button>

              {/* Navigation Buttons */}
              <div className="flex gap-2">
                {currentIndex > 0 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-[11px] font-extrabold hover:bg-white/10 transition-all cursor-pointer active:scale-95 select-none"
                  >
                    Kembali
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4.5 py-2 rounded-xl bg-gradient-to-tr from-[#e0542c] to-[#ff7e5a] text-white text-[11px] font-extrabold hover:shadow-md hover:shadow-[#e0542c]/20 transition-all cursor-pointer active:scale-95 flex items-center gap-1 border border-white/5 select-none"
                >
                  {currentIndex === steps.length - 1 ? "Selesai" : "Lanjut"}
                </button>
              </div>
            </div>

          </motion.div>
        </AnimatePresence>
      </div>


    </div>
  );
}
