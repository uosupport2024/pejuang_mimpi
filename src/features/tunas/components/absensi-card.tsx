import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Calendar, Clock, FileText, LogOut, X, HeartPulse } from "lucide-react";
import { THEME_COLORS, buildCssBackground } from "@/shared/constants/colors";
import { useTenantBranding } from "@/shared/hooks/use-tenant-branding";
import { useRouter } from "@/shared/router/router";

interface AbsensiCardProps {
  izinCuti?: number;
  izinLainnya?: number;
  izinTelat?: number;
  izinPulangCepat?: number;
  izinSakit?: number;
  totalLemburBulanIni?: number;
}

type SelectedLeaveType = "cuti" | "lainnya" | "telat" | "pulang_cepat" | "sakit";

export function AbsensiCard({
  izinCuti = 12,
  izinLainnya = 12,
  izinTelat = 12,
  izinPulangCepat = 12,
  totalLemburBulanIni = 0,
}: AbsensiCardProps) {
  const { navigate } = useRouter();
  const { buttonColor } = useTenantBranding();
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
          className="bg-gradient-rumah text-white p-3.5 rounded-2xl shadow-md flex flex-col text-left justify-between min-h-[90px] w-full transition-all active:scale-[0.98] hover:shadow-lg cursor-pointer border-0"
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
        <button
          type="button"
          onClick={() => navigate("MobileLemburAbsensi")}
          className="bg-gradient-laptop text-white p-3.5 rounded-2xl shadow-md flex flex-col text-right justify-between min-h-[90px] w-full transition-all active:scale-[0.98] hover:shadow-lg cursor-pointer border-0"
        >
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
            <span className="text-lg font-bold leading-none tracking-tight">{totalLemburBulanIni}</span>
            <span className="text-[8.5px] text-white/80 font-bold uppercase">Jam</span>
          </div>
        </button>
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
                style={selectedType !== "cuti" ? {
                  backgroundColor: `${THEME_COLORS.hex.sawahPertumbuhan}0D`,
                  borderColor: `${THEME_COLORS.hex.sawahPertumbuhan}4D`,
                  color: THEME_COLORS.hex.sawahPertumbuhanText
                } : undefined}
                className={`flex flex-col gap-2 justify-between p-3 rounded-xl transition-all cursor-pointer text-left ${selectedType === "cuti"
                  ? "bg-gradient-rumah text-white shadow-md border-0"
                  : "border-2"
                  }`}
              >
                <div className="flex items-center gap-1.5">
                  <div
                    style={selectedType !== "cuti" ? { backgroundColor: `${THEME_COLORS.hex.sawahPertumbuhan}1A`, color: THEME_COLORS.hex.sawahPertumbuhanText } : undefined}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${selectedType === "cuti" ? "bg-white/20 text-white" : ""
                      }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-[10px] font-bold leading-tight ${selectedType === "cuti" ? "text-white" : ""}`}>
                    Cuti Tahunan
                  </span>
                </div>
                <div className="flex items-baseline gap-0.5 mt-1.5">
                  <span className={`text-xl font-bold tracking-tight leading-none ${selectedType === "cuti" ? "text-white" : ""}`}>
                    {izinCuti}
                  </span>
                  <span className={`text-[8.5px] font-bold uppercase ${selectedType === "cuti" ? "text-white/80" : "opacity-85"}`}>
                    Hari
                  </span>
                </div>
              </button>

              {/* Type 2: Izin Lainnya */}
              <button
                type="button"
                onClick={() => setSelectedType(selectedType === "lainnya" ? null : "lainnya")}
                style={selectedType !== "lainnya" ? {
                  backgroundColor: `${THEME_COLORS.hex.airKehidupan}0D`,
                  borderColor: `${THEME_COLORS.hex.airKehidupan}4D`,
                  color: THEME_COLORS.hex.airKehidupanText
                } : undefined}
                className={`flex flex-col gap-2 justify-between p-3 rounded-xl transition-all cursor-pointer text-left ${selectedType === "lainnya"
                  ? "bg-gradient-liburan text-white shadow-md border-0"
                  : "border-2"
                  }`}
              >
                <div className="flex items-center gap-1.5">
                  <div
                    style={selectedType !== "lainnya" ? { backgroundColor: `${THEME_COLORS.hex.airKehidupan}1A`, color: THEME_COLORS.hex.airKehidupanText } : undefined}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${selectedType === "lainnya" ? "bg-white/20 text-white" : ""
                      }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-[10px] font-bold leading-tight ${selectedType === "lainnya" ? "text-white" : ""}`}>
                    Izin Lainnya
                  </span>
                </div>
                <div className="flex items-baseline gap-0.5 mt-1.5">
                  <span className={`text-xl font-bold tracking-tight leading-none ${selectedType === "lainnya" ? "text-white" : ""}`}>
                    {izinLainnya}
                  </span>
                  <span className={`text-[8.5px] font-bold uppercase ${selectedType === "lainnya" ? "text-white/80" : "opacity-85"}`}>
                    Hari
                  </span>
                </div>
              </button>

              {/* Type 3: Izin Telat */}
              <button
                type="button"
                onClick={() => setSelectedType(selectedType === "telat" ? null : "telat")}
                style={selectedType !== "telat" ? {
                  backgroundColor: `${THEME_COLORS.hex.padiKemakmuran}0D`,
                  borderColor: `${THEME_COLORS.hex.padiKemakmuran}66`,
                  color: THEME_COLORS.hex.padiKemakmuranText
                } : undefined}
                className={`flex flex-col gap-2 justify-between p-3 rounded-xl transition-all cursor-pointer text-left ${selectedType === "telat"
                  ? "bg-gradient-laptop text-white shadow-md border-0"
                  : "border-2"
                  }`}
              >
                <div className="flex items-center gap-1.5">
                  <div
                    style={selectedType !== "telat" ? { backgroundColor: `${THEME_COLORS.hex.padiKemakmuran}1F`, color: THEME_COLORS.hex.padiKemakmuranText } : undefined}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${selectedType === "telat" ? "bg-white/20 text-white" : ""
                      }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-[10px] font-bold leading-tight ${selectedType === "telat" ? "text-white" : ""}`}>
                    Izin Telat
                  </span>
                </div>
                <div className="flex items-baseline gap-0.5 mt-1.5">
                  <span className={`text-xl font-bold tracking-tight leading-none ${selectedType === "telat" ? "text-white" : ""}`}>
                    {izinTelat}
                  </span>
                  <span className={`text-[8.5px] font-bold uppercase ${selectedType === "telat" ? "text-white/80" : "opacity-85"}`}>
                    Kali
                  </span>
                </div>
              </button>

              {/* Type 4: Izin Pulang Cepat */}
              <button
                type="button"
                onClick={() => setSelectedType(selectedType === "pulang_cepat" ? null : "pulang_cepat")}
                style={selectedType !== "pulang_cepat" ? {
                  backgroundColor: `${THEME_COLORS.hex.apiSemangat}0D`,
                  borderColor: `${THEME_COLORS.hex.apiSemangat}4D`,
                  color: THEME_COLORS.hex.apiSemangatDark
                } : undefined}
                className={`flex flex-col gap-2 justify-between p-3 rounded-xl transition-all cursor-pointer text-left ${selectedType === "pulang_cepat"
                  ? "bg-gradient-motor text-white shadow-md border-0"
                  : "border-2"
                  }`}
              >
                <div className="flex items-center gap-1.5">
                  <div
                    style={selectedType !== "pulang_cepat" ? { backgroundColor: `${THEME_COLORS.hex.apiSemangat}1A`, color: THEME_COLORS.hex.apiSemangatDark } : undefined}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${selectedType === "pulang_cepat" ? "bg-white/20 text-white" : ""
                      }`}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-[10px] font-bold leading-tight ${selectedType === "pulang_cepat" ? "text-white" : ""}`}>
                    Izin Pulang Cepat
                  </span>
                </div>
                <div className="flex items-baseline gap-0.5 mt-1.5">
                  <span className={`text-xl font-bold tracking-tight leading-none ${selectedType === "pulang_cepat" ? "text-white" : ""}`}>
                    {izinPulangCepat}
                  </span>
                  <span className={`text-[8.5px] font-bold uppercase ${selectedType === "pulang_cepat" ? "text-white/80" : "opacity-85"}`}>
                    Kali
                  </span>
                </div>
              </button>

              {/* Type 5: Izin Sakit */}
              <button
                type="button"
                onClick={() => setSelectedType(selectedType === "sakit" ? null : "sakit")}
                className={`col-span-2 flex flex-row items-center justify-between p-3 rounded-xl transition-all cursor-pointer text-left ${selectedType === "sakit"
                  ? `bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-md shadow-rose-500/15 border-0`
                  : "bg-rose-500/5 border-2 border-rose-500/30 text-rose-600 hover:bg-rose-500/8"
                  }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${selectedType === "sakit" ? "bg-white/20 text-white" : "bg-rose-500/10 text-rose-600"
                      }`}
                  >
                    <HeartPulse className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-[10px] font-bold leading-tight ${selectedType === "sakit" ? "text-white" : "text-rose-600"}`}>
                    Izin Sakit
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
                navigate("MobileLeaveRequest", { selectedType });
              }}
              style={selectedType !== null ? { background: buildCssBackground(buttonColor, THEME_COLORS.hex.primary) } : undefined}
              className={`w-full py-2.5 rounded-xl text-[10.5px] font-bold uppercase tracking-wider transition-all border-0 flex items-center justify-center gap-2 ${selectedType === null
                ? "bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none"
                : `text-white shadow-md active:scale-[0.98] cursor-pointer hover:brightness-105`
                }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Pengajuan Izin</span>
            </button>

            {/* Request Correction (Lupa Absen) Button */}
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                navigate("MobileKoreksiAbsen");
              }}
              className="w-full py-2.5 mt-2 rounded-xl text-[10.5px] font-bold uppercase tracking-wider transition-all border border-zinc-200 hover:bg-zinc-50 active:scale-[0.98] cursor-pointer bg-white text-zinc-650 flex items-center justify-center gap-2"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Lupa Absen? Ajukan Koreksi</span>
            </button>

          </div>
        </div>,
        document.body
      )}
    </>
  );
}
