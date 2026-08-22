import { BookOpen, Edit2, Trash2 } from "lucide-react";
import type { Course } from "../api/course";
import { THEME_COLORS } from "@/shared/constants/colors";

interface CourseCardProps {
  course: Course;
  onEdit: (course: Course) => void;
  onDelete: (course: Course) => void;
  onViewDetail: (course: Course) => void;
}

export function CourseCard({ course, onEdit, onDelete, onViewDetail }: CourseCardProps) {
  return (
    <div
      onClick={() => onViewDetail(course)}
      className="bg-white rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col group relative cursor-pointer"
    >
      {/* Card Header Image / Cover */}
      <div
        style={{ backgroundColor: THEME_COLORS.hex.navBg }}
        className="h-40 w-full relative overflow-hidden shrink-0"
      >
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-white/20">
            <BookOpen size={48} />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold shadow-xs backdrop-blur-xs ${
              course.is_published
                ? "bg-emerald-600/90 text-white"
                : "bg-red-600/90 text-white"
            }`}
          >
            {course.is_published ? "Publik" : "Draft"}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h4 className="text-sm font-bold text-gray-900 transition-colors line-clamp-1 mb-1">
            {course.title}
          </h4>
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {course.description || "Belum ada deskripsi untuk modul pelatihan ini."}
          </p>
        </div>

        {/* Card Meta Footer */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <span
            style={{ color: THEME_COLORS.hex.primary, backgroundColor: `${THEME_COLORS.hex.primary}1A`, borderColor: `${THEME_COLORS.hex.primary}33` }}
            className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold border"
          >
            {course.lessons_count || course.lessons?.length || 0} Materi
          </span>

          {/* Actions */}
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(course);
              }}
              className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              title="Edit Pelatihan"
            >
              <Edit2 size={15} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(course);
              }}
              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Hapus Pelatihan"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
