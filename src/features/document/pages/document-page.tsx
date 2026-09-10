import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, Upload, Download, Trash2, FileText, FileImage, File as FileIcon, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { THEME_COLORS } from "@/shared/constants/colors";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { ConfirmationModal } from "@/shared/components/ui/confirmation-modal";
import { UploadDocumentModal } from "../components/upload-document-modal";
import { fetchTenantDocuments, deleteDocument, downloadDocumentBlob, isPayslip, type UserDocument } from "../api/document";

const PRIVILEGED_ROLES = ["super_admin", "admin", "hrd", "general_manager", "kepala_cabang"];

function isFromHr(doc: UserDocument): boolean {
  return !!doc.uploader?.roles?.some((r) => PRIVILEGED_ROLES.includes(r.name));
}

function formatSize(bytes: number | null): string {
  if (bytes == null) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function extensionOf(filename: string | null): string {
  if (!filename) return "";
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

function FileTypeIcon({ filename, size = 16 }: { filename: string | null; size?: number }) {
  const ext = extensionOf(filename);
  if (["jpg", "jpeg", "png"].includes(ext)) return <FileImage size={size} className="text-sky-500" />;
  if (ext === "pdf") return <FileText size={size} className="text-rose-500" />;
  return <FileIcon size={size} className="text-gray-400" />;
}

type SourceFilter = "all" | "hr" | "employee";

export function DocumentPage() {
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [selected, setSelected] = useState<UserDocument | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserDocument | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const loadDocuments = () => {
    setLoading(true);
    fetchTenantDocuments()
      .then(setDocuments)
      .catch((err: any) => toast.error(err.message || "Gagal memuat daftar dokumen"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  // Preview fetch for the selected document — the download endpoint requires
  // an Authorization header, which a plain <img>/<iframe src> can't send, so
  // the file has to come through an authenticated fetch + blob URL instead.
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
        q.length === 0 ||
        (d.title || "").toLowerCase().includes(q) ||
        (d.original_filename || "").toLowerCase().includes(q) ||
        (d.user?.name || "").toLowerCase().includes(q) ||
        (d.uploader?.name || "").toLowerCase().includes(q);
      const matchesCategory = !categoryFilter || d.document_type === categoryFilter;
      const matchesSource = sourceFilter === "all" || (sourceFilter === "hr" ? isFromHr(d) : !isFromHr(d));
      return matchesQuery && matchesCategory && matchesSource;
    });
  }, [documents, search, categoryFilter, sourceFilter]);

  const handleUploaded = (doc: UserDocument) => {
    setShowUpload(false);
    setDocuments((prev) => [doc, ...prev]);
  };

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
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dokumen</h1>
          <p className="text-xs text-gray-500 mt-1">
            Dokumen hanya bisa dilihat oleh pemiliknya dan Admin/HRD tenant ini.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowUpload(true)}
          style={{ backgroundColor: THEME_COLORS.hex.primary }}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer hover:opacity-90"
        >
          <Upload size={14} /> Unggah
        </button>
      </div>

      <div className="flex gap-6">
        {/* Left: filters + table */}
        <div className={cn("space-y-4 min-w-0", selected ? "flex-1" : "w-full")}>
          <div className="bg-white border border-gray-200/80 rounded-2xl shadow-xs p-4 space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari file, judul, atau pengunggah..."
                  className="w-full h-9 pl-8 pr-3 text-xs bg-zinc-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#e0542c] focus:border-[#e0542c] text-gray-700 font-medium"
                />
              </div>
              <div className="flex items-center gap-1.5">
                {(["all", "hr", "employee"] as SourceFilter[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSourceFilter(s)}
                    style={sourceFilter === s ? { backgroundColor: `${THEME_COLORS.hex.primary}1A`, color: THEME_COLORS.hex.primary } : undefined}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap",
                      sourceFilter === s ? "" : "bg-zinc-100 text-gray-600 hover:bg-zinc-200/80"
                    )}
                  >
                    {s === "all" ? "Semua" : s === "hr" ? "Dari HR" : "Unggahan Pegawai"}
                  </button>
                ))}
              </div>
            </div>

            {categories.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCategoryFilter(null)}
                  style={categoryFilter === null ? { backgroundColor: THEME_COLORS.hex.navBg, color: "white" } : undefined}
                  className={cn("px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer", categoryFilter === null ? "" : "bg-zinc-100 text-gray-600 hover:bg-zinc-200/80")}
                >
                  Semua ({documents.length})
                </button>
                {categories.map((c) => (
                  <button
                    key={c.type}
                    type="button"
                    onClick={() => setCategoryFilter(categoryFilter === c.type ? null : c.type)}
                    style={categoryFilter === c.type ? { backgroundColor: THEME_COLORS.hex.navBg, color: "white" } : undefined}
                    className={cn("px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer capitalize", categoryFilter === c.type ? "" : "bg-zinc-100 text-gray-600 hover:bg-zinc-200/80")}
                  >
                    {c.type} ({c.count})
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200/80 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100 bg-zinc-50/50">
                    <th className="py-2.5 px-4 font-semibold">File</th>
                    <th className="py-2.5 px-3 font-semibold">Kategori</th>
                    <th className="py-2.5 px-3 font-semibold">Diunggah Oleh</th>
                    <th className="py-2.5 px-3 font-semibold">Ukuran</th>
                    <th className="py-2.5 px-3 font-semibold">Tanggal</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [1, 2, 3, 4].map((i) => (
                      <tr key={i} className="border-b border-gray-50 last:border-0">
                        <td className="py-3 px-4" colSpan={6}>
                          <Skeleton className="h-4 w-full rounded" />
                        </td>
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-gray-400">
                        Tidak ada dokumen yang cocok.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((doc) => (
                      <tr
                        key={doc.id}
                        onClick={() => setSelected(doc)}
                        className={cn(
                          "border-b border-gray-50 last:border-0 cursor-pointer transition-colors",
                          selected?.id === doc.id ? "bg-zinc-50" : "hover:bg-zinc-50/60"
                        )}
                      >
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileTypeIcon filename={doc.original_filename} />
                            <div className="min-w-0">
                              <p className="font-bold text-gray-800 truncate">{doc.title || doc.original_filename || "-"}</p>
                              <p className="text-[10px] text-gray-400 truncate">{doc.original_filename}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 text-gray-600 capitalize">
                            {doc.document_type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-gray-600">
                          {doc.uploader?.name || "-"}
                          {isFromHr(doc) && (
                            <span className="ml-1.5 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">HR</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-gray-500">{formatSize(doc.file_size)}</td>
                        <td className="py-2.5 px-3 text-gray-500 whitespace-nowrap">{formatDate(doc.created_at)}</td>
                        <td className="py-2.5 px-4">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleDownload(doc)}
                              title="Unduh"
                              className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <Download size={14} />
                            </button>
                            {!isPayslip(doc) && (
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(doc)}
                                title="Hapus"
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: detail panel */}
        {selected && (
          <div className="w-[340px] shrink-0 bg-white border border-gray-200/80 rounded-2xl shadow-xs p-5 space-y-4 h-fit sticky top-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-gray-800 truncate">{selected.title || selected.original_filename}</h3>
                <p className="text-[10px] text-gray-400 truncate">{selected.original_filename}</p>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="p-1 text-gray-400 hover:text-gray-700 rounded-md cursor-pointer shrink-0">
                <X size={16} />
              </button>
            </div>

            <div className="rounded-xl border border-gray-100 bg-zinc-50 flex items-center justify-center overflow-hidden min-h-[180px]">
              {previewLoading ? (
                <Skeleton className="w-full h-[180px]" />
              ) : previewUrl ? (
                extensionOf(selected.original_filename) === "pdf" ? (
                  <iframe title="preview" src={previewUrl} className="w-full h-[260px]" />
                ) : (
                  <img src={previewUrl} alt={selected.title || "preview"} className="max-w-full max-h-[260px] object-contain" />
                )
              ) : (
                <div className="flex flex-col items-center gap-2 py-10 text-gray-400">
                  <FileTypeIcon filename={selected.original_filename} size={28} />
                  <p className="text-[11px]">Pratinjau tidak tersedia untuk tipe file ini.</p>
                </div>
              )}
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Kategori</span>
                <span className="font-semibold text-gray-700 capitalize">{selected.document_type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Untuk</span>
                <span className="font-semibold text-gray-700">{selected.user?.name || "-"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Diunggah Oleh</span>
                <span className="font-semibold text-gray-700">
                  {selected.uploader?.name || "-"} {isFromHr(selected) && "(HR)"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Ukuran</span>
                <span className="font-semibold text-gray-700">{formatSize(selected.file_size)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Tanggal</span>
                <span className="font-semibold text-gray-700">{formatDate(selected.created_at)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleDownload(selected)}
                className="flex-1 h-9 flex items-center justify-center gap-1.5 text-xs font-bold rounded-lg bg-zinc-100 hover:bg-zinc-200/80 text-gray-700 transition-colors cursor-pointer"
              >
                <Download size={13} /> Unduh
              </button>
              {!isPayslip(selected) && (
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
        )}
      </div>

      {showUpload && <UploadDocumentModal onCancel={() => setShowUpload(false)} onUploaded={handleUploaded} />}

      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Dokumen"
        message={`Apakah Anda yakin ingin menghapus "${deleteTarget?.title || deleteTarget?.original_filename}"? File akan dihapus secara permanen dan tidak bisa dikembalikan.`}
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
