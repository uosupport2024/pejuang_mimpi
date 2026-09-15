import { useState, useEffect } from "react";
import { THEME_COLORS } from "@/shared/constants/colors";
import { Combobox } from "@/shared/components/ui/combobox";

interface ReassignDivisiModalProps {
  sourceName: string;
  options: { value: string; label: string }[];
  submitting: boolean;
  progress: string | null;
  onCancel: () => void;
  onConfirm: (destinationId: number) => void;
}

export function ReassignDivisiModal({
  sourceName,
  options,
  submitting,
  progress,
  onCancel,
  onConfirm,
}: ReassignDivisiModalProps) {
  const [selected, setSelected] = useState<string>("");
  const [step, setStep] = useState<"pick" | "confirm">("pick");
  const [typedName, setTypedName] = useState("");

  useEffect(() => {
    setSelected("");
    setStep("pick");
    setTypedName("");
  }, [sourceName]);

  const selectedLabel = options.find((o) => o.value === selected)?.label || "";

  const handleProceed = () => {
    if (!selected) return;
    setStep("confirm");
  };

  const handleConfirm = () => {
    if (typedName !== selectedLabel) return;
    onConfirm(Number(selected));
  };

  if (step === "confirm") {
    return (
      <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={submitting ? undefined : onCancel} />
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xl max-w-sm w-full p-6 space-y-4 z-50">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-gray-800">Pindahkan Semua Pegawai</h3>
            <p className="text-xs text-gray-500">
              Semua pegawai di divisi <span className="font-semibold text-gray-700">"{sourceName}"</span> akan
              dipindahkan ke <span className="font-semibold text-gray-700">"{selectedLabel}"</span>, lalu divisi
              "{sourceName}" akan dihapus. Posisi pegawai yang dipindahkan akan direset karena posisi bersifat
              khusus untuk tiap divisi.
            </p>
            <p className="text-xs text-gray-500">
              Ketik <span className="font-semibold text-gray-700">"{selectedLabel}"</span> untuk konfirmasi:
            </p>
          </div>

          <input
            type="text"
            autoFocus
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            disabled={submitting}
            placeholder={selectedLabel}
            className="w-full h-9 px-3 py-2 text-xs bg-zinc-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#e0542c] focus:border-[#e0542c] text-gray-700 font-medium disabled:opacity-50"
          />

          {progress && <p className="text-[11px] text-gray-500">{progress}</p>}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => !submitting && setStep("pick")}
              disabled={submitting}
              className="w-full h-9 px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 bg-zinc-100 hover:bg-zinc-200/80 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              Kembali
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={submitting || typedName !== selectedLabel}
              className="w-full h-9 px-4 py-2 text-xs font-bold text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              style={{ backgroundColor: "#dc2626" }}
            >
              {submitting ? "Memindahkan..." : "Ya, Pindahkan & Hapus"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={onCancel} />
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xl max-w-sm w-full p-6 space-y-4 z-50">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-gray-800">Pindahkan Pegawai Sebelum Menghapus</h3>
          <p className="text-xs text-gray-500">
            Divisi <span className="font-semibold text-gray-700">"{sourceName}"</span> masih memiliki pegawai. Pilih
            divisi tujuan untuk memindahkan semua pegawainya sebelum divisi ini dihapus.
          </p>
        </div>

        <Combobox
          options={options}
          value={selected}
          onChange={setSelected}
          placeholder="Pilih divisi tujuan..."
          searchPlaceholder="Cari divisi..."
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
            disabled={!selected}
            style={{ backgroundColor: THEME_COLORS.hex.primary }}
            className="w-full h-9 px-4 py-2 text-xs font-bold text-white rounded-lg transition-colors cursor-pointer hover:opacity-90 disabled:opacity-50"
          >
            Lanjutkan
          </button>
        </div>
      </div>
    </div>
  );
}
