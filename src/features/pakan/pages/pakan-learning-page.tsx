import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  GraduationCap,
  Award,
  Video,
  Volume2,
  FileImage,
  HelpCircle,
  Loader2,
  Check,
  Play,
  Heart
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchCourseById,
  fetchLessonByIdBasic,
  fetchChunkById,
  markChunkSeen,
  answerQuiz,
  completeLesson,
  type Course as APICourse,
  type Lesson as APILesson,
  type LessonChunk as APILessonChunk
} from "@/features/training/api/course";
import patternBg from "@/assets/bg/pattern-background.png";

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export function PakanLearningPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const parts = location.pathname.split("/");
  const courseIdParam = parts[4] || null;
  const courseIdFromUrl = parts[4] ? Number(parts[4]) : null;
  const lessonIdFromUrl = parts[6] ? Number(parts[6]) : null;

  const [course, setCourse] = useState<APICourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingLesson, setLoadingLesson] = useState(false);

  // Player view states
  const [viewMode, setViewMode] = useState<"lessons" | "player">("lessons");
  const [activeLesson, setActiveLesson] = useState<APILesson | null>(null);
  const [activeChunkIndex, setActiveChunkIndex] = useState(0);

  // Quiz states
  const [selectedQuizOptionId, setSelectedQuizOptionId] = useState<number | null>(null);
  const [quizAnswerResult, setQuizAnswerResult] = useState<{ is_correct: boolean; correct_option_id: number } | null>(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const [videoKey, setVideoKey] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [audioLoading, setAudioLoading] = useState(true);
  const [activeChunk, setActiveChunk] = useState<APILessonChunk | null>(null);
  const [loadingChunk, setLoadingChunk] = useState(false);
  const [lives, setLives] = useState(3);
  const pageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Clear parent transforms to resolve iOS/Android WebView touch coordinate mapping issue inside iframe
    const timer = setTimeout(() => {
      if (pageRef.current && pageRef.current.parentElement) {
        pageRef.current.parentElement.style.transform = "none";
        pageRef.current.parentElement.style.webkitTransform = "none";
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [loading, loadingLesson, viewMode]);

  const loadCourseDetail = async () => {
    if (!courseIdParam || isNaN(Number(courseIdParam))) return;
    try {
      setLoading(true);
      const data = await fetchCourseById(Number(courseIdParam));
      setCourse(data);
    } catch (err: any) {
      toast.error(err.message || "Gagal memuat detail pelatihan");
      navigate("/mobile/pakan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourseDetail();
  }, [courseIdParam]);


  useEffect(() => {
    // If user refreshes on the player URL directly, redirect back to course detail page
    if (course === null && lessonIdFromUrl !== null && courseIdFromUrl !== null) {
      navigate(`/mobile/pakan/learn/${courseIdFromUrl}`);
    }
  }, [location.pathname, course]);

  useEffect(() => {
    if (!activeLesson || !activeLesson.chunks || activeLesson.chunks.length === 0) {
      setActiveChunk(null);
      return;
    }
    const chunkMeta = activeLesson.chunks[activeChunkIndex];
    if (!chunkMeta) {
      setActiveChunk(null);
      return;
    }

    let isSubscribed = true;
    const loadChunkDetail = async () => {
      try {
        setLoadingChunk(true);
        const detail = await fetchChunkById(chunkMeta.id);
        if (isSubscribed) {
          setActiveChunk(detail);

          // Auto mark chunk as seen if it's not a quiz
          if (detail.chunk_type !== "quiz") {
            markChunkSeen(detail.id).catch((err) =>
              console.warn("Failed to mark chunk seen automatically:", err)
            );
          }
        }
      } catch (err: any) {
        toast.error(err.message || "Gagal memuat detail bagian materi");
      } finally {
        if (isSubscribed) {
          setLoadingChunk(false);
        }
      }
    };

    loadChunkDetail();

    return () => {
      isSubscribed = false;
    };
  }, [activeLesson, activeChunkIndex]);

  const handleSelectLesson = async (lesson: APILesson) => {
    try {
      setLoadingLesson(true);
      setVideoError(false);
      const basicLesson = await fetchLessonByIdBasic(lesson.id);
      if (!basicLesson.chunks || basicLesson.chunks.length === 0) {
        toast.error("Materi ini belum memiliki bagian konten.");
        return;
      }
      setActiveLesson(basicLesson);
      setActiveChunkIndex(0);
      setViewMode("player");
      setSelectedQuizOptionId(null);
      setQuizAnswerResult(null);
      setImageLoading(true);
      setAudioLoading(true);
      setLives(3);

      // Update URL to dedicate lesson player sub-route
      navigate(`/mobile/pakan/learn/${courseIdParam}/lesson/${lesson.id}`);
    } catch (err: any) {
      toast.error(err.message || "Gagal memuat materi");
    } finally {
      setLoadingLesson(false);
    }
  };

  const handleNextChunk = async () => {
    if (!activeLesson || !activeLesson.chunks) return;

    const currentChunk = activeLesson.chunks[activeChunkIndex];
    if (currentChunk.chunk_type === "quiz" && quizAnswerResult === null) {
      toast.error("Silakan jawab kuis terlebih dahulu untuk melanjutkan.");
      return;
    }

    if (activeChunkIndex < activeLesson.chunks.length - 1) {
      const nextIdx = activeChunkIndex + 1;
      setActiveChunkIndex(nextIdx);
      setSelectedQuizOptionId(null);
      setQuizAnswerResult(null);
      setVideoError(false);
      setImageLoading(true);
      setAudioLoading(true);
    } else {
      // Completed last chunk of the lesson
      try {
        await completeLesson(activeLesson.id);
        setEarnedPoints(activeLesson.lesson_points || 10);
        setShowCongratulations(true);

        // Reload course to update local state progress bar
        const updatedCourse = await fetchCourseById(Number(courseIdParam));
        setCourse(updatedCourse);
      } catch (err: any) {
        toast.error(err.message || "Gagal menyelesaikan materi");
      }
    }
  };

  const handleQuizSubmit = async (quizId: number) => {
    if (!selectedQuizOptionId) return;
    try {
      setSubmittingQuiz(true);
      const res = await answerQuiz(quizId, selectedQuizOptionId);
      setQuizAnswerResult({
        is_correct: res.is_correct,
        correct_option_id: res.correct_option_id
      });
      if (res.is_correct) {
        toast.success("Jawaban Benar!");
      } else {
        toast.error("Jawaban Salah!");
        const nextLives = lives - 1;
        if (nextLives <= 0) {
          toast.error("Kesempatan habis! Mengulang materi dari awal.");
          setActiveChunkIndex(0);
          setLives(3);
          setSelectedQuizOptionId(null);
          setQuizAnswerResult(null);
        } else {
          setLives(nextLives);
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal mengirim jawaban");
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleCloseCongratulations = () => {
    setShowCongratulations(false);
    setViewMode("lessons");
    setActiveLesson(null);
    setLives(3);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-50 relative -mt-6 -mx-5 pb-20">
        <div className="bg-[#1e2a4a] text-white flex items-center gap-3 px-5 pt-4 pb-4 sticky -top-6 z-20 shadow-md relative overflow-hidden shrink-0">
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: `url(${patternBg})`,
              backgroundSize: "180px auto",
              backgroundRepeat: "repeat"
            }}
          />
          <button
            onClick={() => navigate("/mobile/pakan")}
            className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer relative z-10"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="text-base font-bold tracking-tight relative z-10">Materi Pembelajaran</span>
        </div>

        {/* Skeleton Body */}
        <div className="p-4 space-y-5 animate-pulse text-left">
          {/* Card Skeleton */}
          <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs space-y-3">
            <div className="h-3.5 bg-zinc-200 rounded-md w-full" />
            <div className="h-3.5 bg-zinc-200 rounded-md w-5/6" />
            <div className="h-[1px] bg-zinc-100 my-3" />
            <div className="flex justify-between items-center">
              <div className="h-3 bg-zinc-200 rounded-md w-16" />
              <div className="h-3 bg-zinc-200 rounded-md w-20" />
            </div>
            <div className="w-full bg-zinc-150 h-1.5 rounded-full mt-2" />
          </div>

          <div className="h-4 bg-zinc-200 rounded-md w-44 pl-1" />

          {/* Lesson List Items Skeletons */}
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-2xl border border-zinc-200/60 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3 w-3/4">
                  <div className="w-7 h-7 rounded-xl bg-zinc-200 shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 bg-zinc-200 rounded-md w-3/4" />
                    <div className="h-2.5 bg-zinc-200 rounded-md w-1/2" />
                  </div>
                </div>
                <div className="h-6 bg-zinc-200 rounded-md w-14 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (loadingLesson) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-50 relative -mt-6 -mx-5 pb-20">
        {/* Sticky Header */}
        <div className="bg-[#1e2a4a] text-white flex items-center justify-between px-5 pt-4 pb-4 sticky -top-6 z-20 shadow-md relative overflow-hidden shrink-0">
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: `url(${patternBg})`,
              backgroundSize: "180px auto",
              backgroundRepeat: "repeat"
            }}
          />
          <div className="flex items-center gap-3 relative z-10">
            <button
              onClick={() => setViewMode("lessons")}
              className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <span className="text-sm font-bold tracking-tight">Memuat...</span>
          </div>
        </div>

        {/* Player Skeleton */}
        <div className="p-4 flex-1 flex flex-col justify-between pb-20 animate-pulse text-left">
          <div className="space-y-4 flex-1">
            {/* Fake progress tracker */}
            <div className="flex gap-1">
              <div className="h-1 flex-1 rounded-full bg-zinc-200" />
              <div className="h-1 flex-1 rounded-full bg-zinc-200" />
              <div className="h-1 flex-1 rounded-full bg-zinc-200" />
            </div>

            {/* Content Title Skeleton */}
            <div className="flex items-center gap-1.5 pl-0.5">
              <div className="w-4 h-4 bg-zinc-200 rounded-full" />
              <div className="h-3.5 bg-zinc-200 rounded-md w-32" />
            </div>

            {/* Video / Content Box Skeleton */}
            <div className="bg-zinc-200 rounded-2xl aspect-video w-full shadow-xs" />

            {/* Transcript / Subtext Skeleton */}
            <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs space-y-2 mt-3">
              <div className="h-3 bg-zinc-200 rounded-md w-1/4" />
              <div className="h-3 bg-zinc-200 rounded-md w-full" />
              <div className="h-3 bg-zinc-200 rounded-md w-5/6" />
            </div>
          </div>

          {/* Footer Skeleton */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-zinc-150 flex items-center justify-between shrink-0 gap-3 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="h-8 bg-zinc-200 rounded-xl w-20" />
            <div className="h-8 bg-zinc-200 rounded-xl w-24" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-50 relative -mt-6 -mx-5 pb-20">
        <div className="bg-[#1e2a4a] text-white flex items-center gap-3 px-5 pt-4 pb-4 sticky -top-6 z-20 shadow-md relative overflow-hidden shrink-0">
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: `url(${patternBg})`,
              backgroundSize: "180px auto",
              backgroundRepeat: "repeat"
            }}
          />
          <button
            onClick={() => navigate("/mobile/pakan")}
            className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer relative z-10"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="text-base font-bold tracking-tight relative z-10">Materi Pembelajaran</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <span className="text-xs text-zinc-450 font-bold uppercase tracking-wider">Modul tidak ditemukan</span>
        </div>
      </div>
    );
  }

  return (
    <div ref={pageRef} className="flex flex-col min-h-screen bg-zinc-50 relative -mt-6 -mx-5 pb-20">
      {/* Flutter-like Top Sticky Header / Appbar */}
      <div className="bg-[#1e2a4a] text-white flex items-center justify-between px-5 pt-4 pb-4 sticky -top-6 z-20 shadow-md relative overflow-hidden shrink-0">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `url(${patternBg})`,
            backgroundSize: "180px auto",
            backgroundRepeat: "repeat"
          }}
        />

        <div className="flex items-center gap-3 relative z-10 max-w-[80%]">
          <button
            onClick={() => {
              if (viewMode === "player") {
                setViewMode("lessons");
                setActiveLesson(null);
                navigate(`/mobile/pakan/learn/${courseIdParam}`);
              } else {
                navigate("/mobile/pakan");
              }
            }}
            className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer flex items-center justify-center shrink-0"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="text-left min-w-0">
            <h3 className="text-sm font-bold tracking-tight truncate">
              {viewMode === "player" && activeLesson ? activeLesson.title : course.title}
            </h3>
            {viewMode === "player" && (
              <span className="text-[10px] text-white/60 font-bold uppercase tracking-wider block mt-0.5 truncate">
                {course.title}
              </span>
            )}
          </div>
        </div>

        {/* Exit / Hearts Area - applied to all player screens as requested */}
        {viewMode === "player" ? (
          <div className="flex items-center gap-1.5 relative z-10 bg-white/10 px-2.5 py-1.5 rounded-xl border border-white/15 backdrop-blur-xs">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                size={13}
                className={`transition-all duration-300 ${
                  i < lives
                    ? "text-red-500 fill-red-500 scale-100 animate-pulse"
                    : "text-white/20 fill-transparent scale-90"
                }`}
              />
            ))}
          </div>
        ) : (
          <button
            onClick={() => navigate("/mobile/pakan")}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-white/80 hover:text-white relative z-10 text-xs font-bold uppercase tracking-wider"
          >
            Keluar
          </button>
        )}
      </div>

      {/* Main Body Content */}
      <div className="p-4 flex-1 flex flex-col">
        {viewMode === "lessons" ? (
          /* Lessons List View */
          <div className="space-y-4 text-left">
            <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs">
              <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                {course.description || "Kelas pelatihan resmi Uo-space."}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3">
                <div className="flex items-center gap-1.5 text-zinc-800">
                  <GraduationCap size={16} className="text-[#e0542c]" />
                  <span className="text-xs font-bold">
                    {course.lessons?.length || 0} Materi
                  </span>
                </div>
                <span className="text-xs font-bold text-[#e0542c]">
                  Progres: {course.progress?.percentage_completed ?? course.user_progress?.percentage_completed ?? 0}%
                </span>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-zinc-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
                <div
                  className="bg-[#e0542c] h-full rounded-full transition-all duration-300"
                  style={{ width: `${course.progress?.percentage_completed ?? course.user_progress?.percentage_completed ?? 0}%` }}
                />
              </div>
            </div>

            <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider pl-1 pt-1">
              Daftar Materi Pembelajaran
            </h3>

            <div className="space-y-3">
              {course.lessons?.map((lesson, idx) => {
                const isCompleted = lesson.seen_status === "completed";
                const isInProgress = lesson.seen_status === "in_progress";

                // Border and left accent styling based on completion status
                const borderClass = isCompleted
                  ? "border-l-4 border-l-green-500 border-zinc-200/60 bg-green-50/5"
                  : isInProgress
                  ? "border-l-4 border-l-[#e0542c] border-zinc-200/60 bg-amber-500/5"
                  : "border-l-4 border-l-zinc-300 border-zinc-200/60";

                return (
                  <div
                    key={lesson.id}
                    onClick={() => handleSelectLesson(lesson)}
                    className={`bg-white p-4 rounded-2xl border ${borderClass} hover:border-zinc-300 transition-all flex items-center justify-between cursor-pointer group shadow-xs hover:shadow-sm active:scale-[0.99] duration-200`}
                  >
                    <div className="flex items-center gap-3">
                      {isCompleted ? (
                        <div className="w-8 h-8 rounded-xl bg-green-100 text-green-600 flex items-center justify-center shrink-0 border border-green-200 shadow-inner">
                          <Check size={14} className="stroke-[3]" />
                        </div>
                      ) : isInProgress ? (
                        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200 animate-pulse">
                          <Play size={12} className="fill-current stroke-[2]" />
                        </div>
                      ) : (
                        <span className="w-8 h-8 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-center text-xs font-extrabold text-zinc-500 shrink-0">
                          {idx + 1}
                        </span>
                      )}
                      
                      <div className="text-left">
                        <h4 className="text-xs font-bold text-zinc-900 leading-snug group-hover:text-[#e0542c] transition-colors">
                          {lesson.title}
                        </h4>
                        <p className="text-[10px] text-zinc-400 font-medium mt-0.5">
                          {lesson.chunks_count || 0} bagian konten &bull; {lesson.lesson_points || 10} poin
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center shrink-0">
                      {isCompleted ? (
                        <span className="px-3 py-1.5 text-[8.5px] font-black uppercase rounded-xl bg-green-100 text-green-700 border border-green-200 tracking-wider shadow-inner">
                          Selesai
                        </span>
                      ) : isInProgress ? (
                        <span className="px-3 py-1.5 text-[8.5px] font-black uppercase rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-white shadow-sm border border-amber-500/20 tracking-wider">
                          Lanjut
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 text-[8.5px] font-black uppercase rounded-xl bg-gradient-to-tr from-[#e0542c] to-[#ff7e5a] text-white shadow-sm border border-white/10 tracking-wider">
                          Mulai
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Interactive Chunk Player Mode */
          activeLesson &&
          activeLesson.chunks &&
          activeLesson.chunks.length > 0 && (
            <div className="flex-1 flex flex-col justify-between pb-20">
              <div className="space-y-4 flex-1">
                {/* Segmented Progress Tracker */}
                <div className="flex gap-1">
                  {activeLesson.chunks.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= activeChunkIndex ? "bg-[#e0542c]" : "bg-zinc-200"
                        }`}
                    />
                  ))}
                </div>

                {/* Chunk Content View */}
                {loadingChunk || !activeChunk ? (
                  <div className="space-y-4 animate-pulse text-left mt-2">
                    <div className="flex items-center gap-1.5 pl-0.5">
                      <div className="w-4 h-4 bg-zinc-200 rounded-full" />
                      <div className="h-3 bg-zinc-200 rounded-md w-32" />
                    </div>
                    <div className="bg-zinc-200 rounded-2xl aspect-video w-full shadow-xs animate-pulse" />
                    <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs space-y-2 mt-3">
                      <div className="h-3 bg-zinc-200 rounded-md w-1/4" />
                      <div className="h-3 bg-zinc-200 rounded-md w-full" />
                    </div>
                  </div>
                ) : (
                  (() => {
                    const chunk = activeChunk;
                    if (chunk.chunk_type === "video") {
                      const ytId = chunk.detail?.video_url ? extractYouTubeId(chunk.detail.video_url) : null;
                      return (
                        <div className="space-y-3 text-left">
                          <div className="flex items-center justify-between text-zinc-550 font-bold uppercase text-[9.5px] tracking-wider pl-0.5">
                            <div className="flex items-center gap-1.5">
                              <Video size={14} className="text-[#e0542c]" />
                              <span>Video Pembelajaran</span>
                            </div>
                            <button
                              onClick={() => {
                                setVideoKey((p) => p + 1);
                                setVideoError(false);
                                toast.success("Memuat ulang video...");
                              }}
                              className="text-[8.5px] text-[#e0542c] hover:underline cursor-pointer font-bold uppercase tracking-wider bg-[#e0542c]/5 px-2 py-0.5 rounded-md border border-[#e0542c]/10"
                            >
                              Muat Ulang
                            </button>
                          </div>
                          <div className="bg-black rounded-2xl overflow-hidden aspect-video shadow-md border border-zinc-200 relative pointer-events-auto">
                            {ytId ? (
                              <iframe
                                key={`${ytId}-${videoKey}`}
                                src={`https://www.youtube.com/embed/${ytId}?autoplay=1&controls=1&playsinline=1`}
                                title="YouTube Video"
                                className="w-full h-full border-none pointer-events-auto"
                                style={{ pointerEvents: "auto" }}
                                allow="autoplay; encrypted-media; picture-in-picture"
                                allowFullScreen
                              />
                            ) : chunk.detail?.video_url ? (
                              videoError ? (
                                <div className="h-full flex flex-col items-center justify-center text-zinc-400 text-xs p-4 text-center space-y-1">
                                  <span className="font-bold text-red-500">Video tidak dapat dimuat</span>
                                  <span className="text-[10px] text-zinc-500">Tautan video tidak valid atau tidak didukung</span>
                                </div>
                              ) : (
                                <video
                                  key={`${chunk.detail.video_url}-${videoKey}`}
                                  src={chunk.detail.video_url}
                                  controls
                                  autoPlay
                                  playsInline
                                  className="w-full h-full object-cover pointer-events-auto"
                                  style={{ pointerEvents: "auto" }}
                                  onError={() => setVideoError(true)}
                                />
                              )
                            ) : (
                              <div className="h-full flex items-center justify-center text-zinc-400 text-xs">
                                Format URL Video tidak tersedia
                              </div>
                            )}
                          </div>
                          {chunk.detail?.transcript && (
                            <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs mt-3">
                              <h5 className="text-[10px] font-bold text-zinc-700 uppercase tracking-wide">
                                Transkrip Video
                              </h5>
                              <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                                {chunk.detail.transcript}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    }

                    if (chunk.chunk_type === "audio") {
                      return (
                        <div className="space-y-4 text-left">
                          <div className="flex items-center gap-1.5 text-zinc-550 font-bold uppercase text-[9.5px] tracking-wider pl-0.5">
                            <Volume2 size={14} className="text-[#e0542c]" />
                            <span>Audio Pembelajaran</span>
                          </div>
                          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs flex flex-col items-center justify-center py-7 text-center relative min-h-[160px]">
                            {audioLoading ? (
                              <div className="w-full flex flex-col items-center justify-center space-y-3 animate-pulse py-2">
                                <div className="w-12 h-12 rounded-full bg-zinc-200" />
                                <div className="h-3 bg-zinc-200 rounded-md w-2/3" />
                                <div className="h-8 bg-zinc-200 rounded-xl w-full mt-3" />
                              </div>
                            ) : (
                              <>
                                <div className="w-14 h-14 rounded-full bg-[#5C8A90]/10 text-[#5C8A90] flex items-center justify-center mb-4">
                                  <Volume2 size={26} />
                                </div>
                                <h5 className="text-xs font-bold text-zinc-800">
                                  Tekan tombol play untuk memutar audio
                                </h5>
                              </>
                            )}
                            <div className={`w-full mt-5 ${audioLoading ? "hidden" : "block"}`}>
                              <audio
                                src={chunk.detail?.audio_url}
                                controls
                                autoPlay
                                className="w-full h-10 outline-none"
                                onCanPlay={() => setAudioLoading(false)}
                                onLoadedData={() => setAudioLoading(false)}
                                onError={() => setAudioLoading(false)}
                              />
                            </div>
                          </div>
                          {chunk.detail?.transcript && (
                            <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs mt-3">
                              <h5 className="text-[10px] font-bold text-zinc-700 uppercase tracking-wide">
                                Transkrip Audio
                              </h5>
                              <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                                {chunk.detail.transcript}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    }

                    if (chunk.chunk_type === "image_step") {
                      return (
                        <div className="space-y-3 text-left">
                          <div className="flex items-center gap-1.5 text-zinc-550 font-bold uppercase text-[9.5px] tracking-wider pl-0.5">
                            <FileImage size={14} className="text-[#e0542c]" />
                            <span>Panduan Gambar</span>
                          </div>
                          {chunk.detail?.image_url ? (
                            <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs relative aspect-video w-full bg-zinc-50 flex items-center justify-center">
                              {imageLoading && (
                                <div className="absolute inset-0 bg-zinc-200 animate-pulse flex flex-col items-center justify-center space-y-2">
                                  <FileImage size={24} className="text-zinc-400 animate-bounce" />
                                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Memuat Gambar...</span>
                                </div>
                              )}
                              <img
                                src={chunk.detail.image_url}
                                alt="Langkah Gambar"
                                className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoading ? "opacity-0" : "opacity-100"}`}
                                onLoad={() => setImageLoading(false)}
                                onError={() => setImageLoading(false)}
                              />
                            </div>
                          ) : (
                            <div className="bg-zinc-200 rounded-2xl h-44 flex items-center justify-center text-zinc-400 text-xs">
                              Gambar tidak tersedia
                            </div>
                          )}
                          {chunk.detail?.captions && (
                            <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs mt-3">
                              <h5 className="text-[10px] font-bold text-zinc-700 uppercase tracking-wide">
                                Penjelasan Panduan
                              </h5>
                              <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                                {chunk.detail.captions}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    }

                    if (chunk.chunk_type === "quiz") {
                      const quizId = chunk.detail?.id || 0;
                      return (
                        <div className="space-y-3 text-left">
                          <div className="flex items-center gap-1.5 text-zinc-550 font-bold uppercase text-[9.5px] tracking-wider pl-0.5">
                            <HelpCircle size={14} className="text-[#e0542c]" />
                            <span>Kuis Pemahaman</span>
                          </div>

                          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
                            <h4 className="text-xs font-bold text-zinc-900 leading-relaxed">
                              {chunk.detail?.question || "Jawab pertanyaan berikut:"}
                            </h4>

                            <div className="space-y-2.5 mt-3">
                              {chunk.detail?.options?.map((opt) => {
                                const isSelected = selectedQuizOptionId === opt.id;
                                const isSubmitted = quizAnswerResult !== null;
                                const isCorrectOpt = quizAnswerResult?.correct_option_id === opt.id;
                                const isWrongSelected =
                                  isSubmitted && isSelected && !quizAnswerResult?.is_correct;

                                 let optionStyle = "border-zinc-200 hover:bg-zinc-50/50";
                                 if (isSelected && !isSubmitted) {
                                   optionStyle = "border-[#e0542c] bg-[#e0542c]/5 text-zinc-900";
                                 } else if (isSubmitted) {
                                   if (quizAnswerResult.is_correct && isCorrectOpt) {
                                     optionStyle = "border-green-500 bg-green-50 text-green-900";
                                   } else if (!quizAnswerResult.is_correct && isWrongSelected) {
                                     optionStyle = "border-red-500 bg-red-50 text-red-900";
                                   } else {
                                     optionStyle = "border-zinc-150 bg-zinc-50/50 text-zinc-400 opacity-60";
                                   }
                                 }

                                 return (
                                   <button
                                     key={opt.id}
                                     disabled={isSubmitted && quizAnswerResult?.is_correct}
                                     onClick={() => {
                                       if (isSubmitted && !quizAnswerResult?.is_correct) {
                                         setQuizAnswerResult(null);
                                       }
                                       setSelectedQuizOptionId(opt.id || null);
                                     }}
                                     className={`w-full p-3 rounded-xl border text-xs font-bold text-left transition-all flex items-center justify-between cursor-pointer ${optionStyle}`}
                                   >
                                     <span>{opt.options}</span>
                                     {isSubmitted && quizAnswerResult?.is_correct && isCorrectOpt && (
                                       <span className="text-[8.5px] font-bold text-green-600 uppercase bg-green-100 px-2 py-0.5 rounded-md">
                                         Benar
                                       </span>
                                     )}
                                     {isSubmitted && !quizAnswerResult?.is_correct && isWrongSelected && (
                                       <span className="text-[8.5px] font-bold text-red-600 uppercase bg-red-100 px-2 py-0.5 rounded-md">
                                         Salah
                                       </span>
                                     )}
                                   </button>
                                 );
                               })}
                            </div>

                            {/* Quiz Action Submit */}
                            {quizAnswerResult === null && (
                              <button
                                onClick={() => handleQuizSubmit(quizId)}
                                disabled={submittingQuiz || !selectedQuizOptionId}
                                className="w-full mt-4 py-2.5 bg-[#e0542c] hover:bg-[#c23f1b] disabled:opacity-40 disabled:pointer-events-none text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm shadow-[#e0542c]/20"
                              >
                                {submittingQuiz ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    Mengirim...
                                  </>
                                ) : (
                                  "Submit Jawaban"
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    }

                    return null;
                  })()
                )}
              </div>

              {/* Chunk Player Navigation Footer */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-zinc-150 flex items-center justify-between shrink-0 gap-3 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <button
                  onClick={() => {
                    if (activeChunkIndex > 0) {
                      setActiveChunkIndex((p) => p - 1);
                      setSelectedQuizOptionId(null);
                      setQuizAnswerResult(null);
                      setVideoError(false);
                      setImageLoading(true);
                      setAudioLoading(true);
                    } else {
                      setViewMode("lessons");
                      setActiveLesson(null);
                      navigate(`/mobile/pakan/learn/${courseIdParam}`);
                    }
                  }}
                  className="px-4 py-2.5 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-bold uppercase rounded-xl transition-colors cursor-pointer"
                >
                  Kembali
                </button>

                {(() => {
                  const chunk = activeLesson.chunks[activeChunkIndex];
                  const isQuiz = chunk.chunk_type === "quiz";
                  const isQuizAnswered = quizAnswerResult !== null;
                  const canProceed = !isQuiz || isQuizAnswered;

                  return (
                    <button
                      onClick={handleNextChunk}
                      disabled={!canProceed}
                      className="px-5 py-2.5 bg-[#e0542c] hover:bg-[#c23f1b] disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-sm shadow-[#e0542c]/10"
                    >
                      {activeChunkIndex === activeLesson.chunks.length - 1
                        ? "Selesai & Kembali"
                        : "Berikutnya"}
                    </button>
                  );
                })()}
              </div>
            </div>
          )
        )}
      </div>

      {/* Congratulations / Poin Selesai Modal */}
      {showCongratulations && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-55 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 text-center space-y-4 shadow-2xl animate-in scale-in duration-200 border border-zinc-100">
            <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto border border-green-100">
              <Award size={36} className="animate-bounce" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-zinc-900">Materi Selesai!</h3>
              <p className="text-xs text-zinc-500 font-medium">
                Selamat! Anda telah menyelesaikan materi pembelajaran ini dengan sukses.
              </p>
            </div>

            <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-150 inline-block px-6">
              <span className="block text-[10px] text-zinc-400 font-bold uppercase">Poin Didapatkan</span>
              <span className="text-lg font-black text-[#e0542c] mt-0.5 block">
                +{earnedPoints} POIN
              </span>
            </div>

            <button
              onClick={handleCloseCongratulations}
              className="w-full py-2.5 bg-[#e0542c] hover:bg-[#c23f1b] text-white rounded-xl text-xs font-bold uppercase tracking-wide transition-colors cursor-pointer"
            >
              Kembali ke Materi
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
