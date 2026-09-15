import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { THEME_COLORS } from "@/shared/constants/colors";
import { createGolongan, type BackendJabatan } from "@/features/organization/api/organization";
import type { HierarchyNode } from "../api/org-management";

export interface ManageEmployeeSavePayload {
  jabatan_id: number;
  golongan_id: number | null;
  addedContractIds: number[];
  removedContractIds: number[];
}

interface ManageEmployeeModalProps {
  target: HierarchyNode;
  jabatans: BackendJabatan[];
  peers: HierarchyNode[];
  initialSubordinateContractIds: number[];
  submitting: boolean;
  onCancel: () => void;
  onSave: (payload: ManageEmployeeSavePayload) => void;
  onGolonganCreated?: (jabatanId: number, golongan: { id: number; jabatan_id: number; name: string }) => void;
}

export function ManageEmployeeModal({
  target,
  jabatans,
  peers,
  initialSubordinateContractIds,
  submitting,
  onCancel,
  onSave,
  onGolonganCreated,
}: ManageEmployeeModalProps) {
  const [jabatanId, setJabatanId] = useState<number | "">(target.jabatan?.id ?? "");
  const [golonganId, setGolonganId] = useState<number | "">(target.golongan?.id ?? "");
  const [selectedSubordinates, setSelectedSubordinates] = useState<Set<number>>(
    new Set(initialSubordinateContractIds)
  );
  const [newGolonganName, setNewGolonganName] = useState("");
  const [addingGolongan, setAddingGolongan] = useState(false);
  const [extraGolongans, setExtraGolongans] = useState<{ id: number; jabatan_id: number; name: string }[]>([]);

  const selectedJabatan = jabatans.find((j) => j.id === jabatanId);
  const golonganOptions = [
    ...(selectedJabatan?.golongans || []),
    ...extraGolongans.filter((g) => g.jabatan_id === jabatanId),
  ];

  const handleJabatanChange = (value: string) => {
    setJabatanId(value ? Number(value) : "");
    setGolonganId("");
    setNewGolonganName("");
  };

  const handleAddGolongan = async () => {
    if (!jabatanId) return;
    if (!newGolonganName.trim()) {
      toast.error("Nama posisi harus diisi.");
      return;
    }
    setAddingGolongan(true);
    try {
      const created = await createGolongan(jabatanId, newGolonganName.trim());
      setExtraGolongans((prev) => [...prev, created]);
      setGolonganId(created.id);
      setNewGolonganName("");
      onGolonganCreated?.(jabatanId, created);
      toast.success("Posisi berhasil ditambahkan.");
    } catch (err: any) {
      toast.error(err.message || "Gagal menambahkan posisi.");
    } finally {
      setAddingGolongan(false);
    }
  };

  const toggleSubordinate = (contractId: number) => {
    setSelectedSubordinates((prev) => {
      const next = new Set(prev);
      if (next.has(contractId)) next.delete(contractId);
      else next.add(contractId);
      return next;
    });
  };

  const handleSave = () => {
    if (!jabatanId) return;
    const initial = new Set(initialSubordinateContractIds);
    const addedContractIds = Array.from(selectedSubordinates).filter((id) => !initial.has(id));
    const removedContractIds = initialSubordinateContractIds.filter((id) => !selectedSubordinates.has(id));
    onSave({
      jabatan_id: Number(jabatanId),
      golongan_id: golonganId ? Number(golonganId) : null,
      addedContractIds,
      removedContractIds,
    });
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={submitting ? undefined : onCancel} />
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xl max-w-md w-full p-6 space-y-4 z-50 max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-gray-800">Kelola Pegawai</h3>
            <p className="text-[11px] text-gray-500">{target.name}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="p-1 text-gray-400 hover:text-gray-650 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-gray-500">Divisi</label>
          <select
            value={jabatanId}
            onChange={(e) => handleJabatanChange(e.target.value)}
            disabled={submitting}
            className="w-full h-9 px-3 py-2 text-xs bg-zinc-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#e0542c] focus:border-[#e0542c] text-gray-700 font-medium disabled:opacity-50"
          >
            <option value="">Pilih divisi...</option>
            {jabatans.map((j) => (
              <option key={j.id} value={j.id}>
                {j.nama_jabatan}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-gray-500">Posisi</label>
          <select
            value={golonganId}
            onChange={(e) => setGolonganId(e.target.value ? Number(e.target.value) : "")}
            disabled={submitting || !jabatanId}
            className="w-full h-9 px-3 py-2 text-xs bg-zinc-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#e0542c] focus:border-[#e0542c] text-gray-700 font-medium disabled:opacity-50"
          >
            <option value="">— Tidak ada —</option>
            {golonganOptions.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          {jabatanId && (
            <div className="flex gap-1.5 pt-1">
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
                disabled={submitting || addingGolongan}
                placeholder="Posisi baru..."
                className="flex-1 h-8 px-2.5 text-[11px] bg-zinc-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#e0542c] focus:border-[#e0542c] text-gray-700 font-medium disabled:opacity-50"
              />
              <button
                type="button"
                onClick={handleAddGolongan}
                disabled={submitting || addingGolongan}
                className="px-2.5 h-8 text-[11px] font-bold text-gray-700 bg-zinc-100 hover:bg-zinc-200/80 rounded-lg transition-colors cursor-pointer disabled:opacity-50 shrink-0"
              >
                {addingGolongan ? "..." : "+ Tambah"}
              </button>
            </div>
          )}
        </div>

        {peers.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <label className="text-[11px] font-semibold text-gray-500">
              Bawahan di Divisi {target.jabatan?.nama_jabatan || "ini"}
            </label>
            <p className="text-[10px] text-gray-400">
              Pilih pegawai lain di divisi ini yang akan melapor langsung ke {target.name}.
            </p>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {peers.map((p) => (
                <label
                  key={p.contract_id}
                  className="flex items-center gap-2 px-2.5 py-1.5 bg-zinc-50 rounded-lg cursor-pointer hover:bg-zinc-100 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedSubordinates.has(p.contract_id)}
                    onChange={() => toggleSubordinate(p.contract_id)}
                    disabled={submitting}
                    className="cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-gray-700 truncate flex-1">{p.name}</span>
                  {p.golongan && <span className="text-[10px] text-gray-400">{p.golongan.name}</span>}
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="px-4 py-2 text-xs font-bold text-gray-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={submitting || !jabatanId}
            style={{ background: THEME_COLORS.hex.primary }}
            className="px-4 py-2 text-xs font-bold text-white hover:brightness-105 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {submitting ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
