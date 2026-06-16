import { useState } from "react";
import { Search, BookOpen, GraduationCap, Trophy, Play, CheckCircle2, Timer } from "lucide-react";
import { toast } from "sonner";
import type { PakanPageProps } from "../types/pakan.type";

interface Course {
  id: string;
  title: string;
  category: "Dasar" | "Manajemen" | "Kesehatan";
  instructor: string;
  duration: string;
  modulesCount: number;
  progress: number; // 0 to 100
  colorTheme: string; // solid bg color for icon
  textColor: string; // text color for icon
}

const COURSES_DATA: Course[] = [
  {
    id: "1",
    title: "Dasar-Dasar Budidaya Ayam Petelur Modern",
    category: "Dasar",
    instructor: "Dr. Ir. Budi Santoso",
    duration: "4.5 Jam",
    modulesCount: 8,
    progress: 75,
    colorTheme: "bg-[#1e2a4a]/10",
    textColor: "text-[#1e2a4a]",
  },
  {
    id: "2",
    title: "Manajemen Pakan & Optimalisasi Nutrisi",
    category: "Manajemen",
    instructor: "Ade Solihin, M.B.A.",
    duration: "3.2 Jam",
    modulesCount: 6,
    progress: 40,
    colorTheme: "bg-[#e0542c]/10",
    textColor: "text-[#e0542c]",
  },
  {
    id: "3",
    title: "SOP Kesehatan, Vaksinasi & Sanitasi Kandang",
    category: "Kesehatan",
    instructor: "drh. Siti Rahma",
    duration: "5.0 Jam",
    modulesCount: 10,
    progress: 0,
    colorTheme: "bg-emerald-100",
    textColor: "text-emerald-700",
  },
  {
    id: "4",
    title: "Analisis Bisnis & Pemasaran Hasil Ternak",
    category: "Manajemen",
    instructor: "Prof. Dr. Hendra Wijaya",
    duration: "2.8 Jam",
    modulesCount: 5,
    progress: 100,
    colorTheme: "bg-amber-100",
    textColor: "text-amber-700",
  },
];

export function PakanPage({ user }: PakanPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"Semua" | "Dasar" | "Manajemen" | "Kesehatan">("Semua");

  const filteredCourses = COURSES_DATA.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Semua" || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleStartCourse = (title: string) => {
    toast.success(`Memulai kelas: ${title}`);
  };

  return (
    <div className="space-y-4">
      {/* Welcome & Learning Banner (Solid Navy matching THEME_COLORS.hex.navBg) */}
      <div className="relative overflow-hidden rounded-2xl p-5 bg-[#1e2a4a] text-white shadow-sm">
        <div className="relative z-10 flex flex-col justify-between h-full">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[9px] font-black uppercase tracking-wider">
              E-Learning Center
            </span>
            <h2 className="text-base font-black mt-2 leading-tight">
              Ayo Tingkatkan Keahlianmu, {user?.name || "Rekan"}!
            </h2>
            <p className="text-[10px] text-zinc-300 mt-1 max-w-[240px] leading-relaxed">
              Pelajari standar operasional terbaik langsung dari para ahli peternakan.
            </p>
          </div>

          {/* Stats Bar (Solid accents using THEME_COLORS.hex.accent #fee279) */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3.5 border-t border-white/10 text-center">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-[#fee279]">
                <Trophy className="w-3.5 h-3.5 shrink-0" />
                <span className="text-xs font-black">1</span>
              </div>
              <span className="text-[8px] text-zinc-400 font-bold uppercase mt-0.5">Selesai</span>
            </div>
            <div className="flex flex-col items-center border-x border-white/10">
              <div className="flex items-center gap-1 text-[#fee279]">
                <BookOpen className="w-3.5 h-3.5 shrink-0" />
                <span className="text-xs font-black">2</span>
              </div>
              <span className="text-[8px] text-zinc-400 font-bold uppercase mt-0.5">Aktif</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-[#fee279]">
                <Timer className="w-3.5 h-3.5 shrink-0" />
                <span className="text-xs font-black">7.7h</span>
              </div>
              <span className="text-[8px] text-zinc-400 font-bold uppercase mt-0.5">Belajar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
          <Search className="w-4 h-4 text-zinc-400" />
        </span>
        <input
          type="text"
          placeholder="Cari materi pembelajaran..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-100 rounded-xl text-xs text-zinc-800 placeholder-zinc-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#e0542c]/20"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none px-0.5">
        {(["Semua", "Dasar", "Manajemen", "Kesehatan"] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
              selectedCategory === cat
                ? "bg-[#e0542c] text-white shadow-xs"
                : "bg-white text-zinc-500 border border-zinc-100 hover:bg-zinc-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Course List */}
      <div className="space-y-3">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl p-4 border border-zinc-100 shadow-xs flex flex-col justify-between hover:scale-[1.01] transition-transform duration-200"
            >
              <div className="flex gap-3">
                {/* Image Placeholder with Solid Background */}
                <div className={`w-14 h-14 rounded-xl ${course.colorTheme} ${course.textColor} shrink-0 flex items-center justify-center shadow-inner`}>
                  <GraduationCap className="w-7 h-7" />
                </div>
                
                {/* Course Details */}
                <div className="min-w-0 flex-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 text-[8px] font-black uppercase tracking-wide">
                    {course.category}
                  </span>
                  <h3 className="text-xs font-black text-zinc-800 mt-1 leading-snug line-clamp-2">
                    {course.title}
                  </h3>
                  <span className="block text-[9px] text-zinc-400 font-bold mt-0.5 truncate">
                    Oleh: {course.instructor}
                  </span>
                </div>
              </div>

              {/* Progress & Action */}
              <div className="mt-4 pt-3.5 border-t border-zinc-100/80 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center text-[9px] font-bold text-zinc-500 mb-1">
                    <span>Progres Belajar</span>
                    <span className="font-black text-zinc-700">{course.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#e0542c] rounded-full transition-all duration-500"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleStartCourse(course.title)}
                  className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wide flex items-center gap-1 cursor-pointer transition-all ${
                    course.progress === 100
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                      : "bg-[#e0542c] text-white hover:bg-[#c23f1b]"
                  }`}
                >
                  {course.progress === 100 ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      Selesai
                    </>
                  ) : course.progress > 0 ? (
                    <>
                      <Play className="w-3 h-3 fill-current shrink-0" />
                      Lanjut
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-current shrink-0" />
                      Mulai
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 bg-white rounded-2xl border border-zinc-100">
            <span className="text-xs text-zinc-400 font-bold">Materi tidak ditemukan</span>
          </div>
        )}
      </div>
    </div>
  );
}
