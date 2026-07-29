import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  Search,
  LayoutGrid,
  List,
  Sparkles,
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
        <div className="flex items-center gap-3 py-1">
          <div className="w-10 h-10 rounded-md bg-gray-100 border border-gray-200 shrink-0 overflow-hidden flex items-center justify-center text-[#e0542c]">
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
            <span className="text-xs font-bold text-gray-800 block line-clamp-1">{row.title}</span>
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
            onClick={() => handleEditOpen(row)}
            className="p-1.5 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
            title="Edit Pelatihan"
          >
            <Edit2 size={15} />
          </button>
          <button
            onClick={() => handleDeleteClick(row)}
            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Hapus Pelatihan"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
      className: "w-32 text-center",
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Top Banner Stats Component */}
      <CourseStatsBanner
        total={stats.total}
        published={stats.published}
        draft={stats.draft}
      />

      {/* Control Bar: Search, Filters, View Mode, Add Button */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        {/* Left: Compact Search & Status Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Compact Search Box */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pelatihan..."
              className="w-full pl-9 pr-3.5 py-2 rounded-md border border-gray-200 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#e0542c]/20 focus:border-[#e0542c] transition-all bg-gray-50/50"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          </div>

          {/* Status Filter Select */}
          <Select
            value={statusFilter}
            onValueChange={(val: any) => setStatusFilter(val as "all" | "published" | "draft")}
          >
            <SelectTrigger className="w-48 text-xs font-bold bg-gray-50/50 border-gray-200 rounded-md h-9">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status ({courses.length})</SelectItem>
              <SelectItem value="published">Publik ({stats.published})</SelectItem>
              <SelectItem value="draft">Draft ({stats.draft})</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Right: View Mode Toggle & Add Button */}
        <div className="flex items-center gap-3 shrink-0 justify-end">
          {/* View Switcher */}
          <div className="flex bg-gray-100/80 p-1 rounded-md border border-gray-200/50">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-[#e0542c] shadow-xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              title="Tampilan Grid Card"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-[#e0542c] shadow-xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              title="Tampilan Tabel"
            >
              <List size={16} />
            </button>
          </div>

          {/* Add Course Button */}
          <button
            onClick={handleCreateOpen}
            style={{ backgroundColor: THEME_COLORS.hex.primary }}
            className="px-4 py-2 rounded-md text-white text-xs font-bold shadow-md shadow-[#e0542c]/20 hover:opacity-90 active:scale-98 transition-all cursor-pointer flex items-center gap-2 shrink-0"
          >
            <Plus size={16} />
            <span>Pelatihan Baru</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        /* SKELETON LOADING STATE */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 space-y-4 overflow-hidden"
            >
              <Skeleton className="h-40 w-full rounded-md" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-3 w-full rounded-md" />
                <Skeleton className="h-3 w-5/6 rounded-md" />
              </div>
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <Skeleton className="h-3 w-20 rounded-md" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-6 rounded-lg" />
                  <Skeleton className="h-6 w-6 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 flex flex-col items-center justify-center text-center shadow-xs min-h-[320px]">
          <div className="w-14 h-14 rounded-2xl bg-[#e0542c]/10 text-[#e0542c] flex items-center justify-center mb-4">
            <Sparkles size={24} />
          </div>
          <h3 className="text-base font-bold text-gray-800 mb-1">Belum Ada Pelatihan</h3>
          <p className="text-xs text-gray-500 max-w-sm mb-4">
            {searchQuery
              ? `Tidak ditemukan pelatihan dengan kata kunci "${searchQuery}".`
              : "Mulai buat materi modul pelatihan pertama untuk pegawai Anda."}
          </p>
          {!searchQuery && (
            <button
              onClick={handleCreateOpen}
              style={{ backgroundColor: THEME_COLORS.hex.primary }}
              className="px-4 py-2 rounded-md text-white text-xs font-bold shadow-md shadow-[#e0542c]/20 hover:opacity-90 transition-all cursor-pointer flex items-center gap-2"
            >
              <Plus size={16} />
              <span>Tambah Pelatihan</span>
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW WITH PAGINATION */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEdit={handleEditOpen}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>

          {/* Grid View Pagination Footer */}
          {totalPages > 1 && (
            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
              <div className="text-xs text-gray-500 font-medium">
                Menampilkan <span className="text-gray-900 font-bold">{(currentPage - 1) * perPage + 1}</span> sampai{" "}
                <span className="text-gray-900 font-bold">{Math.min(currentPage * perPage, totalItems)}</span> dari{" "}
                <span className="text-gray-900 font-bold">{totalItems}</span> pelatihan
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  className="w-8 h-8 flex items-center justify-center text-[11px] font-semibold rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  &lt;&lt;
                </button>
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
                    className={`w-8 h-8 flex items-center justify-center text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                      currentPage === page
                        ? "bg-[#e0542c] text-white shadow-xs"
                        : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
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
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="w-8 h-8 flex items-center justify-center text-[11px] font-semibold rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  &gt;&gt;
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* TABLE VIEW WITH PAGINATION */
        <ReusableTable
          columns={columns}
          data={filteredCourses}
          loading={loading}
          className="border border-gray-200/80 shadow-xs"
          rowClassName="hover:bg-zinc-50/40"
          showSearch={false}
          emptyMessage="Tidak ada data pelatihan."
          showPagination={true}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={perPage}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: null, title: "" })}
        onConfirm={handleConfirmDelete}
        title="Hapus Pelatihan"
        message={`Apakah Anda yakin ingin menghapus modul pelatihan "${confirmDelete.title}"? Tindakan ini tidak dapat dibatalkan.`}
        variant="danger"
        loading={submitting}
      />
    </div>
  );
}
