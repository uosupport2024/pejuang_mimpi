import { useState } from "react";
import { Plus } from "lucide-react";
import { THEME_COLORS } from "@/shared/constants/colors";
import { useNavigate } from "react-router-dom";
import type { Celengan } from "../types/celengan";
import { getChickenIcon } from "@/shared/utils/icons";
import { motion } from "motion/react";

export function getCelenganStyle(idOrIcon: string | number | null | undefined) {
  const idStr = String(idOrIcon || "");
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % 4;

  const styles = [
    THEME_COLORS.celengan.rumah,       // Green
    THEME_COLORS.celengan.motor,       // Orange
    THEME_COLORS.celengan.liburanBali,  // Teal
    THEME_COLORS.celengan.laptopBaru,  // Yellow
  ];
  return styles[index];
}

interface CelengankuCarouselProps {
  celengans: Celengan[];
  onRefresh: () => void;
  loading?: boolean;
}

export function CelengankuCarousel({ celengans, loading }: CelengankuCarouselProps) {
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(10);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    // Check if scrolled near the end (within 40px of scroll width limit)
    if (target.scrollLeft + target.clientWidth >= target.scrollWidth - 40) {
      if (visibleCount < celengans.length) {
        setVisibleCount((prev) => Math.min(prev + 10, celengans.length));
      }
    }
  };

  const visibleCelengans = celengans.slice(0, visibleCount);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center px-1">
        <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">Celenganku</span>
        {celengans.length > 0 && !loading && (
          <span
            onClick={() => navigate(`/mobile/celengan?id=${celengans[0].id}`)}
            className="text-[10px] text-[#e0542c] font-bold cursor-pointer hover:underline"
          >
            Lihat Semua
          </span>
        )}
      </div>

      {/* Horizontal Carousel */}
      <div
        onScroll={handleScroll}
        className="flex gap-3 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x snap-mandatory"
      >
        {loading ? (
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-28 h-28 bg-white border border-slate-100 rounded-2xl p-3.5 flex flex-col justify-between shrink-0 snap-start animate-pulse"
            >
              <div className="w-12 h-12 bg-slate-100 rounded-xl" />
              <div className="h-3.5 bg-slate-100 rounded w-16" />
            </div>
          ))
        ) : (
          <>
            {visibleCelengans.map((item) => {
              const style = getCelenganStyle(item.id);
              const iconSrc = getChickenIcon(item.icon);
              return (
                <motion.div
                  key={item.id}
                  onClick={() => navigate(`/mobile/celengan?id=${item.id}`)}
                  whileTap={{ scale: 0.97 }}
                  className={`w-28 h-28 bg-gradient-to-br ${style.gradient} text-white p-3 rounded-2xl flex flex-col justify-between shrink-0 snap-start shadow-md hover:scale-102 transition-all duration-200 cursor-pointer`}
                >
                  <div className="w-14 h-14 flex items-center justify-center">
                    <motion.img
                      src={iconSrc}
                      alt={item.name}
                      className="w-12 h-12 object-contain"
                      animate={{
                        y: [0, -3, 0]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: Math.random() * 2
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold tracking-tight text-left leading-tight line-clamp-2">{item.name}</span>
                </motion.div>
              );
            })}

            {/* Card: Tambah Celengan */}
            <motion.div
              onClick={() => navigate("/mobile/celengan/add")}
              whileTap={{ scale: 0.97 }}
              className="w-28 h-28 border-2 border-dashed border-gray-300 hover:border-[#e0542c]/60 rounded-2xl flex flex-col justify-between p-3.5 shrink-0 snap-start transition-all duration-200 hover:bg-gray-50/50 cursor-pointer group text-gray-400 hover:text-[#e0542c]"
            >
              <Plus className="w-5 h-5 text-gray-450 group-hover:text-[#e0542c] transition-colors" />
              <span className="text-xs font-bold tracking-tight text-left leading-tight">Tambah Celengan</span>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
