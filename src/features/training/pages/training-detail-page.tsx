import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Clock,
  CheckCircle2,
  Volume2,
  Video,
  Image as ImageIcon,
  HelpCircle,
  Award,
  Sparkles,
  ChevronDown
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/shared/router/router";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { fetchCourseById, fetchLessonById, type Course, type Lesson, type LessonChunk } from "../api/course";
import { THEME_COLORS } from "@/shared/constants/colors";

// Helper to extract YouTube video ID
function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export function TrainingDetailPage() {
  const { navigate } = useRouter();
  const location = useLocation();

  const [courseId] = useState<number | undefined>(() => location.state?.courseId);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);

  const toggleLesson = (lessonId: number) => {
    setActiveLessonId((prev) => (prev === lessonId ? null : lessonId));
  };

  const handleTocClick = (lessonId: number) => {
    // Expand the lesson (close others)
    setActiveLessonId(lessonId);

    // Scroll smoothly to the target card
    setTimeout(() => {
      const element = document.getElementById(`lesson-card-${lessonId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const loadCourseDetail = async () => {
    if (!courseId) {
      toast.error("ID Pelatihan tidak valid");
      navigate("Training");
      return;
    }
    try {
      setLoading(true);
      const data = await fetchCourseById(courseId);

      // Fetch full lesson details (with chunks) for each lesson
      if (data.lessons && data.lessons.length > 0) {
        const fullLessons = await Promise.all(
          data.lessons.map(async (l) => {
            try {
              return await fetchLessonById(l.id);
            } catch (e) {
              return l;
            }
          })
        );
        data.lessons = fullLessons;
      }

      setCourse(data);
    } catch (err: any) {
      toast.error(err.message || "Gagal memuat detail pelatihan");
      navigate("Training");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourseDetail();
  }, [courseId]);

  if (loading) {
    return (
      <div className="w-full space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="h-3 bg-gray-150 w-full" />
          <div className="p-6 space-y-4">
            <Skeleton className="h-8 w-3/4 rounded-md" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-5/6 rounded-md" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="w-full text-center py-12">
        <p className="text-gray-500">Pelatihan tidak ditemukan.</p>
      </div>
    );
  }

  // Sort lessons by order_index
  const sortedLessons = [...(course.lessons || [])].sort(
    (a, b) => (a.order_index || 0) - (b.order_index || 0)
  );

  return (
    <div className="w-full animate-fade-in">
      <style>{`
        .rich-text-content ul {
          list-style-type: disc !important;
          padding-left: 1.25rem !important;
          margin-top: 0.5rem !important;
          margin-bottom: 0.5rem !important;
        }
        .rich-text-content ol {
          list-style-type: decimal !important;
          padding-left: 1.25rem !important;
          margin-top: 0.5rem !important;
          margin-bottom: 0.5rem !important;
        }
        .rich-text-content p {
          margin-top: 0.25rem;
          margin-bottom: 0.25rem;
        }
        .rich-text-content h3 {
          font-size: 1.125rem;
          font-weight: 600 !important;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .rich-text-content strong {
          font-weight: 600 !important;
        }
      `}</style>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Course Info Card (col-4) */}
        <div className="lg:col-span-4 lg:sticky lg:top-0 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden relative">
            {course.thumbnail_url && (
              <div className="h-48 w-full overflow-hidden border-b border-gray-100">
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <h1 className="text-xl font-extrabold text-gray-900 leading-tight">
                  {course.title}
                </h1>
                <p className="text-xs text-gray-500 whitespace-pre-wrap leading-relaxed">
                  {course.description || "Belum ada deskripsi untuk modul pelatihan ini."}
                </p>
              </div>

              {/* Redesigned Metadata Section: Cleaner format, no colorful pill badges */}
              <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider mb-1">
                    Tingkat Kesulitan
                  </span>
                  <span className="text-gray-800 font-semibold text-xs">
                    {course.difficulty === "intermediate"
                      ? "Menengah"
                      : course.difficulty === "advanced"
                        ? "Mahir"
                        : "Dasar"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider mb-1">
                    Status Modul
                  </span>
                  <span className="text-gray-800 font-semibold text-xs flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${course.is_published ? "bg-emerald-500" : "bg-red-500"}`} />
                    {course.is_published ? "Publik" : "Draft"}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider mb-1">
                    Total Materi
                  </span>
                  <span className="text-gray-800 font-semibold text-xs flex items-center gap-1.5">
                    <Award size={14} style={{ color: THEME_COLORS.hex.primary }} />
                    <span>{sortedLessons.length} Materi Pelatihan</span>
                  </span>
                </div>
                {course.tags && course.tags.length > 0 && (
                  <div className="col-span-2">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider mb-1.5">
                      Tag
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {course.tags.map((tag) => (
                        <span
                          key={tag}
                          style={{ color: THEME_COLORS.hex.primary, backgroundColor: `${THEME_COLORS.hex.primary}1A` }}
                          className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Daftar Isi (Table of Contents) Card */}
          {sortedLessons.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-gray-100">
                Daftar Isi
              </h3>
              <nav className="space-y-2 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin">
                {sortedLessons.map((lesson, idx) => {
                  const isCurrentExpanded = activeLessonId === lesson.id;
                  const chunks = lesson.chunks || [];
                  return (
                    <div key={lesson.id} className="space-y-1">
                      <button
                        onClick={() => handleTocClick(lesson.id)}
                        style={isCurrentExpanded ? { backgroundColor: THEME_COLORS.hex.primary } : undefined}
                        className={`w-full text-left text-xs py-2 px-3 rounded-lg transition-all flex items-center gap-2.5 hover:bg-zinc-50 group/toc cursor-pointer ${isCurrentExpanded
                          ? "text-white font-semibold"
                          : "text-gray-650"
                          }`}
                      >
                        <span
                          style={isCurrentExpanded ? { color: THEME_COLORS.hex.primary } : undefined}
                          className={`w-4 h-4 rounded-md text-[10px] flex items-center justify-center shrink-0 ${isCurrentExpanded
                            ? "bg-white"
                            : "bg-gray-100 text-gray-500 group-hover/toc:bg-gray-200"
                            }`}
                        >
                          {idx + 1}
                        </span>
                        <span className="line-clamp-2">{lesson.title}</span>
                      </button>

                      {/* Nested Chunks List */}
                      {isCurrentExpanded && chunks.length > 0 && (
                        <div className="pl-6 pr-2 py-1 space-y-1">
                          {chunks.map((chunk, cIdx) => (
                            <div
                              key={chunk.id}
                              className="text-[11px] text-gray-500 hover:text-gray-800 flex items-center gap-1.5 py-0.5 line-clamp-1 transition-colors"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                              <span>Bagian {cIdx + 1}: {chunk.detail?.title || chunk.chunk_type}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        {/* Right Area: Lessons & Interactive Content Showcase */}
        <div className="lg:col-span-8 space-y-6">
          {sortedLessons.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
              <div
                style={{ backgroundColor: `${THEME_COLORS.hex.primary}1A`, color: THEME_COLORS.hex.primary }}
                className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
              >
                <Sparkles size={20} />
              </div>
              <h3 className="text-sm font-bold text-gray-800 mb-1">Belum Ada Materi</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Materi pelatihan ini belum ditambahkan oleh instruktur.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedLessons.map((lesson, idx) => (
                <LessonAccordionItem
                  key={lesson.id}
                  lesson={lesson}
                  index={idx}
                  isExpanded={activeLessonId === lesson.id}
                  onToggle={() => toggleLesson(lesson.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-component for individual Lesson accordion with chunk preview
function LessonAccordionItem({
  lesson,
  index,
  isExpanded,
  onToggle,
}: {
  lesson: Lesson;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const chunks = lesson.chunks || [];

  return (
    <div
      id={`lesson-card-${lesson.id}`}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow scroll-mt-20"
    >
      {/* Lesson Header Accent */}
      <div
        onClick={onToggle}
        className="px-6 py-4 bg-zinc-50/70 border-b border-gray-200 flex items-center justify-between gap-4 cursor-pointer select-none hover:bg-zinc-100/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span
            style={{ color: THEME_COLORS.hex.primary }}
            className="w-8 h-8 rounded-lg bg-orange-100/85 font-bold text-xs flex items-center justify-center border border-orange-200/40"
          >
            {index + 1}
          </span>
          <h3 className="text-sm font-bold text-gray-800 line-clamp-1">{lesson.title}</h3>
        </div>

        <div className="flex items-center gap-3">
          <span
            style={{ color: THEME_COLORS.hex.primary, backgroundColor: `${THEME_COLORS.hex.primary}1A`, borderColor: `${THEME_COLORS.hex.primary}33` }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold border"
          >
            +{lesson.lesson_points || 0} Poin
          </span>
          <ChevronDown
            size={18}
            className={`text-gray-400 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 space-y-6 divide-y divide-gray-100">
          {chunks.length === 0 ? (
            <p className="text-xs text-gray-400 italic text-center py-4">Belum ada bagian konten dalam materi ini.</p>
          ) : (
            chunks.map((chunk, cIdx) => (
              <div key={chunk.id} className="pt-6 first:pt-0 space-y-3">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  <span>Bagian {cIdx + 1}</span>
                  <span>•</span>
                  <span style={{ color: THEME_COLORS.hex.primary }}>
                    {chunk.chunk_type === "image_step"
                      ? "langkah gambar"
                      : chunk.chunk_type === "text"
                        ? "teks biasa"
                        : chunk.chunk_type}
                  </span>
                </div>

                {/* Chunk Content Renderer */}
                <ChunkPreviewRenderer chunk={chunk} />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function ChunkPreviewRenderer({ chunk }: { chunk: LessonChunk }) {
  const detail = chunk.detail;
  if (!detail) {
    return <p className="text-xs text-gray-400 italic">Data konten tidak tersedia</p>;
  }

  switch (chunk.chunk_type) {
    case "video": {
      const videoUrl = detail.video_url || "";
      const ytId = extractYouTubeId(videoUrl);
      return (
        <div className="space-y-3">
          {ytId ? (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-gray-200 shadow-xs">
              <iframe
                src={`https://www.youtube.com/embed/${ytId}?rel=0`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Video size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{videoUrl || "Video Link"}</p>
                {detail.duration_second && (
                  <p className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1">
                    <Clock size={10} /> Durasi: {detail.duration_second} detik
                  </p>
                )}
              </div>
            </div>
          )}
          {detail.transcript && (
            <div className="bg-zinc-50 rounded-xl p-3 border border-gray-100 text-xs text-gray-600 leading-relaxed italic">
              "{detail.transcript}"
            </div>
          )}
        </div>
      );
    }

    case "audio": {
      const audioUrl = detail.audio_url || "";
      return (
        <div className="space-y-3">
          <div className="bg-purple-50/40 rounded-xl p-4 border border-purple-100/60 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <Volume2 size={18} />
              </div>
              <span className="text-xs font-bold text-purple-900">Audio Player</span>
            </div>
            {audioUrl ? (
              <audio src={audioUrl} controls className="w-full h-8 mt-2" />
            ) : (
              <p className="text-xs text-purple-400 italic">URL audio kosong</p>
            )}
            {detail.duration_second && (
              <p className="text-[10px] text-purple-700 flex items-center gap-1 font-medium mt-1">
                <Clock size={10} /> Durasi: {detail.duration_second} detik
              </p>
            )}
          </div>
          {detail.transcript && (
            <div className="bg-zinc-50 rounded-xl p-3 border border-gray-100 text-xs text-gray-600 leading-relaxed italic">
              "{detail.transcript}"
            </div>
          )}
        </div>
      );
    }

    case "image_step": {
      return (
        <div className="space-y-3">
          <div className="bg-emerald-50/20 border border-emerald-100/60 rounded-xl p-4 space-y-3">
            {detail.image_url ? (
              <div className="rounded-lg overflow-hidden border border-emerald-100 max-h-96 w-full flex items-center justify-center bg-gray-50">
                <img
                  src={detail.image_url}
                  alt="Step"
                  className="max-h-96 object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
            ) : (
              <div className="bg-zinc-50 rounded-lg p-3 border border-gray-100 flex items-center gap-2 text-gray-400 italic">
                <ImageIcon size={18} />
                <span className="text-xs">Gambar tidak diset</span>
              </div>
            )}
            {detail.captions && (
              <div
                className="text-xs text-gray-750 leading-relaxed font-medium rich-text-content"
                dangerouslySetInnerHTML={{ __html: detail.captions }}
              />
            )}
          </div>
        </div>
      );
    }

    case "text": {
      return (
        <div className="space-y-3">
          <div className="bg-blue-50/20 border border-blue-100/60 rounded-xl p-4 space-y-3">
            {detail.title && (
              <h5 className="font-bold text-gray-800 text-sm">
                {detail.title}
              </h5>
            )}
            {detail.description && (
              <div
                className="text-xs text-gray-750 leading-relaxed font-medium rich-text-content"
                dangerouslySetInnerHTML={{ __html: detail.description }}
              />
            )}
          </div>
        </div>
      );
    }

    case "quiz": {
      const options = detail.options || [];
      return (
        <div className="bg-amber-50/20 border border-amber-100/60 rounded-xl p-4 space-y-3">
          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              <HelpCircle size={13} />
            </div>
            <div
              className="text-xs font-bold text-gray-850 leading-relaxed rich-text-content"
              dangerouslySetInnerHTML={{ __html: detail.question || "Pertanyaan Kuis" }}
            />
          </div>

          <div className="space-y-2 pl-7">
            {options.map((opt, oIdx) => (
              <div
                key={opt.id || oIdx}
                className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition-colors ${opt.is_true
                  ? "bg-emerald-50/80 border-emerald-200 text-emerald-800 font-semibold"
                  : "bg-white border-gray-200 text-gray-600"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center border ${opt.is_true
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : "bg-gray-100 text-gray-500 border-gray-300"
                      }`}
                  >
                    {String.fromCharCode(65 + oIdx)}
                  </span>
                  <span dangerouslySetInnerHTML={{ __html: opt.options }} />
                </div>

                {opt.is_true && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/50 px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-200/50">
                    <CheckCircle2 size={11} /> Jawaban Benar
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    default:
      return <p className="text-xs text-gray-400 italic">Konten tidak didukung</p>;
  }
}
