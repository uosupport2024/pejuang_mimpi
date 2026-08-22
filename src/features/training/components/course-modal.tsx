import { useState, useEffect } from "react";
import { X, Loader2, BookOpen, Image as ImageIcon, Sparkles } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/shared/components/ui/select";
import type { Course, CreateCoursePayload } from "../api/course";
import { THEME_COLORS } from "@/shared/constants/colors";

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: CreateCoursePayload) => Promise<void>;
  initialData?: Course | null;
  loading?: boolean;
}

export function CourseModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  loading = false,
}: CourseModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [difficulty, setDifficulty] = useState("basic");

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setThumbnailUrl(initialData.thumbnail_url || "");
      setIconUrl(initialData.icon_url || "");
      setIsPublished(initialData.is_published ?? true);
      setDifficulty(initialData.difficulty || "basic");
    } else {
      setTitle("");
      setDescription("");
      setThumbnailUrl("");
      setIconUrl("");
      setIsPublished(true);
      setDifficulty("basic");
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      thumbnail_url: thumbnailUrl.trim() || undefined,
      icon_url: iconUrl.trim() || undefined,
      is_published: isPublished,
      difficulty: difficulty,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div style={{ backgroundColor: THEME_COLORS.hex.navBg }} className="px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              style={{ backgroundColor: THEME_COLORS.hex.primary }}
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
            >
              <BookOpen size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {initialData ? "Edit Pelatihan" : "Tambah Pelatihan Baru"}
              </h3>
              <p className="text-xs text-white/70">
                {initialData ? "Perbarui informasi materi modul" : "Buat materi modul pelatihan baru"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Judul Pelatihan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Pengenalan Dasar Operasional"
              className="w-full px-3.5 py-2.5 rounded-md border border-gray-200 text-xs text-gray-900 focus:outline-none transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Deskripsi Pelatihan
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan cakupan pelatihan dan manfaat yang diperoleh..."
              className="w-full px-3.5 py-2.5 rounded-md border border-gray-200 text-xs text-gray-900 focus:outline-none transition-all resize-none"
            />
          </div>

          {/* Thumbnail URL */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              URL Thumbnail Gambar
            </label>
            <div className="relative">
              <ImageIcon size={15} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full pl-9 pr-3.5 py-2.5 rounded-md border border-gray-200 text-xs text-gray-900 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Icon URL */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              URL Ikon Badge (Opsional)
            </label>
            <div className="relative">
              <Sparkles size={15} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={iconUrl}
                onChange={(e) => setIconUrl(e.target.value)}
                placeholder="https://... atau nama ikon lucide"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-md border border-gray-200 text-xs text-gray-900 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Difficulty Selection */}
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-bold text-gray-700">
              Tingkat Kesulitan
            </label>
            <Select
              value={difficulty}
              onValueChange={(val: string | null) => setDifficulty(val || "basic")}
            >
              <SelectTrigger className="w-full text-xs font-bold bg-zinc-50 border border-gray-200 rounded-md h-9">
                <SelectValue placeholder="Pilih Tingkat Kesulitan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic (Dasar)</SelectItem>
                <SelectItem value="beginner">Beginner (Pemula)</SelectItem>
                <SelectItem value="intermediate">Intermediate (Menengah)</SelectItem>
                <SelectItem value="advanced">Advanced (Mahir)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Published Toggle Switch */}
          <div className="flex items-center justify-between pt-2 pb-1 border-t border-gray-100">
            <div>
              <span className="text-xs font-bold text-gray-800 block">Status Publikasi</span>
              <span className="text-[11px] text-gray-500">
                {isPublished
                  ? "Pelatihan akan langsung tampil di katalog pengguna"
                  : "Pelatihan disimpan sebagai draf (tidak tampil)"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsPublished(!isPublished)}
              style={isPublished ? { backgroundColor: THEME_COLORS.hex.primary } : undefined}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isPublished ? "" : "bg-gray-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isPublished ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-md border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              style={{ backgroundColor: THEME_COLORS.hex.primary }}
              className="px-5 py-2.5 rounded-md text-white text-xs font-bold shadow-md hover:opacity-90 active:scale-98 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              <span>{initialData ? "Simpan Perubahan" : "Buat Pelatihan"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
