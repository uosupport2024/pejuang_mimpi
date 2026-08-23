import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  BookOpen,
  GraduationCap,
  Trophy,
  Play,
  CheckCircle2,
  Timer,
  Heart,
  Award
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
import { THEME_COLORS } from "@/shared/constants/colors";

export function PakanPage({ user }: PakanPageProps) {
  const navigate = useNavigate();
  const { effectiveLogo, tenantName } = useTenantBranding();
  const [courses, setCourses] = useState<APICourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<"Semua" | "basic" | "beginner" | "intermediate" | "advanced">("Semua");

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
        instructor: "Trainer POT",
        excerpt: c.description || "Materi pembelajaran resmi Uo-space.",
      };
    });
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return mappedCourses.filter((course) => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDifficulty =
        selectedDifficulty === "Semua" ||
        (course.difficulty || "basic").toLowerCase() === selectedDifficulty.toLowerCase();
      return matchesSearch && matchesDifficulty;
    });
  }, [mappedCourses, searchQuery, selectedDifficulty]);

  const handleStartCourse = async (courseId: number) => {
    try {
      const courseObj = courses.find((c) => c.id === courseId);
      if (!courseObj) return;

      if (!courseObj.user_progress) {
        await enrollCourse(courseId);
        await loadCourses();
      }

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
          style={{ backgroundColor: THEME_COLORS.hex.navBg }}
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
            style={selectedDifficulty === tab.value ? { backgroundColor: THEME_COLORS.hex.primary } : undefined}
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
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-md border border-zinc-100 p-2.5 space-y-3 animate-pulse">
              <div className="h-22 bg-zinc-200 rounded-md w-full" />
              <div className="space-y-2">
                <div className="h-3 bg-zinc-200 rounded-md w-3/4" />
                <div className="h-2 bg-zinc-200 rounded-md w-1/2" />
                <div className="h-6 bg-zinc-200 rounded-md w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Course List Grid */
        <div className="grid grid-cols-2 gap-3">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => {
              const getCourseIcon = (difficulty?: string) => {
                switch (difficulty?.toLowerCase()) {
                  case "basic":
                    return GraduationCap;
                  case "beginner":
                    return BookOpen;
                  case "intermediate":
                    return Heart;
                  case "advanced":
                    return Award;
                  default:
                    return GraduationCap;
                }
              };
              const IconComp = getCourseIcon(course.difficulty);
              const getDifficultyLabel = (difficulty?: string) => {
                switch (difficulty?.toLowerCase()) {
                  case "basic": return "BASIC";
                  case "beginner": return "BEGINNER";
                  case "intermediate": return "INTERMEDIATE";
                  case "advanced": return "ADVANCED";
                  default: return "BASIC";
                }
              };

              return (
                <div
                  key={course.id}
                  className="bg-white rounded-md border border-zinc-100 shadow-xs flex flex-col overflow-hidden hover:scale-[1.01] transition-transform duration-200"
                >
                  <div className="h-22 relative flex items-center justify-center shrink-0 overflow-hidden bg-zinc-100">
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
                        <div className="absolute inset-0 bg-black/15" />
                      </>
                    ) : (
                      <div className={`absolute inset-0 ${course.gradientTheme}`} />
                    )}
                    <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-xs z-10">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <span className="absolute top-2 right-2 inline-flex items-center px-1.5 py-0.5 rounded-full bg-black/25 text-white text-[7.5px] font-bold uppercase tracking-wide backdrop-blur-xs z-10">
                      {getDifficultyLabel(course.difficulty)}
                    </span>
                  </div>

                  <div className="p-2.5 flex-1 flex flex-col justify-between space-y-2.5">
                    <div className="space-y-0.5 text-left">
                      <h3 className="text-[10px] font-bold text-zinc-900 leading-snug line-clamp-2 min-h-[30px]">
                        {course.title}
                      </h3>
                      <p className="text-[8px] text-zinc-400 font-medium leading-normal line-clamp-1">
                        {course.excerpt}
                      </p>
                      <span className="block text-[7.5px] text-zinc-400 font-bold tracking-wider uppercase truncate">
                        Oleh: {course.instructor}
                      </span>
                    </div>

                    <button
                      onClick={() => handleStartCourse(course.id)}
                      className={`w-full py-1.5 rounded-md text-white text-[8.5px] font-bold uppercase tracking-wider shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        course.user_progress?.status === "completed"
                          ? "bg-gradient-to-tr from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 shadow-green-100/50"
                          : "bg-gradient-to-tr from-[#e0542c] to-[#ff7e5a] hover:from-[#c23f1b] hover:to-[#e0542c]"
                      }`}
                    >
                      {course.user_progress?.status === "completed" ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                          Selesai
                        </>
                      ) : course.user_progress ? (
                        <>
                          <Play className="w-2.5 h-2.5 fill-current shrink-0" />
                          Lanjutkan
                        </>
                      ) : (
                        <>
                          <Play className="w-2.5 h-2.5 fill-current shrink-0" />
                          Mulai
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-2 text-center py-8 bg-white rounded-md border border-zinc-100">
              <span className="text-xs text-zinc-400 font-bold">Materi tidak ditemukan</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
