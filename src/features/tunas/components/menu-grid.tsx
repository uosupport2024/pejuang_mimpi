import {
  ClipboardList,
  Calendar,
  MapPoint,
  ClockCircle,
  Compass,
  KeyMinimalistic,
  UsersGroupRounded,
  Widget
} from "@solar-icons/react";
import { toast } from "sonner";

const MENU_ITEMS = [
  { label: "Absensi", icon: ClipboardList, action: () => toast.info("Membuka menu Absensi...") },
  { label: "Cuti & Izin", icon: Calendar, action: () => toast.info("Membuka menu Cuti & Izin...") },
  { label: "Dinas Luar", icon: MapPoint, action: () => toast.info("Membuka menu Dinas Luar...") },
  { label: "Lembur", icon: ClockCircle, action: () => toast.info("Membuka menu Lembur...") },
  { label: "Request Location", icon: Compass, action: () => toast.info("Membuka menu Request Location...") },
  { label: "Ganti Password", icon: KeyMinimalistic, action: () => toast.info("Membuka menu Ganti Password...") },
  { label: "Pegawai", icon: UsersGroupRounded, action: () => toast.info("Membuka daftar Pegawai...") },
  { label: "Lainnya", icon: Widget, action: () => toast.info("Membuka menu lainnya...") },
];

export function MenuGrid() {
  const row1 = MENU_ITEMS.slice(0, 4);
  const row2 = MENU_ITEMS.slice(4, 8);

  const renderItem = (item: typeof MENU_ITEMS[0], index: number) => {
    const Icon = item.icon;
    return (
      <button
        key={index}
        onClick={item.action}
        className="flex flex-col items-center group cursor-pointer active:scale-95 transition-all duration-200 w-12.5"
      >
        {/* Glossy Gradient Icon Wrapper */}
        <div className="w-12.5 h-12.5 rounded-2xl bg-gradient-to-tr from-[#e0542c] to-[#ff7e5a] text-white flex items-center justify-center shadow-md shadow-[#e0542c]/15 relative overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-[#e0542c]/25 shrink-0">
          {/* 3D Gloss Highlight effect */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/15 rounded-t-2xl pointer-events-none" />
          <Icon size={24} weight="Bold" className="relative z-10 transition-transform group-hover:rotate-3 text-white" />
        </div>

        {/* Label */}
        <span className="text-[10px] font-bold text-gray-800 mt-2 text-center leading-snug tracking-wide w-[72px] min-h-[30px] flex items-start justify-center shrink-0">
          {item.label}
        </span>
      </button>
    );
  };

  return (
    <div className="space-y-3 w-full">
      <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider text-left px-0.5">
        Layanan Mandiri
      </h3>

      <div className="space-y-4 w-full">
        {/* Row 1 */}
        <div className="flex justify-between w-full">
          {row1.map((item, idx) => renderItem(item, idx))}
        </div>

        {/* Row 2 */}
        <div className="flex justify-between w-full">
          {row2.map((item, idx) => renderItem(item, idx + 4))}
        </div>
      </div>
    </div>
  );
}
