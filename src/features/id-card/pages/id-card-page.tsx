import { ArrowLeft, Mail, Phone, Calendar, User, ShieldCheck } from "lucide-react";
import { useRouter } from "@/shared/router/router";
import patternBg from "@/assets/bg/pattern-background.png";

interface IdCardPageProps {
  user: any;
}

export function IdCardPage({ user }: IdCardPageProps) {
  const { navigate } = useRouter();

  // Format Join Date
  const formatJoinDate = (dateStr?: string) => {
    if (!dateStr) return "16 Sep 2025";
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  // Helper to format Date of Birth
  const formatBirthDate = (dateStr?: string) => {
    if (!dateStr) return "01 Jul 1992";
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  // Helper to resolve marital status
  const formatMaritalStatus = (status?: string) => {
    if (!status) return "Belum Kawin";
    if (status.startsWith("TK")) return "Belum Kawin";
    return "Kawin";
  };

  // Generate Initials
  const getInitials = (name?: string) => {
    if (!name) return "AM";
    return name
      .split(" ")
      .map(n => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const employeeName = user?.name || "Ade Muchtar";
  const employeeId = user?.id || "46";
  const initials = getInitials(employeeName);

  return (
    <div className="space-y-4 pb-12">
      {/* Header Bar */}
      <div className="relative -mx-5 -mt-6 mb-4 overflow-hidden rounded-b-2xl bg-[#1e2a4a] text-white">
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{ backgroundImage: `url(${patternBg})`, backgroundSize: "150px 150px", backgroundRepeat: "repeat" }}
        />
        <div className="relative z-10 flex items-center px-6 pt-7 pb-6 gap-3.5">
          <button
            onClick={() => navigate("MobileProfile")}
            className="p-2 hover:bg-white/10 active:scale-95 rounded-full transition-all cursor-pointer text-white border border-white/10 bg-white/5 backdrop-blur-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-bold tracking-widest uppercase text-white/70 leading-none">Kartu Pegawai</span>
            <h1 className="text-base font-bold tracking-tight text-white mt-1.5 leading-none">Identitas Digital</h1>
          </div>
        </div>
      </div>

      {/* Stacked Cards Container */}
      <div className="flex flex-col items-center gap-6 py-2 px-1">
        {/* CARD FRONT */}
        <div className="w-[280px] aspect-[1/1.58] bg-white rounded-[24px] border border-zinc-200 shadow-md relative overflow-hidden flex flex-col justify-between items-center text-center p-5">
          {/* Top Header Background Header Design */}
          <div className="bg-[#1e2a4a] text-white w-full py-4 absolute top-0 left-0 right-0 flex flex-col items-center border-b-4 border-[#e0542c]">
            <span className="text-[10px] font-black tracking-[0.2em] text-[#fee279] leading-none">PORTOTALENTS</span>
            <span className="text-[7.5px] font-bold tracking-widest text-white/70 uppercase mt-1 leading-none">PEJUANG MIMPI</span>
          </div>

          {/* Profile Photo Area */}
          <div className="mt-12 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full border-[3px] border-white shadow-md bg-zinc-100 flex items-center justify-center overflow-hidden shrink-0 mt-3">
              {user?.foto_karyawan ? (
                <img src={user.foto_karyawan} alt="Foto Karyawan" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-[#e0542c] to-[#fee279] text-white flex items-center justify-center text-2xl font-black select-none">
                  {initials}
                </div>
              )}
            </div>
            <h2 className="text-sm font-extrabold text-[#1e2a4a] mt-3.5 leading-tight tracking-tight uppercase">
              {employeeName}
            </h2>
            <span className="text-[9px] font-extrabold text-[#e0542c] uppercase tracking-wider bg-[#e0542c]/10 px-3 py-1 rounded-full mt-2 select-none">
              {user?.role === "Administrator" ? "Admin" : "Staff"}
            </span>
          </div>

          {/* Barcode & ID Details */}
          <div className="w-full flex flex-col items-center mb-1">
            {/* Elegant Barcode Design using CSS line grids */}
            <div className="w-44 h-8 flex items-center justify-center gap-[1.5px] opacity-80 select-none bg-zinc-50 border border-zinc-100 rounded-md p-1.5">
              {[1,2,3,4,1,2,3,1,4,2,1,3,2,4,1,2,3,1,4,2,1,3,2,1,4,2,3,1].map((val, idx) => (
                <div 
                  key={idx} 
                  className="bg-zinc-800 h-full rounded-xs shrink-0" 
                  style={{ width: `${val * 0.75}px` }} 
                />
              ))}
            </div>
            <span className="text-[9px] font-bold font-mono tracking-widest text-zinc-500 mt-1 select-none">
              ID: EMP-{String(employeeId).padStart(4, "0")}
            </span>
            <div className="w-full border-t border-zinc-100 mt-3 pt-2 text-center">
              <span className="text-[8.5px] font-bold text-zinc-400 uppercase tracking-wider">
                Tanggal Bergabung: {formatJoinDate(user?.tgl_join)}
              </span>
            </div>
          </div>
        </div>

        {/* CARD BACK */}
        <div className="w-[280px] aspect-[1/1.58] bg-[#1e2a4a] text-white rounded-[24px] border border-[#161f36] shadow-md relative overflow-hidden flex flex-col justify-between p-5 text-left">
          {/* Cloud Pattern Background Overlay */}
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{ backgroundImage: `url(${patternBg})`, backgroundSize: "120px 120px" }}
          />

          {/* Header */}
          <div className="relative z-10 flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-[10px] font-black tracking-widest text-[#fee279]">PORTOTALENTS</span>
              <span className="text-[7px] font-bold tracking-wider text-white/50 uppercase mt-0.5">KARTU IDENTITAS DIGITAL</span>
            </div>
            <ShieldCheck className="w-6 h-6 text-[#fee279] opacity-80 shrink-0" />
          </div>

          {/* Employee Details Grid */}
          <div className="relative z-10 space-y-2 mt-4 text-white/90">
            {/* Email */}
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#fee279] shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[7.5px] font-extrabold uppercase text-white/40 tracking-wider leading-none">Email</span>
                <span className="text-[9.5px] font-semibold truncate leading-normal mt-0.5">{user?.email || "ademuchtar027@gmail.com"}</span>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#fee279] shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[7.5px] font-extrabold uppercase text-white/40 tracking-wider leading-none">Telepon</span>
                <span className="text-[9.5px] font-semibold truncate leading-normal mt-0.5">{user?.telepon || "081296390911"}</span>
              </div>
            </div>

            {/* Birth Date */}
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#fee279] shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[7.5px] font-extrabold uppercase text-white/40 tracking-wider leading-none">Tanggal Lahir</span>
                <span className="text-[9.5px] font-semibold truncate leading-normal mt-0.5">{formatBirthDate(user?.tgl_lahir)}</span>
              </div>
            </div>

            {/* Gender / Marital Status */}
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-[#fee279] shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[7.5px] font-extrabold uppercase text-white/40 tracking-wider leading-none">Informasi Personal</span>
                <span className="text-[9.5px] font-semibold truncate leading-normal mt-0.5">
                  {user?.gender || "Laki-Laki"} • {formatMaritalStatus(user?.status_nikah)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes & Footer signature area */}
          <div className="relative z-10 w-full mt-3">
            <div className="border-t border-white/10 pt-2.5">
              <p className="text-[7px] text-white/40 leading-relaxed font-medium">
                1. Kartu identitas digital ini diterbitkan secara sah oleh Perusahaan.<br />
                2. Wajib ditunjukkan saat melaksanakan tugas dan koordinasi kedinasan.<br />
                3. Jika menemukan kartu fisik yang tercetak, harap hubungi HRD Perusahaan.
              </p>
            </div>
            
            {/* Signature Placeholder */}
            <div className="w-full text-center mt-3 border-t border-white/5 pt-1.5">
              <span className="text-[7px] text-[#fee279]/50 font-bold uppercase tracking-wider select-none leading-none">
                DIREKTUR UTAMA • PORTOTALENTS
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
