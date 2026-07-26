import { BookOpen, Layers, Eye, EyeOff, Edit2, Trash2 } from "lucide-react";
import type { Course } from "../api/course";

interface CourseCardProps {
  course: Course;
  onTogglePublish: (course: Course) => void;
  onEdit: (course: Course) => void;
  onDelete: (course: Course) => void;
}

export function CourseCard({ course, onTogglePublish, onEdit, onDelete }: CourseCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col group relative">
      {/* Card Header Image / Cover */}
      <div className="h-40 w-full bg-gradient-to-r from-[#1e2a4a] to-[#2a3b68] relative overflow-hidden shrink-0">
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

        {/* Status Badge (Slim, rounded-md, no dot) */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold shadow-xs backdrop-blur-xs ${
              course.is_published
                ? "bg-emerald-600/90 text-white"
                : "bg-zinc-700/90 text-white"
            }`}
          >
            {course.is_published ? "Publik" : "Disembunyikan"}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#e0542c] transition-colors line-clamp-1 mb-1">
            {course.title}
          </h4>
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {course.description || "Belum ada deskripsi untuk modul course ini."}
          </p>
        </div>

        {/* Card Meta Footer */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
            <Layers size={14} className="text-[#e0542c]" />
            <span>{course.lessons_count || course.lessons?.length || 0} Materi</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onTogglePublish(course)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                course.is_published
                  ? "text-emerald-600 hover:bg-emerald-50"
                  : "text-gray-400 hover:bg-gray-100"
              }`}
              title={course.is_published ? "Sembunyikan Course" : "Publikasikan Course"}
            >
              {course.is_published ? <Eye size={15} /> : <EyeOff size={15} />}
            </button>
            <button
              onClick={() => onEdit(course)}
              className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              title="Edit Course"
            >
              <Edit2 size={15} />
            </button>
            <button
              onClick={() => onDelete(course)}
              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Hapus Course"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
