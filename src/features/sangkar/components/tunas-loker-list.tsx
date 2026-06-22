import { THEME_COLORS } from "@/shared/constants/colors";
import { toast } from "sonner";

export function TunasLokerList() {
  const jobs = [
    {
      position: "Frontend Developer",
      company: "PT Finexy Digital Corp",
      location: "Jakarta Selatan",
      type: "Hybrid",
      education: "S1 Informatika",
      salary: "Rp 6,5 - 9,0 jt"
    },
    {
      position: "Social Media Specialist",
      company: "Mimpi Creative Agency",
      location: "Bandung",
      type: "Remote",
      education: "Minimal D3",
      salary: "Rp 4,5 - 6,0 jt"
    },
    {
      position: "Barista & Store Helper",
      company: "Kopi Nusantara Co",
      location: "Surabaya",
      type: "Full-time",
      education: "Minimal SMA/SMK",
      salary: "Rp 3,5 - 4,5 jt"
    },
    {
      position: "Admin Operational",
      company: "PT Logistik Jaya",
      location: "Tangerang",
      type: "On-site",
      education: "Minimal SMA/D3",
      salary: "Rp 4,8 - 5,5 jt"
    }
  ];

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center px-0.5">
        <span className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">Daftar Tunas Terbaru</span>
        <span
          onClick={() => toast.info("Membuka riwayat lengkap tunas...")}
          className="text-[10px] text-[#e0542c] font-bold cursor-pointer hover:underline"
        >
          Lihat Semua
        </span>
      </div>

      {/* List of Tunas logs */}
      <div className="flex flex-col gap-2.5">
        {jobs.map((item, idx) => {
          return (
            <div
              key={idx}
              className="flex items-center justify-between p-3.5 bg-white hover:bg-zinc-50/40 rounded-2xl border border-gray-100/70 shadow-md shadow-black/[0.06] transition-all duration-200 cursor-pointer group hover:scale-[1.005] hover:shadow-lg"
              onClick={() => toast.success(`Membuka lamaran untuk ${item.position} di ${item.company}...`)}
            >
              <div className="flex flex-col text-left min-w-0">
                <span className="text-xs font-extrabold text-gray-900 group-hover:text-[#e0542c] transition-colors truncate">{item.position}</span>
                <span className="text-[10px] text-zinc-400 font-bold truncate mt-0.5">{item.company}</span>

                {/* Badges: Type (Green), Location (Yellow), Education (Blue) */}
                <div className="flex flex-wrap gap-1 mt-2">
                  <span className={`text-[8.5px] font-extrabold px-2 py-0.5 rounded-full ${THEME_COLORS.badges.type}`}>
                    {item.type}
                  </span>
                  <span className={`text-[8.5px] font-extrabold px-2 py-0.5 rounded-full ${THEME_COLORS.badges.location}`}>
                    {item.location}
                  </span>
                  <span className={`text-[8.5px] font-extrabold px-2 py-0.5 rounded-full ${THEME_COLORS.badges.education}`}>
                    {item.education}
                  </span>
                </div>
              </div>

              <div className="flex flex-col text-right shrink-0 ml-3 self-center">
                <span className="text-xs font-black text-[#e0542c]">{item.salary}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
