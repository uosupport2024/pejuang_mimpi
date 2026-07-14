import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { ReusableTable } from "@/shared/components/ui/reusable-table";
import { fetchShifts, createShift, updateShift, deleteShift, type BackendShift } from "../api/shift";
import { ConfirmationModal } from "@/shared/components/ui/confirmation-modal";

export function ShiftPage() {
  const [shifts, setShifts] = useState<BackendShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: number | null }>({
    isOpen: false,
    id: null,
  });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedShift, setSelectedShift] = useState<BackendShift | null>(null);
  const [formData, setFormData] = useState({
    nama_shift: "",
    jam_masuk: "",
    jam_keluar: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const loadShifts = async () => {
    try {
      setLoading(true);
      const data = await fetchShifts();
      setShifts(data);
    } catch (err: any) {
      toast.error(err.message || "Gagal memuat data shift");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShifts();
  }, []);

  const handleAddClick = () => {
    setModalMode("add");
    setSelectedShift(null);
    setFormData({
      nama_shift: "",
      jam_masuk: "08:00",
      jam_keluar: "17:00",
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (shift: BackendShift) => {
    setModalMode("edit");
    setSelectedShift(shift);
    setFormData({
      nama_shift: shift.nama_shift,
      jam_masuk: shift.jam_masuk,
      jam_keluar: shift.jam_keluar,
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setConfirmDelete({ isOpen: true, id });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete.id) return;
    try {
      setSubmitting(true);
      await deleteShift(confirmDelete.id);
      toast.success("Shift berhasil dihapus");
      setConfirmDelete({ isOpen: false, id: null });
      loadShifts();
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus shift");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_shift.trim()) {
      toast.error("Nama shift harus diisi");
      return;
    }

    try {
      setSubmitting(true);
      if (modalMode === "add") {
        await createShift(formData);
        toast.success("Shift baru berhasil ditambahkan");
      } else if (modalMode === "edit" && selectedShift) {
        await updateShift(selectedShift.id, formData);
        toast.success("Shift berhasil diupdate");
      }
      setIsModalOpen(false);
      loadShifts();
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan shift");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: <span className="text-center block w-full text-xs font-semibold text-gray-500 tracking-wider">No.</span>,
      accessorKey: "id",
      cell: (_row: BackendShift, index: number) => (
        <span className="text-center block text-xs text-gray-600">{index + 1}.</span>
      ),
      className: "w-16 text-center",
    },
    {
      header: <span className="text-left block w-full text-xs font-semibold text-gray-500 tracking-wider">Nama Shift</span>,
      accessorKey: "nama_shift",
      cell: (row: BackendShift) => (
        <span className="text-left block text-xs font-semibold text-gray-800">{row.nama_shift}</span>
      ),
    },
    {
      header: <span className="text-left block w-full text-xs font-semibold text-gray-500 tracking-wider">Jam Masuk</span>,
      accessorKey: "jam_masuk",
      cell: (row: BackendShift) => (
        <span className="text-left block font-mono text-xs text-gray-600">{row.jam_masuk}</span>
      ),
    },
    {
      header: <span className="text-left block w-full text-xs font-semibold text-gray-500 tracking-wider">Jam Keluar</span>,
      accessorKey: "jam_keluar",
      cell: (row: BackendShift) => (
        <span className="text-left block font-mono text-xs text-gray-600">{row.jam_keluar}</span>
      ),
    },
    {
      header: <span className="text-center block w-full text-xs font-semibold text-gray-500 tracking-wider">Actions</span>,
      cell: (row: BackendShift) => {
        if (row.nama_shift.toLowerCase() === "libur") {
          return (
            <span className="flex justify-center">
              <span className="px-2 py-0.5 text-[10px] font-semibold text-[#516b46] bg-[#7FA46D]/10 border border-[#7FA46D]/20 rounded-full">
                Default Shift
              </span>
            </span>
          );
        }
        return (
          <div className="flex justify-center gap-2">
            <button
              onClick={() => handleEditClick(row)}
              className="p-1.5 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-md transition-colors cursor-pointer"
              title="Edit"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={() => handleDeleteClick(row.id)}
              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="w-full space-y-6">
      <ReusableTable
        columns={columns}
        data={shifts}
        loading={loading}
        className="border border-gray-200/80 shadow-xs"
        rowClassName="hover:bg-zinc-50/30"
        showSearch={true}
        searchPlaceholder="Cari nama shift..."
        emptyMessage="Tidak ada data shift."
        addButtonText="Input Shift"
        addButtonIcon={<Plus size={16} />}
        onAddClick={handleAddClick}
        addButtonColor="success"
      />

      {/* Add / Edit Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-lg max-w-sm w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-xs font-bold text-gray-800">
                {modalMode === "add" ? "Tambah Shift Baru" : "Edit Shift"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-650 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-500">Nama Shift</label>
                <input
                  type="text"
                  required
                  value={formData.nama_shift}
                  onChange={(e) => setFormData({ ...formData, nama_shift: e.target.value })}
                  placeholder="Contoh: Shift Pagi, Shift Malam"
                  className="w-full h-9 px-3 py-2 text-xs bg-zinc-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7FA46D] focus:border-[#7FA46D] text-gray-700 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-500">Jam Masuk</label>
                  <input
                    type="time"
                    required
                    value={formData.jam_masuk}
                    onChange={(e) => setFormData({ ...formData, jam_masuk: e.target.value })}
                    className="w-full h-9 px-3 py-2 text-xs bg-zinc-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7FA46D] focus:border-[#7FA46D] text-gray-700 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-500">Jam Keluar</label>
                  <input
                    type="time"
                    required
                    value={formData.jam_keluar}
                    onChange={(e) => setFormData({ ...formData, jam_keluar: e.target.value })}
                    className="w-full h-9 px-3 py-2 text-xs bg-zinc-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7FA46D] focus:border-[#7FA46D] text-gray-700 font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#7FA46D] hover:bg-[#6e935d] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: null })}
        onConfirm={handleConfirmDelete}
        title="Hapus Shift"
        message="Apakah Anda yakin ingin menghapus shift ini? Tindakan ini tidak dapat dibatalkan."
        variant="danger"
        loading={submitting}
      />
    </div>
  );
}
