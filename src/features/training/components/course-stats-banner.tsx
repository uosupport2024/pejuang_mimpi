import { BookOpen, CheckCircle2, EyeOff } from "lucide-react";
import { THEME_COLORS } from "@/shared/constants/colors";

interface CourseStatsBannerProps {
  total: number;
  published: number;
  hidden: number;
}

export function CourseStatsBanner({ total, published, hidden }: CourseStatsBannerProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Metric 1 */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 flex items-center gap-4 shadow-xs">
        <div
          className="w-12 h-12 rounded-2xl text-white flex items-center justify-center shadow-md shadow-[#1e2a4a]/20 shrink-0"
          style={{ backgroundColor: THEME_COLORS.hex.navBg }}
        >
          <BookOpen size={22} />
        </div>
        <div>
          <span className="text-2xl font-black text-gray-900 leading-none block">{total}</span>
          <span className="text-xs font-semibold text-gray-500 mt-1 block">Total Course Modul</span>
        </div>
      </div>

      {/* Metric 2 */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 flex items-center gap-4 shadow-xs">
        <div
          className="w-12 h-12 rounded-2xl text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0"
          style={{ backgroundColor: THEME_COLORS.hex.sawahPertumbuhan }}
        >
          <CheckCircle2 size={22} />
        </div>
        <div>
          <span className="text-2xl font-black text-emerald-600 leading-none block">{published}</span>
          <span className="text-xs font-semibold text-gray-500 mt-1 block">Dipublikasikan (Tampil)</span>
        </div>
      </div>

      {/* Metric 3 */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 flex items-center gap-4 shadow-xs">
        <div className="w-12 h-12 rounded-2xl text-white flex items-center justify-center shadow-md shadow-zinc-500/20 shrink-0 bg-zinc-600">
          <EyeOff size={22} />
        </div>
        <div>
          <span className="text-2xl font-black text-zinc-600 leading-none block">{hidden}</span>
          <span className="text-xs font-semibold text-gray-500 mt-1 block">Disembunyikan (Non-Aktif)</span>
        </div>
      </div>
    </div>
  );
}
