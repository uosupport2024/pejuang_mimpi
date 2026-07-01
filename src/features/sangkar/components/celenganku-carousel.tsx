import { Plus, Home, Bike, Palmtree, Laptop, HelpCircle } from "lucide-react";
import { THEME_COLORS } from "@/shared/constants/colors";
import { useNavigate } from "react-router-dom";
import type { Celengan } from "../types/celengan";

export function getIconComponent(iconName: string | null | undefined) {
  switch (iconName?.toLowerCase()) {
    case "rumah":
    case "home":
      return Home;
    case "motor":
    case "bike":
    case "bicycle":
    case "motorcycle":
      return Bike;
    case "liburanbali":
    case "liburan bali":
    case "palmtree":
    case "palm":
      return Palmtree;
    case "laptopbaru":
    case "laptop baru":
    case "laptop":
    case "computer":
      return Laptop;
    default:
      return HelpCircle;
  }
}

export function getCelenganStyle(iconName: string | null | undefined) {
  const name = iconName?.toLowerCase() || "";
  if (name.includes("rumah") || name.includes("home")) return THEME_COLORS.celengan.rumah;
  if (name.includes("motor") || name.includes("bike") || name.includes("cycle")) return THEME_COLORS.celengan.motor;
  if (name.includes("bali") || name.includes("liburan") || name.includes("palm")) return THEME_COLORS.celengan.liburanBali;
  if (name.includes("laptop") || name.includes("computer")) return THEME_COLORS.celengan.laptopBaru;
  return THEME_COLORS.celengan.rumah;
}

interface CelengankuCarouselProps {
  celengans: Celengan[];
  onRefresh: () => void;
}

export function CelengankuCarousel({ celengans }: CelengankuCarouselProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center px-1">
        <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">Celenganku</span>
        {celengans.length > 0 && (
          <span
            onClick={() => navigate(`/mobile/celengan?id=${celengans[0].id}`)}
            className="text-[10px] text-[#e0542c] font-bold cursor-pointer hover:underline"
          >
            Lihat Semua
          </span>
        )}
      </div>

      {/* Horizontal Carousel */}
      <div className="flex gap-3 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x snap-mandatory">
        {celengans.map((item) => {
          const style = getCelenganStyle(item.icon);
          const Icon = getIconComponent(item.icon);
          return (
            <div
              key={item.id}
              onClick={() => navigate(`/mobile/celengan?id=${item.id}`)}
              className={`w-28 h-28 bg-gradient-to-br ${style.gradient} text-white p-3.5 rounded-2xl flex flex-col justify-between shrink-0 snap-start shadow-md hover:scale-102 transition-all duration-200 cursor-pointer`}
            >
              <Icon className="w-5 h-5 text-white/95" />
              <span className="text-xs font-bold tracking-tight text-left leading-tight">{item.name}</span>
            </div>
          );
        })}

        {/* Card: Tambah Celengan */}
        <div
          onClick={() => navigate("/mobile/celengan/add")}
          className="w-28 h-28 border-2 border-dashed border-gray-300 hover:border-[#e0542c]/60 rounded-2xl flex flex-col justify-between p-3.5 shrink-0 snap-start transition-all duration-200 hover:bg-gray-50/50 cursor-pointer group text-gray-400 hover:text-[#e0542c]"
        >
          <Plus className="w-5 h-5 text-gray-450 group-hover:text-[#e0542c] transition-colors" />
          <span className="text-xs font-bold tracking-tight text-left leading-tight">Tambah Celengan</span>
        </div>
      </div>
    </div>
  );
}
