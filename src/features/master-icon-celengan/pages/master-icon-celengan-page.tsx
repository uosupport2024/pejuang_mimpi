import { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from "react";
import {
  Sparkles,
  Plus,
  Search,
  Building2,
  Trash2,
  UploadCloud,
  X,
  Loader2,
  LayoutGrid,
  List,
  Image as ImageIcon,
  CheckCircle2,
  HelpCircle,
  RefreshCw
} from "lucide-react";
import {
  fetchTenantIconsAPI,
  createTenantIconAPI,
  deleteTenantIconAPI,
  syncDefaultIconsAPI,
  type TenantIconItem
} from "../api/master-icon-celengan";
import { fetchTenantsAdminAPI, type TenantAdminItem } from "@/features/tenant-management/api/tenant-management";
import { ReusableTable, type ColumnDef } from "@/shared/components/ui/reusable-table";
import { THEME_COLORS } from "@/shared/constants/colors";
import { CHICKEN_ICONS } from "@/shared/utils/icons";
import { toast } from "sonner";

interface MasterIconCelenganPageProps {
  user?: {
    name?: string;
    email?: string;
    role?: string;
  };
}

export function MasterIconCelenganPage({ user: _user }: MasterIconCelenganPageProps) {
  const [icons, setIcons] = useState<TenantIconItem[]>([]);
  const [tenants, setTenants] = useState<TenantAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTenantId, setSelectedTenantId] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");
  const [syncing, setSyncing] = useState(false);

  // Create Icon Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTenantId, setModalTenantId] = useState<string>("");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tenantsData, iconsData] = await Promise.all([
        fetchTenantsAdminAPI(),
        fetchTenantIconsAPI(selectedTenantId === "all" ? undefined : selectedTenantId)
      ]);
      setTenants(tenantsData);
      setIcons(iconsData);
      if (tenantsData.length > 0 && !modalTenantId) {
        setModalTenantId(String(tenantsData[0].id));
      }
    } catch (err: any) {
      console.error("Failed to load master icons:", err);
      toast.error("Gagal memuat data master icon celengan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedTenantId]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 10MB");
        return;
      }
      setIconFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleOpenModal = () => {
    setIconFile(null);
    setPreviewUrl(null);
    if (selectedTenantId !== "all") {
      setModalTenantId(selectedTenantId);
    } else if (tenants.length > 0) {
      setModalTenantId(String(tenants[0].id));
    }
    setIsModalOpen(true);
  };

  const handleCreateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!iconFile) {
      toast.error("Silakan pilih file icon terlebih dahulu");
      return;
    }
    if (!modalTenantId) {
      toast.error("Silakan pilih tenant untuk icon ini");
      return;
    }

    setSubmitting(true);
    try {
      await createTenantIconAPI(iconFile, modalTenantId);
      toast.success("Icon celengan berhasil didaftarkan untuk tenant!");
      setIsModalOpen(false);
      setIconFile(null);
      setPreviewUrl(null);
      await loadData();
    } catch (err: any) {
      console.error("Failed to upload icon:", err);
      toast.error(err.message || "Gagal mengupload icon celengan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSyncAll = async () => {
    const isFiltered = selectedTenantId !== "all";
    const targetTenant = tenants.find((t) => String(t.id) === selectedTenantId);
    const targetLabel = isFiltered && targetTenant ? `tenant "${targetTenant.name}"` : "semua tenant";

    if (
      !confirm(
        `Apakah Anda ingin mendistribusikan 51 icon celengan bawaan ke ${targetLabel}? (Hanya icon yang belum ada yang akan didaftarkan, tidak akan ada icon duplikat).`
      )
    ) {
      return;
    }

    setSyncing(true);
    try {
      const res = await syncDefaultIconsAPI(selectedTenantId);
      toast.success(res.message || `Berhasil mensinkronkan icon ke ${targetLabel}!`);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Gagal melakukan sinkronisasi icon");
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus icon celengan ini?")) return;
    setDeletingId(id);
    try {
      await deleteTenantIconAPI(id);
      toast.success("Icon celengan berhasil dihapus");
      setIcons((prev) => prev.filter((item) => String(item.id) !== String(id)));
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus icon");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredIcons = icons.filter((item) => {
    const q = search.toLowerCase();
    const tenantName = item.tenant?.name?.toLowerCase() || "";
    const tenantSlug = item.tenant?.slug?.toLowerCase() || "";
    const iconPath = item.icon?.toLowerCase() || "";
    return (
      tenantName.includes(q) ||
      tenantSlug.includes(q) ||
      iconPath.includes(q) ||
      String(item.id).includes(q)
    );
  });

  const defaultIconsCount = Object.keys(CHICKEN_ICONS).length;
  const tenantsWithCustomIcons = new Set(icons.map((i) => String(i.tenant_id))).size;

  const columns: ColumnDef<TenantIconItem>[] = [
    {
      header: "No.",
      cell: (_, index) => (
        <span className="text-gray-500 font-medium text-xs">{index + 1}</span>
      ),
      className: "w-12 text-center",
      sortable: false,
    },
    {
      header: "Preview Icon",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 shadow-2xs flex items-center justify-center p-1.5 overflow-hidden group hover:scale-105 transition-transform">
            <img
              src={row.icon_url}
              alt={`Icon #${row.id}`}
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          </div>
          <div>
            <span className="font-bold text-gray-800 text-xs block">Icon ID #{row.id}</span>
            <span className="text-[10px] text-gray-400 font-mono">
              {row.icon.split("/").pop()}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Tenant",
      cell: (row) => {
        const tenant = row.tenant || tenants.find((t) => String(t.id) === String(row.tenant_id));
        return (
          <div>
            <span className="font-semibold text-gray-800 text-xs block">
              {tenant ? tenant.name : `Tenant ID #${row.tenant_id}`}
            </span>
            {tenant?.slug && (
              <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded">
                slug: {tenant.slug}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Path Storage",
      cell: (row) => (
        <span className="text-xs font-mono text-gray-600 truncate max-w-[200px] block">
          {row.icon}
        </span>
      ),
    },
    {
      header: "Aksi",
      className: "w-20 text-center",
      cell: (row) => (
        <div className="flex items-center justify-center">
          <button
            onClick={() => handleDelete(row.id)}
            disabled={deletingId === row.id}
            className="p-1.5 bg-white hover:bg-rose-50 text-gray-400 hover:text-rose-600 border border-gray-200 hover:border-rose-200 rounded-lg transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            title="Hapus Icon"
          >
            {deletingId === row.id ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-200/80 pb-4">
        <div className="max-w-xl">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Sparkles style={{ color: THEME_COLORS.hex.primary }} className="w-5 h-5" />
              Master Icon Celengan
            </h1>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-orange-500/10 text-orange-600 border border-orange-200">
              Super Admin
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Daftarkan icon celengan khusus per tenant. Jika suatu tenant belum mendaftarkan icon khusus, sistem akan otomatis menggunakan icon default bawaan.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
          <button
            onClick={handleSyncAll}
            disabled={syncing}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 bg-white hover:bg-orange-50 text-gray-700 hover:text-orange-600 border border-gray-200 hover:border-orange-300 text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
            title="Distribusikan 51 icon bawaan ke tenant tanpa duplikasi"
          >
            <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${syncing ? "animate-spin text-orange-500" : "text-orange-500"}`} />
            <span>{syncing ? "Mensinkronkan..." : selectedTenantId !== "all" ? "Sinkronkan ke Tenant Ini" : "Sinkronkan ke Semua Tenant"}</span>
          </button>

          <button
            onClick={handleOpenModal}
            style={{ backgroundColor: THEME_COLORS.hex.primary }}
            className="inline-flex items-center justify-center gap-2 h-9 px-4 text-white text-xs font-bold rounded-xl shadow-sm hover:opacity-95 transition-all cursor-pointer active:scale-98 shrink-0 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Tambah Icon Celengan</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 block">Total Icon Custom Terdaftar</span>
            <h3 className="text-xl font-black text-gray-900 mt-0.5">{icons.length}</h3>
          </div>
          <div
            style={{ backgroundColor: `${THEME_COLORS.hex.primary}15`, color: THEME_COLORS.hex.primary }}
            className="w-10 h-10 rounded-xl flex items-center justify-center"
          >
            <ImageIcon className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 block">Tenant dengan Custom Icon</span>
            <h3 className="text-xl font-black text-emerald-600 mt-0.5">
              {tenantsWithCustomIcons} / {tenants.length}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 block">Icon Default (Fallback)</span>
            <h3 className="text-xl font-black text-orange-600 mt-0.5">{defaultIconsCount} Icon</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <HelpCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters & Content Area */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Tenant */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-600">Filter Tenant:</span>
              <select
                value={selectedTenantId}
                onChange={(e) => setSelectedTenantId(e.target.value)}
                className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-gray-300 transition-colors font-medium text-gray-800"
              >
                <option value="all">Semua Tenant ({icons.length} Icon)</option>
                {tenants.map((t) => {
                  const count = icons.filter((i) => String(i.tenant_id) === String(t.id)).length;
                  return (
                    <option key={t.id} value={String(t.id)}>
                      {t.name} ({count} Icon)
                    </option>
                  );
                })}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white text-gray-800 shadow-xs"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                title="Tampilan Galeri / Grid"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Galeri</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white text-gray-800 shadow-xs"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                title="Tampilan Tabel"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tabel</span>
              </button>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari tenant, path icon..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-gray-300 transition-colors"
            />
          </div>
        </div>

        {/* Content View */}
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
            <span className="text-xs">Memuat data icon celengan...</span>
          </div>
        ) : filteredIcons.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mb-3">
              <ImageIcon className="w-6 h-6" />
            </div>
            <h4 className="text-xs font-bold text-gray-800">Belum Ada Icon Custom</h4>
            <p className="text-[11px] text-gray-500 max-w-sm mt-1">
              {selectedTenantId !== "all"
                ? "Tenant yang dipilih belum mendaftarkan icon khusus. Tenant ini akan otomatis memakai icon celengan default."
                : "Belum ada icon celengan custom yang diunggah untuk tenant manapun."}
            </p>
            <button
              onClick={handleOpenModal}
              style={{ backgroundColor: THEME_COLORS.hex.primary }}
              className="mt-4 px-3 py-1.5 text-white text-xs font-bold rounded-xl shadow-sm hover:opacity-95 transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Unggah Icon Baru</span>
            </button>
          </div>
        ) : viewMode === "table" ? (
          <div className="p-2">
            <ReusableTable
              columns={columns}
              data={filteredIcons}
              loading={loading}
              emptyMessage="Belum ada data icon."
              showSearch={false}
            />
          </div>
        ) : (
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredIcons.map((item) => {
              const tenant = item.tenant || tenants.find((t) => String(t.id) === String(item.tenant_id));
              return (
                <div
                  key={item.id}
                  className="p-3 bg-gray-50/70 hover:bg-white rounded-2xl border border-gray-200/80 hover:border-gray-300 hover:shadow-md transition-all group flex flex-col items-center text-center relative"
                >
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="absolute top-2 right-2 p-1.5 bg-white text-gray-400 hover:text-rose-600 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-50 border border-gray-200 transition-all cursor-pointer shadow-xs"
                    title="Hapus Icon"
                  >
                    {deletingId === item.id ? (
                      <Loader2 className="w-3 h-3 animate-spin text-rose-500" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                  </button>

                  <div className="w-20 h-20 rounded-xl bg-white border border-gray-100 shadow-2xs flex items-center justify-center p-2 mb-2 group-hover:scale-105 transition-transform">
                    <img
                      src={item.icon_url}
                      alt={`Icon #${item.id}`}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <span className="text-xs font-bold text-gray-800 line-clamp-1 w-full">
                    {tenant?.name || `Tenant #${item.tenant_id}`}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono truncate w-full mt-0.5">
                    {item.icon.split("/").pop()}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fallback Reference Card */}
      <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 mt-0.5">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-gray-800">Mekanisme Fallback Otomatis</h4>
          <p className="text-[11px] text-gray-600 leading-relaxed">
            Saat pengguna dari instansi/tenant tertentu membuat celengan, sistem akan memeriksa apakah tenant tersebut memiliki icon khusus di master ini. Jika <strong>ada</strong>, pilihan icon tenant tersebut akan dimunculkan. Jika <strong>belum ada</strong>, sistem tetap berjalan lancar dengan menampilkan icon celengan bawaan (default {defaultIconsCount} icon ayam).
          </p>
        </div>
      </div>

      {/* MODAL: Tambah Icon Celengan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full border border-gray-200 shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div
                  style={{ backgroundColor: `${THEME_COLORS.hex.primary}15`, color: THEME_COLORS.hex.primary }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                >
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-900">Tambah Icon Celengan</h3>
                  <p className="text-[10px] text-gray-500">Pilih tenant dan unggah file gambar icon</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-700 block">
                  Pilih Tenant / Instansi <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={modalTenantId}
                  onChange={(e) => setModalTenantId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-orange-500 font-medium text-gray-800"
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={String(t.id)}>
                      {t.name} ({t.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-700 block">
                  File Gambar Icon <span className="text-rose-500">*</span>
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {previewUrl ? (
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col items-center justify-center relative">
                    <button
                      type="button"
                      onClick={() => {
                        setIconFile(null);
                        setPreviewUrl(null);
                      }}
                      className="absolute top-2 right-2 p-1 bg-white hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-full border border-gray-200 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-24 h-24 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center p-2 mb-2">
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[11px] font-semibold text-gray-700">{iconFile?.name}</span>
                    <span className="text-[10px] text-gray-400">
                      {((iconFile?.size || 0) / 1024).toFixed(1)} KB
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-6 border-2 border-dashed border-gray-300 hover:border-orange-500 rounded-2xl bg-gray-50/50 hover:bg-orange-50/20 transition-all flex flex-col items-center justify-center text-center cursor-pointer group"
                  >
                    <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-orange-500 transition-colors mb-2" />
                    <span className="text-xs font-bold text-gray-700 group-hover:text-orange-600 transition-colors">
                      Klik untuk memilih gambar
                    </span>
                    <span className="text-[10px] text-gray-400 mt-0.5">
                      PNG, SVG, JPG, atau WebP (Maksimal 10MB)
                    </span>
                  </button>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting || !iconFile}
                  style={{ backgroundColor: THEME_COLORS.hex.primary }}
                  className="px-4 py-2 text-xs font-bold text-white rounded-xl hover:opacity-95 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Mengunggah...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Simpan Icon</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
