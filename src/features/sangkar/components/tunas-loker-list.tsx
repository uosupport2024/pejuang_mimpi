import { useState, useEffect } from "react";
import { THEME_COLORS } from "@/shared/constants/colors";
import { toast } from "sonner";
import { fetchLokers } from "@/features/pakan/api/loker";
import { useNavigate } from "react-router-dom";

const MOCK_JOBS = [
  {
    id: "1",
    position: "Frontend Developer",
    company: "PT Finexy Digital Corp",
    location: "Jakarta Selatan",
    type: "Hybrid",
    education: "S1",
    salary: "Rp 6,5 - 9,0 jt"
  },
  {
    id: "2",
    position: "Social Media Specialist",
    company: "Mimpi Creative Agency",
    location: "Bandung",
    type: "Remote",
    education: "D3",
    salary: "Rp 4,5 - 6,0 jt"
  },
  {
    id: "3",
    position: "Barista & Store Helper",
    company: "Kopi Nusantara Co",
    location: "Surabaya",
    type: "Full-time",
    education: "SMA/SMK",
    salary: "Rp 3,5 - 4,5 jt"
  },
  {
    id: "4",
    position: "Admin Operational",
    company: "PT Logistik Jaya",
    location: "Tangerang",
    type: "On-site",
    education: "SMA/D3",
    salary: "Rp 4,8 - 5,5 jt"
  }
];

export function TunasLokerList() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>(MOCK_JOBS);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetchLokers({ per_page: 4 });
        if (res.data.length > 0) {
          const mapped = res.data.map((j) => ({
            id: j.id,
            position: j.position,
            company: j.company,
            location: j.location.split("•")[0].trim(),
            type: j.workplace,
            education: "SMA/D3",
            salary: j.salary
          }));
          setJobs(mapped);
        }
      } catch (err) {
        console.warn("Backend API not reachable, using fallback mock jobs.", err);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center px-0.5">
        <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">Daftar Tunas Terbaru</span>
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
              onClick={() => navigate(`/mobile/loker/${item.id || idx + 1}`)}
            >
              <div className="flex flex-col text-left min-w-0">
                <span className="text-xs font-bold text-gray-900 group-hover:text-[#e0542c] transition-colors truncate">{item.position}</span>
                <span className="text-[10px] text-zinc-400 font-bold truncate mt-0.5">{item.company}</span>

                {/* Badges: Type (Green), Location (Yellow), Education (Blue) */}
                <div className="flex gap-1 mt-2 overflow-x-auto scrollbar-none select-none">
                  <span className={`text-[7.5px] font-extrabold px-1.5 py-0.5 rounded-full leading-none whitespace-nowrap ${THEME_COLORS.badges.type}`}>
                    {item.type}
                  </span>
                  <span className={`text-[7.5px] font-extrabold px-1.5 py-0.5 rounded-full leading-none whitespace-nowrap ${THEME_COLORS.badges.location}`}>
                    {item.location}
                  </span>
                  <span className={`text-[7.5px] font-extrabold px-1.5 py-0.5 rounded-full leading-none whitespace-nowrap ${THEME_COLORS.badges.education}`}>
                    {item.education}
                  </span>
                </div>
              </div>

              <div className="flex flex-col text-right shrink-0 ml-3 self-center">
                <span className="text-xs font-bold text-[#e0542c]">{item.salary}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
