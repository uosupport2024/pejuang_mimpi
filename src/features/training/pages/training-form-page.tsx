import { useState, useEffect } from "react";
import {
  BookOpen,
  Loader2,
  Save,
  Layers,
  Plus,
  Edit2,
  Trash2,
  Award
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/shared/router/router";
import { useLocation } from "react-router-dom";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { FormField } from "@/shared/components/ui/form-field";
import { ReusableTable } from "@/shared/components/ui/reusable-table";
import { ConfirmationModal } from "@/shared/components/ui/confirmation-modal";
import { THEME_COLORS } from "@/shared/constants/colors";
import { LessonModal } from "../components/lesson-modal";
import { LessonChunkBuilder } from "../components/lesson-chunk-builder";
import {
  createCourse,
  createCourseFull,
  updateCourse,
  fetchCourseById,
  createLesson,
  updateLesson,
  deleteLesson,
  type Lesson
} from "../api/course";

interface TrainingFormPageProps {
  mode: "add" | "edit";
}

export function TrainingFormPage({ mode }: TrainingFormPageProps) {
  const { navigate } = useRouter();
  const location = useLocation();

  // Lazy initialize courseId from location state
  const [courseId] = useState<number | undefined>(() => location.state?.courseId);

  const [loadingCourse, setLoadingCourse] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  // Lesson Modal State
  const [lessonModal, setLessonModal] = useState<{
    isOpen: boolean;
    mode: "add" | "edit";
    initialData?: { id?: number; title: string; lessonPoints: number; orderIndex: number };
  }>({
    isOpen: false,
    mode: "add",
  });
  const [submittingLesson, setSubmittingLesson] = useState(false);

  // Lesson Delete Confirmation Modal State
  const [confirmDeleteLesson, setConfirmDeleteLesson] = useState<{
    isOpen: boolean;
    id: number | null;
    title: string;
  }>({
    isOpen: false,
    id: null,
    title: "",
  });
  const [deletingLesson, setDeletingLesson] = useState(false);

  // Lesson Reorder Confirmation Modal State
  const [pendingReorderLessons, setPendingReorderLessons] = useState<Lesson[] | null>(null);
  const [confirmReorderModalOpen, setConfirmReorderModalOpen] = useState(false);
  const [submittingReorder, setSubmittingReorder] = useState(false);

  // Empty Lessons Submission Confirmation Modal State
  const [confirmEmptyLessonsModalOpen, setConfirmEmptyLessonsModalOpen] = useState(false);

  // Chunk Builder State
  const [builderLessonId, setBuilderLessonId] = useState<number | null>(null);
  const [builderOpen, setBuilderOpen] = useState(false);

  // Load course & lessons details if editing
  const loadCourseDetail = async () => {
    if (!courseId) return;
    try {
      setLoadingCourse(true);
      const course = await fetchCourseById(courseId);
      setTitle(course.title || "");
      setDescription(course.description || "");
      setThumbnailUrl(course.thumbnail_url || "");
      setIconUrl(course.icon_url || "");
      setIsPublished(course.is_published ?? true);
      
      // Sort lessons by order_index ascending
      const sortedLessons = [...(course.lessons || [])].sort(
        (a, b) => (a.order_index || 0) - (b.order_index || 0)
      );
      setLessons(sortedLessons);
    } catch (err: any) {
      toast.error(err.message || "Gagal memuat detail course");
      navigate("Training");
    } finally {
      setLoadingCourse(false);
    }
  };

  useEffect(() => {
    if (mode === "edit") {
      if (!courseId) {
        navigate("Training");
        return;
      }
      loadCourseDetail();
    }
  }, [mode, courseId]);

  const handleSubmitCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Judul course harus diisi terlebih dahulu");
      return;
    }

    // Prompt confirmation if submitting course with empty lessons
    if (lessons.length === 0 && !confirmEmptyLessonsModalOpen) {
      setConfirmEmptyLessonsModalOpen(true);
      return;
    }

    await executeSubmitCourse();
  };

  const executeSubmitCourse = async () => {
    try {
      setSubmitting(true);
      const basePayload = {
        title: title.trim(),
        description: description.trim() || undefined,
        thumbnail_url: thumbnailUrl.trim() || undefined,
        icon_url: iconUrl.trim() || undefined,
        is_published: isPublished,
      };

      if (mode === "edit" && courseId) {
        await updateCourse(courseId, basePayload);
        toast.success(`Course "${title}" berhasil diperbarui`);
      } else {
        if (lessons.length > 0) {
          await createCourseFull({
            ...basePayload,
            lessons: lessons.map((l, idx) => ({
              title: l.title,
              icon_url: l.icon_url || undefined,
              order_index: idx + 1,
              lesson_points: l.lesson_points || 0,
            })),
          });
        } else {
          await createCourse(basePayload);
        }
        toast.success(`Course "${title}" berhasil dibuat`);
      }

      setConfirmEmptyLessonsModalOpen(false);
      navigate("Training");
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan course");
    } finally {
      setSubmitting(false);
    }
  };

  // Lesson Handlers
  const handleOpenAddLesson = () => {
    if (!title.trim()) {
      toast.error("Silakan isi judul course terlebih dahulu sebelum menambahkan materi pelatihan");
      return;
    }

    setLessonModal({
      isOpen: true,
      mode: "add",
      initialData: {
        title: "",
        lessonPoints: 10,
        orderIndex: lessons.length + 1,
      },
    });
  };

  const handleOpenEditLesson = (lesson: Lesson) => {
    setLessonModal({
      isOpen: true,
      mode: "edit",
      initialData: {
        id: lesson.id,
        title: lesson.title,
        lessonPoints: lesson.lesson_points || 0,
        orderIndex: lesson.order_index || 1,
      },
    });
  };

  const handleSubmitLesson = async (data: { title: string; lessonPoints: number; orderIndex: number }) => {
    try {
      setSubmittingLesson(true);
      
      if (mode === "add" || !courseId) {
        // Draft mode (Add Course): manage state locally
        if (lessonModal.mode === "edit" && lessonModal.initialData?.id) {
          setLessons((prev) =>
            prev.map((item) =>
              item.id === lessonModal.initialData?.id
                ? { ...item, title: data.title, lesson_points: data.lessonPoints, order_index: data.orderIndex }
                : item
            )
          );
          toast.success("Materi draf diperbarui");
        } else {
          const newDraftLesson: Lesson = {
            id: Date.now(),
            title: data.title,
            lesson_points: data.lessonPoints,
            order_index: data.orderIndex || lessons.length + 1,
          };
          setLessons((prev) => [...prev, newDraftLesson]);
          toast.success("Materi ditambahkan ke draf");
        }
        setLessonModal({ isOpen: false, mode: "add" });
      } else {
        // Edit mode (Existing Course): sync directly with API
        const payload = {
          title: data.title,
          lesson_points: data.lessonPoints,
          order_index: data.orderIndex,
        };

        if (lessonModal.mode === "edit" && lessonModal.initialData?.id) {
          await updateLesson(lessonModal.initialData.id, payload);
          toast.success("Materi berhasil diperbarui");
        } else {
          await createLesson(courseId, payload);
          toast.success("Materi baru berhasil ditambahkan");
        }

        setLessonModal({ isOpen: false, mode: "add" });
        loadCourseDetail();
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan materi");
    } finally {
      setSubmittingLesson(false);
    }
  };

  const handleDeleteLessonClick = (lesson: Lesson) => {
    setConfirmDeleteLesson({
      isOpen: true,
      id: lesson.id,
      title: lesson.title,
    });
  };

  const handleConfirmDeleteLesson = async () => {
    if (!confirmDeleteLesson.id) return;
    try {
      setDeletingLesson(true);
      if (mode === "add" || !courseId) {
        setLessons((prev) => prev.filter((item) => item.id !== confirmDeleteLesson.id));
        toast.success(`Materi "${confirmDeleteLesson.title}" dihapus dari draf`);
      } else {
        await deleteLesson(confirmDeleteLesson.id);
        toast.success(`Materi "${confirmDeleteLesson.title}" berhasil dihapus`);
        loadCourseDetail();
      }
      setConfirmDeleteLesson({ isOpen: false, id: null, title: "" });
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus materi");
    } finally {
      setDeletingLesson(false);
    }
  };

  // Reorder Drag & Drop handler for Lessons
  const handleReorderLessons = (reorderedData: Lesson[]) => {
    if (mode === "add" || !courseId) {
      const updatedLessons = reorderedData.map((item, idx) => ({
        ...item,
        order_index: idx + 1,
      }));
      setLessons(updatedLessons);
    } else {
      setPendingReorderLessons(reorderedData);
      setConfirmReorderModalOpen(true);
    }
  };

  const handleConfirmReorder = async () => {
    if (!pendingReorderLessons) return;
    try {
      setSubmittingReorder(true);
      const updatedLessons = pendingReorderLessons.map((item, idx) => ({
        ...item,
        order_index: idx + 1,
      }));
      setLessons(updatedLessons);

      const updatePromises = updatedLessons.map((item) =>
        updateLesson(item.id, { order_index: item.order_index })
      );
      await Promise.all(updatePromises);
      toast.success("Urutan materi berhasil diperbarui");
      setConfirmReorderModalOpen(false);
      setPendingReorderLessons(null);
    } catch (err: any) {
      toast.error("Gagal menyimpan urutan materi");
      loadCourseDetail();
    } finally {
      setSubmittingReorder(false);
    }
  };

  const handleCancelReorder = () => {
    setPendingReorderLessons(null);
    setConfirmReorderModalOpen(false);
  };

  // Lesson Columns Definition for ReusableTable
  const lessonColumns = [
    {
      header: <span className="text-center block w-full">Urutan</span>,
      cell: (row: Lesson, index: number) => (
        <span className="text-center block font-bold text-gray-600">
          {row.order_index ?? index + 1}
        </span>
      ),
      className: "w-16 text-center",
    },
    {
      header: "Judul Materi",
      cell: (row: Lesson) => (
        <span className="font-bold text-gray-900">{row.title}</span>
      ),
    },
    {
      header: <span className="text-center block w-full">Poin</span>,
      cell: (row: Lesson) => (
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200/80">
            <Award size={12} className="text-amber-500" />
            {row.lesson_points || 0} Poin
          </span>
        </div>
      ),
      className: "w-28 text-center",
    },
    {
      header: <span className="text-center block w-full">Konten Chunk</span>,
      cell: (row: Lesson) => (
        <div className="flex justify-center">
          {mode === "edit" && row.id ? (
            <button
              type="button"
              onClick={() => {
                setBuilderLessonId(row.id);
                setBuilderOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-[#e0542c]/10 text-gray-700 hover:text-[#e0542c] font-bold text-[11px] transition-all cursor-pointer border border-gray-200"
            >
              <Layers size={13} />
              <span>Isi Konten ({row.chunks?.length || 0})</span>
            </button>
          ) : (
            <span className="text-[10px] text-gray-400 italic">Simpan course dulu</span>
          )}
        </div>
      ),
      className: "w-36 text-center",
    },
    {
      header: <span className="text-center block w-full">Aksi</span>,
      cell: (row: Lesson) => (
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={() => handleOpenEditLesson(row)}
            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            title="Edit Materi"
          >
            <Edit2 size={14} />
          </button>
          <button
            type="button"
            onClick={() => handleDeleteLessonClick(row)}
            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Hapus Materi"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
      className: "w-28 text-center",
    },
  ];

  // Skeleton Loading View
  if (loadingCourse) {
    return (
      <div className="w-full space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <Skeleton className="w-8 h-8 rounded-xl" />
              <Skeleton className="h-4 w-44 rounded-md" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-3 w-28 rounded-md" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-3 w-28 rounded-md" />
              <Skeleton className="h-28 w-full rounded-xl" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-3 w-36 rounded-md" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-3 w-40 rounded-md" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Skeleton className="h-10 w-20 rounded-xl" />
              <Skeleton className="h-10 w-36 rounded-xl" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-4">
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="h-44 w-full rounded-2xl" />
            </div>
            <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-3">
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="h-8 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Course Main Form */}
      <form onSubmit={handleSubmitCourse} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Primary Fields using shared FormField */}
        <div className="lg:col-span-2 bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs space-y-3.5">
          <div className="pb-2.5 border-b border-gray-100 text-gray-800">
            <h2 className="text-sm font-bold text-gray-900">
              {mode === "edit" ? "Edit Informasi Course" : "Form Course Baru"}
            </h2>
            <p className="text-[11px] text-gray-500">
              Lengkapi informasi utama modul materi pelatihan
            </p>
          </div>

          {/* Title */}
          <FormField
            label="Judul Course"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Orientasi Pegawai Baru 2026"
          />

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Deskripsi Course
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan cakupan modul, materi yang akan dipelajari, serta target kemampuan pegawai..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#e0542c]/20 focus:border-[#e0542c] transition-all resize-none"
            />
          </div>

          {/* Image & Icon URL Grid (Col-6 each) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="URL Banner / Cover Image"
              type="text"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
            />

            <FormField
              label="URL Icon / Badge Logo (Opsional)"
              type="text"
              value={iconUrl}
              onChange={(e) => setIconUrl(e.target.value)}
              placeholder="https://... atau nama ikon"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate("Training")}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              style={{ backgroundColor: THEME_COLORS.hex.primary }}
              className="px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-md shadow-[#e0542c]/20 hover:opacity-90 active:scale-98 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              <span>{mode === "edit" ? "Simpan Perubahan" : "Buat Course"}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Live Card Preview & Settings */}
        <div className="space-y-6">
          {/* Card Preview Box */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              Pratinjau Modul
            </h3>

            {/* Simulated Course Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden flex flex-col relative">
              <div className="h-36 w-full bg-gradient-to-r from-[#1e2a4a] to-[#2a3b68] relative overflow-hidden flex items-center justify-center">
                {thumbnailUrl.trim() ? (
                  <img
                    src={thumbnailUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <BookOpen size={40} className="text-white/20" />
                )}

                {/* Status Badge */}
                <div className="absolute top-2.5 right-2.5 z-10">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold shadow-xs backdrop-blur-xs ${
                      isPublished
                        ? "bg-emerald-600/90 text-white"
                        : "bg-zinc-700/90 text-white"
                    }`}
                  >
                    {isPublished ? "Publik" : "Disembunyikan"}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-2">
                <h4 className="text-xs font-bold text-gray-900 line-clamp-1">
                  {title.trim() || "Judul Course"}
                </h4>
                <p className="text-[11px] text-gray-500 line-clamp-2">
                  {description.trim() || "Deskripsi modul course akan tampil di sini..."}
                </p>
              </div>
            </div>
          </div>

          {/* Publication Status Card */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              Status Publikasi
            </h3>
            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-xs font-bold text-gray-800 block">
                  {isPublished ? "Publik (Tampil)" : "Disembunyikan (Sembunyi)"}
                </span>
                <span className="text-[10px] text-gray-500 block leading-snug max-w-[180px]">
                  {isPublished
                    ? "Modul ini tampil dan dapat diakses oleh karyawan."
                    : "Modul ini disembunyikan dari katalog karyawan."}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsPublished(!isPublished)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isPublished ? "bg-[#e0542c]" : "bg-gray-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isPublished ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* LESSONS SECTION (Available both in add & edit mode) */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Daftar Materi Pelatihan ({lessons.length})
            </h3>
            <p className="text-[11px] text-gray-500">
              {mode === "add"
                ? "Tambahkan materi ke dalam draf course ini sebelum disimpan."
                : "Tarik (drag & drop) baris di bawah untuk mengubah urutan materi secara otomatis."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddLesson}
            style={{ backgroundColor: THEME_COLORS.hex.primary }}
            className="px-3.5 py-2 rounded-xl text-white text-xs font-bold shadow-md shadow-[#e0542c]/20 hover:opacity-90 active:scale-98 transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus size={15} />
            <span>Tambah Materi</span>
          </button>
        </div>

        {/* Lessons List / Empty State */}
        {lessons.length === 0 ? (
          <div className="py-10 text-center flex flex-col items-center justify-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            <Layers size={32} className="text-gray-300 mb-2" />
            <p className="text-xs font-bold text-gray-700">Belum Ada Materi Pelatihan</p>
            <p className="text-[11px] text-gray-500 max-w-xs mt-0.5 mb-3">
              Isi judul course di atas lalu klik "+ Tambah Materi" untuk menambahkan materi pertama.
            </p>
            <button
              type="button"
              onClick={handleOpenAddLesson}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#e0542c] bg-[#e0542c]/10 hover:bg-[#e0542c]/20 transition-all cursor-pointer"
            >
              + Tambah Materi Pertama
            </button>
          </div>
        ) : (
          <ReusableTable
            columns={lessonColumns}
            data={lessons}
            showSearch={false}
            showPagination={false}
            isReorderable={true}
            onReorder={handleReorderLessons}
            className="border border-gray-200/80 shadow-xs"
          />
        )}
      </div>

      {/* Modal Add / Edit Lesson */}
      <LessonModal
        isOpen={lessonModal.isOpen}
        mode={lessonModal.mode}
        initialData={lessonModal.initialData}
        onSubmit={handleSubmitLesson}
        onClose={() => setLessonModal({ ...lessonModal, isOpen: false })}
        loading={submittingLesson}
      />

      {/* Lesson Chunk Builder Drawer */}
      <LessonChunkBuilder
        lessonId={builderLessonId}
        isOpen={builderOpen}
        onClose={() => {
          setBuilderOpen(false);
          setBuilderLessonId(null);
          loadCourseDetail();
        }}
      />

      {/* Confirmation Modal Delete Lesson */}
      <ConfirmationModal
        isOpen={confirmDeleteLesson.isOpen}
        onClose={() => setConfirmDeleteLesson({ isOpen: false, id: null, title: "" })}
        onConfirm={handleConfirmDeleteLesson}
        title="Hapus Materi"
        message={`Apakah Anda yakin ingin menghapus materi "${confirmDeleteLesson.title}"?`}
        variant="danger"
        loading={deletingLesson}
      />

      {/* Confirmation Modal Reorder Lessons */}
      <ConfirmationModal
        isOpen={confirmReorderModalOpen}
        onClose={handleCancelReorder}
        onConfirm={handleConfirmReorder}
        title="Konfirmasi Urutan Materi"
        message="Apakah Anda yakin ingin menyimpan perubahan urutan materi pelatihan ini?"
        confirmText="Ya, Simpan Urutan"
        cancelText="Batal"
        variant="warning"
        loading={submittingReorder}
      />

      {/* Confirmation Modal Submit Course with Empty Lessons */}
      <ConfirmationModal
        isOpen={confirmEmptyLessonsModalOpen}
        onClose={() => setConfirmEmptyLessonsModalOpen(false)}
        onConfirm={executeSubmitCourse}
        title="Simpan Course Tanpa Materi?"
        message="Modul course ini belum memiliki materi pelatihan. Apakah Anda yakin ingin menyimpan course ini sekarang?"
        confirmText="Ya, Simpan Course"
        cancelText="Batal"
        variant="warning"
        loading={submitting}
      />
    </div>
  );
}
