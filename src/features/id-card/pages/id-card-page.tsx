import { ArrowLeft, Mail, Phone, Calendar, User, ShieldCheck, Download } from "lucide-react";
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

  // Client-side HTML5 Canvas PNG Downloader
  const handleDownload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 380;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, 600, 380);
    gradient.addColorStop(0, "#1e2a4a");
    gradient.addColorStop(0.5, "#24345d");
    gradient.addColorStop(1, "#151f38");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 380);

    // 2. Draw border
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, 580, 360);

    // 3. Header Text
    ctx.fillStyle = "#fee279";
    ctx.font = "900 18px sans-serif";
    ctx.fillText("PEJUANG MIMPI", 40, 55);

    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = "bold 9px sans-serif";
    ctx.fillText("KARTU KARYAWAN DIGITAL", 40, 75);

    // 4. Employee Badge
    ctx.fillStyle = "rgba(254, 226, 121, 0.15)";
    ctx.fillRect(450, 35, 110, 30);
    ctx.strokeStyle = "rgba(254, 226, 121, 0.4)";
    ctx.lineWidth = 1;
    ctx.strokeRect(450, 35, 110, 30);
    
    ctx.fillStyle = "#fee279";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("EMPLOYEE", 505, 54);

    // Reset text align
    ctx.textAlign = "left";

    // 5. Avatar Placeholder with Gradient
    const avatarGradient = ctx.createLinearGradient(40, 120, 150, 230);
    avatarGradient.addColorStop(0, "#e0542c");
    avatarGradient.addColorStop(1, "#fee279");
    ctx.fillStyle = avatarGradient;
    
    // Draw rounded rect for avatar
    ctx.beginPath();
    ctx.arc(95, 175, 50, 0, Math.PI * 2);
    ctx.fill();

    // Draw Initials inside Avatar
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 32px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(initials, 95, 187);

    // Reset text align
    ctx.textAlign = "left";

    // 6. Employee Details
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText(employeeName.toUpperCase(), 165, 155);

    ctx.fillStyle = "#fee279";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText(user?.role === "Administrator" ? "ADMIN" : "STAFF", 165, 182);

    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText(`ID: EMP-${String(employeeId).padStart(4, "0")}`, 165, 208);

    // 7. Footer: Join Date
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = "bold 8px sans-serif";
    ctx.fillText("TANGGAL BERGABUNG", 40, 298);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText(formatJoinDate(user?.tgl_join), 40, 320);

    // 8. Barcode lines
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    const barcodeX = 420;
    const barcodeY = 295;
    const barcodeHeight = 28;
    const barWidths = [2, 4, 1, 3, 2, 4, 1, 2, 4, 3, 1, 4, 2, 1, 3, 2, 4];
    let currentX = barcodeX;
    barWidths.forEach(width => {
      ctx.fillRect(currentX, barcodeY, width, barcodeHeight);
      currentX += width + 2;
    });

    // 9. Trigger download
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `kartu-karyawan-${employeeName.toLowerCase().replace(/\s+/g, "-")}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="space-y-5 pb-12 text-left">
      {/* Header Bar */}
      <div className="relative -mx-5 -mt-6 mb-4 overflow-hidden rounded-b-2xl bg-[#1e2a4a] text-white">
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{ backgroundImage: `url(${patternBg})`, backgroundSize: "150px 150px", backgroundRepeat: "repeat" }}
        />
        <div className="relative z-10 flex items-center px-6 pt-7 pb-6 gap-3.5">
          <button
            onClick={() => navigate("MobileLumbung")}
            className="p-2 hover:bg-white/10 active:scale-95 rounded-full transition-all cursor-pointer text-white border border-white/10 bg-white/5 backdrop-blur-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-bold tracking-widest uppercase text-white/70 leading-none">Kartu Karyawan</span>
            <h1 className="text-base font-bold tracking-tight text-white mt-1.5 leading-none">Identitas Digital</h1>
          </div>
        </div>
      </div>

      {/* Cards Layout Section */}
      <div className="space-y-6 px-1">
        
        {/* CARD FRONT */}
        <div className="space-y-2">
          <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block px-1">Tampak Depan</span>
          
          <div className="w-full aspect-[1.586/1] bg-gradient-to-br from-[#1e2a4a] via-[#24345d] to-[#151f38] text-white p-5 rounded-[24px] shadow-lg relative overflow-hidden flex flex-col justify-between border border-white/5">
            {/* Cloud Pattern Overlay */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{ backgroundImage: `url(${patternBg})`, backgroundSize: "120px 120px" }}
            />
            {/* Gloss reflection sweeps */}
            <div className="absolute -inset-y-24 -inset-x-40 w-44 bg-white/5 blur-2xl rounded-full rotate-45 pointer-events-none" />

            {/* Header: Company Name & Brand */}
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-[11px] font-black tracking-[0.2em] text-[#fee279] leading-none">
                  PEJUANG MIMPI
                </p>
                <p className="text-[7.5px] font-semibold text-white/60 tracking-widest mt-1 uppercase leading-none">
                  KARTU KARYAWAN DIGITAL
                </p>
              </div>
              <span className="text-[8px] font-extrabold tracking-widest text-[#fee279] bg-white/10 border border-white/10 px-2.5 py-1 rounded-md uppercase select-none">
                EMPLOYEE
              </span>
            </div>

            {/* Middle: Profile Avatar & Details side-by-side */}
            <div className="flex items-center gap-4 relative z-10 my-auto">
              {/* Photo */}
              <div className="w-[72px] h-[72px] rounded-2xl border-2 border-white/20 bg-white/5 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                {user?.foto_karyawan ? (
                  <img src={user.foto_karyawan} alt="Foto" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-[#e0542c] to-[#fee279] text-white flex items-center justify-center text-xl font-black select-none">
                    {initials}
                  </div>
                )}
              </div>

              {/* Text Info */}
              <div className="flex flex-col min-w-0 text-left">
                <h2 className="text-sm font-extrabold text-white tracking-wide uppercase truncate leading-snug">
                  {employeeName}
                </h2>
                <p className="text-[10px] font-bold text-[#fee279] uppercase tracking-wider mt-0.5">
                  {user?.role === "Administrator" ? "Admin" : "Staff"}
                </p>
                <p className="text-[9px] font-bold font-mono text-white/60 tracking-widest mt-1">
                  ID: EMP-{String(employeeId).padStart(4, "0")}
                </p>
              </div>
            </div>

            {/* Footer: Date & Small Barcode */}
            <div className="flex justify-between items-end relative z-10 border-t border-white/10 pt-3">
              <div className="space-y-0.5">
                <p className="text-[6.5px] text-white/50 font-bold tracking-wider leading-none">
                  TANGGAL BERGABUNG
                </p>
                <p className="text-[9px] font-bold text-white/90 leading-none mt-1">
                  {formatJoinDate(user?.tgl_join)}
                </p>
              </div>

              {/* Clean decorative barcode */}
              <div className="flex items-center gap-[1px] opacity-70 bg-white/5 px-2 py-1 rounded-sm border border-white/5 select-none shrink-0 h-6">
                {[1,2,3,1,2,1,3,2,1,3,1,2,3,1,2].map((val, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white h-full shrink-0" 
                    style={{ width: `${val * 0.75}px` }} 
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CARD BACK */}
        <div className="space-y-2">
          <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block px-1">Tampak Belakang</span>
          
          <div className="w-full aspect-[1.586/1] bg-gradient-to-br from-[#18233c] to-[#101729] text-white p-5 rounded-[24px] shadow-lg relative overflow-hidden flex flex-col justify-between border border-white/5">
            {/* Pattern overlay */}
            <div
              className="absolute inset-0 opacity-5 pointer-events-none"
              style={{ backgroundImage: `url(${patternBg})`, backgroundSize: "120px 120px" }}
            />

            {/* Top: Header back side */}
            <div className="relative z-10 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black tracking-widest text-[#fee279] leading-none">
                  PEJUANG MIMPI
                </p>
                <p className="text-[6.5px] font-bold tracking-wider text-white/40 uppercase mt-1 leading-none">
                  KARTU IDENTITAS DIGITAL
                </p>
              </div>
              <ShieldCheck className="w-5.5 h-5.5 text-[#fee279]/80 shrink-0" />
            </div>

            {/* Middle: Details stack */}
            <div className="relative z-10 grid grid-cols-2 gap-x-4 gap-y-2 my-auto">
              {/* Email */}
              <div className="flex items-center gap-2 min-w-0">
                <Mail className="w-3.5 h-3.5 text-[#fee279] shrink-0" />
                <div className="flex flex-col min-w-0 text-left">
                  <span className="text-[6px] font-bold uppercase text-white/40 tracking-wider leading-none">Email</span>
                  <span className="text-[9px] font-semibold truncate text-white/90 leading-tight mt-0.5">{user?.email || "ademuchtar027@gmail.com"}</span>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-2 min-w-0">
                <Phone className="w-3.5 h-3.5 text-[#fee279] shrink-0" />
                <div className="flex flex-col min-w-0 text-left">
                  <span className="text-[6px] font-bold uppercase text-white/40 tracking-wider leading-none">Telepon</span>
                  <span className="text-[9px] font-semibold truncate text-white/90 leading-tight mt-0.5">{user?.telepon || "081296390911"}</span>
                </div>
              </div>

              {/* Birth Date */}
              <div className="flex items-center gap-2 min-w-0">
                <Calendar className="w-3.5 h-3.5 text-[#fee279] shrink-0" />
                <div className="flex flex-col min-w-0 text-left">
                  <span className="text-[6px] font-bold uppercase text-white/40 tracking-wider leading-none">Tanggal Lahir</span>
                  <span className="text-[9px] font-semibold truncate text-white/90 leading-tight mt-0.5">{formatBirthDate(user?.tgl_lahir)}</span>
                </div>
              </div>

              {/* Personal Info */}
              <div className="flex items-center gap-2 min-w-0">
                <User className="w-3.5 h-3.5 text-[#fee279] shrink-0" />
                <div className="flex flex-col min-w-0 text-left">
                  <span className="text-[6px] font-bold uppercase text-white/40 tracking-wider leading-none">Personal</span>
                  <span className="text-[9px] font-semibold truncate text-white/90 leading-tight mt-0.5">
                    {user?.gender || "Laki-Laki"} • {formatMaritalStatus(user?.status_nikah)}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom: Signature / Disclaimer */}
            <div className="relative z-10 border-t border-white/10 pt-2.5">
              <p className="text-[6.5px] text-white/40 leading-relaxed font-medium text-left">
                Kartu identitas ini merupakan properti resmi Perusahaan. Wajib digunakan secara bertanggung jawab. Jika menemukan kartu ini harap kembalikan kepada departemen HRD.
              </p>
              
              <div className="w-full text-center mt-3 border-t border-white/5 pt-1.5 leading-none">
                <span className="text-[6.5px] text-[#fee279]/40 font-bold uppercase tracking-widest select-none">
                  DIREKTUR UTAMA • PEJUANG MIMPI
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Download Action Button */}
        <div className="pt-2 px-1">
          <button
            type="button"
            onClick={handleDownload}
            className="w-full h-12 rounded-xl bg-[#e0542c] hover:bg-[#c23f1b] text-white font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#e0542c]/15 active:scale-95 transition-all border-none text-xs"
          >
            <Download className="w-4 h-4 text-white shrink-0" />
            <span>Unduh Kartu Pegawai (PNG)</span>
          </button>
        </div>

      </div>
    </div>
  );
}
