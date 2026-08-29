import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  BookOpen,
  Trophy,
  Play,
  CheckCircle2,
  Timer
} from "lucide-react";
import { toast } from "sonner";
import type { PakanPageProps } from "../types/pakan.type";
import patternBg from "@/assets/bg/pattern-background.png";
import {
  fetchCourses,
  enrollCourse,
  type Course as APICourse
} from "@/features/training/api/course";
import { useTenantBranding } from "@/shared/hooks/use-tenant-branding";
import { THEME_COLORS, buildCssBackground } from "@/shared/constants/colors";

export function PakanPage({ user }: PakanPageProps) {
  const navigate = useNavigate();
  const { effectiveLogo, tenantName, navbarBgStyle, buttonColor } = useTenantBranding();
  const [courses, setCourses] = useState<APICourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("Semua");

  const loadCourses = async () => {
    try {
      setLoading(true);
      const res = await fetchCourses(1, 100);
      setCourses(res.data);
    } catch (err: any) {
      toast.error(err.message || "Gagal memuat data pembelajaran");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  // Stats calculation dynamically from database courses
  const stats = useMemo(() => {
    let completed = 0;
    let active = 0;
    let points = 0;

    courses.forEach((c) => {
      if (c.user_progress?.status === "completed") {
        completed++;
      } else if (c.user_progress?.status === "in_progress") {
        active++;
      }
      points += c.user_progress?.total_point || 0;
    });

    return { completed, active, points };
  }, [courses]);

  const mappedCourses = useMemo(() => {
    return courses.map((c) => {
      const diff = (c.difficulty || "basic").toLowerCase();
      let progressVal = 0;
      if (c.user_progress) {
        progressVal = c.user_progress.percentage_completed;
      }

      let gradientTheme = THEME_COLORS.celengan.rumah.gradient; // basic (Green)
      if (diff === "beginner") {
        gradientTheme = THEME_COLORS.celengan.motor.gradient; // beginner (Orange)
      } else if (diff === "intermediate") {
        gradientTheme = THEME_COLORS.celengan.liburanBali.gradient; // intermediate (Teal)
      } else if (diff === "advanced") {
        gradientTheme = THEME_COLORS.celengan.laptopBaru.gradient; // advanced (Yellow)
      }

      return {
        ...c,
        progress: progressVal,
        gradientTheme,
      };
    });
  }, [courses]);

  const getCourseTags = (tags: any): string[] => {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags.map((t) => String(t).trim()).filter(Boolean);
    if (typeof tags === "string") {
      try {
        const parsed = JSON.parse(tags);
        if (Array.isArray(parsed)) return parsed.map((t) => String(t).trim()).filter(Boolean);
      } catch {
        return tags.split(",").map((t) => t.trim()).filter(Boolean);
      }
    }
    return [];
  };

  const filteredCourses = useMemo(() => {
    return mappedCourses.filter((c) => {
      const desc = (c.description || "").toLowerCase();
      const tags = getCourseTags(c.tags).map((t) => t.toLowerCase());
      const query = searchQuery.toLowerCase();
      const matchSearch =
        c.title.toLowerCase().includes(query) ||
        desc.includes(query) ||
        tags.some((t) => t.includes(query));
      
      const matchDifficulty =
        selectedDifficulty === "Semua" ||
        c.difficulty?.toLowerCase() === selectedDifficulty.toLowerCase();

      return matchSearch && matchDifficulty;
    });
  }, [mappedCourses, searchQuery, selectedDifficulty]);

  const handleStartCourse = async (courseId: number) => {
    try {
      await enrollCourse(courseId);
      navigate(`/mobile/pakan/learn/${courseId}`);
    } catch (err: any) {
      toast.error(err.message || "Gagal memulai kelas");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Banner Card */}
      <div className="-mt-6 -mx-5 relative mb-4">
        <div
          style={navbarBgStyle}
          className="w-full text-white rounded-t-none rounded-b-[40px] shadow-lg border-b border-white/10 flex flex-col p-6 pt-11 pb-6 relative overflow-hidden"
        >
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: `url(${patternBg})`,
              backgroundSize: "180px auto",
              backgroundRepeat: "repeat"
            }}
          />

          <div className="flex justify-between items-center z-10 relative mb-4">
            <div className="flex items-center gap-3.5">
              <img src={effectiveLogo} alt={tenantName || "Logo"} className="w-12 h-12 object-contain" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold tracking-wider uppercase text-white/90 leading-none">
                  Selamat Belajar
                </span>
                <span className="text-lg font-bold tracking-tight text-white mt-1.5 leading-none">
                  {user?.name || "Rekan"}
                </span>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-white text-[9px] font-bold tracking-wide uppercase shadow-xs">
              E-Learning
            </span>
          </div>

          <div className="h-[1px] bg-white/15 w-full my-1.5 z-10 relative" />

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2 mt-2 pt-2.5 text-center z-10 relative">
            <div className="flex flex-col items-center">
              <div style={{ color: THEME_COLORS.hex.accent }} className="flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 shrink-0" />
                <span className="text-xs font-bold">{stats.completed}</span>
              </div>
              <span className="text-[8px] text-zinc-400 font-bold uppercase mt-0.5">Selesai</span>
            </div>
            <div className="flex flex-col items-center border-x border-white/10">
              <div style={{ color: THEME_COLORS.hex.accent }} className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 shrink-0" />
                <span className="text-xs font-bold">{stats.active}</span>
              </div>
              <span className="text-[8px] text-zinc-400 font-bold uppercase mt-0.5">Aktif</span>
            </div>
            <div className="flex flex-col items-center">
              <div style={{ color: THEME_COLORS.hex.accent }} className="flex items-center gap-1">
                <Timer className="w-3.5 h-3.5 shrink-0" />
                <span className="text-xs font-bold">{stats.points} Poin</span>
              </div>
              <span className="text-[8px] text-zinc-400 font-bold uppercase mt-0.5">Belajar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Cari kelas, skill, materi..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-zinc-200/80 rounded-2xl text-xs font-semibold text-gray-800 placeholder-zinc-400 focus:outline-hidden focus:border-zinc-400 shadow-xs transition-all"
        />
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {([
          { value: "Semua", label: "SEMUA TINGKAT" },
          { value: "basic", label: "BASIC" },
          { value: "beginner", label: "BEGINNER" },
          { value: "intermediate", label: "INTERMEDIATE" },
          { value: "advanced", label: "ADVANCED" }
        ] as const).map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSelectedDifficulty(tab.value)}
            style={selectedDifficulty === tab.value ? { background: buildCssBackground(buttonColor, THEME_COLORS.hex.primary) } : undefined}
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
              selectedDifficulty === tab.value
                ? "text-white shadow-xs"
                : "bg-white text-zinc-500 border border-zinc-100 hover:bg-zinc-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading Skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-zinc-100 p-3 flex flex-col gap-3 animate-pulse">
              <div className="flex gap-3 items-start">
                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-zinc-200 rounded-xl shrink-0" />
                <div className="flex-1 flex flex-col justify-between py-0.5 space-y-2">
                  <div className="space-y-1.5">
                    <div className="h-3.5 bg-zinc-200 rounded-md w-4/5" />
                    <div className="h-2.5 bg-zinc-200 rounded-md w-3/5" />
                  </div>
                  <div className="h-3 bg-zinc-200 rounded-md w-1/3" />
                </div>
              </div>
              <div className="h-8 bg-zinc-200 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : (
        /* Course List (Horizontal Single Column with Fullwidth Button) */
        <div className="grid grid-cols-1 gap-3">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => {
              const getDifficultyLabel = (difficulty?: string) => {
                switch (difficulty?.toLowerCase()) {
                  case "basic": return "BASIC";
                  case "beginner": return "BEGINNER";
                  case "intermediate": return "INTERMEDIATE";
                  case "advanced": return "ADVANCED";
                  default: return "BASIC";
                }
              };

              const courseTags = getCourseTags(course.tags);

              return (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl border border-zinc-200/80 p-3 shadow-xs flex flex-col gap-3 hover:shadow-md transition-all duration-200"
                >
                  {/* Top Row: Thumbnail on Left, Information on Right */}
                  <div className="flex flex-row gap-3 items-start">
                    {/* Left Side: Thumbnail with badge */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl relative overflow-hidden shrink-0 bg-zinc-100 flex items-center justify-center">
                      {course.thumbnail_url ? (
                        <>
                          <img
                            src={course.thumbnail_url}
                            alt={course.title}
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                          <div className="absolute inset-0 bg-black/10" />
                        </>
                      ) : (
                        <div className={`absolute inset-0 ${course.gradientTheme}`} />
                      )}
                      <span className="absolute top-1.5 left-1.5 inline-flex items-center px-1.5 py-0.5 rounded-md bg-black/35 text-white text-[7.5px] font-bold uppercase tracking-wider backdrop-blur-xs z-10 border border-white/10">
                        {getDifficultyLabel(course.difficulty)}
                      </span>
                    </div>

                    {/* Right Side: Information Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch text-left py-0.5">
                      <div className="flex flex-col gap-1">
                        <h3 className="text-xs font-bold text-zinc-900 leading-snug line-clamp-2">
                          {course.title}
                        </h3>
                        <p className="text-[9.5px] text-zinc-500 font-medium leading-relaxed line-clamp-2">
                          {course.description || "Tingkatkan keahlian Anda melalui modul pembelajaran ini."}
                        </p>
                      </div>

                      {courseTags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1 mt-auto">
                          {courseTags.slice(0, 2).map((tag, idx) => (
                            <span
                              key={idx}
                              style={{
                                backgroundColor: THEME_COLORS.hex.slateClassic,
                              }}
                              className="inline-flex items-center px-2 py-0.5 rounded text-[7.5px] font-normal text-white leading-tight truncate max-w-[85px]"
                            >
                              #{tag}
                            </span>
                          ))}
                          {courseTags.length > 2 && (
                            <span
                              style={{
                                backgroundColor: THEME_COLORS.hex.slateClassic,
                              }}
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-[7.5px] font-normal text-white leading-tight"
                            >
                              +{courseTags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fullwidth Action Button at Bottom */}
                  <button
                    onClick={() => handleStartCourse(course.id)}
                    style={{
                      backgroundColor:
                        course.user_progress?.status === "completed"
                          ? THEME_COLORS.hex.sawahPertumbuhan
                          : typeof buttonColor === "string" && !buttonColor.includes("gradient")
                          ? buttonColor
                          : THEME_COLORS.hex.primary,
                    }}
                    className="w-full py-2 rounded-xl text-white text-[9.5px] font-bold uppercase tracking-wider shadow-xs active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-1.5 hover:brightness-105"
                  >
                    {course.user_progress?.status === "completed" ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        Selesai
                      </>
                    ) : course.user_progress ? (
                      <>
                        <Play className="w-3 h-3 fill-current shrink-0" />
                        Lanjutkan
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-current shrink-0" />
                        Mulai
                      </>
                    )}
                  </button>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 bg-white rounded-2xl border border-zinc-100">
              <span className="text-xs text-zinc-400 font-bold">Materi tidak ditemukan</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
