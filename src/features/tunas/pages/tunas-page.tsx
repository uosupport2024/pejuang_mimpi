import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Briefcase, Clock, Bookmark, Calendar, MessageSquare, CheckCircle2, FileText, Search, Trophy, XCircle } from "lucide-react";
import { useRouter } from "@/shared/router/router";
import { toast } from "sonner";
import logoWhite from "@/assets/logo/logo-white.png";
import patternBg from "@/assets/bg/pattern-background.png";
import { AbsensiCard } from "../components/absensi-card";
import { MenuGrid } from "../components/menu-grid";
import { AttendanceHistory } from "../components/attendance-history";
import { useTunas } from "../hooks/use-tunas";
import type { TunasPageProps } from "../types/tunas.type";
import { PakanLokerList } from "../../pakan/components/pakan-list";
import { usePakan } from "../../pakan/hooks/use-pakan";
import { fetchMyApplications, fetchLokerDetail } from "../../pakan/api/loker";

interface PakanLokerSubPageProps {
  selectedApplication: any | null;
  setSelectedApplication: (app: any | null) => void;
  showChat: boolean;
  setShowChat: (show: boolean) => void;
}

function PakanLokerSubPage({
  selectedApplication,
  setSelectedApplication,
  showChat,
  setShowChat,
}: PakanLokerSubPageProps) {
  const [subTab, setSubTab] = useState<"search" | "history">("search");
  const [appliedJobs, setAppliedJobs] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Detail View & Chat states
  const [selectedApplicationLoker, setSelectedApplicationLoker] = useState<any | null>(null);
  const [loadingAppDetail, setLoadingAppDetail] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (showChat) {
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [chatMessages, showChat]);

  const {
    searchQuery,
    setSearchQuery,
    filteredJobs,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,

    // Filter states
    isFilterOpen,
    setIsFilterOpen,
    openFilters,
    applyFilters,
    resetFilters,
    tempFilteredCount,

    // Temp states
    tempJobTypes,
    toggleTempJobType,
    tempWorkplaces,
    toggleTempWorkplace,
    tempCategories,
    toggleTempCategory,
    tempProvinces,
    toggleTempProvince,
    tempCities,
    toggleTempCity,
    tempMinSalary,
    setTempMinSalary,
  } = usePakan();

  // Load applied history when history tab is active
  useEffect(() => {
    if (subTab === "history") {
      async function loadHistory() {
        try {
          setLoadingHistory(true);
          const data = await fetchMyApplications();
          setAppliedJobs(data);
        } catch (err) {
          console.error(err);
          toast.error("Gagal memuat riwayat lamaran");
        } finally {
          setLoadingHistory(false);
        }
      }
      loadHistory();
    }
  }, [subTab]);

  // Load chat messages when chat is opened
  useEffect(() => {
    if (showChat && selectedApplication) {
      const positionName = selectedApplication.loker?.title || "Lowongan";
      const companyName = selectedApplication.loker?.company || "Perusahaan";
      const status = (selectedApplication.status || "submitted").toLowerCase();

      const initialMsgs = [
        {
          id: 1,
          sender: "hrd",
          text: `Halo, terima kasih telah melamar untuk posisi ${positionName} di ${companyName}. Lamaran Anda telah kami terima.`,
          time: "10:00",
        },
      ];

      if (status === "submitted") {
        initialMsgs.push({
          id: 2,
          sender: "hrd",
          text: "Saat ini berkas lamaran Anda sedang dalam antrean untuk peninjauan oleh tim rekrutmen kami. Mohon tunggu kabar selanjutnya ya.",
          time: "10:02",
        });
      } else if (status === "reviewed") {
        initialMsgs.push({
          id: 2,
          sender: "hrd",
          text: "Kabar baik! Lamaran Anda sedang ditinjau secara mendalam oleh tim rekrutmen kami. Silakan siapkan dokumen pendukung jika diperlukan.",
          time: "10:05",
        });
      } else if (status === "interview") {
        initialMsgs.push(
          {
            id: 2,
            sender: "user",
            text: "Baik Bapak/Ibu, terima kasih atas kesempatannya. Saya sangat menantikan info selanjutnya.",
            time: "10:03",
          },
          {
            id: 3,
            sender: "hrd",
            text: "Selamat! Berdasarkan hasil seleksi berkas, kami mengundang Anda untuk mengikuti tahap wawancara online. Silakan konfirmasi kesediaan Anda.",
            time: "10:10",
          }
        );
      } else if (status === "accepted" || status === "approved") {
        initialMsgs.push(
          {
            id: 2,
            sender: "hrd",
            text: "Selamat! Anda dinyatakan lolos seleksi. Kami akan mengirimkan surat penawaran kerja (Offering Letter) dan petunjuk onboarding ke email Anda.",
            time: "10:15",
          }
        );
      } else if (status === "rejected") {
        initialMsgs.push(
          {
            id: 2,
            sender: "hrd",
            text: "Terima kasih atas waktu dan ketertarikan Anda. Saat ini kualifikasi Anda belum sesuai dengan kebutuhan posisi ini. Kami harap dapat bekerja sama di kesempatan mendatang.",
            time: "10:20",
          }
        );
      }

      setChatMessages(initialMsgs);
    }
  }, [showChat, selectedApplication]);

  const getStatusBadge = (status?: string) => {
    const s = (status || "submitted").toLowerCase();
    switch (s) {
      case "submitted":
        return (
          <span className="px-2.5 py-1.5 text-[10px] font-bold rounded-full bg-[#e0542c]/10 text-[#e0542c] border border-[#e0542c]/20 uppercase tracking-wider shrink-0 leading-none inline-flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e0542c] mr-1.5 shrink-0" />
            Diajukan
          </span>
        );
      case "reviewed":
        return (
          <span className="px-2.5 py-1.5 text-[10px] font-bold rounded-full bg-[#5C8A90]/10 text-[#3b595d] border border-[#5C8A90]/20 uppercase tracking-wider shrink-0 leading-none inline-flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5C8A90] mr-1.5 shrink-0" />
            Ditinjau
          </span>
        );
      case "interview":
        return (
          <span className="px-2.5 py-1.5 text-[10px] font-bold rounded-full bg-[#F2B233]/12 text-[#916715] border border-[#F2B233]/20 uppercase tracking-wider shrink-0 leading-none inline-flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F2B233] mr-1.5 shrink-0" />
            Wawancara
          </span>
        );
      case "accepted":
      case "approved":
        return (
          <span className="px-2.5 py-1.5 text-[10px] font-bold rounded-full bg-[#7FA46D]/10 text-[#516b46] border border-[#7FA46D]/20 uppercase tracking-wider shrink-0 leading-none inline-flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7FA46D] mr-1.5 shrink-0" />
            Diterima
          </span>
        );
      case "rejected":
        return (
          <span className="px-2.5 py-1.5 text-[10px] font-bold rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20 uppercase tracking-wider shrink-0 leading-none inline-flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5 shrink-0" />
            Ditolak
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1.5 text-[10px] font-bold rounded-full bg-zinc-100 text-zinc-650 border border-zinc-200 uppercase tracking-wider shrink-0 leading-none inline-flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 mr-1.5 shrink-0" />
            {s}
          </span>
        );
    }
  };

  const getJobTypeLabel = (type?: string) => {
    if (!type) return "Full-time";
    switch (type) {
      case "paruh_waktu": return "Part-time";
      case "purna_waktu": return "Full-time";
      case "remote": return "Remote";
      case "hybrid": return "Hybrid";
      case "pekerja_lepas": return "Freelance";
      default: return "Full-time";
    }
  };

  // Render Chat Overlay Page
  if (showChat && selectedApplication) {
    const app = selectedApplication;
    const companyName = app.loker?.company || "Perusahaan Mitra";
    const positionName = app.loker?.title || "Lowongan";

    const handleSendMessage = () => {
      if (!chatInput.trim()) return;

      const newMsg = {
        id: Date.now(),
        sender: "user",
        text: chatInput,
        time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      };

      setChatMessages((prev) => [...prev, newMsg]);
      setChatInput("");

      // Simulate HRD response
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: "hrd",
            text: "Terima kasih atas pesan Anda. Tim rekrutmen kami akan segera membalas pesan Anda kembali secepatnya.",
            time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }, 1500);
    };

    return (
      <div className="absolute inset-0 bg-[#F7F3EB] z-50 flex flex-col text-left">
        {/* Chat Header */}
        <div className="bg-[#1e2a4a] text-white flex items-center justify-between px-5 pt-4 pb-4 z-20 shadow-md relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: `url(${patternBg})`,
              backgroundSize: "150px 150px"
            }}
          />
          <div className="flex items-center gap-3 relative z-10 w-full">
            <button
              onClick={() => setShowChat(false)}
              className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-white"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center font-black text-xs text-white border border-white/20 select-none">
                {companyName.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col text-left leading-none space-y-1">
                <span className="text-xs font-black tracking-tight text-white">{companyName}</span>
                <span className="text-[10px] text-emerald-400 font-bold">HRD • Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Body messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#f3efe4]/85 scrollbar-none pb-20">
          <div className="text-center my-2">
            <span className="bg-zinc-200/60 border border-zinc-200/20 text-zinc-550 text-[9px] font-bold px-2 py-0.5 rounded-md leading-none uppercase tracking-wide">
              Posisi: {positionName}
            </span>
          </div>

          {chatMessages.map((msg) => {
            const isMe = msg.sender === "user";
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-1.5`}
              >
                {!isMe && (
                  <div className="w-6.5 h-6.5 bg-[#1e2a4a] text-white rounded-full flex items-center justify-center text-[9px] font-extrabold shrink-0 select-none">
                    {companyName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className={`max-w-[75%] rounded-[20px] px-3.5 py-2 shadow-xs ${
                  isMe
                    ? "bg-[#e0542c] text-white rounded-tr-xs"
                    : "bg-white text-zinc-800 rounded-tl-xs border border-slate-200/40"
                }`}>
                  <p className="text-xs font-semibold leading-relaxed break-words">{msg.text}</p>
                  <span className={`block text-[8px] mt-1 text-right ${isMe ? "text-white/70" : "text-zinc-400"} font-bold`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-white border-t border-zinc-200/50 flex gap-2 items-center z-30">
          <input
            type="text"
            placeholder="Tulis pesan..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendMessage();
            }}
            className="flex-1 px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-full text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#e0542c]/20 text-zinc-800"
          />
          <button
            onClick={handleSendMessage}
            className="w-9.5 h-9.5 bg-[#e0542c] hover:bg-[#c23f1b] text-white rounded-full flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer shrink-0 border border-orange-500/10"
          >
            <svg
              className="w-4.5 h-4.5 fill-current ml-0.5"
              viewBox="0 0 24 24"
            >
              <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // Render Detail Application Overlay
  if (selectedApplication && !showChat) {
    const app = selectedApplication;
    const lokerDetail = selectedApplicationLoker;
    const activeLoker = lokerDetail || app.loker;

    const statusVal = (app.status || "submitted").toLowerCase();
    let currentStep = 1; // 1: Diajukan, 2: Ditinjau, 3: Wawancara, 4: Keputusan
    if (statusVal === "reviewed") currentStep = 2;
    else if (statusVal === "interview") currentStep = 3;
    else if (statusVal === "accepted" || statusVal === "approved" || statusVal === "rejected") currentStep = 4;

    const steps = [
      {
        label: "Lamaran Diajukan",
        desc: "Lamaran Anda telah sukses dikirim ke sistem rekrutmen perusahaan.",
        time: app.created_at
          ? new Date(app.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "—"
      },
      {
        label: "Berkas Ditinjau",
        desc: "Tim HRD sedang memverifikasi kualifikasi, CV, dan portofolio Anda.",
        time: currentStep >= 2 ? "Proses" : ""
      },
      {
        label: "Wawancara Kerja",
        desc: "Undangan wawancara online/tatap muka akan dikirim via pesan chat.",
        time: currentStep >= 3 ? "Proses" : ""
      },
      {
        label: statusVal === "rejected" ? "Lamaran Ditolak" : statusVal === "accepted" || statusVal === "approved" ? "Lamaran Diterima" : "Keputusan Akhir",
        desc: statusVal === "rejected"
          ? "Terima kasih atas partisipasi Anda. Saat ini kualifikasi Anda belum sesuai."
          : statusVal === "accepted" || statusVal === "approved"
          ? "Selamat! Anda dinyatakan lulus seleksi dan diterima bergabung."
          : "Hasil seleksi akhir akan diumumkan setelah seluruh tahapan selesai.",
        time: currentStep === 4 ? "Selesai" : ""
      }
    ];

    return (
      <div className="space-y-4 pb-24 text-left relative min-h-[500px]">
        {/* Flat Sticky Navy Header matching standard layouts */}
        <div className="bg-[#1e2a4a] text-white flex items-center justify-between px-5 pt-4 pb-4 sticky -top-6 z-20 shadow-md -mx-5 -mt-6 relative overflow-hidden">
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
                onClick={() => setSelectedApplication(null)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-white"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <span className="text-sm font-bold tracking-tight">Detail Lamaran</span>
            </div>
          </div>
        </div>

        {/* Progress Tracker Card */}
        <div className="bg-white border border-slate-200/50 rounded-2xl p-5 shadow-xs">
          <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 mb-5">Status Rekrutmen</h4>

          {/* Vertical Stepper Timeline */}
          <div className="space-y-6 relative pl-10 text-left">
            {/* Connecting Vertical Line */}
            <div className="absolute left-[13px] top-3.5 bottom-3.5 w-[2px] bg-zinc-200" />
            
            {/* Filled Vertical Line */}
            <div
              className={`absolute left-[13px] top-3.5 w-[2px] transition-all duration-500 ${
                statusVal === "rejected" ? "bg-rose-500" : "bg-emerald-500"
              }`}
              style={{
                height: `${((currentStep - 1) / (steps.length - 1)) * 100}%`
              }}
            />

            {steps.map((step, idx) => {
              const stepNum = idx + 1;
              const isCompleted = stepNum < currentStep;
              const isActive = stepNum === currentStep;
              
              let circleColor = "bg-zinc-100 border-zinc-200 text-zinc-400";
              let textColor = "text-zinc-400";
              let descColor = "text-zinc-400 font-medium";

              if (isCompleted) {
                circleColor = "bg-emerald-500 border-emerald-500 text-white shadow-sm";
                textColor = "text-zinc-800 font-bold";
                descColor = "text-zinc-550 font-semibold";
              } else if (isActive) {
                if (stepNum === 4 && statusVal === "rejected") {
                  circleColor = "bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-500/20";
                  textColor = "text-rose-600 font-extrabold";
                  descColor = "text-rose-500 font-semibold";
                } else if (stepNum === 4 && (statusVal === "accepted" || statusVal === "approved")) {
                  circleColor = "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20";
                  textColor = "text-emerald-600 font-extrabold";
                  descColor = "text-emerald-500 font-semibold";
                } else {
                  circleColor = "bg-[#e0542c] border-[#e0542c] text-white shadow-md shadow-orange-500/20";
                  textColor = "text-[#e0542c] font-extrabold";
                  descColor = "text-zinc-650 font-semibold";
                }
              }

              // Determine icon for the step
              let stepIcon = <FileText className="w-3.5 h-3.5" />;
              if (stepNum === 2) {
                stepIcon = <Search className="w-3.5 h-3.5" />;
              } else if (stepNum === 3) {
                stepIcon = <Calendar className="w-3.5 h-3.5" />;
              } else if (stepNum === 4) {
                if (statusVal === "rejected") {
                  stepIcon = <XCircle className="w-3.5 h-3.5" />;
                } else if (statusVal === "accepted" || statusVal === "approved") {
                  stepIcon = <CheckCircle2 className="w-3.5 h-3.5" />;
                } else {
                  stepIcon = <Trophy className="w-3.5 h-3.5" />;
                }
              }

              return (
                <div key={idx} className="flex gap-4 items-start relative z-10">
                  {/* Step Indicator Circle */}
                  <div className={`w-[28px] h-[28px] rounded-full flex items-center justify-center border transition-all duration-300 absolute left-0 ${circleColor} shrink-0`}>
                    {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : stepIcon}
                  </div>
                  
                  {/* Step Text Info */}
                  <div className="flex-1 space-y-0.5 min-h-[28px]">
                    <div className="flex justify-between items-center">
                      <span className={`text-xs ${textColor}`}>
                        {step.label}
                      </span>
                      {step.time && (
                        <span className={`text-[8.5px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                          isCompleted
                            ? "bg-emerald-50 text-emerald-600"
                            : isActive && statusVal === "rejected"
                            ? "bg-rose-50 text-rose-600"
                            : isActive
                            ? "bg-orange-50 text-[#e0542c]"
                            : "bg-zinc-100 text-zinc-500"
                        }`}>
                          {step.time}
                        </span>
                      )}
                    </div>
                    <p className={`text-[10px] leading-relaxed ${descColor}`}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Job Details Card */}
        {loadingAppDetail ? (
          <div className="bg-white border border-slate-200/50 rounded-2xl p-5 shadow-xs space-y-4 animate-pulse">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 bg-slate-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4.5 bg-slate-200 rounded w-2/3" />
                <div className="h-3 bg-slate-100 rounded w-1/3" />
              </div>
            </div>
            <div className="h-20 bg-slate-100 rounded w-full" />
          </div>
        ) : activeLoker ? (
          <div className="bg-white border border-slate-200/50 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 bg-gradient-to-tr from-[#1e2a4a]/10 to-[#1e2a4a]/5 border border-zinc-200/50 rounded-full flex items-center justify-center font-black text-md text-[#1e2a4a] shadow-xs shrink-0 select-none">
                {(activeLoker.company || "P").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="text-md font-bold text-zinc-900 tracking-tight leading-tight">
                  {activeLoker.position || activeLoker.title || "Lowongan Kerja"}
                </h3>
                <p className="text-xs text-zinc-550 font-semibold mt-1">
                  {activeLoker.company || "Perusahaan Mitra"} <span className="mx-1.5">•</span> {activeLoker.location || "Indonesia"}
                </p>
              </div>
            </div>

            {/* Pill Badges Row */}
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[10px] font-bold px-2.5 py-1.5 bg-[#7FA46D]/10 text-[#516b46] border border-[#7FA46D]/20 rounded-full leading-none">
                {getJobTypeLabel(activeLoker.job_type || activeLoker.jobType)}
              </span>
              <span className="text-[10px] font-bold px-2.5 py-1.5 bg-[#5C8A90]/10 text-[#3b595d] border border-[#5C8A90]/20 rounded-full leading-none">
                {activeLoker.workplace || "On-site"}
              </span>
              <span className="text-[10px] font-bold px-2.5 py-1.5 bg-[#F2B233]/12 text-[#916715] border border-[#F2B233]/20 rounded-full leading-none">
                {activeLoker.salary || "Negosiasi"}
              </span>
            </div>

            <div className="border-t border-zinc-100 pt-4 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-zinc-800 mb-1.5">Deskripsi Pekerjaan</h4>
                <p className="text-xs text-zinc-650 leading-relaxed font-semibold whitespace-pre-line">
                  {activeLoker.description || "Deskripsi pekerjaan tidak tersedia."}
                </p>
              </div>

              {app.note && (
                <div className="bg-zinc-50 border border-zinc-200/30 rounded-xl p-3">
                  <span className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-wider block leading-none mb-1.5">Catatan Anda</span>
                  <p className="text-[11px] text-zinc-700 font-semibold leading-relaxed">
                    "{app.note}"
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/50 rounded-2xl p-5 shadow-xs text-center text-zinc-450">
            Gagal mengambil detail pekerjaan.
          </div>
        )}

        {/* Floating Chat Button */}
        <button
          onClick={() => setShowChat(true)}
          className="fixed bottom-24 right-6 w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer z-40 border border-emerald-500/20"
        >
          <div className="relative">
            <MessageSquare className="w-6 h-6 fill-current" />
            <span className="absolute -top-2 -right-2 bg-rose-500 text-[8px] font-black text-white px-1.5 py-0.5 rounded-full leading-none">
              1
            </span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sub Tabs Toggle Switch */}
      <div className="flex bg-[#e2dcd0]/50 p-1 rounded-2xl border border-zinc-200/40 shadow-inner">
        <button
          onClick={() => setSubTab("search")}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            subTab === "search"
              ? "bg-[#e0542c] text-white shadow-sm"
              : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          Cari Lowongan
        </button>
        <button
          onClick={() => setSubTab("history")}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            subTab === "history"
              ? "bg-[#e0542c] text-white shadow-sm"
              : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          Riwayat Lamaran
        </button>
      </div>

      {subTab === "search" ? (
        <PakanLokerList
          jobs={filteredJobs}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          loadMore={loadMore}

          // Filter Props
          isFilterOpen={isFilterOpen}
          openFilters={openFilters}
          onCloseFilters={() => setIsFilterOpen(false)}
          applyFilters={applyFilters}
          resetFilters={resetFilters}
          tempFilteredCount={tempFilteredCount}
          tempJobTypes={tempJobTypes}
          toggleTempJobType={toggleTempJobType}
          tempWorkplaces={tempWorkplaces}
          toggleTempWorkplace={toggleTempWorkplace}
          tempCategories={tempCategories}
          toggleTempCategory={toggleTempCategory}
          tempProvinces={tempProvinces}
          toggleTempProvince={toggleTempProvince}
          tempCities={tempCities}
          toggleTempCity={toggleTempCity}
          tempMinSalary={tempMinSalary}
          setTempMinSalary={setTempMinSalary}
        />
      ) : (
        <div className="space-y-3 pb-8 text-left">
          {loadingHistory ? (
            <div className="flex flex-col gap-3 animate-pulse">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-white border border-slate-200/50 rounded-2xl p-4 shadow-xs space-y-4 text-left"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1 mr-4">
                      <div className="h-4 bg-zinc-200 rounded w-3/4" />
                      <div className="h-3.5 bg-zinc-150 rounded w-1/2" />
                    </div>
                    <div className="h-5 bg-zinc-200 rounded-full w-14" />
                  </div>
                  <div className="flex items-center gap-4 pt-2 border-t border-zinc-50">
                    <div className="h-3.5 bg-zinc-150 rounded w-20" />
                    <div className="h-3.5 bg-zinc-150 rounded w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : appliedJobs.length > 0 ? (
            <div className="flex flex-col gap-3">
              {appliedJobs.map((app) => {
                const statusVal = (app.status || "submitted").toLowerCase();
                let borderLeftColor = "border-l-[#e0542c]/75";
                let cardBg = "bg-white hover:bg-slate-50/40";

                if (statusVal === "reviewed") {
                  borderLeftColor = "border-l-[#5C8A90]/75";
                } else if (statusVal === "interview") {
                  borderLeftColor = "border-l-[#F2B233]/75";
                  cardBg = "bg-[#F2B233]/2 hover:bg-[#F2B233]/4";
                } else if (statusVal === "accepted" || statusVal === "approved") {
                  borderLeftColor = "border-l-[#7FA46D]/75";
                  cardBg = "bg-gradient-to-tr from-white to-[#7FA46D]/3";
                } else if (statusVal === "rejected") {
                  borderLeftColor = "border-l-rose-500/75";
                  cardBg = "bg-linear-to-tr from-white to-rose-500/3";
                }

                const companyInitial = (app.loker?.company || "P").charAt(0).toUpperCase();

                return (
                  <div
                    key={app.id}
                    onClick={async () => {
                      setSelectedApplication(app);
                      setShowChat(false);
                      try {
                        setLoadingAppDetail(true);
                        const detail = await fetchLokerDetail(app.loker?.id || app.loker_id);
                        setSelectedApplicationLoker(detail);
                      } catch (err) {
                        console.warn("Failed to fetch full loker detail, using basic data from list", err);
                        setSelectedApplicationLoker(app.loker || null);
                      } finally {
                        setLoadingAppDetail(false);
                      }
                    }}
                    className={`${cardBg} border-y border-r border-slate-200/50 border-l-4 ${borderLeftColor} rounded-2xl p-4 shadow-xs relative flex flex-col justify-between space-y-3.5 hover:shadow-sm transition-all duration-300 cursor-pointer`}
                  >
                    {/* Top info and status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3 items-center min-w-0">
                        {/* Company Logo Badge */}
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#1e2a4a]/10 to-[#1e2a4a]/5 flex items-center justify-center font-black text-xs text-[#1e2a4a] border border-zinc-200/40 shadow-xs shrink-0 select-none">
                          {companyInitial}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-zinc-900 leading-snug truncate">
                            {app.loker?.title || "Posisi Pekerjaan"}
                          </h4>
                          <p className="text-[11px] font-semibold text-zinc-450 mt-0.5 leading-none truncate">
                            {app.loker?.company || "Perusahaan Mitra"} <span className="mx-1">•</span> {app.loker?.location || "Indonesia"}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(app.status)}
                    </div>

                  {/* Mid info row (job type and date) */}
                  <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-550 pt-2 border-t border-zinc-50 leading-none">
                    <span className="inline-flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                      {getJobTypeLabel(app.loker?.job_type)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      {app.created_at
                        ? new Date(app.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </span>
                  </div>

                  {/* Note block (if user entered a note) */}
                  {app.note && (
                    <div className="bg-zinc-50 border border-zinc-150/40 rounded-xl p-2.5 flex items-start gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-zinc-400 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-wider block leading-none mb-1">Catatan Anda</span>
                        <p className="text-[10px] text-zinc-650 font-semibold leading-relaxed break-words">
                          "{app.note}"
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-zinc-100/60 p-6 text-center space-y-2 shadow-xs">
              <CheckCircle2 className="w-8 h-8 text-zinc-350" />
              <div className="space-y-0.5">
                <span className="text-xs text-zinc-800 font-extrabold block">Belum Ada Lamaran</span>
                <span className="text-[10px] text-zinc-400 font-bold block">Lowongan yang Anda lamar akan muncul di sini.</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function TunasPage({ user }: TunasPageProps) {
  const { navigate } = useRouter();
  const { clockInTime, clockOutTime, isCheckedIn, dayName, dateString, profileData } = useTunas();
  const [activeView, setActiveView] = useState<"dashboard" | "pakan">("dashboard");
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);
  const [showChat, setShowChat] = useState(false);

  // Greeting helper based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 19) return "Selamat Sore";
    return "Selamat Malam";
  };

  // Helper to determine if button should wiggle (1 hour before shift start or if user is late)
  const shouldWiggleButton = () => {
    if (isCheckedIn) return false;

    const shiftMasuk = profileData?.shift?.jam_masuk; // e.g. "23:00"
    if (!shiftMasuk) return true;

    try {
      const [shiftHour, shiftMinute] = shiftMasuk.split(":").map(Number);
      const now = new Date();

      // Determine the exact shift date if backend provides the date
      let shiftDate: Date;
      if (profileData?.today_schedule?.tanggal) {
        shiftDate = new Date(`${profileData.today_schedule.tanggal}T${shiftMasuk}`);
      } else {
        shiftDate = new Date(now);
        shiftDate.setHours(shiftHour, shiftMinute, 0, 0);
      }

      const diffMs = shiftDate.getTime() - now.getTime();

      // Wiggle if current time is within 1 hour (3,600,000 ms) before the shift start time,
      // or if they are late (shift started but within a reasonable 8 hour shift duration window)
      return diffMs <= 3600000 && diffMs > -28800000;
    } catch (err) {
      console.error("Error parsing shift time for wiggle:", err);
      return true;
    }
  };

  if (activeView === "pakan") {
    const hideHeader = selectedApplication !== null;

    return (
      <div className="space-y-4">
        {/* Flat Sticky Navy Header matching detail page layout */}
        {!hideHeader && (
          <div className="bg-[#1e2a4a] text-white flex items-center justify-between px-5 pt-4 pb-4 sticky -top-6 z-20 shadow-md -mx-5 -mt-6 relative overflow-hidden">
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
                  onClick={() => setActiveView("dashboard")}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <span className="text-sm font-bold tracking-tight">Pakan</span>
              </div>
              <button
                onClick={() => toast.success("Pencarian disimpan!")}
                className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              >
                <Bookmark className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        )}

        {/* Loker Content Page */}
        <div className={hideHeader ? "" : "pt-2"}>
          <PakanLokerSubPage
            selectedApplication={selectedApplication}
            setSelectedApplication={setSelectedApplication}
            showChat={showChat}
            setShowChat={setShowChat}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Banner Card - matching the design in Sangkar */}
      <div className="-mt-6 -mx-5 relative mb-4">
        <div className="w-full bg-[#1e2a4a] text-white rounded-t-none rounded-b-[40px] shadow-lg shadow-[#1e2a4a]/20 border-b border-white/10 flex flex-col p-6 pt-7 pb-6 relative overflow-hidden">
          {/* Background Pattern */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: `url(${patternBg})`,
              backgroundSize: "150px 150px",
              backgroundRepeat: "repeat"
            }}
          />

          {/* Content */}
          <div className="flex justify-between items-start z-10 relative mb-4">
            {/* Left: Logo & User Info */}
            <div className="flex items-center gap-3.5">
              <img src={logoWhite} alt="Logo" className="w-12 h-12 object-contain" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold tracking-wider uppercase text-white/90 leading-none">
                  {getGreeting()}
                </span>
                <span className="text-lg font-bold tracking-tight text-white mt-1.5 leading-none">
                  {user.name}
                </span>
              </div>
            </div>

            {/* Right: Pakan Button */}
            <button
              type="button"
              onClick={() => setActiveView("pakan")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-tr from-[#e0542c] to-[#ff7e5a] text-white text-[9px] font-bold uppercase tracking-wider shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer hover:shadow-[#e0542c]/20"
            >
              <Briefcase className="w-3.5 h-3.5 text-white/95" />
              <span>Pakan</span>
            </button>
          </div>

          {/* Divider line */}
          <div className="h-[1px] bg-white/15 w-full my-1.5 z-10 relative" />

          {/* Bottom row: Date & Location */}
          <div className="flex justify-between items-center z-10 relative mt-2 text-xs">
            <span className="font-semibold text-white/80">
              {dayName}, {dateString}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-white text-[9px] font-bold tracking-wide uppercase max-w-[180px] shadow-xs">
              <Briefcase className="w-3 h-3 text-white/90 shrink-0" />
              <span className="truncate">{profileData?.tenant?.name || "POT Tenant"}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Horizontal Clock In / Out & Action Card (Style matching user screenshot, no border) */}
      <div className={`w-full bg-[#1e2a4a] text-white p-5 rounded-3xl shadow-lg transition-all duration-300 flex flex-col ${shouldWiggleButton()
        ? "border border-[#e0542c]/45 shadow-[0_0_15px_rgba(224,84,44,0.18)]"
        : "border border-white/5 shadow-[#1e2a4a]/20"
        }`}>
        {/* Top: Job & Office Location */}
        <div className="flex justify-between items-center w-full border-b border-white/10 pb-3 mb-3 text-left">
          <div className="flex flex-col">
            <span className="text-[7.5px] uppercase text-white/50 font-bold tracking-wider leading-none">Divisi Kerja</span>
            <span className="text-xs font-bold text-white mt-1 leading-none">
              {profileData?.jabatan?.nama_jabatan || "Operasional"}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[7.5px] uppercase text-white/50 font-bold tracking-wider leading-none">Lokasi Kantor</span>
            <span className="text-xs font-bold text-[#fee279] mt-1 leading-none uppercase">
              {profileData?.lokasi?.nama_lokasi || "Kantor Pusat"}
            </span>
          </div>
        </div>

        {/* Bottom: Clock Times & Action Button */}
        <div className="flex items-center justify-between gap-4 w-full">
          {/* Times Info (Left Column) */}
          <div className="flex items-center gap-8 text-left">
            {/* Clock In */}
            <div className="flex flex-col">
              <span className="text-[10px] text-white/60 font-bold uppercase tracking-wider leading-none">Masuk</span>
              <span className="text-sm font-bold text-white mt-2 leading-none">
                {clockInTime === "--:--" ? "--" : clockInTime}
              </span>
            </div>

            {/* Clock Out */}
            <div className="flex flex-col">
              <span className="text-[10px] text-white/60 font-bold uppercase tracking-wider leading-none">Pulang</span>
              <span className="text-sm font-bold text-white mt-2 leading-none">
                {clockOutTime === "--:--" ? "--" : clockOutTime}
              </span>
            </div>
          </div>

          {/* Capsule Button (Right Column) */}
          <button
            type="button"
            onClick={() => {
              navigate("MobileAbsensi");
            }}
            className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all active:scale-95 cursor-pointer shadow-xs flex items-center gap-1.5 ${isCheckedIn && clockOutTime !== "--:--"
              ? "bg-white/10 text-white/40 cursor-not-allowed"
              : "bg-gradient-to-tr from-[#e0542c] to-[#ff7e5a] text-white shadow-[#e0542c]/15"
              } ${shouldWiggleButton() ? "animate-wiggle" : ""}`}
            disabled={isCheckedIn && clockOutTime !== "--:--"}
          >
            {!(isCheckedIn && clockOutTime !== "--:--") && <Clock className="w-3.5 h-3.5 text-white/90" />}
            {!isCheckedIn
              ? "Masuk"
              : clockOutTime === "--:--"
                ? "Keluar"
                : "Selesai"}
          </button>
        </div>
      </div>

      {/* Attendance card */}
      <AbsensiCard
        izinCuti={profileData?.izin_cuti}
        izinLainnya={profileData?.izin_lainnya}
        izinTelat={profileData?.izin_telat}
        izinPulangCepat={profileData?.izin_pulang_cepat}
        izinSakit={profileData?.izin_sakit}
        totalLemburBulanIni={profileData?.total_lembur_bulan_ini}
      />

      {/* Services Grid Menu */}
      <MenuGrid />

      <AttendanceHistory />
    </div>
  );
}
