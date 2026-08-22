import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Trash2,
  BookOpen,
  Search,
  LayoutGrid,
  List,
  Sparkles,
  Layers,
  Edit3,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/shared/router/router";
import { ReusableTable } from "@/shared/components/ui/reusable-table";
import { ConfirmationModal } from "@/shared/components/ui/confirmation-modal";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { THEME_COLORS } from "@/shared/constants/colors";
import { CourseCard } from "../components/course-card";
import { CourseStatsBanner } from "../components/course-stats-banner";
import {
  fetchCourses,
  deleteCourse,
  type Course
} from "../api/course";

export function TrainingPage() {
  const { navigate } = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [backendStats, setBackendStats] = useState<{
    total: number;
    published: number;
    draft: number;
  }>({ total: 0, published: 0, draft: 0 });

  // Delete confirmation modal state
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    id: number | null;
    title: string;
  }>({
    isOpen: false,
    id: null,
    title: "",
  });

  const loadCourses = async () => {
    try {
      setLoading(true);
      const res = await fetchCourses(currentPage, perPage, searchQuery, statusFilter);
      setCourses(res.data);
      setCurrentPage(res.current_page);
      setTotalPages(res.last_page);
      setTotalItems(res.total);
      if (res.stats) {
        setBackendStats(res.stats);
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal memuat data pelatihan");
    } finally {
      setLoading(false);
    }
  };

  // Reset page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Fetch courses on page/search/status change
  useEffect(() => {
    loadCourses();
  }, [currentPage, searchQuery, statusFilter]);

  // Filtered courses based on statusFilter tab
  const filteredCourses = courses;

  // Stats calculation
  const stats = useMemo(() => {
    return backendStats;
  }, [backendStats]);

  // Handlers for page navigation
  const handleCreateOpen = () => {
    navigate("TrainingAdd");
  };

  const handleEditOpen = (course: Course) => {
    navigate("TrainingEdit", { courseId: course.id });
  };

  const handleDetailOpen = (course: Course) => {
    navigate("TrainingDetail", { courseId: course.id });
  };

  const handleDeleteClick = (course: Course) => {
    setConfirmDelete({
      isOpen: true,
      id: course.id,
      title: course.title,
    });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete.id) return;
    try {
      setSubmitting(true);
      await deleteCourse(confirmDelete.id);
      toast.success(`Pelatihan "${confirmDelete.title}" berhasil dihapus`);
      setConfirmDelete({ isOpen: false, id: null, title: "" });
      loadCourses();
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus pelatihan");
    } finally {
      setSubmitting(false);
    }
  };

  // Columns for Table View
  const columns = [
    {
      header: <span className="text-center block w-full text-xs font-semibold text-gray-500 tracking-wider">No.</span>,
      cell: (_row: Course, index: number) => (
        <span className="text-center block text-xs text-gray-600">
          {(currentPage - 1) * perPage + index + 1}.
        </span>
      ),
      className: "w-12 text-center",
    },
    {
      header: <span className="text-left block w-full text-xs font-semibold text-gray-500 tracking-wider">Pelatihan</span>,
      cell: (row: Course) => (
        <div
          onClick={() => handleDetailOpen(row)}
          className="flex items-center gap-3 py-1 cursor-pointer group/row"
        >
          <div
            style={{ color: THEME_COLORS.hex.primary }}
            className="w-10 h-10 rounded-md bg-gray-100 border border-gray-200 shrink-0 overflow-hidden flex items-center justify-center transition-colors"
          >
            {row.thumbnail_url ? (
              <img
                src={row.thumbnail_url}
                alt={row.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <BookOpen size={18} />
            )}
          </div>
          <div>
            <span className="text-xs font-bold text-gray-800 block line-clamp-1 group-hover/row:text-orange-600 transition-colors">{row.title}</span>
            <span className="text-[11px] text-gray-500 line-clamp-1 max-w-[280px]">
              {row.description || "Tidak ada deskripsi"}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: <span className="text-center block w-full text-xs font-semibold text-gray-500 tracking-wider">Status</span>,
      cell: (row: Course) => (
        <div className="flex justify-center">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
              row.is_published
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                : "bg-red-50 text-red-700 border border-red-200/80"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                row.is_published ? "bg-emerald-500" : "bg-red-500"
              }`}
            />
            {row.is_published ? "Publik" : "Draft"}
          </span>
        </div>
      ),
      className: "w-28 text-center",
    },
    {
      header: <span className="text-center block w-full text-xs font-semibold text-gray-500 tracking-wider">Materi / Lesson</span>,
      cell: (row: Course) => (
        <span className="text-center block text-xs font-semibold text-gray-700">
          {row.lessons_count || row.lessons?.length || 0} Materi
        </span>
      ),
      className: "w-32 text-center",
    },
    {
      header: <span className="text-center block w-full text-xs font-semibold text-gray-500 tracking-wider">Aksi</span>,
      cell: (row: Course) => (
        <div className="flex justify-center gap-1.5">
          <button
            onClick={() => handleDetailOpen(row)}
            className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
            title="Kelola Materi Pelatihan"
          >
            <Layers size={14} />
          </button>
          <button
            onClick={() => handleEditOpen(row)}
            className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
            title="Ubah Informasi"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={() => handleDeleteClick(row)}
            className="p-1.5 hover:bg-red-50 rounded-md text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
            title="Hapus Pelatihan"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
      className: "w-32 text-center",
    },
  ];

  return (
    <div className="space-y-6">
      <CourseStatsBanner total={stats.total} published={stats.published} draft={stats.draft} />

      <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Cari judul atau deskripsi pelatihan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-md border border-gray-200 text-xs text-gray-800 focus:outline-none transition-all bg-gray-50/50"
            />
          </div>
          <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val)}>
            <SelectTrigger className="w-36 text-xs h-9 bg-gray-50/50">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">Semua Status</SelectItem>
              <SelectItem value="published" className="text-xs">Publik</SelectItem>
              <SelectItem value="draft" className="text-xs">Draf</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3 shrink-0 justify-end">
          <div className="flex bg-gray-100/80 p-1 rounded-md border border-gray-200/50">
            <button
              onClick={() => setViewMode("grid")}
              style={viewMode === "grid" ? { color: THEME_COLORS.hex.primary } : undefined}
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                viewMode === "grid" ? "bg-white shadow-xs" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              style={viewMode === "table" ? { color: THEME_COLORS.hex.primary } : undefined}
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                viewMode === "table" ? "bg-white shadow-xs" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <List size={16} />
            </button>
          </div>
          <button
            onClick={handleCreateOpen}
            style={{ backgroundColor: THEME_COLORS.hex.primary }}
            className="px-4 py-2 rounded-md text-white text-xs font-bold shadow-md hover:opacity-90 active:scale-98 transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Pelatihan Baru</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 rounded-2xl" />)}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 flex flex-col items-center justify-center text-center shadow-xs min-h-[320px]">
          <div
            style={{ backgroundColor: `${THEME_COLORS.hex.primary}1A`, color: THEME_COLORS.hex.primary }}
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          >
            <Sparkles size={24} />
          </div>
          <h3 className="text-base font-bold text-gray-800 mb-1">Belum Ada Pelatihan</h3>
          <p className="text-xs text-gray-500 max-w-sm mb-4">
            {searchQuery ? `Tidak ditemukan pelatihan dengan kata kunci "${searchQuery}".` : "Mulai buat materi modul pelatihan pertama untuk pegawai Anda."}
          </p>
          {!searchQuery && (
            <button
              onClick={handleCreateOpen}
              style={{ backgroundColor: THEME_COLORS.hex.primary }}
              className="px-4 py-2 rounded-md text-white text-xs font-bold shadow-md hover:opacity-90 transition-all cursor-pointer flex items-center gap-2"
            >
              <Plus size={16} />
              <span>Tambah Pelatihan</span>
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEdit={handleEditOpen}
                onDelete={handleDeleteClick}
                onViewDetail={handleDetailOpen}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-5 py-3 rounded-xl border border-gray-200/80 shadow-xs">
              <span className="text-xs text-gray-500 font-medium">
                Menampilkan <span className="font-bold text-gray-700">{(currentPage - 1) * perPage + 1}</span> -{" "}
                <span className="font-bold text-gray-700">{Math.min(currentPage * perPage, totalItems)}</span>{" "}
                dari <span className="font-bold text-gray-700">{totalItems}</span> pelatihan
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="w-8 h-8 flex items-center justify-center text-[11px] font-semibold rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  &lt;
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={currentPage === page ? { backgroundColor: THEME_COLORS.hex.primary } : undefined}
                    className={`w-8 h-8 flex items-center justify-center text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                      currentPage === page ? "text-white shadow-xs" : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className="w-8 h-8 flex items-center justify-center text-[11px] font-semibold rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  &gt;
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <ReusableTable
          columns={columns}
          data={filteredCourses}
          loading={loading}
          showSearch={false}
          showPagination={true}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={perPage}
          onPageChange={setCurrentPage}
          emptyMessage="Tidak ada modul pelatihan."
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: null, title: "" })}
        onConfirm={handleConfirmDelete}
        title="Hapus Pelatihan"
        message={`Apakah Anda yakin ingin menghapus modul pelatihan "${confirmDelete.title}"? Seluruh bab materi dan kuis di dalamnya akan terhapus.`}
        confirmText={submitting ? "Menghapus..." : "Hapus"}
        cancelText="Batal"
        variant="danger"
        loading={submitting}
      />
    </div>
  );
}
