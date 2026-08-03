import { useState, useEffect, useRef } from "react";
import {
  Video,
  Volume2,
  Image as ImageIcon,
  HelpCircle,
  Plus,
  Edit2,
  Trash2,
  X,
  Layers,
  CheckCircle2,
  Play,
  Clock,
  ChevronDown,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmationModal } from "@/shared/components/ui/confirmation-modal";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { THEME_COLORS } from "@/shared/constants/colors";
import { ChunkModal } from "./chunk-modal";
import {
  fetchLessonById,
  createChunk,
  updateChunk,
  deleteChunk,
  type Lesson,
  type LessonChunk,
  type CreateChunkPayload
} from "../api/course";

interface LessonChunkBuilderProps {
  lessonId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export function LessonChunkBuilder({ lessonId, isOpen, onClose }: LessonChunkBuilderProps) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(false);

  // Chunk Modal state
  const [chunkModal, setChunkModal] = useState<{
    isOpen: boolean;
    mode: "add" | "edit";
    initialData?: LessonChunk;
  }>({
    isOpen: false,
    mode: "add",
  });
  const [submittingChunk, setSubmittingChunk] = useState(false);

  // Delete Chunk Confirmation state
  const [confirmDeleteChunk, setConfirmDeleteChunk] = useState<{
    isOpen: boolean;
    id: number | null;
  }>({
    isOpen: false,
    id: null,
  });
  const [deletingChunk, setDeletingChunk] = useState(false);
  const [expandedChunks, setExpandedChunks] = useState<Record<number, boolean>>({});
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const fetchActiveRef = useRef<number | null>(null);

  const toggleChunk = (chunkId: number) => {
    setExpandedChunks((prev) => ({
      ...prev,
      [chunkId]: !prev[chunkId],
    }));
  };

  const loadLessonDetail = async () => {
    if (!lessonId) return;
    if (fetchActiveRef.current === lessonId) return;
    fetchActiveRef.current = lessonId;
    try {
      setLoading(true);
      const data = await fetchLessonById(lessonId);
      setLesson(data);
    } catch (err: any) {
      toast.error(err.message || "Gagal memuat detail materi lesson");
    } finally {
      setLoading(false);
      fetchActiveRef.current = null;
    }
  };

  useEffect(() => {
    if (isOpen && lessonId) {
      loadLessonDetail();
    } else {
      setLesson(null);
    }
  }, [isOpen, lessonId]);

  if (!isOpen || !lessonId) return null;

  const handleOpenAddChunk = () => {
    setChunkModal({
      isOpen: true,
      mode: "add",
    });
  };

  const handleOpenEditChunk = (chunk: LessonChunk) => {
    setChunkModal({
      isOpen: true,
      mode: "edit",
      initialData: chunk,
    });
  };

  const handleSubmitChunk = async (payload: CreateChunkPayload) => {
    try {
      setSubmittingChunk(true);
      if (chunkModal.mode === "edit" && chunkModal.initialData?.id) {
        await updateChunk(chunkModal.initialData.id, payload);
        toast.success("Konten berhasil diperbarui");
      } else if (lessonId) {
        await createChunk(lessonId, payload);
        toast.success("Konten baru berhasil ditambahkan");
      }

      setChunkModal({ isOpen: false, mode: "add" });
      loadLessonDetail();
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan konten");
    } finally {
      setSubmittingChunk(false);
    }
  };

  const handleDeleteChunkClick = (chunkId: number) => {
    setConfirmDeleteChunk({
      isOpen: true,
      id: chunkId,
    });
  };

  const handleConfirmDeleteChunk = async () => {
    if (!confirmDeleteChunk.id) return;
    try {
      setDeletingChunk(true);
      await deleteChunk(confirmDeleteChunk.id);
      toast.success("Konten berhasil dihapus");
      setConfirmDeleteChunk({ isOpen: false, id: null });
      loadLessonDetail();
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus konten");
    } finally {
      setDeletingChunk(false);
    }
  };

  const getChunkTypeBadge = (type: string) => {
    switch (type) {
      case "video":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#e0542c]/10 text-[#e0542c] font-bold text-[9.5px] border border-[#e0542c]/20">
            <Video size={11} /> Video
          </span>
        );
      case "audio":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-bold text-[9.5px] border border-zinc-200">
            <Volume2 size={11} /> Audio
          </span>
        );
      case "image_step":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#7FA46D]/10 text-[#516b46] font-bold text-[9.5px] border border-[#7FA46D]/20">
            <ImageIcon size={11} /> Gambar
          </span>
        );
      case "quiz":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F2B233]/12 text-[#916715] font-bold text-[9.5px] border border-[#F2B233]/20">
            <HelpCircle size={11} /> Kuis
          </span>
        );
      case "text":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[9.5px] border border-blue-200">
            <FileText size={11} /> Teks
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-end">
      <style>{`
        .rich-text-preview ul {
          list-style-type: disc !important;
          padding-left: 1.25rem !important;
          margin-top: 0.25rem !important;
          margin-bottom: 0.25rem !important;
        }
        .rich-text-preview ol {
          list-style-type: decimal !important;
          padding-left: 1.25rem !important;
          margin-top: 0.25rem !important;
          margin-bottom: 0.25rem !important;
        }
      `}</style>
      <div className={`bg-white h-full shadow-2xl flex flex-col transition-all duration-300 rounded-l-2xl animate-in slide-in-from-right duration-200 ${
        chunkModal.isOpen
          ? isSidebarCollapsed
            ? "w-full max-w-4xl"
            : "w-full max-w-6xl"
          : "w-full max-w-lg"
      }`}>
        <div className="flex-1 flex overflow-hidden min-h-0">
          <div className={`flex flex-col h-full border-r border-gray-100 transition-all duration-300 shrink-0 overflow-hidden ${
            chunkModal.isOpen
              ? isSidebarCollapsed
                ? "w-0 border-r-0"
                : "w-[340px]"
              : "w-full"
          }`}>
        {/* Drawer Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] font-bold text-[#e0542c] uppercase tracking-wider block">
              Penyusun Konten Materi
            </span>
            <h3 className="text-base font-bold text-gray-900 line-clamp-1">
              {lesson?.title || "Memuat Materi..."}
            </h3>
          </div>

          <button
            type="button"
            onClick={() => {
              if (chunkModal.isOpen) {
                setIsSidebarCollapsed(true);
              } else {
                onClose();
              }
            }}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            title={chunkModal.isOpen ? "Sembunyikan Daftar Konten" : "Tutup"}
          >
            <X size={18} />
          </button>
        </div>

            {/* Drawer Body Content */}
            <div className={`flex-1 overflow-y-auto space-y-4 min-h-0 ${chunkModal.isOpen ? "p-4" : "p-6"}`}>
              {/* Header Action Row */}
              <div className="flex flex-col gap-2 pb-2 border-b border-gray-100/80 shrink-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Daftar Bagian Konten
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[10px] font-bold text-gray-600">
                    {(lesson?.chunks || []).length} Konten
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddChunk}
                  style={{ backgroundColor: THEME_COLORS.hex.primary }}
                  className="w-full py-2 rounded-lg text-white text-xs font-bold shadow-sm hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Tambah Bagian Konten</span>
                </button>
              </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-5 h-5 rounded-md" />
                      <Skeleton className="w-16 h-5 rounded-full" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="w-6 h-6 rounded-lg" />
                      <Skeleton className="w-6 h-6 rounded-lg" />
                    </div>
                  </div>
                  <div className="bg-gray-50/50 rounded-md p-3 border border-gray-100/80 flex gap-3 items-center">
                    <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3.5 w-3/4 rounded-md" />
                      <Skeleton className="h-3 w-1/3 rounded-md" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (lesson?.chunks || []).length === 0 ? (
            <div className="py-14 text-center flex flex-col items-center justify-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <Layers size={36} className="text-gray-300 mb-2" />
              <p className="text-xs font-bold text-gray-700">Belum Ada Konten</p>
              <p className="text-[11px] text-gray-500 max-w-xs mt-0.5 mb-4">
                Materi ini masih kosong. Klik tombol "+ Tambah Bagian Konten" untuk menambahkan video, audio, gambar, atau kuis.
              </p>
              <button
                type="button"
                onClick={handleOpenAddChunk}
                className="px-4 py-2.5 rounded-md text-xs font-bold text-[#e0542c] bg-[#e0542c]/10 hover:bg-[#e0542c]/20 transition-all cursor-pointer"
              >
                + Tambah Bagian Konten Pertama
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {(lesson?.chunks || []).map((chunk, idx) => {
                const detail =
                  chunk.detail ||
                  (chunk as any).video ||
                  (chunk as any).audio ||
                  (chunk as any).image_step ||
                  (chunk as any).imageStep ||
                  (chunk as any).quiz ||
                  (chunk as any).text ||
                  {};

                const videoUrlStr = detail.video_url || (chunk as any).video_url || "";
                const audioUrlStr = detail.audio_url || (chunk as any).audio_url || "";
                const imageUrlStr = detail.image_url || (chunk as any).image_url || "";
                const textTitleStr = detail.title || (chunk as any).title || "";
                const textContentStr = detail.description || (chunk as any).description || "";
                const durationSec = detail.duration_second || (chunk as any).duration_second || 0;
                const transcriptStr = detail.transcript || (chunk as any).transcript || "";
                const captionsStr = detail.captions || (chunk as any).captions || "";
                const questionStr = detail.question || (chunk as any).question || "";
                const optionsArr = detail.options || (chunk as any).options || [];
                const ytId = extractYouTubeId(videoUrlStr);

                const isExpanded = expandedChunks[chunk.id] === true;

                return (
                  <div
                    key={chunk.id}
                    className={`bg-white rounded-xl border border-gray-205 shadow-xs hover:border-gray-300 transition-all space-y-2.5 ${
                      chunkModal.isOpen ? "p-3" : "p-4"
                    }`}
                  >
                    <div
                      onClick={() => toggleChunk(chunk.id)}
                      className="flex items-center justify-between cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-md bg-gray-100 text-[10px] font-bold text-gray-600 flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        {getChunkTypeBadge(chunk.chunk_type)}

                        {/* Inline content preview snippet */}
                        {chunk.chunk_type === "image_step" && captionsStr && (
                          <span className={`text-[10px] text-gray-400 truncate ml-0.5 font-medium ${
                            chunkModal.isOpen ? "max-w-[70px]" : "max-w-[140px]"
                          }`}>
                            {captionsStr.replace(/<[^>]*>/g, "")}
                          </span>
                        )}
                        {chunk.chunk_type === "video" && videoUrlStr && (
                          <span className={`text-[10px] text-gray-400 truncate ml-0.5 font-medium ${
                            chunkModal.isOpen ? "max-w-[70px]" : "max-w-[140px]"
                          }`}>
                            {videoUrlStr}
                          </span>
                        )}
                        {chunk.chunk_type === "quiz" && questionStr && (
                          <span className={`text-[10px] text-gray-400 truncate ml-0.5 font-medium ${
                            chunkModal.isOpen ? "max-w-[70px]" : "max-w-[140px]"
                          }`}>
                            {questionStr}
                          </span>
                        )}
                        {chunk.chunk_type === "text" && (textTitleStr || textContentStr) && (
                          <span className={`text-[10px] text-gray-400 truncate ml-0.5 font-medium ${
                            chunkModal.isOpen ? "max-w-[70px]" : "max-w-[140px]"
                          }`}>
                            {textTitleStr || textContentStr.replace(/<[^>]*>/g, "")}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditChunk(chunk)}
                          className="p-1 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Konten"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteChunkClick(chunk.id)}
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Konten"
                        >
                          <Trash2 size={14} />
                        </button>
                        <div className="w-px h-4 bg-gray-200 mx-1 shrink-0" />
                        <button
                          type="button"
                          onClick={() => toggleChunk(chunk.id)}
                          className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer flex items-center justify-center animate-none"
                          title={isExpanded ? "Sembunyikan Detail" : "Lihat Detail"}
                        >
                          <ChevronDown
                            size={16}
                            className={`transition-transform duration-200 ${
                              isExpanded ? "rotate-180 text-gray-700" : ""
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Chunk Type Content Preview (Visible when expanded) */}
                    {isExpanded && (
                      <div className="space-y-3 pt-3 border-t border-gray-100 animate-in fade-in duration-200">
                        {chunk.chunk_type === "video" && (
                          <div className="bg-zinc-50 border border-gray-200 rounded-xl p-3 flex gap-3.5 items-center">
                            {ytId ? (
                              <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-gray-200 shadow-xs">
                                <img
                                  src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                                  alt="YT"
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                  <Play size={14} className="fill-white text-white" />
                                </div>
                              </div>
                            ) : (
                              <div className="w-14 h-14 rounded-lg bg-blue-50 border border-blue-150 text-blue-500 flex items-center justify-center shrink-0">
                                <Video size={20} />
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block mb-0.5">
                                Konten Video
                              </span>
                              <p className="font-bold text-gray-800 text-xs truncate" title={videoUrlStr}>
                                {videoUrlStr ? "Tautan Video YouTube" : "Tautan Video Kosong"}
                              </p>
                              {durationSec > 0 && (
                                <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5 font-medium">
                                  <Clock size={10} />
                                  <span>
                                    {Math.floor(durationSec / 60)}m {durationSec % 60}d ({durationSec} detik)
                                  </span>
                                </p>
                              )}
                              {transcriptStr && (
                                <p className="text-[10px] text-gray-400 italic mt-0.5 truncate" title={transcriptStr}>
                                  Transkrip: "{transcriptStr}"
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {chunk.chunk_type === "audio" && (
                          <div className="bg-zinc-50 border border-gray-200 rounded-xl p-3 flex gap-3.5 items-center">
                            <div className="w-12 h-12 rounded-lg bg-purple-50 border border-purple-150 text-purple-600 flex items-center justify-center shrink-0">
                              <Volume2 size={20} />
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">
                                Konten Audio
                              </span>
                              {audioUrlStr ? (
                                <audio
                                  src={audioUrlStr}
                                  controls
                                  className="w-full h-7 mt-1 scale-95 origin-left"
                                />
                              ) : (
                                <p className="font-bold text-gray-800 text-xs">URL Audio Kosong</p>
                              )}
                              {durationSec > 0 && (
                                <p className="text-[10px] text-gray-500 flex items-center gap-1 font-medium">
                                  <Clock size={10} />
                                  <span>{durationSec} detik</span>
                                </p>
                              )}
                              {transcriptStr && (
                                <p className="text-[10px] text-gray-400 italic mt-0.5 truncate" title={transcriptStr}>
                                  Transkrip: "{transcriptStr}"
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {chunk.chunk_type === "image_step" && (
                          <div className="bg-zinc-50 border border-gray-200 rounded-xl p-3 flex gap-3.5 items-center">
                            {imageUrlStr ? (
                              <div className="w-20 h-14 rounded-lg overflow-hidden bg-gray-100 border border-gray-250 shrink-0 shadow-xs">
                                <img
                                  src={imageUrlStr}
                                  alt="Step"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = "none";
                                  }}
                                  />
                              </div>
                            ) : (
                              <div className="w-20 h-14 rounded-lg bg-emerald-50 border border-emerald-150 text-emerald-500 flex items-center justify-center shrink-0">
                                <ImageIcon size={20} />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-0.5">
                                Penjelasan Langkah Gambar
                              </span>
                              <div
                                className="font-semibold text-gray-700 text-xs rich-text-preview"
                                dangerouslySetInnerHTML={{ __html: captionsStr || "Tanpa Penjelasan" }}
                                />
                            </div>
                          </div>
                        )}

                        {chunk.chunk_type === "text" && (
                          <div className="bg-zinc-50 border border-gray-200 rounded-xl p-3 space-y-2">
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block mb-0.5">
                              Konten Teks
                            </span>
                            {textTitleStr && (
                              <h5 className="font-bold text-gray-800 text-xs">
                                {textTitleStr}
                              </h5>
                            )}
                            <div
                              className="font-semibold text-gray-700 text-xs rich-text-preview"
                              dangerouslySetInnerHTML={{ __html: textContentStr || "Tanpa Konten Teks" }}
                              />
                          </div>
                        )}

                        {chunk.chunk_type === "quiz" && (
                          <div className="bg-zinc-50 border border-gray-200 rounded-xl p-4 text-xs space-y-3">
                            <div className="flex items-start gap-2">
                              <span className="shrink-0 flex items-center justify-center w-5 h-5 rounded bg-amber-50 border border-amber-150 text-amber-600 mt-0.5">
                                <HelpCircle size={12} />
                              </span>
                              <div className="flex-1">
                                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block mb-0.5">
                                  Pertanyaan Kuis
                                </span>
                                <div
                                  className="font-bold text-gray-800 leading-snug rich-text-preview"
                                  dangerouslySetInnerHTML={{ __html: questionStr || "Pertanyaan Kuis" }}
                                />
                              </div>
                            </div>

                            {Array.isArray(optionsArr) && optionsArr.length > 0 && (
                              <div className="space-y-1.5 pt-3 border-t border-gray-100">
                                {optionsArr.map((opt: any, oIdx: number) => (
                                  <div key={oIdx} className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg border border-gray-100 bg-white">
                                    <div className="flex items-center gap-2">
                                      <span className={`w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center border ${
                                        opt.is_true
                                          ? "bg-emerald-100 text-emerald-800 border-emerald-250"
                                          : "bg-gray-150 text-gray-600 border-gray-200"
                                      }`}>
                                        {String.fromCharCode(65 + oIdx)}
                                      </span>
                                      <span className={opt.is_true ? "font-semibold text-gray-800" : "text-gray-600"}>
                                        {opt.options}
                                      </span>
                                    </div>
                                    {opt.is_true && (
                                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                        <CheckCircle2 size={10} /> Kunci Jawaban
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          </div>
        </div>

        {/* Panel Kanan: Inline Editor Form */}
        {chunkModal.isOpen && (
          <div className="flex-1 h-full overflow-hidden bg-gray-50/30 animate-in fade-in duration-300">
            <ChunkModal
              isOpen={chunkModal.isOpen}
              mode={chunkModal.mode}
              initialData={chunkModal.initialData}
              onSubmit={handleSubmitChunk}
              onClose={() => {
                setChunkModal({ ...chunkModal, isOpen: false });
                setIsSidebarCollapsed(false);
              }}
              loading={submittingChunk}
              inline={true}
              isSidebarCollapsed={isSidebarCollapsed}
              onToggleSidebar={() => setIsSidebarCollapsed(false)}
            />
          </div>
        )}
      </div>
    </div>

      {/* Delete Chunk Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmDeleteChunk.isOpen}
        onClose={() => setConfirmDeleteChunk({ isOpen: false, id: null })}
        onConfirm={handleConfirmDeleteChunk}
        title="Hapus Bagian Konten"
        message="Apakah Anda yakin ingin menghapus bagian konten ini dari materi?"
        variant="danger"
        loading={deletingChunk}
      />
    </div>
  );
}
