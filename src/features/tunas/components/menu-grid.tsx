import {
  User,
  Calendar,
  History,
  Dollar,
  DocumentText,
  Refresh,
  MedalStar,
  Buildings
} from "@solar-icons/react";
import { toast } from "sonner";
import { useRouter } from "@/shared/router/router";

export function MenuGrid() {
  const { navigate } = useRouter();

  const menuItems = [
    { label: "Payroll", icon: Dollar, action: () => navigate("PayrollHistory") },
    { label: "Pengajuan Absen", icon: Calendar, action: () => navigate("MobileKoreksiAbsen") },
    { label: "Kartu Pegawai", icon: User, action: () => navigate("MobileIdCard") },
    { label: "Riwayat Absen", icon: History, action: () => navigate("MobileHistory") },
    { label: "Riwayat Izin", icon: DocumentText, action: () => navigate("MobileLeaveHistory") },
    { label: "Riwayat Lembur", icon: Refresh, action: () => navigate("MobileLemburHistory") },
    { label: "Kinerja", icon: MedalStar, action: () => toast.info("Membuka menu Kinerja...") },
    { label: "Perusahaan", icon: Buildings, action: () => toast.info("Membuka profil Perusahaan...") },
  ];

  const row1 = menuItems.slice(0, 4);
  const row2 = menuItems.slice(4, 8);

  const renderItem = (item: typeof menuItems[0], index: number) => {
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
