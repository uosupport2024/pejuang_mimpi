import { useState, useEffect } from "react";
import { THEME_COLORS } from "@/shared/constants/colors";
import { Combobox } from "@/shared/components/ui/combobox";
import { ConfirmationModal } from "@/shared/components/ui/confirmation-modal";
import type { HierarchyNode } from "../api/org-management";

interface ReassignManagerModalProps {
  target: HierarchyNode;
  currentManagerName: string | null;
  options: { value: string; label: string }[];
  submitting: boolean;
  onCancel: () => void;
  onConfirm: (managerContractId: number | null) => void;
}

const NO_MANAGER_VALUE = "__none__";

export function ReassignManagerModal({
  target,
  currentManagerName,
  options,
  submitting,
  onCancel,
  onConfirm,
}: ReassignManagerModalProps) {
  const [selected, setSelected] = useState<string>(NO_MANAGER_VALUE);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    setSelected(NO_MANAGER_VALUE);
    setConfirming(false);
  }, [target]);

  const fullOptions = [{ value: NO_MANAGER_VALUE, label: "— Tidak ada (Top Level) —" }, ...options];
  const selectedLabel = fullOptions.find((o) => o.value === selected)?.label || "";

  const handleProceed = () => {
    setConfirming(true);
  };

  const handleConfirm = () => {
    onConfirm(selected === NO_MANAGER_VALUE ? null : Number(selected));
  };

  if (confirming) {
    return (
      <ConfirmationModal
        isOpen
        onClose={() => setConfirming(false)}
        onConfirm={handleConfirm}
        title="Pindahkan Atasan"
        message={`Pindahkan ${target.name} dari "${currentManagerName || "Tidak ada"}" ke "${selectedLabel}"?`}
        confirmText="Ya, Pindahkan"
        variant="warning"
        loading={submitting}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={onCancel} />
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xl max-w-sm w-full p-6 space-y-4 z-50">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-gray-800">Ubah Atasan</h3>
          <p className="text-xs text-gray-500">
            Pilih atasan baru untuk <span className="font-semibold text-gray-700">{target.name}</span>. Atasan saat ini:{" "}
            <span className="font-semibold text-gray-700">{currentManagerName || "Tidak ada"}</span>.
          </p>
        </div>

        <Combobox
          options={fullOptions}
          value={selected}
          onChange={setSelected}
          placeholder="Pilih atasan..."
          searchPlaceholder="Cari nama..."
        />

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="w-full h-9 px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 bg-zinc-100 hover:bg-zinc-200/80 rounded-lg transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleProceed}
            style={{ backgroundColor: THEME_COLORS.hex.primary }}
            className="w-full h-9 px-4 py-2 text-xs font-bold text-white rounded-lg transition-colors cursor-pointer hover:opacity-90"
          >
            Lanjutkan
          </button>
        </div>
      </div>
    </div>
  );
}
