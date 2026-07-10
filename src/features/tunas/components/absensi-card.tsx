import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Calendar, Clock, FileText, LogOut, X } from "lucide-react";
import { THEME_COLORS } from "@/shared/constants/colors";
import { useRouter } from "@/shared/router/router";

interface AbsensiCardProps {
  izinCuti?: number;
  izinLainnya?: number;
  izinTelat?: number;
  izinPulangCepat?: number;
}

type SelectedLeaveType = "cuti" | "lainnya" | "telat" | "pulang_cepat";

export function AbsensiCard({
  izinCuti = 12,
  izinLainnya = 12,
  izinTelat = 12,
  izinPulangCepat = 12,
}: AbsensiCardProps) {
  const { navigate } = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<SelectedLeaveType | null>("cuti");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return (
    <>
      <div className="grid grid-cols-2 gap-3.5 w-full">
        {/* Card 1: Cuti & Izin (Sawah Pertumbuhan / Green Gradient) */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={`bg-gradient-to-br ${THEME_COLORS.celengan.rumah.gradient} text-white p-3.5 rounded-2xl shadow-md shadow-[#7FA46D]/15 flex flex-col text-left justify-between min-h-[90px] w-full transition-all active:scale-[0.98] hover:shadow-lg cursor-pointer border-0`}
        >
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
            <span className="text-lg font-bold leading-none tracking-tight">{izinCuti}</span>
            <span className="text-[8.5px] text-white/80 font-bold uppercase">Hari</span>
          </div>
        </button>

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

      {/* Premium Bottom Sheet Modal inside React Portal */}
      {isModalOpen && mounted && createPortal(
        <div className="fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-black/60 z-50 flex flex-col justify-end animate-in fade-in duration-200">
          {/* Backdrop click to close */}
          <div className="absolute inset-0 z-0" onClick={() => setIsModalOpen(false)} />

          {/* Bottom Sheet Container */}
          <div className="relative z-10 bg-white rounded-t-[32px] p-4.5 pb-6 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300 flex flex-col gap-3.5 text-left border-t border-zinc-100">
            {/* Grabber Indicator */}
            <div className="w-12 h-1 bg-zinc-200 rounded-full mx-auto -mt-1.5 mb-0.5 shrink-0" />

            {/* Header */}
            <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
              <div>
                <h3 className="text-sm font-bold text-zinc-800">Detail Sisa Cuti & Izin</h3>
                <p className="text-[9.5px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5 leading-none">
                  Ringkasan Hak & Kuota Izin Anda
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-zinc-100 active:scale-95 transition-all rounded-full cursor-pointer text-zinc-400 hover:text-zinc-600 border border-zinc-200/50 flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Grid 2x2 cards for the 4 types */}
            <div className="grid grid-cols-2 gap-3">
              {/* Type 1: Izin Cuti */}
              <button
                type="button"
                onClick={() => setSelectedType(selectedType === "cuti" ? null : "cuti")}
                className={`flex flex-col gap-2 justify-between p-3 rounded-xl transition-all cursor-pointer text-left ${
                  selectedType === "cuti"
                    ? `bg-gradient-to-br ${THEME_COLORS.celengan.rumah.gradient} text-white shadow-md shadow-[#7FA46D]/15 border-0`
                    : "bg-[#7FA46D]/5 border-2 border-[#7FA46D]/30 text-[#516b46] hover:bg-[#7FA46D]/8"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      selectedType === "cuti" ? "bg-white/20 text-white" : "bg-[#7FA46D]/10 text-[#516b46]"
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-[10px] font-bold leading-tight ${selectedType === "cuti" ? "text-white" : "text-[#516b46]"}`}>
                    Cuti Tahunan
                  </span>
                </div>
                <div className="flex items-baseline gap-0.5 mt-1.5">
                  <span className={`text-xl font-bold tracking-tight leading-none ${selectedType === "cuti" ? "text-white" : "text-[#516b46]"}`}>
                    {izinCuti}
                  </span>
                  <span className={`text-[8.5px] font-bold uppercase ${selectedType === "cuti" ? "text-white/80" : "text-[#516b46]/85"}`}>
                    Hari
                  </span>
                </div>
              </button>

              {/* Type 2: Izin Lainnya */}
              <button
                type="button"
                onClick={() => setSelectedType(selectedType === "lainnya" ? null : "lainnya")}
                className={`flex flex-col gap-2 justify-between p-3 rounded-xl transition-all cursor-pointer text-left ${
                  selectedType === "lainnya"
                    ? `bg-gradient-to-br ${THEME_COLORS.celengan.liburanBali.gradient} text-white shadow-md shadow-[#5C8A90]/15 border-0`
                    : "bg-[#5C8A90]/5 border-2 border-[#5C8A90]/30 text-[#3b595d] hover:bg-[#5C8A90]/8"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      selectedType === "lainnya" ? "bg-white/20 text-white" : "bg-[#5C8A90]/10 text-[#3b595d]"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-[10px] font-bold leading-tight ${selectedType === "lainnya" ? "text-white" : "text-[#3b595d]"}`}>
                    Izin Lainnya
                  </span>
                </div>
                <div className="flex items-baseline gap-0.5 mt-1.5">
                  <span className={`text-xl font-bold tracking-tight leading-none ${selectedType === "lainnya" ? "text-white" : "text-[#3b595d]"}`}>
                    {izinLainnya}
                  </span>
                  <span className={`text-[8.5px] font-bold uppercase ${selectedType === "lainnya" ? "text-white/80" : "text-[#3b595d]/85"}`}>
                    Hari
                  </span>
                </div>
              </button>

              {/* Type 3: Izin Telat */}
              <button
                type="button"
                onClick={() => setSelectedType(selectedType === "telat" ? null : "telat")}
                className={`flex flex-col gap-2 justify-between p-3 rounded-xl transition-all cursor-pointer text-left ${
                  selectedType === "telat"
                    ? `bg-gradient-to-br ${THEME_COLORS.celengan.laptopBaru.gradient} text-white shadow-md shadow-[#F2B233]/15 border-0`
                    : "bg-[#F2B233]/5 border-2 border-[#F2B233]/40 text-[#916715] hover:bg-[#F2B233]/8"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      selectedType === "telat" ? "bg-white/20 text-white" : "bg-[#F2B233]/12 text-[#916715]"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-[10px] font-bold leading-tight ${selectedType === "telat" ? "text-white" : "text-[#916715]"}`}>
                    Izin Telat
                  </span>
                </div>
                <div className="flex items-baseline gap-0.5 mt-1.5">
                  <span className={`text-xl font-bold tracking-tight leading-none ${selectedType === "telat" ? "text-white" : "text-[#916715]"}`}>
                    {izinTelat}
                  </span>
                  <span className={`text-[8.5px] font-bold uppercase ${selectedType === "telat" ? "text-white/80" : "text-[#916715]/85"}`}>
                    Kali
                  </span>
                </div>
              </button>

              {/* Type 4: Izin Pulang Cepat */}
              <button
                type="button"
                onClick={() => setSelectedType(selectedType === "pulang_cepat" ? null : "pulang_cepat")}
                className={`flex flex-col gap-2 justify-between p-3 rounded-xl transition-all cursor-pointer text-left ${
                  selectedType === "pulang_cepat"
                    ? `bg-gradient-to-br ${THEME_COLORS.celengan.motor.gradient} text-white shadow-md shadow-[#F25C2A]/15 border-0`
                    : "bg-[#F25C2A]/5 border-2 border-[#F25C2A]/30 text-[#C54117] hover:bg-[#F25C2A]/8"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      selectedType === "pulang_cepat" ? "bg-white/20 text-white" : "bg-[#F25C2A]/10 text-[#C54117]"
                    }`}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-[10px] font-bold leading-tight ${selectedType === "pulang_cepat" ? "text-white" : "text-[#C54117]"}`}>
                    Izin Pulang Cepat
                  </span>
                </div>
                <div className="flex items-baseline gap-0.5 mt-1.5">
                  <span className={`text-xl font-bold tracking-tight leading-none ${selectedType === "pulang_cepat" ? "text-white" : "text-[#C54117]"}`}>
                    {izinPulangCepat}
                  </span>
                  <span className={`text-[8.5px] font-bold uppercase ${selectedType === "pulang_cepat" ? "text-white/80" : "text-[#C54117]/85"}`}>
                    Kali
                  </span>
                </div>
              </button>
            </div>

            {/* Request Permission Button */}
            <button
              type="button"
              disabled={selectedType === null}
              onClick={() => {
                setIsModalOpen(false);
                navigate("MobileLeaveRequest");
              }}
              className={`w-full py-2.5 rounded-xl text-[10.5px] font-bold uppercase tracking-wider transition-all border-0 flex items-center justify-center gap-2 ${
                selectedType === null
                  ? "bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none"
                  : "bg-[#e0542c] hover:bg-[#c23f1b] text-white shadow-md shadow-[#e0542c]/15 active:scale-[0.98] cursor-pointer"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Pengajuan Izin</span>
            </button>

          </div>
        </div>,
        document.body
      )}
    </>
  );
}
