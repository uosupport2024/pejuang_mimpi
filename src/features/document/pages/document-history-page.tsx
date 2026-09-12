import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Search, Upload, FileText, FileImage, File as FileIcon, ChevronRight, Trash2, X, Download } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useRouter } from "@/shared/router/router";
import { useTenantBranding } from "@/shared/hooks/use-tenant-branding";
import { THEME_COLORS } from "@/shared/constants/colors";
import { ConfirmationModal } from "@/shared/components/ui/confirmation-modal";
import patternBg from "@/assets/bg/pattern-background.png";
import { UploadDocumentModal } from "../components/upload-document-modal";
import { fetchMyDocuments, deleteDocument, downloadDocumentBlob, isPayslip, type UserDocument } from "../api/document";

interface DocumentHistoryPageProps {
  user: any;
}

type SourceFilter = "all" | "mine" | "hr";

function isSelfUploaded(doc: UserDocument): boolean {
  return doc.uploaded_by_user_id === doc.user_id;
}

function formatSize(bytes: number | null): string {
  if (bytes == null) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extensionOf(filename: string | null): string {
  if (!filename) return "";
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

function FileTypeIcon({ filename, size = 18 }: { filename: string | null; size?: number }) {
  const ext = extensionOf(filename);
  if (["jpg", "jpeg", "png"].includes(ext)) return <FileImage style={{ width: size, height: size }} className="text-sky-500" />;
  if (ext === "pdf") return <FileText style={{ width: size, height: size }} className="text-rose-500" />;
  return <FileIcon style={{ width: size, height: size }} className="text-gray-400" />;
}

export function DocumentHistoryPage(_props: DocumentHistoryPageProps) {
  const { navigate } = useRouter();
  const { navbarBgStyle, buttonColor } = useTenantBranding();
  const primaryColor = typeof buttonColor === "string" && buttonColor ? buttonColor : THEME_COLORS.hex.primary;

  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const [selected, setSelected] = useState<UserDocument | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [showUpload, setShowUpload] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserDocument | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadDocuments = () => {
    setLoading(true);
    fetchMyDocuments()
      .then(setDocuments)
      .catch((err: any) => toast.error(err.message || "Gagal memuat dokumen saya"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (!selected) return;

    const ext = extensionOf(selected.original_filename);
    if (!["jpg", "jpeg", "png", "pdf"].includes(ext)) return;

    setPreviewLoading(true);
    downloadDocumentBlob(selected)
      .then((blob) => setPreviewUrl(URL.createObjectURL(blob)))
      .catch(() => toast.error("Gagal memuat pratinjau dokumen"))
      .finally(() => setPreviewLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    documents.forEach((d) => counts.set(d.document_type, (counts.get(d.document_type) || 0) + 1));
    return Array.from(counts.entries()).map(([type, count]) => ({ type, count }));
  }, [documents]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return documents.filter((d) => {
      const matchesQuery =
        q.length === 0 || (d.title || "").toLowerCase().includes(q) || (d.original_filename || "").toLowerCase().includes(q);
      const matchesCategory = !categoryFilter || d.document_type === categoryFilter;
      const matchesSource = sourceFilter === "all" || (sourceFilter === "mine" ? isSelfUploaded(d) : !isSelfUploaded(d));
      return matchesQuery && matchesCategory && matchesSource;
    });
  }, [documents, search, categoryFilter, sourceFilter]);

  const handleDownload = async (doc: UserDocument) => {
    try {
      const blob = await downloadDocumentBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.original_filename || doc.title || "document";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      toast.error(err.message || "Gagal mengunduh dokumen");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDocument(deleteTarget);
      toast.success("Dokumen berhasil dihapus.");
      setDocuments((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      if (selected?.id === deleteTarget.id) setSelected(null);
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus dokumen");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4 pb-24 text-left">
      {/* Header Bar */}
      <div style={navbarBgStyle} className="relative -mx-5 -mt-6 mb-4 overflow-hidden rounded-b-2xl text-white">
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{ backgroundImage: `url(${patternBg})`, backgroundSize: "180px auto", backgroundRepeat: "repeat" }}
        />
        <div className="relative z-10 flex items-center gap-3.5 px-6 pt-10 pb-8">
          <button
            onClick={() => navigate("MobileLumbung")}
            className="p-2 hover:bg-white/10 active:scale-95 rounded-full transition-all cursor-pointer text-white border border-white/10 bg-white/5 backdrop-blur-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-bold tracking-widest uppercase text-white/70 leading-none">Layanan Mandiri</span>
            <h1 className="text-base font-bold tracking-tight text-white mt-1.5 leading-none">Dokumen Saya</h1>
          </div>
        </div>
      </div>

      <div className="px-1 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari dokumen..."
            className="w-full h-10 pl-8 pr-3 text-xs bg-white border border-zinc-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#e0542c] focus:border-[#e0542c] text-gray-700 font-medium shadow-xs"
          />
        </div>

        {/* Source tabs */}
        <div className="flex items-center gap-1.5">
          {(["all", "mine", "hr"] as SourceFilter[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSourceFilter(s)}
              style={sourceFilter === s ? { backgroundColor: `${primaryColor}1A`, color: primaryColor } : undefined}
              className={cn(
                "flex-1 py-2 rounded-xl text-[11px] font-bold text-center transition-colors cursor-pointer",
                sourceFilter === s ? "" : "bg-white border border-zinc-200/80 text-gray-500"
              )}
            >
              {s === "all" ? "Semua" : s === "mine" ? "Unggahan Saya" : "Dari HR"}
            </button>
          ))}
        </div>

        {/* Category chips */}
        {categories.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCategoryFilter(null)}
              style={categoryFilter === null ? { backgroundColor: THEME_COLORS.hex.navBg, color: "white" } : undefined}
              className={cn("px-2.5 py-1 rounded-md text-[10.5px] font-bold transition-colors cursor-pointer", categoryFilter === null ? "" : "bg-white border border-zinc-200/80 text-gray-600")}
            >
              Semua
            </button>
            {categories.map((c) => (
              <button
                key={c.type}
                type="button"
                onClick={() => setCategoryFilter(categoryFilter === c.type ? null : c.type)}
                style={categoryFilter === c.type ? { backgroundColor: THEME_COLORS.hex.navBg, color: "white" } : undefined}
                className={cn("px-2.5 py-1 rounded-md text-[10.5px] font-bold transition-colors cursor-pointer capitalize", categoryFilter === c.type ? "" : "bg-white border border-zinc-200/80 text-gray-600")}
              >
                {c.type} ({c.count})
              </button>
            ))}
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-3 border border-zinc-100/80 shadow-xs flex items-center gap-3 animate-pulse">
                <div className="w-9 h-9 rounded-lg bg-zinc-100 shrink-0" />
                <div className="flex flex-col gap-1 flex-1">
                  <div className="h-3.5 bg-zinc-100 rounded-md w-3/4" />
                  <div className="h-2.5 bg-zinc-50 rounded-md w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-xs text-zinc-400 border border-zinc-200/80 font-semibold">
            Belum ada dokumen.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((doc) => (
              <button
                key={doc.id}
                type="button"
                onClick={() => setSelected(doc)}
                className="bg-white rounded-2xl p-3 border border-zinc-100/80 shadow-xs flex items-center gap-3 text-left cursor-pointer active:scale-[0.99] transition-transform"
              >
                <div className="w-9 h-9 rounded-lg bg-zinc-50 flex items-center justify-center shrink-0">
                  <FileTypeIcon filename={doc.original_filename} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-800 truncate">{doc.title || doc.original_filename}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 capitalize">
                    {doc.document_type} · {formatSize(doc.file_size)} · {new Date(doc.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                    {!isSelfUploaded(doc) && <span className="ml-1 font-bold text-emerald-600">· HR</span>}
                  </p>
                </div>
                <ChevronRight size={16} className="text-gray-300 shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Upload button */}
      <button
        type="button"
        onClick={() => setShowUpload(true)}
        style={{ backgroundColor: primaryColor }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-sm h-11 flex items-center justify-center gap-2 text-white rounded-xl text-xs font-bold shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
      >
        <Upload size={14} /> Unggah File
      </button>

      {showUpload && (
        <UploadDocumentModal
          allowTargetSelection={false}
          onCancel={() => setShowUpload(false)}
          onUploaded={(doc) => {
            setShowUpload(false);
            setDocuments((prev) => [doc, ...prev]);
          }}
        />
      )}

      {/* Preview overlay */}
      {selected && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs" onClick={() => setSelected(null)} />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl border border-gray-200 shadow-xl max-w-sm w-full p-4 z-[101] space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <span className="text-xs font-bold text-gray-800 truncate">{selected.title || selected.original_filename}</span>
              <button type="button" onClick={() => setSelected(null)} className="p-1 hover:bg-zinc-100 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full flex items-center justify-center bg-zinc-50 rounded-xl overflow-hidden min-h-[200px] max-h-[50vh]">
              {previewLoading ? (
                <div className="w-full h-[200px] bg-zinc-100 animate-pulse" />
              ) : previewUrl ? (
                extensionOf(selected.original_filename) === "pdf" ? (
                  <iframe title="preview" src={previewUrl} className="w-full h-[300px]" />
                ) : (
                  <img src={previewUrl} alt={selected.title || "preview"} className="max-w-full max-h-[45vh] object-contain" />
                )
              ) : (
                <div className="flex flex-col items-center gap-2 py-10 text-gray-400">
                  <FileTypeIcon filename={selected.original_filename} size={28} />
                  <p className="text-[11px]">Pratinjau tidak tersedia.</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleDownload(selected)}
                className="flex-1 h-9 flex items-center justify-center gap-1.5 text-xs font-bold rounded-lg bg-zinc-100 hover:bg-zinc-200/80 text-gray-700 transition-colors cursor-pointer"
              >
                <Download size={13} /> Unduh
              </button>
              {!isPayslip(selected) && isSelfUploaded(selected) && (
                <button
                  type="button"
                  onClick={() => setDeleteTarget(selected)}
                  className="flex-1 h-9 flex items-center justify-center gap-1.5 text-xs font-bold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                >
                  <Trash2 size={13} /> Hapus
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Dokumen"
        message={`Apakah Anda yakin ingin menghapus "${deleteTarget?.title || deleteTarget?.original_filename}"? File akan dihapus secara permanen.`}
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
