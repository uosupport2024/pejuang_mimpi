import { Home, Bike, Palmtree, Laptop, Plus } from "lucide-react";
import { THEME_COLORS } from "@/shared/constants/colors";
import { toast } from "sonner";

export function CelengankuCarousel() {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center px-1">
        <span className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">Celenganku</span>
        <span
          onClick={() => toast.info("Fitur celengan lengkap segera hadir!")}
          className="text-[10px] text-[#e0542c] font-bold cursor-pointer hover:underline"
        >
          Lihat Semua
        </span>
      </div>

      {/* Horizontal Carousel */}
      <div className="flex gap-3 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x snap-mandatory">
        {/* Card 1: Rumah */}
        <div
          onClick={() => toast.info("Membuka detail Celengan Rumah...")}
          className={`w-28 h-28 bg-gradient-to-br ${THEME_COLORS.celengan.rumah.gradient} text-white p-3.5 rounded-2xl flex flex-col justify-between shrink-0 snap-start shadow-md hover:scale-102 transition-all duration-200 cursor-pointer`}
        >
          <Home className="w-5 h-5 text-white/95" />
          <span className="text-xs font-extrabold tracking-tight text-left leading-tight">Rumah</span>
        </div>

        {/* Card 2: Motor */}
        <div
          onClick={() => toast.info("Membuka detail Celengan Motor...")}
          className={`w-28 h-28 bg-gradient-to-br ${THEME_COLORS.celengan.motor.gradient} text-white p-3.5 rounded-2xl flex flex-col justify-between shrink-0 snap-start shadow-md hover:scale-102 transition-all duration-200 cursor-pointer`}
        >
          <Bike className="w-5 h-5 text-white/95" />
          <span className="text-xs font-extrabold tracking-tight text-left leading-tight">Motor</span>
        </div>

        {/* Card 3: Liburan Bali */}
        <div
          onClick={() => toast.info("Membuka detail Celengan Liburan Bali...")}
          className={`w-28 h-28 bg-gradient-to-br ${THEME_COLORS.celengan.liburanBali.gradient} text-white p-3.5 rounded-2xl flex flex-col justify-between shrink-0 snap-start shadow-md hover:scale-102 transition-all duration-200 cursor-pointer`}
        >
          <Palmtree className="w-5 h-5 text-white/95" />
          <span className="text-xs font-extrabold tracking-tight text-left leading-tight">Liburan Bali</span>
        </div>

        {/* Card 4: Laptop Baru */}
        <div
          onClick={() => toast.info("Membuka detail Celengan Laptop Baru...")}
          className={`w-28 h-28 bg-gradient-to-br ${THEME_COLORS.celengan.laptopBaru.gradient} text-white p-3.5 rounded-2xl flex flex-col justify-between shrink-0 snap-start shadow-md hover:scale-102 transition-all duration-200 cursor-pointer`}
        >
          <Laptop className="w-5 h-5 text-white/95" />
          <span className="text-xs font-extrabold tracking-tight text-left leading-tight">Laptop Baru</span>
        </div>

        {/* Card 5: Tambah Celengan */}
        <div
          onClick={() => toast.success("Membuka form tambah celengan baru...")}
          className="w-28 h-28 border-2 border-dashed border-gray-300 hover:border-[#e0542c]/60 rounded-2xl flex flex-col justify-between p-3.5 shrink-0 snap-start transition-all duration-200 hover:bg-gray-50/50 cursor-pointer group text-gray-400 hover:text-[#e0542c]"
        >
          <Plus className="w-5 h-5 text-gray-450 group-hover:text-[#e0542c] transition-colors" />
          <span className="text-xs font-extrabold tracking-tight text-left leading-tight">Tambah Celengan</span>
        </div>
      </div>
    </div>
  );
}
