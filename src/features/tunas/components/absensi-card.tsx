import { Calendar, Clock } from "lucide-react";
import { THEME_COLORS } from "@/shared/constants/colors";

export function AbsensiCard() {
  return (
    <div className="grid grid-cols-2 gap-3.5 w-full">
      {/* Card 1: Cuti & Izin (Sawah Pertumbuhan / Green Gradient) */}
      <div className={`bg-gradient-to-br ${THEME_COLORS.celengan.rumah.gradient} text-white p-3.5 rounded-2xl shadow-md shadow-[#7FA46D]/15 flex flex-col text-left justify-between min-h-[90px] transition-all hover:scale-[1.01] hover:shadow-lg`}>
        <div className="flex items-start gap-2">
          <div className="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center shrink-0">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10.5px] font-bold leading-tight text-white">Cuti & Izin</span>
            <span className="text-[8.5px] text-white/75 font-bold leading-normal mt-0.5 capitalize">
              Sisa Cuti & Izin
            </span>
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline gap-0.5 text-left text-white">
          <span className="text-lg font-bold leading-none tracking-tight">12</span>
          <span className="text-[8.5px] text-white/80 font-bold uppercase">Hari</span>
        </div>
      </div>

      {/* Card 2: Lembur (Padi Kemakmuran / Yellow Gradient) — RIGHT aligned */}
      <div className={`bg-gradient-to-br ${THEME_COLORS.celengan.laptopBaru.gradient} text-white p-3.5 rounded-2xl shadow-md shadow-[#F2B233]/15 flex flex-col text-right justify-between min-h-[90px] transition-all hover:scale-[1.01] hover:shadow-lg`}>
        <div className="flex items-start gap-2 flex-row-reverse">
          <div className="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center shrink-0">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col min-w-0 items-end">
            <span className="text-[10.5px] font-bold leading-tight text-white">Lembur</span>
            <span className="text-[8.5px] text-white/75 font-bold leading-normal mt-0.5 capitalize">
              Total Bulan Ini
            </span>
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline gap-0.5 justify-end text-white">
          <span className="text-lg font-bold leading-none tracking-tight">20</span>
          <span className="text-[8.5px] text-white/80 font-bold uppercase">Jam</span>
        </div>
      </div>
    </div>
  );
}
