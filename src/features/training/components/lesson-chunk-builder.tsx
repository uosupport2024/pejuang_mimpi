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
  Clock
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
  const fetchActiveRef = useRef<number | null>(null);

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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#e0542c]/10 text-[#e0542c] font-bold text-[10px] border border-[#e0542c]/20">
            <Video size={12} /> Video
          </span>
        );
      case "audio":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#5C8A90]/10 text-[#3b595d] font-bold text-[10px] border border-[#5C8A90]/20">
            <Volume2 size={12} /> Audio
          </span>
        );
      case "image_step":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#7FA46D]/10 text-[#516b46] font-bold text-[10px] border border-[#7FA46D]/20">
            <ImageIcon size={12} /> Langkah Gambar
          </span>
        );
      case "quiz":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#F2B233]/12 text-[#916715] font-bold text-[10px] border border-[#F2B233]/20">
            <HelpCircle size={12} /> Kuis
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-end">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
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
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5">
          {/* Header Action Row */}
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-gray-700">
              Daftar Bagian Konten ({(lesson?.chunks || []).length})
            </h4>

            <button
              type="button"
              onClick={handleOpenAddChunk}
              style={{ backgroundColor: THEME_COLORS.hex.primary }}
              className="px-4 py-2.5 rounded-md text-white text-xs font-bold shadow-md shadow-[#e0542c]/20 hover:opacity-90 transition-all cursor-pointer flex items-center gap-1.5"
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
                  {};

                const videoUrlStr = detail.video_url || (chunk as any).video_url || "";
                const audioUrlStr = detail.audio_url || (chunk as any).audio_url || "";
                const imageUrlStr = detail.image_url || (chunk as any).image_url || "";
                const durationSec = detail.duration_second || (chunk as any).duration_second || 0;
                const transcriptStr = detail.transcript || (chunk as any).transcript || "";
                const captionsStr = detail.captions || (chunk as any).captions || "";
                const questionStr = detail.question || (chunk as any).question || "";
                const optionsArr = detail.options || (chunk as any).options || [];
                const ytId = extractYouTubeId(videoUrlStr);

                return (
                  <div
                    key={chunk.id}
                    className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs hover:border-gray-300 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-gray-100 text-[10px] font-bold text-gray-600 flex items-center justify-center">
                          {idx + 1}
                        </span>
                        {getChunkTypeBadge(chunk.chunk_type)}
                      </div>

                      <div className="flex items-center gap-1">
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
                      </div>
                    </div>

                    {/* Chunk Type Content Preview */}
                    {chunk.chunk_type === "video" && (
                      <div className="bg-gray-50/80 rounded-md p-3 border border-gray-200/80 text-xs space-y-2">
                        <div className="flex gap-3 items-center">
                          {ytId ? (
                            <div className="relative w-24 aspect-video rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-gray-200">
                              <img
                                src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                                alt="YT"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                <Play size={12} className="fill-white text-white" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                              <Video size={20} />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 truncate" title={videoUrlStr}>
                              {videoUrlStr || "URL Video Kosong"}
                            </p>
                            {durationSec > 0 && (
                              <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                                <Clock size={10} />
                                <span>
                                  {Math.floor(durationSec / 60)} menit {durationSec % 60} detik ({durationSec}s)
                                </span>
                              </p>
                            )}
                          </div>
                        </div>

                        {transcriptStr && (
                          <div className="pt-1 border-t border-gray-200 text-[11px] text-gray-600 italic line-clamp-2">
                            "{transcriptStr}"
                          </div>
                        )}
                      </div>
                    )}

                    {chunk.chunk_type === "audio" && (
                      <div className="bg-purple-50/50 border border-purple-100 rounded-md p-3 text-xs space-y-2">
                        <div className="space-y-2">
                          {audioUrlStr ? (
                            <audio
                              src={audioUrlStr}
                              controls
                              className="w-full h-8 rounded-md bg-purple-100/50 border border-purple-200 focus:outline-none"
                            />
                          ) : (
                            <p className="font-bold text-purple-900">URL Audio Kosong</p>
                          )}
                          {durationSec > 0 && (
                            <p className="text-[10px] font-bold text-purple-700 flex items-center gap-1">
                              <Clock size={10} />
                              <span>Durasi: {durationSec} detik</span>
                            </p>
                          )}
                        </div>
                        {transcriptStr && (
                          <p className="text-[11px] text-purple-800 italic line-clamp-2">"{transcriptStr}"</p>
                        )}
                      </div>
                    )}

                    {chunk.chunk_type === "image_step" && (
                      <div className="bg-emerald-50/50 border border-emerald-100 rounded-md p-3 text-xs flex gap-3 items-start">
                        {imageUrlStr && (
                          <img
                            src={imageUrlStr}
                            alt="Step"
                            className="w-16 h-12 object-cover rounded-lg border border-emerald-200 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-emerald-900 line-clamp-2">
                            {captionsStr || "Tanpa Penjelasan"}
                          </p>
                          <p className="text-[10px] text-emerald-700 truncate mt-0.5">{imageUrlStr}</p>
                        </div>
                      </div>
                    )}

                    {chunk.chunk_type === "quiz" && (
                      <div className="bg-amber-50/50 border border-amber-100 rounded-md p-3 text-xs space-y-2">
                        <p className="font-bold text-amber-900">Pertanyaan: {questionStr}</p>
                        {Array.isArray(optionsArr) && optionsArr.length > 0 && (
                          <div className="space-y-1 pt-1 border-t border-amber-200/60">
                            {optionsArr.map((opt: any, oIdx: number) => (
                              <div key={oIdx} className="flex items-center justify-between text-[11px] text-amber-900">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-800 text-[9px] font-bold flex items-center justify-center">
                                    {String.fromCharCode(65 + oIdx)}
                                  </span>
                                  <span>{opt.options}</span>
                                </div>
                                {opt.is_true && (
                                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                    <CheckCircle2 size={10} /> Benar
                                  </span>
                                )}
                              </div>
                            ))}
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

      {/* Chunk Modal Add / Edit */}
      <ChunkModal
        isOpen={chunkModal.isOpen}
        mode={chunkModal.mode}
        initialData={chunkModal.initialData}
        onSubmit={handleSubmitChunk}
        onClose={() => setChunkModal({ ...chunkModal, isOpen: false })}
        loading={submittingChunk}
      />

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
