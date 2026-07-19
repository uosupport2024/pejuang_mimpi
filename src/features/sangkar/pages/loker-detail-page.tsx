import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Bookmark, CheckCircle2, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { fetchLokerDetail, applyLoker, fetchLokers } from "@/features/pakan/api/loker";
import type { JobOpening } from "@/features/pakan/types/pakan.type";
import patternBg from "@/assets/bg/pattern-background.png";
import { motion } from "framer-motion";

export function LokerDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const idParam = location.pathname.split("/").pop() || null;

  const [loker, setLoker] = useState<(JobOpening & { description: string }) | null>(null);
  const [recommendations, setRecommendations] = useState<JobOpening[]>([]);
  const [loading, setLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "company" | "reviews">("description");
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!idParam) {
      navigate("/mobile/home");
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchLokerDetail(idParam!);
        setLoker(data);
        setIsApplied(!!data.isApplied);

        try {
          const recsRes = await fetchLokers({ per_page: 5 });
          const filteredRecs = recsRes.data
            .filter((j) => String(j.id) !== String(idParam))
            .slice(0, 3);
          setRecommendations(filteredRecs);
        } catch (e) {
          console.warn("Failed to load recommendations from server, using local fallback");
          const localRecs = [
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
            }
          ].filter(j => j.id !== String(idParam)).slice(0, 2);
          setRecommendations(localRecs as any);
        }

      } catch (err) {
        console.error(err);
        toast.error("Gagal memuat detail lowongan");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [idParam, navigate]);

  const handleApply = async (noteValue?: string) => {
    if (!idParam || isApplied) return;

    try {
      setIsApplying(true);
      setShowNoteModal(false);
      const success = await applyLoker(idParam, noteValue);
      if (success) {
        setIsApplied(true);
        toast.success("Berhasil mengirimkan lamaran pekerjaan!");
      } else {
        toast.error("Gagal mengirimkan lamaran");
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal melamar pekerjaan");
    } finally {
      setIsApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F7F3EB] text-slate-800 relative -mt-6 -mx-5 text-left animate-pulse">
        {/* Skeleton Top Header */}
        <div className="bg-[#1e2a4a] text-white flex items-center justify-between px-5 pt-4 pb-4 sticky -top-6 z-20 shadow-md relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: `url(${patternBg})`,
              backgroundSize: "150px 150px"
            }}
          />
          <div className="flex items-center gap-3 relative z-10">
            <button className="p-1 rounded-full text-white/40">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="h-4 bg-white/20 rounded w-28" />
          </div>
          <button className="p-1 rounded-full text-white/40 relative z-10">
            <Bookmark className="w-5 h-5" />
          </button>
        </div>

        {/* Skeleton Content Body */}
        <div className="p-5 space-y-4">
          {/* Company Card Skeleton */}
          <div className="bg-white p-5 rounded-[24px] border border-gray-100/70 shadow-xs space-y-4">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 bg-slate-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4.5 bg-slate-200 rounded w-2/3" />
                <div className="h-3 bg-slate-100 rounded w-1/3" />
              </div>
            </div>
            <div className="flex gap-1.5 pt-1">
              <div className="h-5 bg-slate-100 rounded-full w-14" />
              <div className="h-5 bg-slate-100 rounded-full w-14" />
              <div className="h-5 bg-slate-100 rounded-full w-14" />
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <div className="h-4 bg-slate-200 rounded w-20" />
              <div className="h-4.5 bg-slate-200 rounded w-24" />
            </div>
          </div>

          {/* Tabs Bar Skeleton */}
          <div className="flex bg-[#e2dcd0] p-1 rounded-xl">
            <div className="flex-1 h-8 bg-white/40 rounded-lg" />
            <div className="flex-1 h-8" />
            <div className="flex-1 h-8" />
          </div>

          {/* Description Skeleton */}
          <div className="bg-white p-5 rounded-[24px] border border-gray-100/70 shadow-xs space-y-3">
            <div className="h-3.5 bg-slate-200 rounded w-1/4" />
            <div className="space-y-2">
              <div className="h-3 bg-slate-100 rounded w-full" />
              <div className="h-3 bg-slate-100 rounded w-5/6" />
              <div className="h-3 bg-slate-100 rounded w-4/5" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!loker) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white text-slate-500 p-6 text-center">
        <span className="text-sm font-semibold">Lowongan tidak ditemukan.</span>
        <button onClick={() => navigate("/mobile/home")} className="mt-4 bg-[#e0542c] text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer">
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F3EB] text-slate-800 relative -mt-6 -mx-5 text-left">
      {/* Top sticky navigation */}
      <div className="bg-[#1e2a4a] text-white flex items-center justify-between px-5 pt-4 pb-4 sticky -top-6 z-20 shadow-md relative overflow-hidden">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `url(${patternBg})`,
            backgroundSize: "150px 150px",
            backgroundRepeat: "repeat"
          }}
        />
        <div className="flex items-center gap-3 relative z-10 w-full justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/mobile/home")}
              className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer animate-none"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <span className="text-sm font-bold tracking-tight">Detail Pekerjaan</span>
          </div>
          <button
            onClick={() => {
              setIsBookmarked(!isBookmarked);
              toast.success(isBookmarked ? "Bookmark dihapus" : "Pekerjaan disimpan!");
            }}
            className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-orange-500 text-orange-500" : "text-white"}`} />
          </button>
        </div>
      </div>

      {/* Main Body Content Container */}
      <div className="p-5 space-y-5 pb-36">
        {/* Google-like Simple Header Block */}
        <div className="flex gap-4 items-center mb-1">
          <div className="w-12 h-12 bg-white border border-zinc-200/80 rounded-full flex items-center justify-center font-black text-sm text-zinc-700 shadow-xs shrink-0 select-none">
            {loker.company.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-zinc-900 tracking-tight leading-tight">{loker.position}</h3>
            <p className="text-xs text-zinc-550 font-semibold mt-1">
              {loker.company} <span className="mx-1.5">•</span> {loker.location}
            </p>
          </div>
        </div>

        {/* Pill Badges Row */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[10px] font-bold px-3 py-1.5 bg-white border border-zinc-200/50 text-zinc-650 rounded-full leading-none">
            {loker.jobType}
          </span>
          <span className="text-[10px] font-bold px-3 py-1.5 bg-white border border-zinc-200/50 text-zinc-650 rounded-full leading-none">
            {loker.workplace}
          </span>
          <span className="text-[10px] font-bold px-3 py-1.5 bg-white border border-zinc-200/50 text-zinc-650 rounded-full leading-none">
            {loker.salary}
          </span>
        </div>

        {/* Segmented Control / Tab bar */}
        <div className="flex bg-zinc-200/60 p-1 rounded-full select-none relative">
          <button
            onClick={() => setActiveTab("description")}
            className={`flex-1 text-center py-2.5 rounded-full text-xs font-extrabold transition-all relative z-10 duration-200 cursor-pointer ${activeTab === "description" ? "text-white" : "text-zinc-650 hover:text-zinc-900"
              }`}
          >
            {activeTab === "description" && (
              <motion.div
                layoutId="activeLokerTab"
                className="absolute inset-0 bg-[#e0542c] rounded-full -z-10 shadow-sm"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            Deskripsi
          </button>
          <button
            onClick={() => setActiveTab("company")}
            className={`flex-1 text-center py-2.5 rounded-full text-xs font-extrabold transition-all relative z-10 duration-200 cursor-pointer ${activeTab === "company" ? "text-white" : "text-zinc-650 hover:text-zinc-900"
              }`}
          >
            {activeTab === "company" && (
              <motion.div
                layoutId="activeLokerTab"
                className="absolute inset-0 bg-[#e0542c] rounded-full -z-10 shadow-sm"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            Perusahaan
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`flex-1 text-center py-2.5 rounded-full text-xs font-extrabold transition-all relative z-10 duration-200 cursor-pointer ${activeTab === "reviews" ? "text-white" : "text-zinc-650 hover:text-zinc-900"
              }`}
          >
            {activeTab === "reviews" && (
              <motion.div
                layoutId="activeLokerTab"
                className="absolute inset-0 bg-[#e0542c] rounded-full -z-10 shadow-sm"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            Ulasan
          </button>
        </div>

        {/* Tab Contents */}
        <div className="space-y-6 flex-1">
          {activeTab === "description" && (
            <>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 mb-2">Tentang Pekerjaan</h4>
                <p className="text-xs text-zinc-600 leading-relaxed font-semibold whitespace-pre-line">
                  {loker.description}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-zinc-900 mb-2.5">Kualifikasi</h4>
                <ul className="space-y-2 text-xs text-zinc-600 font-semibold list-disc pl-4">
                  <li>Memiliki integritas tinggi dan minat belajar yang kuat.</li>
                  <li>Kreatif, inovatif, dan mampu berkomunikasi dengan baik.</li>
                  <li>Dapat beradaptasi cepat dalam lingkungan kerja dinamis.</li>
                  <li>Memiliki latar belakang pendidikan atau sertifikasi yang relevan.</li>
                </ul>
              </div>
            </>
          )}

          {activeTab === "company" && (
            <div>
              <h4 className="text-sm font-bold text-zinc-900 mb-2">Tentang {loker.company}</h4>
              <p className="text-xs text-zinc-600 leading-relaxed font-semibold">
                {loker.company} adalah penyedia layanan dan solusi industri terpercaya yang berfokus pada inovasi, pertumbuhan bakat, dan kolaborasi tim untuk mencapai mimpi-mimpi besar bersama. Kami berkomitmen menciptakan lingkungan kerja yang inklusif dan produktif.
              </p>
            </div>
          )}

          {activeTab === "reviews" && (
            <div>
              <h4 className="text-sm font-bold text-zinc-900 mb-2">Ulasan Karyawan</h4>
              <p className="text-xs text-zinc-550 italic font-semibold">
                Belum ada ulasan untuk perusahaan ini. Jadilah yang pertama memberikan ulasan setelah Anda diterima bekerja!
              </p>
            </div>
          )}

          {/* Relevant Job Recommendations */}
          {recommendations.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-zinc-100">
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2">Rekomendasi Lowongan Lain</h4>
              <div className="flex flex-col gap-2.5">
                {recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    onClick={() => navigate(`/mobile/loker/${rec.id}`)}
                    className="flex items-center justify-between p-3.5 bg-white border border-slate-200/40 rounded-2xl shadow-xs cursor-pointer transition-all duration-200 group active:scale-[0.995] hover:bg-zinc-50/50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 bg-zinc-50 border border-zinc-200/60 rounded-full flex items-center justify-center font-extrabold text-[11px] text-zinc-600 shrink-0 select-none">
                        {rec.company.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-zinc-900 group-hover:text-[#e0542c] transition-colors truncate">{rec.position}</p>
                        <p className="text-[10px] text-zinc-450 font-bold truncate mt-0.5">{rec.company} • {rec.location}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-350 shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Sticky apply button wrapper */}
      <div className="fixed bottom-4 left-0 right-0 px-5 py-2 bg-gradient-to-t from-white via-white to-transparent pointer-events-none z-30">
        <button
          onClick={() => setShowNoteModal(true)}
          disabled={isApplying || isApplied}
          className={`w-full max-w-[440px] mx-auto h-12 rounded-full flex items-center justify-center gap-2 text-xs font-extrabold shadow-md active:scale-98 transition-all cursor-pointer pointer-events-auto ${isApplied
            ? "bg-emerald-500 text-white cursor-default"
            : "bg-[#e0542c] hover:bg-[#c84620] text-white"
            }`}
        >
          {isApplied ? (
            <>
              <CheckCircle2 className="w-4.5 h-4.5" />
              <span>Sudah Dilamar</span>
            </>
          ) : (
            <span>{isApplying ? "Mengirim Lamaran..." : "Lamar Pekerjaan Sekarang"}</span>
          )}
        </button>
      </div>

      {/* Note input Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-5 z-50 text-left animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 space-y-4 shadow-xl border border-gray-100 animate-in zoom-in-95 duration-200 pointer-events-auto">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-zinc-900">Catatan Lamaran</h3>
              <p className="text-[11px] font-medium text-zinc-400">
                Tambahkan pesan atau catatan singkat untuk lamaran ini (opsional).
              </p>
            </div>

            <textarea
              className="w-full border border-gray-250 rounded-2xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#e0542c] focus:border-[#e0542c] text-zinc-750 bg-zinc-50 font-semibold placeholder-zinc-400"
              placeholder="Tulis pesan atau catatan Anda di sini..."
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowNoteModal(false);
                  setNote(""); // clear
                }}
                className="flex-1 h-9 rounded-full border border-gray-200 hover:bg-gray-50 text-xs font-bold text-zinc-500 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleApply(note)}
                className="flex-1 h-9 rounded-full bg-[#e0542c] hover:bg-[#c84620] text-xs font-bold text-white transition-colors cursor-pointer flex items-center justify-center"
              >
                Kirim Lamaran
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
