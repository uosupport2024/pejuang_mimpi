import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Check } from "lucide-react";
import { toast } from "sonner";
import { ReusableTable } from "@/shared/components/ui/reusable-table";
import {
  fetchJabatans,
  createJabatan,
  updateJabatan,
  deleteJabatan,
  createGolongan,
  updateGolongan,
  deleteGolongan,
  type BackendJabatan,
  type BackendGolongan,
} from "../api/organization";
import { ConfirmationModal } from "@/shared/components/ui/confirmation-modal";

export function OrganizationPage() {
  const [divisions, setDivisions] = useState<BackendJabatan[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedDivision, setSelectedDivision] = useState<BackendJabatan | null>(null);
  const [formData, setFormData] = useState({
    nama_jabatan: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete confirmation state
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    id: number | null;
    name: string;
  }>({
    isOpen: false,
    id: null,
    name: "",
  });

  // Golongan (posisi) management — only relevant in edit mode
  const [golongans, setGolongans] = useState<BackendGolongan[]>([]);
  const [newGolonganName, setNewGolonganName] = useState("");
  const [addingGolongan, setAddingGolongan] = useState(false);
  const [editingGolonganId, setEditingGolonganId] = useState<number | null>(null);
  const [editingGolonganName, setEditingGolonganName] = useState("");
  const [savingGolonganEdit, setSavingGolonganEdit] = useState(false);
  const [confirmDeleteGolongan, setConfirmDeleteGolongan] = useState<{
    isOpen: boolean;
    id: number | null;
    name: string;
  }>({
    isOpen: false,
    id: null,
    name: "",
  });
  const [deletingGolongan, setDeletingGolongan] = useState(false);

  const loadDivisions = async () => {
    try {
      setLoading(true);
      const data = await fetchJabatans();
      setDivisions(data);
    } catch (err: any) {
      toast.error(err.message || "Gagal memuat data divisi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDivisions();
  }, []);

  const handleAddClick = () => {
    setModalMode("add");
    setSelectedDivision(null);
    setFormData({
      nama_jabatan: "",
    });
    setGolongans([]);
    setNewGolonganName("");
    setEditingGolonganId(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (division: BackendJabatan) => {
    setModalMode("edit");
    setSelectedDivision(division);
    setFormData({
      nama_jabatan: division.nama_jabatan,
    });
    setGolongans(division.golongans || []);
    setNewGolonganName("");
    setEditingGolonganId(null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: number, name: string) => {
    setConfirmDelete({
      isOpen: true,
      id,
      name,
    });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete.id) return;
    try {
      setSubmitting(true);
      await deleteJabatan(confirmDelete.id);
      toast.success(`Divisi "${confirmDelete.name}" berhasil dihapus`);
      setConfirmDelete({ isOpen: false, id: null, name: "" });
      loadDivisions();
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus divisi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddGolongan = async () => {
    if (!selectedDivision) return;
    if (!newGolonganName.trim()) {
      toast.error("Nama golongan/posisi harus diisi");
      return;
    }
    try {
      setAddingGolongan(true);
      const created = await createGolongan(selectedDivision.id, newGolonganName.trim());
      setGolongans((prev) => [...prev, created]);
      setNewGolonganName("");
      toast.success("Golongan/posisi berhasil ditambahkan");
    } catch (err: any) {
      toast.error(err.message || "Gagal menambahkan golongan/posisi");
    } finally {
      setAddingGolongan(false);
    }
  };

  const handleStartEditGolongan = (golongan: BackendGolongan) => {
    setEditingGolonganId(golongan.id);
    setEditingGolonganName(golongan.name);
  };

  const handleCancelEditGolongan = () => {
    setEditingGolonganId(null);
    setEditingGolonganName("");
  };

  const handleSaveEditGolongan = async () => {
    if (!editingGolonganId) return;
    if (!editingGolonganName.trim()) {
      toast.error("Nama golongan/posisi harus diisi");
      return;
    }
    try {
      setSavingGolonganEdit(true);
      const updated = await updateGolongan(editingGolonganId, editingGolonganName.trim());
      setGolongans((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
      handleCancelEditGolongan();
      toast.success("Golongan/posisi berhasil diperbarui");
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui golongan/posisi");
    } finally {
      setSavingGolonganEdit(false);
    }
  };

  const handleDeleteGolonganClick = (golongan: BackendGolongan) => {
    setConfirmDeleteGolongan({ isOpen: true, id: golongan.id, name: golongan.name });
  };

  const handleConfirmDeleteGolongan = async () => {
    if (!confirmDeleteGolongan.id) return;
    try {
      setDeletingGolongan(true);
      await deleteGolongan(confirmDeleteGolongan.id);
      setGolongans((prev) => prev.filter((g) => g.id !== confirmDeleteGolongan.id));
      toast.success(`Golongan/posisi "${confirmDeleteGolongan.name}" berhasil dihapus`);
      setConfirmDeleteGolongan({ isOpen: false, id: null, name: "" });
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus golongan/posisi");
    } finally {
      setDeletingGolongan(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_jabatan.trim()) {
      toast.error("Nama divisi/jabatan harus diisi");
      return;
    }

    try {
      setSubmitting(true);
      if (modalMode === "add") {
        await createJabatan(formData);
        toast.success("Divisi baru berhasil ditambahkan");
      } else if (modalMode === "edit" && selectedDivision) {
        await updateJabatan(selectedDivision.id, formData);
        toast.success("Divisi berhasil diupdate");
      }
      setIsModalOpen(false);
      loadDivisions();
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan divisi");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: <span className="text-center block w-full text-xs font-semibold text-gray-500 tracking-wider">No.</span>,
      accessorKey: "id",
      cell: (_row: BackendJabatan, index: number) => (
        <span className="text-center block text-xs text-gray-600">{index + 1}.</span>
      ),
      className: "w-16 text-center",
    },
    {
      header: <span className="text-left block w-full text-xs font-semibold text-gray-500 tracking-wider">Nama Divisi / Jabatan</span>,
      accessorKey: "nama_jabatan",
      cell: (row: BackendJabatan) => (
        <div className="flex items-center gap-2">
          <span className="text-left block text-xs font-semibold text-gray-800">{row.nama_jabatan}</span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-gray-500">
            {row.golongans?.length ?? 0} Posisi
          </span>
        </div>
      ),
    },
    {
      header: "Aksi",
      cell: (row: BackendJabatan) => (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => handleEditClick(row)}
            className="p-1.5 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-md transition-colors cursor-pointer"
            title="Edit"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => handleDeleteClick(row.id, row.nama_jabatan)}
            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full space-y-6">
      <ReusableTable
        columns={columns}
        data={divisions}
        loading={loading}
        className="border border-gray-200/80 shadow-xs"
        rowClassName="hover:bg-zinc-50/30"
        showSearch={true}
        searchPlaceholder="Cari nama divisi..."
        emptyMessage="Tidak ada data divisi."
        addButtonText="Input Divisi"
        addButtonIcon={<Plus size={16} />}
        onAddClick={handleAddClick}
        addButtonColor="success"
      />

      {/* Add / Edit Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-lg max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-xs font-bold text-gray-800">
                {modalMode === "add" ? "Tambah Divisi Baru" : "Edit Divisi"}
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
                <label className="text-[11px] font-semibold text-gray-500">Nama Divisi / Jabatan</label>
                <input
                  type="text"
                  required
                  value={formData.nama_jabatan}
                  onChange={(e) => setFormData({ nama_jabatan: e.target.value })}
                  placeholder="Contoh: HRD, Staff IT, Marketing"
                  className="w-full h-9 px-3 py-2 text-xs bg-zinc-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#e0542c] focus:border-[#e0542c] text-gray-700 font-medium"
                />
              </div>

              {modalMode === "edit" && selectedDivision && (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <label className="text-[11px] font-semibold text-gray-500">Golongan / Posisi</label>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newGolonganName}
                      onChange={(e) => setNewGolonganName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddGolongan();
                        }
                      }}
                      placeholder="Contoh: Manager, Senior Staff, Staff"
                      className="flex-1 h-9 px-3 py-2 text-xs bg-zinc-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#e0542c] focus:border-[#e0542c] text-gray-700 font-medium"
                    />
                    <button
                      type="button"
                      onClick={handleAddGolongan}
                      disabled={addingGolongan}
                      className="px-3 h-9 text-xs font-bold text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1 shrink-0"
                      style={{ background: "var(--theme-button, #e0542c)" }}
                    >
                      <Plus size={14} /> Tambah
                    </button>
                  </div>

                  {golongans.length === 0 ? (
                    <p className="text-[11px] text-gray-400 py-2 text-center">Belum ada golongan/posisi untuk divisi ini.</p>
                  ) : (
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {golongans.map((g) => (
                        <div key={g.id} className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-zinc-50 rounded-lg">
                          {editingGolonganId === g.id ? (
                            <>
                              <input
                                type="text"
                                autoFocus
                                value={editingGolonganName}
                                onChange={(e) => setEditingGolonganName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleSaveEditGolongan();
                                  }
                                  if (e.key === "Escape") handleCancelEditGolongan();
                                }}
                                className="flex-1 h-7 px-2 text-xs bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e0542c] focus:border-[#e0542c] text-gray-700 font-medium"
                              />
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={handleSaveEditGolongan}
                                  disabled={savingGolonganEdit}
                                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                                  title="Simpan"
                                >
                                  <Check size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCancelEditGolongan}
                                  className="p-1 text-gray-400 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                                  title="Batal"
                                >
                                  <X size={13} />
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <span className="text-xs font-semibold text-gray-700 truncate">{g.name}</span>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleStartEditGolongan(g)}
                                  className="p-1 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-md transition-colors cursor-pointer"
                                  title="Edit"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteGolonganClick(g)}
                                  className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                                  title="Hapus"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

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
                  style={{ background: "var(--theme-button, #e0542c)" }}
                  className="px-4 py-2 text-xs font-bold text-white hover:brightness-105 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reusable Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: null, name: "" })}
        onConfirm={handleConfirmDelete}
        title="Hapus Divisi"
        message={`Apakah Anda yakin ingin menghapus divisi "${confirmDelete.name}"? Pegawai yang terhubung dengan divisi ini mungkin akan kehilangan referensi divisi.`}
        variant="danger"
        loading={submitting}
      />

      <ConfirmationModal
        isOpen={confirmDeleteGolongan.isOpen}
        onClose={() => setConfirmDeleteGolongan({ isOpen: false, id: null, name: "" })}
        onConfirm={handleConfirmDeleteGolongan}
        title="Hapus Golongan/Posisi"
        message={`Apakah Anda yakin ingin menghapus golongan/posisi "${confirmDeleteGolongan.name}"? Ini akan gagal jika masih ada pegawai dengan kontrak yang menggunakan posisi ini.`}
        variant="danger"
        loading={deletingGolongan}
      />
    </div>
  );
}
