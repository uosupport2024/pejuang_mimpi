import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { UploadCloud, File as FileIcon, X } from "lucide-react";
import { THEME_COLORS } from "@/shared/constants/colors";
import { Combobox } from "@/shared/components/ui/combobox";
import { fetchEmployees, type BackendEmployee } from "@/features/employee/api/employee";
import { uploadDocument, type UserDocument } from "../api/document";

const QUICK_TYPES: { value: string; label: string; hrOnly: boolean }[] = [
  { value: "rotation", label: "Rotasi", hrOnly: true },
  { value: "notification", label: "Pemberitahuan", hrOnly: true },
  { value: "personal", label: "Personal", hrOnly: false },
  { value: "certificate", label: "Sertifikat", hrOnly: false },
];

const SELF_VALUE = "__self__";

interface UploadDocumentModalProps {
  onCancel: () => void;
  onUploaded: (doc: UserDocument) => void;
}

export function UploadDocumentModal({ onCancel, onUploaded }: UploadDocumentModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [targetUser, setTargetUser] = useState(SELF_VALUE);
  const [employees, setEmployees] = useState<BackendEmployee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEmployees({ per_page: 50 })
      .then((res) => setEmployees(res.data))
      .catch(() => toast.error("Gagal memuat daftar pegawai"))
      .finally(() => setLoadingEmployees(false));
  }, []);

  const employeeOptions = [
    { value: SELF_VALUE, label: "Diri Sendiri" },
    ...employees.map((e) => ({ value: String(e.id), label: e.name })),
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 10 MB.");
      return;
    }
    setFile(f);
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Pilih file terlebih dahulu.");
      return;
    }
    if (!documentType.trim()) {
      toast.error("Kategori dokumen wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      const doc = await uploadDocument({
        document_type: documentType.trim(),
        title: title.trim() || undefined,
        user_id: targetUser !== SELF_VALUE ? Number(targetUser) : undefined,
        file,
      });
      toast.success("Dokumen berhasil diunggah.");
      onUploaded(doc);
    } catch (err: any) {
      toast.error(err.message || "Gagal mengunggah dokumen.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={submitting ? undefined : onCancel} />
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xl max-w-md w-full p-6 space-y-4 z-50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-800">Unggah Dokumen</h3>
          <button type="button" onClick={onCancel} disabled={submitting} className="p-1 text-gray-400 hover:text-gray-700 rounded-md cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <input ref={fileInputRef} type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="hidden" />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-200 hover:border-gray-300 rounded-xl p-5 flex flex-col items-center justify-center gap-2 text-center transition-colors cursor-pointer"
        >
          {file ? (
            <>
              <FileIcon size={22} className="text-gray-500" />
              <p className="text-xs font-bold text-gray-700 truncate max-w-full">{file.name}</p>
              <p className="text-[10px] text-gray-400">{(file.size / 1024).toFixed(0)} KB — klik untuk ganti</p>
            </>
          ) : (
            <>
              <UploadCloud size={22} className="text-gray-400" />
              <p className="text-xs font-semibold text-gray-600">Klik untuk pilih file</p>
              <p className="text-[10px] text-gray-400">PDF, DOC, DOCX, JPG, PNG — maks 10 MB</p>
            </>
          )}
        </button>

        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-gray-500">Judul (opsional)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="mis. SK Mutasi Cabang Jakarta"
            className="w-full h-9 px-3 text-xs bg-zinc-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#e0542c] focus:border-[#e0542c] text-gray-700 font-medium"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-gray-500">Kategori *</label>
          <input
            type="text"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            placeholder="mis. personal, certificate, rotation..."
            className="w-full h-9 px-3 text-xs bg-zinc-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#e0542c] focus:border-[#e0542c] text-gray-700 font-medium"
          />
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {QUICK_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setDocumentType(t.value)}
                title={t.hrOnly ? "Hanya HR/Admin yang bisa mengunggah tipe ini" : undefined}
                className="px-2 py-1 rounded-md text-[10px] font-bold bg-zinc-100 hover:bg-zinc-200/80 text-gray-600 transition-colors cursor-pointer"
              >
                {t.label} {t.hrOnly && "🔒"}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-gray-500">Untuk Pegawai</label>
          {loadingEmployees ? (
            <div className="h-9 w-full bg-zinc-100 animate-pulse rounded-lg" />
          ) : (
            <Combobox options={employeeOptions} value={targetUser} onChange={setTargetUser} searchPlaceholder="Cari pegawai..." />
          )}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="w-full h-9 px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 bg-zinc-100 hover:bg-zinc-200/80 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            style={{ backgroundColor: THEME_COLORS.hex.primary }}
            className="w-full h-9 px-4 py-2 text-xs font-bold text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50 hover:opacity-90"
          >
            {submitting ? "Mengunggah..." : "Unggah"}
          </button>
        </div>
      </div>
    </div>
  );
}
