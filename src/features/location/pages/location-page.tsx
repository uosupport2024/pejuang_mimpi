import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ReusableTable } from "@/shared/components/ui/reusable-table";
import { fetchLocations, deleteLocation, type BackendLocation } from "../api/location";
import { ConfirmationModal } from "@/shared/components/ui/confirmation-modal";
import { useRouter } from "@/shared/router/router";

export function LocationPage() {
  const { navigate } = useRouter();
  const [locations, setLocations] = useState<BackendLocation[]>([]);
  const [loading, setLoading] = useState(true);
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

  const loadLocations = async () => {
    try {
      setLoading(true);
      const data = await fetchLocations();
      setLocations(data);
    } catch (err: any) {
      toast.error(err.message || "Gagal memuat data lokasi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

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
      await deleteLocation(confirmDelete.id);
      toast.success(`Lokasi "${confirmDelete.name}" berhasil dihapus`);
      setConfirmDelete({ isOpen: false, id: null, name: "" });
      loadLocations();
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus lokasi");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: <span className="text-center block w-full text-xs font-semibold text-gray-500 tracking-wider">No.</span>,
      cell: (_row: BackendLocation, index: number) => (
        <span className="text-center block text-xs text-gray-600">{index + 1}.</span>
      ),
      className: "w-16 text-center",
    },
    {
      header: <span className="text-left block w-full text-xs font-semibold text-gray-500 tracking-wider">Nama Lokasi</span>,
      accessorKey: "nama_lokasi",
      cell: (row: BackendLocation) => (
        <span className="text-left block text-xs font-semibold text-gray-800">{row.nama_lokasi}</span>
      ),
    },
    {
      header: <span className="text-left block w-full text-xs font-semibold text-gray-500 tracking-wider">Koordinat</span>,
      cell: (row: BackendLocation) => (
        <span className="text-left block text-xs font-mono text-gray-600">
          {row.lat_kantor ? `${row.lat_kantor.substring(0, 10)}, ${row.long_kantor ? row.long_kantor.substring(0, 10) : ""}` : "-"}
        </span>
      ),
    },
    {
      header: <span className="text-left block w-full text-xs font-semibold text-gray-500 tracking-wider">Radius</span>,
      cell: (row: BackendLocation) => (
        <span className="text-left block text-xs text-gray-600">
          {row.radius && Number(row.radius) > 0 ? `${row.radius} meter` : "-"}
        </span>
      ),
    },
    {
      header: <span className="text-left block w-full text-xs font-semibold text-gray-500 tracking-wider">Keterangan / Alamat</span>,
      cell: (row: BackendLocation) => (
        <span className="text-left block text-xs text-gray-505 truncate max-w-[200px]" title={row.keterangan || ""}>
          {row.keterangan || "-"}
        </span>
      ),
    },
    {
      header: "Aksi",
      cell: (row: BackendLocation) => (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => navigate("LocationEdit", { locationId: row.id })}
            className="p-1.5 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-md transition-colors cursor-pointer"
            title="Edit"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => handleDeleteClick(row.id, row.nama_lokasi)}
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
        data={locations}
        loading={loading}
        className="border border-gray-200/80 shadow-xs"
        rowClassName="hover:bg-zinc-50/30"
        showSearch={true}
        searchPlaceholder="Cari nama lokasi..."
        emptyMessage="Tidak ada data lokasi."
        addButtonText="Input Lokasi"
        addButtonIcon={<Plus size={16} />}
        onAddClick={() => navigate("LocationAdd")}
        addButtonColor="success"
      />

      {/* Reusable Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: null, name: "" })}
        onConfirm={handleConfirmDelete}
        title="Hapus Lokasi"
        message={`Apakah Anda yakin ingin menghapus lokasi kantor "${confirmDelete.name}"? Pegawai yang terhubung dengan lokasi ini mungkin akan kehilangan referensi lokasi.`}
        variant="danger"
        loading={submitting}
      />
    </div>
  );
}
