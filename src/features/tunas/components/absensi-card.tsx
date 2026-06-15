import { ArrowDownLeft, ArrowUpRight, ArrowUp, Repeat } from "lucide-react";

interface AbsensiCardProps {
  clockInTime: string;
  clockOutTime: string;
  isCheckedIn?: boolean;
}

export function AbsensiCard({ clockInTime, clockOutTime, isCheckedIn = false }: AbsensiCardProps) {
  // Status check in
  const getCheckInStatus = () => {
    if (clockInTime === "--:--") return "--";
    const [h, m] = clockInTime.split(":").map(Number);
    if (h < 8 || (h === 8 && m === 0)) return "Early";
    return "Late";
  };

  // Status check out
  const getCheckOutStatus = () => {
    if (clockOutTime === "--:--") return "Not Yet";
    const [h] = clockOutTime.split(":").map(Number);
    if (h < 17) return "Early";
    return "On Time";
  };

  // Dynamic month name
  const currentMonth = new Date().toLocaleDateString("id-ID", { month: "long" });

  const isClockedIn = clockInTime !== "--:--";
  const isClockedOut = clockOutTime !== "--:--";

  return (
    <div className="grid grid-cols-2 gap-3.5 w-full">
      {/* Card 1: Check In (Purple Gradient) */}
      <div className={`bg-gradient-to-br from-[#7c3aed] to-[#5b21b6] text-white p-4 rounded-3xl shadow-lg shadow-[#7c3aed]/10 flex flex-col text-left justify-between min-h-[110px] transition-all hover:scale-[1.01] hover:shadow-xl ${
        isClockedIn ? "opacity-100" : "opacity-80"
      }`}>
        <div className="flex items-start gap-2.5">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
            isClockedIn ? "bg-white/25 text-white" : "bg-white/15 text-white/80"
          }`}>
            <ArrowDownLeft className="w-4.5 h-4.5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-black leading-tight text-white">Check In</span>
            <span className="text-[10px] text-white/70 font-bold leading-normal mt-0.5 capitalize">
              {getCheckInStatus()}
            </span>
          </div>
        </div>
        <div className="mt-4">
          <span className="text-2xl font-black leading-none tracking-tight text-white">
            {clockInTime}
          </span>
        </div>
      </div>

      {/* Card 2: Check Out (Pink/Rose Gradient) */}
      <div className={`bg-gradient-to-br from-[#ec4899] to-[#be185d] text-white p-4 rounded-3xl shadow-lg shadow-[#ec4899]/10 flex flex-col text-left justify-between min-h-[110px] transition-all hover:scale-[1.01] hover:shadow-xl ${
        isClockedOut ? "opacity-100" : "opacity-80"
      }`}>
        <div className="flex items-start gap-2.5">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
            isClockedOut ? "bg-white/25 text-white" : "bg-white/15 text-white/80"
          }`}>
            <ArrowUpRight className="w-4.5 h-4.5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-black leading-tight text-white">Check Out</span>
            <span className="text-[10px] text-white/70 font-bold leading-normal mt-0.5 capitalize">
              {getCheckOutStatus()}
            </span>
          </div>
        </div>
        <div className="mt-4">
          <span className="text-2xl font-black leading-none tracking-tight text-white">
            {clockOutTime}
          </span>
        </div>
      </div>

      {/* Card 3: Absence (Cyan Gradient) */}
      <div className="bg-gradient-to-br from-[#06b6d4] to-[#0891b2] text-white p-4 rounded-3xl shadow-lg shadow-[#06b6d4]/10 flex flex-col text-left justify-between min-h-[110px] transition-all hover:scale-[1.01] hover:shadow-xl">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/25 text-white flex items-center justify-center shrink-0">
            <ArrowUp className="w-4.5 h-4.5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-black leading-tight text-white">Absence</span>
            <span className="text-[10px] text-white/70 font-bold leading-normal mt-0.5 capitalize">
              {currentMonth}
            </span>
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-1 text-left text-white">
          <span className="text-2xl font-black leading-none tracking-tight">1</span>
          <span className="text-[10px] text-white/80 font-black uppercase">Hari</span>
        </div>
      </div>

      {/* Card 4: Total Attended (Yellow Gradient) */}
      <div className="bg-gradient-to-br from-[#eab308] to-[#ca8a04] text-white p-4 rounded-3xl shadow-lg shadow-[#eab308]/10 flex flex-col text-left justify-between min-h-[110px] transition-all hover:scale-[1.01] hover:shadow-xl">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/25 text-white flex items-center justify-center shrink-0">
            <Repeat className="w-4.5 h-4.5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-black leading-tight text-white">Total Attended</span>
            <span className="text-[10px] text-white/70 font-bold leading-normal mt-0.5 capitalize">
              {currentMonth}
            </span>
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-1 text-left text-white">
          <span className="text-2xl font-black leading-none tracking-tight">
            {isCheckedIn ? 19 : 18}
          </span>
          <span className="text-[10px] text-white/80 font-black uppercase">Hari</span>
        </div>
      </div>
    </div>
  );
}
