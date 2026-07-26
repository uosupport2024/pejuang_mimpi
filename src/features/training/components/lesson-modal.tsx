import { useState, useEffect } from "react";
import { Loader2, Save, X } from "lucide-react";
import { FormField } from "@/shared/components/ui/form-field";
import { THEME_COLORS } from "@/shared/constants/colors";

interface LessonModalProps {
  isOpen: boolean;
  mode: "add" | "edit";
  initialData?: {
    id?: number;
    title: string;
    lessonPoints: number;
    orderIndex: number;
  };
  onSubmit: (data: { title: string; lessonPoints: number; orderIndex: number }) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}

export function LessonModal({
  isOpen,
  mode,
  initialData,
  onSubmit,
  onClose,
  loading = false,
}: LessonModalProps) {
  const [title, setTitle] = useState("");
  const [lessonPoints, setLessonPoints] = useState(10);
  const [orderIndex, setOrderIndex] = useState(1);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setLessonPoints(initialData.lessonPoints ?? 10);
      setOrderIndex(initialData.orderIndex ?? 1);
    } else {
      setTitle("");
      setLessonPoints(10);
      setOrderIndex(1);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await onSubmit({
      title: title.trim(),
      lessonPoints: Number(lessonPoints) || 0,
      orderIndex: Number(orderIndex) || 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-md p-5 space-y-3.5 animate-in fade-in zoom-in-95 duration-150 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              {mode === "edit" ? "Edit Materi Lesson" : "Tambah Materi Lesson"}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body using shared FormField */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <FormField
            label="Judul Materi"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Pengenalan Visi & Misi"
          />

          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="Urutan Tampil"
              type="number"
              value={orderIndex}
              onChange={(e) => setOrderIndex(Number(e.target.value))}
            />

            <FormField
              label="Poin Hadiah"
              type="number"
              value={lessonPoints}
              onChange={(e) => setLessonPoints(Number(e.target.value))}
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2.5 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              style={{ backgroundColor: THEME_COLORS.hex.primary }}
              className="px-5 py-2 rounded-xl text-white text-xs font-bold shadow-md shadow-[#e0542c]/20 hover:opacity-90 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              <span>Simpan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
