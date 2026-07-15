import { useState } from "react";
import { Search, BookOpen, GraduationCap, Trophy, Play, CheckCircle2, Timer, Heart, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import type { PakanPageProps } from "../types/pakan.type";
import logoWhite from "@/assets/logo/logo-white.png";
import patternBg from "@/assets/bg/pattern-background.png";

interface Course {
  id: string;
  title: string;
  excerpt: string;
  category: "Dasar" | "Manajemen" | "Kesehatan";
  instructor: string;
  duration: string;
  modulesCount: number;
  progress: number; // 0 to 100
  gradientTheme: string;
}

const COURSES_DATA: Course[] = [
  {
    id: "1",
    title: "Dasar-Dasar Pelayanan Prima (Excellent Service)",
    excerpt: "Konsep dasar pelayanan hospitality, etika penampilan, komunikasi efektif, dan grooming standar hotel bintang 5.",
    category: "Dasar",
    instructor: "Andri Wijaya, M.Par.",
    duration: "4.5 Jam",
    modulesCount: 8,
    progress: 75,
    gradientTheme: "from-[#7FA46D] to-[#5C824C]",
  },
  {
    id: "2",
    title: "Manajemen Operasional Front Office & Housekeeping",
    excerpt: "Prosedur check-in/check-out, pengelolaan reservasi kamar, standar kebersihan area publik, dan housekeeping SOP.",
    category: "Manajemen",
    instructor: "Nadia Siregar, CHA",
    duration: "3.2 Jam",
    modulesCount: 6,
    progress: 40,
    gradientTheme: "from-[#F25C2A] to-[#C54117]",
  },
  {
    id: "3",
    title: "SOP Higiene, Sanitasi & Keamanan Pangan (HACCP)",
    excerpt: "Standar kebersihan dapur hotel, sanitasi alat makan, penyimpanan bahan pangan, serta pencegahan kontaminasi silang.",
    category: "Kesehatan",
    instructor: "Chef Danu Subrata",
    duration: "5.0 Jam",
    modulesCount: 10,
    progress: 0,
    gradientTheme: "from-[#5C8A90] to-[#3F686D]",
  },
  {
    id: "4",
    title: "Strategi Pemasaran & Revenue Management Hotel",
    excerpt: "Optimasi harga kamar dinamis, pengelolaan Online Travel Agent (OTA), serta program retensi dan loyalitas tamu.",
    category: "Manajemen",
    instructor: "Prof. Dr. Hendra Wijaya",
    duration: "2.8 Jam",
    modulesCount: 5,
    progress: 100,
    gradientTheme: "from-[#F2B233] to-[#C58F1B]",
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
      {/* Header Banner Card - matching the design in Sangkar & Tunas */}
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

          {/* Top row: Logo & Welcome Info */}
          <div className="flex justify-between items-center z-10 relative mb-4">
            {/* Left: Logo & User Info */}
            <div className="flex items-center gap-3.5">
              <img src={logoWhite} alt="Logo" className="w-12 h-12 object-contain" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold tracking-wider uppercase text-white/90 leading-none">
                  Selamat Belajar
                </span>
                <span className="text-lg font-bold tracking-tight text-white mt-1.5 leading-none">
                  {user?.name || "Rekan"}
                </span>
              </div>
            </div>

            {/* Right: Page Label Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-white text-[9px] font-bold tracking-wide uppercase shadow-xs">
              E-Learning
            </span>
          </div>

          {/* Divider line */}
          <div className="h-[1px] bg-white/15 w-full my-1.5 z-10 relative" />

          {/* Stats Bar (Solid accents using THEME_COLORS.hex.accent #fee279) */}
          <div className="grid grid-cols-3 gap-2 mt-2 pt-2.5 text-center z-10 relative">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-[#fee279]">
                <Trophy className="w-3.5 h-3.5 shrink-0" />
                <span className="text-xs font-bold">1</span>
              </div>
              <span className="text-[8px] text-zinc-400 font-bold uppercase mt-0.5">Selesai</span>
            </div>
            <div className="flex flex-col items-center border-x border-white/10">
              <div className="flex items-center gap-1 text-[#fee279]">
                <BookOpen className="w-3.5 h-3.5 shrink-0" />
                <span className="text-xs font-bold">2</span>
              </div>
              <span className="text-[8px] text-zinc-400 font-bold uppercase mt-0.5">Aktif</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-[#fee279]">
                <Timer className="w-3.5 h-3.5 shrink-0" />
                <span className="text-xs font-bold">7.7 Jam</span>
              </div>
              <span className="text-[8px] text-zinc-400 font-bold uppercase mt-0.5">Belajar</span>
            </div>
          </div>

          {/* Search Input inside Header Card */}
          <div className="relative mt-4 z-10">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
              <Search className="w-4 h-4 text-zinc-400" />
            </span>
            <input
              type="text"
              placeholder="Cari materi pembelajaran..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white text-zinc-800 placeholder-zinc-450 rounded-xl text-xs shadow-xs focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none px-0.5">
        {(["Semua", "Dasar", "Manajemen", "Kesehatan"] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 transition-all cursor-pointer ${selectedCategory === cat
              ? "bg-[#e0542c] text-white shadow-xs"
              : "bg-white text-zinc-500 border border-zinc-100 hover:bg-zinc-50"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Course List Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => {
            // Map course category or ID to icon
            const getCourseIcon = (id: string) => {
              switch (id) {
                case "1": return GraduationCap;
                case "2": return BookOpen;
                case "3": return Heart;
                case "4": return TrendingUp;
                default: return GraduationCap;
              }
            };
            const IconComp = getCourseIcon(course.id);

            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-zinc-100 shadow-xs flex flex-col overflow-hidden hover:scale-[1.01] transition-transform duration-200"
              >
                {/* Thumbnail Header Block - Compact Height (h-22) */}
                <div className={`h-22 bg-gradient-to-tr ${course.gradientTheme} flex items-center justify-center relative shrink-0`}>
                  {/* Glassmorphic icon container - smaller size */}
                  <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-xs">
                    <IconComp className="w-5 h-5" />
                  </div>
                  {/* Category badge absolutely positioned on top-right */}
                  <span className="absolute top-2 right-2 inline-flex items-center px-1.5 py-0.5 rounded-full bg-black/25 text-white text-[7.5px] font-bold uppercase tracking-wide backdrop-blur-xs">
                    {course.category}
                  </span>
                </div>

                {/* Content details & Action Button - Compact padding */}
                <div className="p-2.5 flex-1 flex flex-col justify-between space-y-2.5">
                  <div className="space-y-0.5 text-left">
                    {/* Title - Compact size and spacing */}
                    <h3 className="text-[10px] font-bold text-zinc-900 leading-snug line-clamp-2 min-h-[30px]">
                      {course.title}
                    </h3>

                    {/* Excerpt - 1 line max, small size */}
                    <p className="text-[8px] text-zinc-400 font-bold leading-normal line-clamp-1">
                      {course.excerpt}
                    </p>

                    {/* Instructor / Author */}
                    <span className="block text-[7.5px] text-zinc-400 font-bold tracking-wider uppercase truncate">
                      Oleh: {course.instructor}
                    </span>
                  </div>



                  {/* Action Button - Compact height and py */}
                  <button
                    onClick={() => handleStartCourse(course.title)}
                    className="w-full py-1.5 rounded-xl bg-gradient-to-tr from-[#e0542c] to-[#ff7e5a] text-white text-[8.5px] font-bold uppercase tracking-wider shadow-xs hover:from-[#c23f1b] hover:to-[#e0542c] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 font-bold"
                  >
                    {course.progress === 100 ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        Selesai
                      </>
                    ) : course.progress > 0 ? (
                      <>
                        <Play className="w-2.5 h-2.5 fill-current shrink-0" />
                        Lanjut
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
          <div className="col-span-2 text-center py-8 bg-white rounded-2xl border border-zinc-100">
            <span className="text-xs text-zinc-400 font-bold">Materi tidak ditemukan</span>
          </div>
        )}
      </div>
    </div>
  );
}
