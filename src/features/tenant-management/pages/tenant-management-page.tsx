import { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from "react";
import {
  Building2,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Mail,
  Phone,
  Palette,
  UploadCloud,
  Edit2,
  ShieldCheck,
  Sparkles,
  User,
  KeyRound,
  X
} from "lucide-react";
import {
  fetchTenantsAdminAPI,
  createTenantAPI,
  updateTenantAPI,
  type TenantAdminItem,
  type CreateTenantResult
} from "../api/tenant-management";
import { ReusableTable, type ColumnDef } from "@/shared/components/ui/reusable-table";
import { THEME_COLORS } from "@/shared/constants/colors";
import { useRouter } from "@/shared/router/router";
import { toast } from "sonner";

interface TenantManagementPageProps {
  user?: {
    name?: string;
    email?: string;
    role?: string;
  };
}

export function TenantManagementPage({ user: _user }: TenantManagementPageProps) {
  const { navigate } = useRouter();
  const [tenants, setTenants] = useState<TenantAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State: Create
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createSlug, setCreateSlug] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPhone, setCreatePhone] = useState("");
  const [createWeb, setCreateWeb] = useState("");
  const [createAddress, setCreateAddress] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createIsActive, setCreateIsActive] = useState(true);
  const [createMainColor, setCreateMainColor] = useState<string>(THEME_COLORS.hex.primary);
  const [createSubColor, setCreateSubColor] = useState<string>(THEME_COLORS.hex.padiKemakmuran);
  const [createLogoFile, setCreateLogoFile] = useState<File | null>(null);
  const [createLogoPreview, setCreateLogoPreview] = useState<string | null>(null);
  const createFileInputRef = useRef<HTMLInputElement>(null);

  // Modal State: Success Credentials Dialog
  const [createdResult, setCreatedResult] = useState<CreateTenantResult | null>(null);
  const [isCopiedUser, setIsCopiedUser] = useState(false);
  const [isCopiedPass, setIsCopiedPass] = useState(false);

  // Modal State: Edit
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<TenantAdminItem | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editWeb, setEditWeb] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [editMainColor, setEditMainColor] = useState<string>(THEME_COLORS.hex.primary);
  const [editSubColor, setEditSubColor] = useState<string>(THEME_COLORS.hex.padiKemakmuran);
  const [editLogoFile, setEditLogoFile] = useState<File | null>(null);
  const [editLogoPreview, setEditLogoPreview] = useState<string | null>(null);
  const [editRemoveLogo, setEditRemoveLogo] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const list = await fetchTenantsAdminAPI();
      setTenants(list);
    } catch (err: any) {
      toast.error(err.message || "Gagal memuat daftar tenant");
    } finally {
      setLoading(false);
    }
  };

  // Auto generate slug from name
  const handleNameChange = (nameVal: string) => {
    setCreateName(nameVal);
    const slugVal = nameVal
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    setCreateSlug(slugVal);
  };

  const handleCreateLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Ukuran file logo maksimal 10MB");
        return;
      }
      setCreateLogoFile(file);
      setCreateLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleEditLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Ukuran file logo maksimal 10MB");
        return;
      }
      setEditLogoFile(file);
      setEditLogoPreview(URL.createObjectURL(file));
      setEditRemoveLogo(false);
    }
  };

  const handleCreateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) {
      toast.error("Nama organisasi wajib diisi.");
      return;
    }
    if (!createSlug.trim()) {
      toast.error("Slug tenant wajib diisi.");
      return;
    }

    try {
      setCreating(true);
      const res = await createTenantAPI({
        name: createName,
        slug: createSlug,
        email: createEmail || undefined,
        phone: createPhone || undefined,
        web: createWeb || undefined,
        address: createAddress || undefined,
        description: createDescription || undefined,
        is_active: createIsActive,
        main_color: createMainColor,
        sub_color: createSubColor,
        logoFile: createLogoFile,
      });

      toast.success("Tenant baru berhasil didaftarkan!");
      setIsCreateOpen(false);
      resetCreateForm();
      loadTenants();

      // Show the credentials dialog
      if (res.admin_user) {
        setCreatedResult(res);
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal membuat tenant baru");
    } finally {
      setCreating(false);
    }
  };

  const resetCreateForm = () => {
    setCreateName("");
    setCreateSlug("");
    setCreateEmail("");
    setCreatePhone("");
    setCreateWeb("");
    setCreateAddress("");
    setCreateDescription("");
    setCreateIsActive(true);
    setCreateMainColor(THEME_COLORS.hex.primary);
    setCreateSubColor(THEME_COLORS.hex.padiKemakmuran);
    setCreateLogoFile(null);
    setCreateLogoPreview(null);
    if (createFileInputRef.current) createFileInputRef.current.value = "";
  };

  const openEditModal = (t: TenantAdminItem) => {
    setEditingTenant(t);
    setEditName(t.name || "");
    setEditSlug(t.slug || "");
    setEditEmail(t.email || "");
    setEditPhone(t.phone || "");
    setEditWeb(t.web || "");
    setEditAddress(t.address || "");
    setEditDescription(t.description || "");
    setEditIsActive(t.is_active !== false && t.is_active !== 0);
    setEditMainColor(t.main_color && t.main_color.startsWith("#") ? t.main_color : THEME_COLORS.hex.primary);
    setEditSubColor(t.sub_color && t.sub_color.startsWith("#") ? t.sub_color : THEME_COLORS.hex.padiKemakmuran);
    setEditLogoPreview(t.logo_url || t.logo || null);
    setEditLogoFile(null);
    setEditRemoveLogo(false);
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingTenant?.id) return;

    try {
      setSavingEdit(true);
      await updateTenantAPI(editingTenant.id, {
        name: editName,
        slug: editSlug,
        email: editEmail,
        phone: editPhone,
        web: editWeb,
        address: editAddress,
        description: editDescription,
        is_active: editIsActive,
        main_color: editMainColor,
        sub_color: editSubColor,
        logoFile: editLogoFile,
        removeLogo: editRemoveLogo,
      });

      toast.success("Data tenant berhasil diperbarui!");
      setIsEditOpen(false);
      loadTenants();
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui data tenant");
    } finally {
      setSavingEdit(false);
    }
  };

  const copyToClipboard = (text: string, type: "user" | "pass") => {
    navigator.clipboard.writeText(text);
    if (type === "user") {
      setIsCopiedUser(true);
      setTimeout(() => setIsCopiedUser(false), 2000);
    } else {
      setIsCopiedPass(true);
      setTimeout(() => setIsCopiedPass(false), 2000);
    }
    toast.success("Berhasil disalin ke clipboard!");
  };

  const filteredTenants = tenants.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.slug.toLowerCase().includes(q) ||
      (t.email && t.email.toLowerCase().includes(q)) ||
      (t.phone && t.phone.toLowerCase().includes(q))
    );
  });

  const totalTenants = tenants.length;
  const activeTenants = tenants.filter((t) => t.is_active !== false && t.is_active !== 0).length;
  const inactiveTenants = totalTenants - activeTenants;

  const columns: ColumnDef<TenantAdminItem>[] = [
    {
      header: "Organisasi / Tenant",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 shadow-2xs flex items-center justify-center overflow-hidden shrink-0">
            {row.logo_url || row.logo ? (
              <img
                src={row.logo_url || row.logo || ""}
                alt={row.name}
                className="w-full h-full object-contain p-1"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <span
                style={{ color: row.main_color || THEME_COLORS.hex.primary }}
                className="text-xs font-black"
              >
                {row.name.substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <span className="font-bold text-gray-900 block text-xs">{row.name}</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-gray-100 text-gray-600 rounded border border-gray-200">
                slug: {row.slug}
              </span>
              <span className="text-[10px] text-gray-400 font-medium">ID #{row.id}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Kontak & Alamat",
      cell: (row) => (
        <div className="space-y-1 text-xs">
          {row.email ? (
            <div className="flex items-center gap-1.5 text-gray-600">
              <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="truncate max-w-[150px]">{row.email}</span>
            </div>
          ) : null}
          {row.phone ? (
            <div className="flex items-center gap-1.5 text-gray-600">
              <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>{row.phone}</span>
            </div>
          ) : null}
          {!row.email && !row.phone ? <span className="text-gray-400 text-[11px]">—</span> : null}
        </div>
      ),
    },
    {
      header: "Warna Brand",
      cell: (row) => {
        const main = row.main_color || THEME_COLORS.hex.primary;
        const sub = row.sub_color || THEME_COLORS.hex.padiKemakmuran;
        return (
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-1 shrink-0">
              <div
                className="w-4 h-4 rounded-full border-2 border-white shadow-2xs"
                style={{ backgroundColor: main }}
                title={`Utama: ${main}`}
              />
              <div
                className="w-4 h-4 rounded-full border-2 border-white shadow-2xs"
                style={{ backgroundColor: sub }}
                title={`Sekunder: ${sub}`}
              />
            </div>
            <span className="text-[10px] font-mono font-medium text-gray-500">
              {main}
            </span>
          </div>
        );
      },
    },
    {
      header: "Status",
      cell: (row) => {
        const isActive = row.is_active !== false && row.is_active !== 0;
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
              isActive
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-gray-100 text-gray-600 border-gray-200"
            }`}
          >
            {isActive ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-gray-400" />}
            {isActive ? "Aktif" : "Non-Aktif"}
          </span>
        );
      },
    },
    {
      header: "Aksi",
      className: "text-right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => navigate("TenantMapping")}
            className="px-2.5 py-1 bg-white hover:bg-orange-50 text-gray-700 hover:text-[#E0542C] border border-gray-200 hover:border-orange-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
            title="Kelola Hak Akses Menu"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#E0542C]" />
            <span>Hak Akses</span>
          </button>
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
            title="Edit Tenant"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Building2 style={{ color: THEME_COLORS.hex.primary }} className="w-5 h-5" />
              Manajemen Tenant
            </h1>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-orange-500/10 text-orange-600 border border-orange-200">
              Super Admin
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Daftarkan tenant instansi baru, atur konfigurasi brand, dan kelola akun administrator tenant.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          style={{ backgroundColor: THEME_COLORS.hex.primary }}
          className="inline-flex items-center gap-2 px-4 py-2 text-white text-xs font-bold rounded-xl shadow-sm hover:opacity-95 transition-all cursor-pointer active:scale-98 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Tenant Baru</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 block">Total Tenant Terdaftar</span>
            <h3 className="text-xl font-black text-gray-900 mt-0.5">{totalTenants}</h3>
          </div>
          <div
            style={{ backgroundColor: `${THEME_COLORS.hex.primary}15`, color: THEME_COLORS.hex.primary }}
            className="w-10 h-10 rounded-xl flex items-center justify-center"
          >
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 block">Tenant Aktif</span>
            <h3 className="text-xl font-black text-emerald-600 mt-0.5">{activeTenants}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 block">Tenant Non-Aktif</span>
            <h3 className="text-xl font-black text-gray-500 mt-0.5">{inactiveTenants}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-gray-800">Daftar Instansi / Tenant</h2>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold">
              {filteredTenants.length} Tenant
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari tenant, slug, email..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-gray-300 transition-colors"
            />
          </div>
        </div>

        <div className="p-2">
          <ReusableTable
            columns={columns}
            data={filteredTenants}
            loading={loading}
            emptyMessage="Belum ada data tenant yang sesuai pencarian."
            showSearch={false}
          />
        </div>
      </div>

      {/* MODAL: Tambah Tenant Baru */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-gray-200 shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between p-4.5 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div
                  style={{ backgroundColor: `${THEME_COLORS.hex.primary}15`, color: THEME_COLORS.hex.primary }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                >
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-900">Tambah Tenant Baru</h3>
                  <p className="text-[11px] text-gray-500">
                    Sistem akan otomatis membuat akun Admin pertama untuk tenant ini.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-700 block">
                    Nama Organisasi / Tenant <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={createName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Contoh: PT Sukses Bersama"
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-700 block">
                    Slug Identitas URL <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={createSlug}
                    onChange={(e) => setCreateSlug(e.target.value.toLowerCase().trim())}
                    placeholder="pt-sukses-bersama"
                    className="w-full px-3 py-2 text-xs font-mono bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-700 block">Email Kontak</label>
                  <input
                    type="email"
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    placeholder="admin@perusahaan.com"
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-700 block">Nomor Telepon</label>
                  <input
                    type="tel"
                    value={createPhone}
                    onChange={(e) => setCreatePhone(e.target.value)}
                    placeholder="08123456789"
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-700 block">Website</label>
                  <input
                    type="url"
                    value={createWeb}
                    onChange={(e) => setCreateWeb(e.target.value)}
                    placeholder="https://perusahaan.com"
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-700 block">Status Tenant</label>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="createIsActive"
                      checked={createIsActive}
                      onChange={(e) => setCreateIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
                    />
                    <label htmlFor="createIsActive" className="text-xs font-semibold text-gray-700 cursor-pointer">
                      Tenant Langsung Aktif
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-700 block">Alamat Instansi</label>
                <textarea
                  rows={2}
                  value={createAddress}
                  onChange={(e) => setCreateAddress(e.target.value)}
                  placeholder="Alamat kantor..."
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-orange-500 resize-none"
                />
              </div>

              {/* Brand Colors */}
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                <div className="flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-[#E0542C]" />
                  <span className="text-xs font-bold text-gray-800">Warna Brand Tema</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-gray-600 block">Warna Utama (Main)</label>
                    <div className="flex items-center gap-2 p-1 bg-white rounded-lg border border-gray-200">
                      <input
                        type="color"
                        value={createMainColor}
                        onChange={(e) => setCreateMainColor(e.target.value.toUpperCase())}
                        className="w-7 h-7 rounded border-0 cursor-pointer p-0 bg-transparent shrink-0"
                      />
                      <input
                        type="text"
                        maxLength={7}
                        value={createMainColor}
                        onChange={(e) => setCreateMainColor(e.target.value.toUpperCase())}
                        className="w-full text-xs font-mono font-bold text-gray-700 bg-transparent focus:outline-none uppercase"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-gray-600 block">Warna Sekunder (Sub)</label>
                    <div className="flex items-center gap-2 p-1 bg-white rounded-lg border border-gray-200">
                      <input
                        type="color"
                        value={createSubColor}
                        onChange={(e) => setCreateSubColor(e.target.value.toUpperCase())}
                        className="w-7 h-7 rounded border-0 cursor-pointer p-0 bg-transparent shrink-0"
                      />
                      <input
                        type="text"
                        maxLength={7}
                        value={createSubColor}
                        onChange={(e) => setCreateSubColor(e.target.value.toUpperCase())}
                        className="w-full text-xs font-mono font-bold text-gray-700 bg-transparent focus:outline-none uppercase"
                      />
                    </div>
                  </div>
                </div>

                {/* Preset Fast Picker */}
                <div className="pt-1 flex flex-wrap gap-1.5">
                  {THEME_COLORS.presets.slice(0, 4).map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => {
                        setCreateMainColor(p.main);
                        setCreateSubColor(p.sub);
                      }}
                      className="px-2 py-0.5 bg-white hover:bg-gray-100 border border-gray-200 rounded-md text-[10px] font-medium text-gray-700 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.main }} />
                      <span>{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Logo Upload */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                  {createLogoPreview ? (
                    <img src={createLogoPreview} alt="Logo" className="w-full h-full object-contain p-1" />
                  ) : (
                    <Building2 className="w-6 h-6 text-gray-300" />
                  )}
                </div>
                <div className="flex-1">
                  <span className="text-xs font-bold text-gray-800 block">Logo Instansi</span>
                  <input
                    type="file"
                    ref={createFileInputRef}
                    onChange={handleCreateLogoChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => createFileInputRef.current?.click()}
                      className="px-2.5 py-1 bg-white hover:bg-gray-100 text-gray-700 text-[11px] font-semibold rounded-lg border border-gray-200 flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <UploadCloud className="w-3 h-3" />
                      Pilih Logo
                    </button>
                    {createLogoPreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setCreateLogoPreview(null);
                          setCreateLogoFile(null);
                        }}
                        className="text-rose-500 hover:text-rose-600 text-[11px] font-semibold cursor-pointer"
                      >
                        Batal
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  style={{ backgroundColor: THEME_COLORS.hex.primary }}
                  className="px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {creating ? "Mendaftarkan..." : "Daftarkan Tenant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Success Credentials Dialog */}
      {createdResult && createdResult.admin_user && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full border border-gray-200 shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-gray-900">Tenant & Akun Admin Dibuat!</h3>
              <p className="text-xs text-gray-500 mt-1">
                Tenant <strong>{createdResult.tenant.name}</strong> berhasil dibuat beserta akun login administrator awalnya.
              </p>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-gray-500">
                  <User className="w-3.5 h-3.5" />
                  <span>Username</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-gray-900">
                    {createdResult.admin_user.username}
                  </span>
                  <button
                    onClick={() => copyToClipboard(createdResult.admin_user?.username || "", "user")}
                    className="p-1 hover:bg-gray-200 rounded text-gray-600 transition-colors cursor-pointer"
                    title="Salin Username"
                  >
                    {isCopiedUser ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-gray-200">
                <div className="flex items-center gap-1.5 text-gray-500">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Password Awal</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-orange-600">
                    {createdResult.admin_user.password}
                  </span>
                  <button
                    onClick={() => copyToClipboard(createdResult.admin_user?.password || "", "pass")}
                    className="p-1 hover:bg-gray-200 rounded text-gray-600 transition-colors cursor-pointer"
                    title="Salin Password"
                  >
                    {isCopiedPass ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 font-medium">
              ⚠️ <strong>Penting:</strong> Simpan password ini sekarang untuk diserahkan ke administrator tenant. Password tidak dapat ditampilkan kembali demi keamanan.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCreatedResult(null)}
                style={{ backgroundColor: THEME_COLORS.hex.primary }}
                className="w-full py-2 text-xs font-bold text-white rounded-xl shadow-xs hover:opacity-95 transition-all cursor-pointer"
              >
                Saya Sudah Menyimpan Kredensial
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Edit Tenant */}
      {isEditOpen && editingTenant && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-gray-200 shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between p-4.5 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div
                  style={{ backgroundColor: `${THEME_COLORS.hex.primary}15`, color: THEME_COLORS.hex.primary }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                >
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-900">Edit Data Tenant</h3>
                  <p className="text-[11px] text-gray-500">Perbarui profil dan identitas instansi #{editingTenant.id}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-700 block">
                    Nama Organisasi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-700 block">
                    Slug Identitas <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editSlug}
                    onChange={(e) => setEditSlug(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-700 block">Email Kontak</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-700 block">Nomor Telepon</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-700 block">Website</label>
                  <input
                    type="url"
                    value={editWeb}
                    onChange={(e) => setEditWeb(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-700 block">Status Tenant</label>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="editIsActive"
                      checked={editIsActive}
                      onChange={(e) => setEditIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
                    />
                    <label htmlFor="editIsActive" className="text-xs font-semibold text-gray-700 cursor-pointer">
                      Tenant Aktif
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-700 block">Alamat</label>
                <textarea
                  rows={2}
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-orange-500 resize-none"
                />
              </div>

              {/* Colors */}
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                <div className="flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-[#E0542C]" />
                  <span className="text-xs font-bold text-gray-800">Warna Brand Tema</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-gray-600 block">Warna Utama (Main)</label>
                    <div className="flex items-center gap-2 p-1 bg-white rounded-lg border border-gray-200">
                      <input
                        type="color"
                        value={editMainColor}
                        onChange={(e) => setEditMainColor(e.target.value.toUpperCase())}
                        className="w-7 h-7 rounded border-0 cursor-pointer p-0 bg-transparent shrink-0"
                      />
                      <input
                        type="text"
                        maxLength={7}
                        value={editMainColor}
                        onChange={(e) => setEditMainColor(e.target.value.toUpperCase())}
                        className="w-full text-xs font-mono font-bold text-gray-700 bg-transparent focus:outline-none uppercase"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-gray-600 block">Warna Sekunder (Sub)</label>
                    <div className="flex items-center gap-2 p-1 bg-white rounded-lg border border-gray-200">
                      <input
                        type="color"
                        value={editSubColor}
                        onChange={(e) => setEditSubColor(e.target.value.toUpperCase())}
                        className="w-7 h-7 rounded border-0 cursor-pointer p-0 bg-transparent shrink-0"
                      />
                      <input
                        type="text"
                        maxLength={7}
                        value={editSubColor}
                        onChange={(e) => setEditSubColor(e.target.value.toUpperCase())}
                        className="w-full text-xs font-mono font-bold text-gray-700 bg-transparent focus:outline-none uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Logo */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                  {editLogoPreview ? (
                    <img src={editLogoPreview} alt="Logo" className="w-full h-full object-contain p-1" />
                  ) : (
                    <Building2 className="w-6 h-6 text-gray-300" />
                  )}
                </div>
                <div className="flex-1">
                  <span className="text-xs font-bold text-gray-800 block">Logo Instansi</span>
                  <input
                    type="file"
                    ref={editFileInputRef}
                    onChange={handleEditLogoChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => editFileInputRef.current?.click()}
                      className="px-2.5 py-1 bg-white hover:bg-gray-100 text-gray-700 text-[11px] font-semibold rounded-lg border border-gray-200 flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <UploadCloud className="w-3 h-3" />
                      Ganti Logo
                    </button>
                    {editLogoPreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditLogoPreview(null);
                          setEditLogoFile(null);
                          setEditRemoveLogo(true);
                          if (editFileInputRef.current) editFileInputRef.current.value = "";
                        }}
                        className="text-rose-500 hover:text-rose-600 text-[11px] font-semibold cursor-pointer"
                      >
                        Hapus Logo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  style={{ backgroundColor: THEME_COLORS.hex.primary }}
                  className="px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {savingEdit ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
