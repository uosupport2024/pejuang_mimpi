import { useEffect, useState } from "react";
import { Plus, Pencil, Ban, RotateCcw, FileWarning } from "lucide-react";
import { toast } from "sonner";
import { FormField } from "@/shared/components/ui/form-field";
import { ConfirmationModal } from "@/shared/components/ui/confirmation-modal";
import { THEME_COLORS } from "@/shared/constants/colors";
import {
  fetchActiveContract,
  createContract,
  fetchPayrollAllocations,
  createPayrollAllocation,
  updatePayrollAllocation,
  deactivatePayrollAllocation,
  reactivatePayrollAllocation,
  type PayrollAllocation,
  type AllocationCategory,
  type DeductionMethod,
} from "../api/payroll-allocation";

interface PayrollAllocationTabProps {
  employeeId: number;
  tenantId: number;
}

const CATEGORY_OPTIONS: { value: AllocationCategory; label: string }[] = [
  { value: "official_investment", label: "Investasi (Resmi Perusahaan)" },
  { value: "official_charity", label: "Amal (Resmi Perusahaan)" },
  { value: "regular_investment", label: "Investasi (Pribadi)" },
  { value: "regular_charity", label: "Amal (Pribadi)" },
];

const METHOD_OPTIONS: { value: DeductionMethod; label: string }[] = [
  { value: "fixed_amount", label: "Nominal Tetap (Rp)" },
  { value: "percentage", label: "Persentase (%)" },
];

const CATEGORY_LABEL: Record<AllocationCategory, string> = Object.fromEntries(
  CATEGORY_OPTIONS.map((o) => [o.value, o.label])
) as Record<AllocationCategory, string>;

const emptyForm = {
  category: "regular_investment" as AllocationCategory,
  deduction_method: "fixed_amount" as DeductionMethod,
  value: "0",
  destination_reference: "",
  effective_start_date: "",
  effective_end_date: "",
};

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

export function PayrollAllocationTab({ employeeId, tenantId }: PayrollAllocationTabProps) {
  const [loading, setLoading] = useState(true);
  const [contractId, setContractId] = useState<number | null>(null);
  const [creatingContract, setCreatingContract] = useState(false);

  const [allocations, setAllocations] = useState<PayrollAllocation[]>([]);
  const [listLoading, setListLoading] = useState(false);

  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [confirmTarget, setConfirmTarget] = useState<PayrollAllocation | null>(null);
  const [deactivating, setDeactivating] = useState(false);

  const loadContract = async () => {
    setLoading(true);
    try {
      const contract = await fetchActiveContract(employeeId);
      if (contract) {
        setContractId(contract.id);
        await loadAllocations(contract.id);
      } else {
        setContractId(null);
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal memuat data kontrak pegawai.");
    } finally {
      setLoading(false);
    }
  };

  const loadAllocations = async (cId: number) => {
    setListLoading(true);
    try {
      const rows = await fetchPayrollAllocations(cId);
      setAllocations(rows);
    } catch (err: any) {
      toast.error(err.message || "Gagal memuat daftar alokasi.");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) {
      loadContract();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  const handleCreateContract = async () => {
    setCreatingContract(true);
    try {
      const contract = await createContract({
        user_id: employeeId,
        tenant_id: tenantId,
        contract_start_date: new Date().toISOString().slice(0, 10),
      });
      toast.success("Kontrak berhasil dibuat. Sekarang alokasi bisa ditambahkan.");
      setContractId(contract.id);
      await loadAllocations(contract.id);
    } catch (err: any) {
      toast.error(err.message || "Gagal membuat kontrak pegawai.");
    } finally {
      setCreatingContract(false);
    }
  };

  const handleFormChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
  };

  const handleEditClick = (row: PayrollAllocation) => {
    setEditingId(row.id);
    setFormData({
      category: row.category,
      deduction_method: row.deduction_method,
      value: String(row.value),
      destination_reference: row.destination_reference,
      effective_start_date: row.effective_start_date?.slice(0, 10) || "",
      effective_end_date: row.effective_end_date?.slice(0, 10) || "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractId) return;

    if (!formData.destination_reference.trim()) {
      toast.error("Tujuan/Referensi wajib diisi.");
      return;
    }
    if (!formData.effective_start_date) {
      toast.error("Tanggal mulai berlaku wajib diisi.");
      return;
    }
    const numericValue = Number(formData.value);
    if (formData.deduction_method === "percentage" && (numericValue < 0 || numericValue > 100)) {
      toast.error("Nilai persentase harus di antara 0 - 100.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        contract_id: contractId,
        category: formData.category,
        deduction_method: formData.deduction_method,
        value: numericValue,
        destination_reference: formData.destination_reference.trim(),
        effective_start_date: formData.effective_start_date,
        effective_end_date: formData.effective_end_date || null,
      };

      if (editingId) {
        await updatePayrollAllocation(editingId, payload);
        toast.success("Alokasi berhasil diperbarui.");
      } else {
        await createPayrollAllocation(payload);
        toast.success("Alokasi berhasil ditambahkan.");
      }

      resetForm();
      await loadAllocations(contractId);
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan alokasi.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!confirmTarget || !contractId) return;
    setDeactivating(true);
    try {
      await deactivatePayrollAllocation(confirmTarget.id);
      toast.success("Alokasi berhasil dinonaktifkan.");
      setConfirmTarget(null);
      await loadAllocations(contractId);
    } catch (err: any) {
      toast.error(err.message || "Gagal menonaktifkan alokasi.");
    } finally {
      setDeactivating(false);
    }
  };

  const handleReactivate = async (row: PayrollAllocation) => {
    if (!contractId) return;
    try {
      await reactivatePayrollAllocation(row.id);
      toast.success("Alokasi berhasil diaktifkan kembali.");
      await loadAllocations(contractId);
    } catch (err: any) {
      toast.error(err.message || "Gagal mengaktifkan kembali alokasi.");
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200/80 rounded-2xl shadow-xs p-6 space-y-4">
        <div className="h-4 w-48 bg-zinc-100 rounded animate-pulse" />
        <div className="h-24 w-full bg-zinc-100 rounded animate-pulse" />
      </div>
    );
  }

  if (!contractId) {
    return (
      <div className="bg-white border border-gray-200/80 rounded-2xl shadow-xs p-6 space-y-4">
        <h2 style={{ color: THEME_COLORS.hex.primary }} className="text-sm font-semibold border-b border-gray-100 pb-2">
          Alokasi & Pemotongan Lainnya
        </h2>
        <div className="flex flex-col items-center justify-center text-center gap-3 py-10">
          <FileWarning size={36} className="text-amber-500" />
          <p className="text-sm font-semibold text-gray-700">Pegawai ini belum memiliki kontrak aktif.</p>
          <p className="text-xs text-gray-500 max-w-md">
            Alokasi & pemotongan lainnya (investasi/amal) tersimpan per-kontrak. Buat kontrak aktif untuk pegawai ini
            terlebih dahulu sebelum menambahkan alokasi.
          </p>
          <button
            type="button"
            onClick={handleCreateContract}
            disabled={creatingContract}
            style={{ backgroundColor: THEME_COLORS.hex.primary }}
            className="mt-2 px-4 py-2 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 hover:opacity-90"
          >
            {creatingContract ? "Membuat Kontrak..." : "Buat Kontrak Sekarang"}
          </button>
        </div>
      </div>
    );
  }

  // This whole tab lives inside the parent EmployeeEdit page's outer <form>
  // (which submits "Update Pegawai"). Pressing Enter in one of these fields
  // would otherwise bubble up and submit that unrelated form instead of
  // this tab's own Tambah/Update Alokasi action.
  const blockEnterSubmit = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") {
      e.preventDefault();
    }
  };

  return (
    <div className="space-y-6" onKeyDown={blockEnterSubmit}>
      <div className="bg-white border border-gray-200/80 rounded-2xl shadow-xs p-6 space-y-4">
        <h2 style={{ color: THEME_COLORS.hex.primary }} className="text-sm font-semibold border-b border-gray-100 pb-2">
          {editingId ? "Edit Alokasi" : "Tambah Alokasi Baru"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Kategori *"
            type="combobox"
            name="category"
            value={formData.category}
            options={CATEGORY_OPTIONS}
            onChange={handleFormChange}
          />
          <FormField
            label="Metode Pemotongan *"
            type="combobox"
            name="deduction_method"
            value={formData.deduction_method}
            options={METHOD_OPTIONS}
            onChange={handleFormChange}
          />
          <FormField
            label={formData.deduction_method === "percentage" ? "Nilai (0 - 100 %) *" : "Nilai (Rp) *"}
            type="number"
            name="value"
            value={formData.value}
            onChange={handleFormChange}
            isCurrency={formData.deduction_method === "fixed_amount"}
          />
          <FormField
            label="Tujuan / Referensi *"
            type="text"
            name="destination_reference"
            placeholder="mis. No. Rekening Reksadana X, Nama Lembaga Amal"
            value={formData.destination_reference}
            onChange={handleFormChange}
          />
          <FormField
            label="Berlaku Mulai *"
            type="date"
            name="effective_start_date"
            value={formData.effective_start_date}
            onChange={handleFormChange}
          />
          <FormField
            label="Berlaku Sampai (kosongkan jika selamanya)"
            type="date"
            name="effective_end_date"
            value={formData.effective_end_date}
            onChange={handleFormChange}
            minDate={formData.effective_start_date ? new Date(formData.effective_start_date) : undefined}
          />
        </div>
        <div className="flex items-center justify-end gap-3 pt-2">
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-gray-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Batal Edit
            </button>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            style={{ backgroundColor: THEME_COLORS.hex.primary }}
            className="flex items-center gap-1.5 px-4 py-2 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 hover:opacity-90"
          >
            {!editingId && <Plus size={14} />}
            {submitting ? "Menyimpan..." : editingId ? "Update Alokasi" : "Tambah Alokasi"}
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200/80 rounded-2xl shadow-xs p-6 space-y-4">
        <h2 style={{ color: THEME_COLORS.hex.primary }} className="text-sm font-semibold border-b border-gray-100 pb-2">
          Daftar Alokasi & Pemotongan
        </h2>

        {listLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 w-full bg-zinc-100 rounded animate-pulse" />
            ))}
          </div>
        ) : allocations.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-8">Belum ada alokasi/pemotongan lainnya untuk pegawai ini.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="py-2 pr-3 font-semibold">Kategori</th>
                  <th className="py-2 pr-3 font-semibold">Nilai</th>
                  <th className="py-2 pr-3 font-semibold">Tujuan / Referensi</th>
                  <th className="py-2 pr-3 font-semibold">Periode</th>
                  <th className="py-2 pr-3 font-semibold">Status</th>
                  <th className="py-2 pr-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {allocations.map((row) => (
                  <tr key={row.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 pr-3 text-gray-700 font-medium">{CATEGORY_LABEL[row.category]}</td>
                    <td className="py-2.5 pr-3 text-gray-700">
                      {row.deduction_method === "percentage"
                        ? `${Number(row.value)}%`
                        : formatRupiah(Number(row.value))}
                    </td>
                    <td className="py-2.5 pr-3 text-gray-500 max-w-[220px] truncate" title={row.destination_reference}>
                      {row.destination_reference}
                    </td>
                    <td className="py-2.5 pr-3 text-gray-500 whitespace-nowrap">
                      {row.effective_start_date?.slice(0, 10)} &ndash;{" "}
                      {row.effective_end_date ? row.effective_end_date.slice(0, 10) : "Selamanya"}
                    </td>
                    <td className="py-2.5 pr-3">
                      <span
                        className={
                          row.is_active
                            ? "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-600"
                            : "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 text-gray-500"
                        }
                      >
                        {row.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleEditClick(row)}
                          title="Edit"
                          className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Pencil size={14} />
                        </button>
                        {row.is_active ? (
                          <button
                            type="button"
                            onClick={() => setConfirmTarget(row)}
                            title="Nonaktifkan"
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Ban size={14} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleReactivate(row)}
                            title="Aktifkan Kembali"
                            className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <RotateCcw size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleConfirmDeactivate}
        title="Nonaktifkan Alokasi"
        message={`Apakah Anda yakin ingin menonaktifkan alokasi "${confirmTarget?.destination_reference}"? Alokasi tidak akan dihapus, hanya berhenti dipotong pada periode payroll berikutnya.`}
        variant="danger"
        loading={deactivating}
      />
    </div>
  );
}
