import { useState, useEffect } from "react";
import { useRouter } from "@/shared/router/router";
import { createEmployee, fetchMasters, type MasterData } from "../api/employee";
import { createContract, updateContractAssignment, fetchActiveContract } from "../api/payroll-allocation";
import { fetchGolongans, createGolongan, type BackendGolongan } from "@/features/organization/api/organization";
import { fetchHierarchy, type HierarchyNode } from "@/features/org-management/api/org-management";
import { fetchTenantsAPI } from "@/features/tenant-mapping/api/tenant-mapping";
import { toast } from "sonner";
import { FileWarning } from "lucide-react";
import { FormField } from "@/shared/components/ui/form-field";
import { cn } from "@/shared/lib/utils";
import { THEME_COLORS } from "@/shared/constants/colors";

const NO_GOLONGAN_VALUE = "__none__";
const NO_MANAGER_VALUE = "__none__";

const TABS = [
  { id: "pribadi", label: "Informasi Pribadi" },
  { id: "status", label: "Status & Jabatan" },
  { id: "identitas", label: "Dokumen" },
  { id: "cuti", label: "Cuti & Izin" },
  { id: "gaji", label: "Penjumlahan Gaji" },
  { id: "potongan", label: "Pengurangan Gaji" },
  { id: "tunjangan", label: "Tunjangan & Potongan" },
];

interface EmployeeAddPageProps {
  user?: {
    email?: string;
    tenant_id?: number | string;
    tenant?: { id?: number | string; name?: string } | null;
    tenant_list?: { tenant_id?: number | string; tenant_name?: string }[];
  };
}

export function EmployeeAddPage({ user }: EmployeeAddPageProps) {
  const { navigate } = useRouter();
  const [activeTab, setActiveTab] = useState("pribadi");
  const [masters, setMasters] = useState<MasterData | null>(null);
  const [loadingMasters, setLoadingMasters] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Super admin manages multiple tenants and always sees/controls the
  // Tenant field; every other admin only ever works within their own
  // tenant, so it's preset silently and hidden to avoid confusion.
  const isSuperAdmin = user?.email?.toLowerCase() === "admin@gmail.com";
  const currentTenantId = user?.tenant_id || user?.tenant?.id || user?.tenant_list?.[0]?.tenant_id || 3;
  const currentTenantName = user?.tenant?.name || user?.tenant_list?.[0]?.tenant_name || "Tenant Saat Ini";
  const [tenantOptions, setTenantOptions] = useState([{ value: String(currentTenantId), label: currentTenantName }]);

  // Posisi & Atasan — set on the new employee's contract, created right
  // after the employee itself is saved (a brand-new employee has no
  // contract yet, so these can't be written until then).
  const [golonganId, setGolonganId] = useState(NO_GOLONGAN_VALUE);
  const [managerContractId, setManagerContractId] = useState(NO_MANAGER_VALUE);
  const [golonganOptions, setGolonganOptions] = useState<BackendGolongan[]>([]);
  const [managerOptions, setManagerOptions] = useState<HierarchyNode[]>([]);
  const [newGolonganName, setNewGolonganName] = useState("");
  const [addingGolongan, setAddingGolongan] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    foto_karyawan: "",
    email: "",
    telepon: "",
    username: "",
    password: "",
    tenant_id: String(currentTenantId),
    lokasi_id: "",
    jabatan_id: "",
    tgl_lahir: "",
    tgl_join: "",
    masa_berlaku: "",
    role_name: "staff",
    gender: "Laki-Laki",
    is_admin: "user", // Dashboard: admin / user

    // Status & Jabatan
    status_nikah: "TK/0",
    status_pajak: "TK/0",

    // Dokumen Identitas
    ktp: "",
    kartu_keluarga: "",
    bpjs_kesehatan: "",
    bpjs_ketenagakerjaan: "",
    npwp: "",
    sim: "",
    pkwt: "",
    kontrak: "",
    tgl_mulai_pkwt: "",
    tgl_berakhir_pkwt: "",
    rekening: "",
    bank: "",
    nama_rekening: "",

    // Cuti & Izin
    izin_cuti: "12",
    izin_lainnya: "0", // Izin Masuk
    izin_telat: "0",
    izin_pulang_cepat: "0",

    // Penjumlahan Gaji
    gaji_harian: "0",
    gaji_pokok: "0",
    makan_transport: "0",
    lembur: "0",
    kehadiran_full: "0",
    thr: "0",
    bonus_pribadi: "0",
    bonus_team: "0",
    bonus_jackpot: "0",

    // Pengurangan Gaji
    potong_izin: "0",
    potong_terlambat: "0",
    potong_mangkir: "0",
    saldo_kasbon: "0",

    // Tunjangan & Potongan Pajak / BPJS
    tunjangan_bpjs_kesehatan: "0",
    tunjangan_bpjs_ketenagakerjaan: "0",
    potongan_bpjs_kesehatan: "0",
    potongan_bpjs_ketenagakerjaan: "0",
    tunjangan_pajak: "0",
  });

  useEffect(() => {
    fetchMasters()
      .then((data) => {
        setMasters(data);
        if (data.lokasi.length > 0) {
          setFormData((prev) => ({ ...prev, lokasi_id: String(data.lokasi[0].id) }));
        }
        if (data.jabatan.length > 0) {
          setFormData((prev) => ({ ...prev, jabatan_id: String(data.jabatan[0].id) }));
        }
        setLoadingMasters(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Gagal memuat data referensi.");
        setLoadingMasters(false);
      });
  }, []);

  useEffect(() => {
    fetchHierarchy()
      .then(setManagerOptions)
      .catch((err: any) => toast.error(err.message || "Gagal memuat daftar atasan."));
  }, []);

  useEffect(() => {
    if (!isSuperAdmin) return;
    fetchTenantsAPI()
      .then((tenants) => {
        if (tenants.length > 0) {
          setTenantOptions(tenants.map((t) => ({ value: String(t.id), label: t.name })));
        }
      })
      .catch((err: any) => toast.error(err.message || "Gagal memuat daftar tenant."));
  }, [isSuperAdmin]);

  // Posisi is jabatan-scoped — refetch whenever Divisi changes, and drop
  // the current selection if it no longer belongs to the newly-picked
  // jabatan.
  useEffect(() => {
    if (!formData.jabatan_id) {
      setGolonganOptions([]);
      return;
    }
    fetchGolongans(Number(formData.jabatan_id))
      .then((options) => {
        setGolonganOptions(options);
        setGolonganId((prev) => (prev === NO_GOLONGAN_VALUE || options.some((o) => String(o.id) === prev) ? prev : NO_GOLONGAN_VALUE));
      })
      .catch((err: any) => toast.error(err.message || "Gagal memuat daftar posisi."));
  }, [formData.jabatan_id]);

  const handleAddGolongan = async () => {
    if (!formData.jabatan_id) {
      toast.error("Pilih Divisi terlebih dahulu.");
      return;
    }
    if (!newGolonganName.trim()) {
      toast.error("Nama posisi harus diisi.");
      return;
    }
    setAddingGolongan(true);
    try {
      const created = await createGolongan(Number(formData.jabatan_id), newGolonganName.trim());
      setGolonganOptions((prev) => [...prev, created]);
      setGolonganId(String(created.id));
      setNewGolonganName("");
      toast.success("Posisi berhasil ditambahkan.");
    } catch (err: any) {
      toast.error(err.message || "Gagal menambahkan posisi.");
    } finally {
      setAddingGolongan(false);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getMasaKerjaStr = (joinDateStr: string) => {
    if (!joinDateStr) return "0 Tahun, 0 Bulan, 0 Hari.";
    const joinDate = new Date(joinDateStr);
    if (isNaN(joinDate.getTime())) return "0 Tahun, 0 Bulan, 0 Hari.";
    const now = new Date();
    let years = now.getFullYear() - joinDate.getFullYear();
    let months = now.getMonth() - joinDate.getMonth();
    let days = now.getDate() - joinDate.getDate();

    if (days < 0) {
      months -= 1;
      const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += lastMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    return `${years} Tahun, ${months} Bulan, ${days} Hari.`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const submitData = {
        ...formData,
        lokasi_id: formData.lokasi_id ? Number(formData.lokasi_id) : null,
        jabatan_id: formData.jabatan_id ? Number(formData.jabatan_id) : null,
        tenant_id: Number(formData.tenant_id),
        izin_cuti: Number(formData.izin_cuti),
        izin_lainnya: Number(formData.izin_lainnya),
        izin_telat: Number(formData.izin_telat),
        izin_pulang_cepat: Number(formData.izin_pulang_cepat),
        gaji_harian: Number(formData.gaji_harian),
        gaji_pokok: Number(formData.gaji_pokok),
        makan_transport: Number(formData.makan_transport),
        lembur: Number(formData.lembur),
        kehadiran_full: Number(formData.kehadiran_full),
        thr: Number(formData.thr),
        bonus_pribadi: Number(formData.bonus_pribadi),
        bonus_team: Number(formData.bonus_team),
        bonus_jackpot: Number(formData.bonus_jackpot),
        potong_izin: Number(formData.potong_izin),
        potong_terlambat: Number(formData.potong_terlambat),
        potong_mangkir: Number(formData.potong_mangkir),
        saldo_kasbon: Number(formData.saldo_kasbon),
        tunjangan_bpjs_kesehatan: Number(formData.tunjangan_bpjs_kesehatan),
        tunjangan_bpjs_ketenagakerjaan: Number(formData.tunjangan_bpjs_ketenagakerjaan),
        potongan_bpjs_kesehatan: Number(formData.potongan_bpjs_kesehatan),
        potongan_bpjs_ketenagakerjaan: Number(formData.potongan_bpjs_ketenagakerjaan),
        tunjangan_pajak: Number(formData.tunjangan_pajak),
      };

      const created = await createEmployee(submitData);
      toast.success("Pegawai berhasil ditambahkan!");

      // Posisi/Atasan live on the contract, not on `users`. A contract is
      // already auto-provisioned for the new employee's tenant as soon as
      // the backend saves the User row (SyncsTenantContract) — reuse that
      // one instead of creating a second, which used to leave the employee
      // with two contract rows (the auto-provisioned one expired, a
      // duplicate active one from here).
      if (golonganId !== NO_GOLONGAN_VALUE || managerContractId !== NO_MANAGER_VALUE) {
        try {
          const contract =
            (await fetchActiveContract(created.id)) ||
            (await createContract({
              user_id: created.id,
              tenant_id: Number(formData.tenant_id),
              contract_start_date: new Date().toISOString().slice(0, 10),
            }));
          await updateContractAssignment(contract.id, {
            golongan_id: golonganId === NO_GOLONGAN_VALUE ? null : Number(golonganId),
            manager_contract_id: managerContractId === NO_MANAGER_VALUE ? null : Number(managerContractId),
          });
        } catch (err: any) {
          toast.error(err.message || "Pegawai dibuat, namun gagal mengatur posisi/atasan.");
        }
      }

      navigate("Employee");
    } catch (err: any) {
      toast.error(err.message || "Gagal menambahkan pegawai.");
    } finally {
      setSubmitting(false);
    }
  };

  const lokasiOptions = masters?.lokasi.map(l => ({ value: String(l.id), label: l.nama_lokasi })) || [];
  const jabatanOptions = masters?.jabatan.map(j => ({ value: String(j.id), label: j.nama_jabatan })) || [];

  const golonganComboOptions = [
    { value: NO_GOLONGAN_VALUE, label: "— Tidak ada —" },
    ...golonganOptions.map((g) => ({ value: String(g.id), label: g.name })),
  ];
  const managerComboOptions = [
    { value: NO_MANAGER_VALUE, label: "— Tidak ada —" },
    ...managerOptions.map((m) => ({ value: String(m.contract_id), label: `${m.name || "-"} — ${m.jabatan?.nama_jabatan || "-"}` })),
  ];

  const roleOptions = [
    { value: "staff", label: "staff" },
    { value: "admin", label: "admin" },
    { value: "finance", label: "finance" },
    { value: "general_manager", label: "general_manager" },
    { value: "hrd", label: "hrd" },
    { value: "kepala_cabang", label: "kepala_cabang" },
    { value: "regional_manager", label: "regional_manager" },
  ];
  const genderOptions = [
    { value: "Laki-Laki", label: "Laki-Laki" },
    { value: "Perempuan", label: "Perempuan" },
  ];
  const isAdminOptions = [
    { value: "admin", label: "admin" },
    { value: "user", label: "user" },
  ];
  const statusNikahOptions = [
    { value: "TK/0", label: "TK/0" },
    { value: "TK/1", label: "TK/1" },
    { value: "TK/2", label: "TK/2" },
    { value: "TK/3", label: "TK/3" },
    { value: "K/0", label: "K/0" },
    { value: "K/1", label: "K/1" },
    { value: "K/2", label: "K/2" },
    { value: "K/3", label: "K/3" },
  ];
  const statusPajakOptions = statusNikahOptions;

  return (
    <div className="w-full space-y-6">


      {/* Tabs navigation */}
      <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-none gap-2 bg-white px-4 py-1.5 rounded-xl shadow-xs border border-gray-200/80">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            style={activeTab === tab.id ? { color: THEME_COLORS.hex.primary, borderColor: THEME_COLORS.hex.primary } : undefined}
            className={cn(
              "px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer",
              activeTab === tab.id
                ? ""
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tab 1: Informasi Pribadi */}
        {activeTab === "pribadi" && (
          <div className="bg-white border border-gray-200/80 rounded-2xl shadow-xs p-6 space-y-4">
            <h2 style={{ color: THEME_COLORS.hex.primary }} className="text-sm font-semibold border-b border-gray-100 pb-2">Informasi Pribadi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Nama Pegawai *" type="text" name="name" required value={formData.name} onChange={handleChange} />

              <FormField label="Foto Pegawai" type="file" onChange={() => {
                setFormData(prev => ({ ...prev, foto_karyawan: "foto.png" }));
              }} />

              <FormField label="Email *" type="email" name="email" required value={formData.email} onChange={handleChange} />
              <FormField label="Nomor Handphone *" type="text" name="telepon" required value={formData.telepon} onChange={handleChange} />
              <FormField label="Username *" type="text" name="username" required value={formData.username} onChange={handleChange} />
              <FormField label="Password *" type="password" name="password" required minLength={6} value={formData.password} onChange={handleChange} />

              {isSuperAdmin && (
                <FormField label="Tenant *" type="combobox" name="tenant_id" value={formData.tenant_id} options={tenantOptions} onChange={handleChange} />
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-500">Lokasi Kantor *</label>
                {loadingMasters ? (
                  <div className="h-9 w-full bg-zinc-100 animate-pulse rounded-lg" />
                ) : (
                  <FormField label="" type="combobox" name="lokasi_id" value={formData.lokasi_id} options={lokasiOptions} onChange={handleChange} searchPlaceholder="Cari lokasi..." />
                )}
              </div>

              <FormField label="Tanggal Lahir *" type="date" name="tgl_lahir" value={formData.tgl_lahir} onChange={handleChange} maxDate={new Date()} />
              <FormField label="Tanggal Masuk Perusahaan *" type="date" name="tgl_join" value={formData.tgl_join} onChange={handleChange} maxDate={new Date()} />

              <FormField label="Masa Kerja" type="text" disabled value={getMasaKerjaStr(formData.tgl_join)} />

              <FormField label="Role *" type="combobox" name="role_name" value={formData.role_name} options={roleOptions} onChange={handleChange} />
              <FormField label="Gender *" type="combobox" name="gender" value={formData.gender} options={genderOptions} onChange={handleChange} />
              <FormField label="Dashboard *" type="combobox" name="is_admin" value={formData.is_admin} options={isAdminOptions} onChange={handleChange} />
            </div>
          </div>
        )}

        {/* Tab 2: Status & Jabatan */}
        {activeTab === "status" && (
          <div className="bg-white border border-gray-200/80 rounded-2xl shadow-xs p-6 space-y-4">
            <h2 style={{ color: THEME_COLORS.hex.primary }} className="text-sm font-semibold border-b border-gray-100 pb-2">Status & Jabatan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Status Pernikahan *" type="combobox" name="status_nikah" value={formData.status_nikah} options={statusNikahOptions} onChange={handleChange} />

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-500">Divisi *</label>
                {loadingMasters ? (
                  <div className="h-9 w-full bg-zinc-100 animate-pulse rounded-lg" />
                ) : (
                  <FormField label="" type="combobox" name="jabatan_id" value={formData.jabatan_id} options={jabatanOptions} onChange={handleChange} searchPlaceholder="Cari divisi..." />
                )}
              </div>

              <FormField label="Status Pajak" type="combobox" name="status_pajak" value={formData.status_pajak} options={statusPajakOptions} onChange={handleChange} />
            </div>

            <div className="pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-500">Posisi</label>
                <FormField
                  label=""
                  type="combobox"
                  value={golonganId}
                  options={golonganComboOptions}
                  onChange={(e: any) => setGolonganId(e.target.value)}
                  searchPlaceholder="Cari posisi..."
                  placeholder={!formData.jabatan_id ? "Pilih Divisi terlebih dahulu" : undefined}
                />
                {formData.jabatan_id && (
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
                      placeholder="Posisi baru..."
                      className="flex-1 h-8 px-2.5 text-[11px] bg-zinc-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#e0542c] focus:border-[#e0542c] text-gray-700 font-medium"
                    />
                    <button
                      type="button"
                      onClick={handleAddGolongan}
                      disabled={addingGolongan}
                      className="px-2.5 h-8 text-[11px] font-bold text-gray-700 bg-zinc-100 hover:bg-zinc-200/80 rounded-lg transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      {addingGolongan ? "..." : "+ Tambah"}
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-500">Atasan</label>
                <FormField
                  label=""
                  type="combobox"
                  value={managerContractId}
                  options={managerComboOptions}
                  onChange={(e: any) => setManagerContractId(e.target.value)}
                  searchPlaceholder="Cari atasan..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Dokumen Identitas */}
        {activeTab === "identitas" && (
          <div className="bg-white border border-gray-200/80 rounded-2xl shadow-xs p-6 space-y-4">
            <h2 style={{ color: THEME_COLORS.hex.primary }} className="text-sm font-semibold border-b border-gray-100 pb-2">Dokumen Identitas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Nomor KTP" type="text" name="ktp" value={formData.ktp} onChange={handleChange} />
              <FormField label="Nomor Kartu Keluarga" type="text" name="kartu_keluarga" value={formData.kartu_keluarga} onChange={handleChange} />
              <FormField label="Nomor BPJS Kesehatan" type="text" name="bpjs_kesehatan" value={formData.bpjs_kesehatan} onChange={handleChange} />
              <FormField label="Nomor BPJS Ketenagakerjaan" type="text" name="bpjs_ketenagakerjaan" value={formData.bpjs_ketenagakerjaan} onChange={handleChange} />
              <FormField label="Nomor NPWP" type="text" name="npwp" value={formData.npwp} onChange={handleChange} />
              <FormField label="Nomor SIM" type="text" name="sim" value={formData.sim} onChange={handleChange} />
              <FormField label="Nomor PKWT" type="text" name="pkwt" value={formData.pkwt} onChange={handleChange} />
              <FormField label="Nomor Kontrak" type="text" name="kontrak" value={formData.kontrak} onChange={handleChange} />

              <FormField label="Tanggal Mulai PKWT" type="date" name="tgl_mulai_pkwt" value={formData.tgl_mulai_pkwt} onChange={handleChange} />
              <FormField label="Tanggal Berakhir PKWT" type="date" name="tgl_berakhir_pkwt" value={formData.tgl_berakhir_pkwt} onChange={handleChange} minDate={formData.tgl_mulai_pkwt ? new Date(formData.tgl_mulai_pkwt) : undefined} />

              <FormField label="Nomor Rekening" type="text" name="rekening" value={formData.rekening} onChange={handleChange} />
              <FormField label="Bank" type="text" name="bank" value={formData.bank} onChange={handleChange} />
              <FormField label="Nama Pemilik Rekening" type="text" name="nama_rekening" value={formData.nama_rekening} onChange={handleChange} />

              <FormField label="Masa Berlaku" type="date" name="masa_berlaku" value={formData.masa_berlaku} onChange={handleChange} minDate={new Date()} />
            </div>
          </div>
        )}

        {/* Tab 4: Cuti & Izin */}
        {activeTab === "cuti" && (
          <div className="bg-white border border-gray-200/80 rounded-2xl shadow-xs p-6 space-y-4">
            <h2 style={{ color: THEME_COLORS.hex.primary }} className="text-sm font-semibold border-b border-gray-100 pb-2">Cuti & Izin</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField label="Cuti" type="number" name="izin_cuti" value={formData.izin_cuti} onChange={handleChange} />
              <FormField label="Izin Masuk" type="number" name="izin_lainnya" value={formData.izin_lainnya} onChange={handleChange} />
              <FormField label="Izin Telat" type="number" name="izin_telat" value={formData.izin_telat} onChange={handleChange} />
              <FormField label="Izin Pulang Cepat" type="number" name="izin_pulang_cepat" value={formData.izin_pulang_cepat} onChange={handleChange} />
            </div>
          </div>
        )}

        {/* Tab 5: Penjumlahan Gaji */}
        {activeTab === "gaji" && (
          <div className="bg-white border border-gray-200/80 rounded-2xl shadow-xs p-6 space-y-4">
            <h2 style={{ color: THEME_COLORS.hex.primary }} className="text-sm font-semibold border-b border-gray-100 pb-2">Penjumlahan Gaji</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Gaji Harian (/ Hari)" type="number" name="gaji_harian" value={formData.gaji_harian} onChange={handleChange} isCurrency={true} />
              <FormField label="Gaji Pokok (/ Bulan)" type="number" name="gaji_pokok" value={formData.gaji_pokok} onChange={handleChange} isCurrency={true} />
              <FormField label="Makan Dan Transport (/ Bulan)" type="number" name="makan_transport" value={formData.makan_transport} onChange={handleChange} isCurrency={true} />
              <FormField label="Lembur (/ Jam)" type="number" name="lembur" value={formData.lembur} onChange={handleChange} isCurrency={true} />
              <FormField label="100% Kehadiran (/ Bulan)" type="number" name="kehadiran_full" value={formData.kehadiran_full} onChange={handleChange} isCurrency={true} />
              <FormField label="THR (/ Bulan)" type="number" name="thr" value={formData.thr} onChange={handleChange} isCurrency={true} />
              <FormField label="Bonus Pribadi (/ Bulan)" type="number" name="bonus_pribadi" value={formData.bonus_pribadi} onChange={handleChange} isCurrency={true} />
              <FormField label="Bonus Team (/ Bulan)" type="number" name="bonus_team" value={formData.bonus_team} onChange={handleChange} isCurrency={true} />
              <FormField label="Bonus Jackpot (/ Bulan)" type="number" name="bonus_jackpot" value={formData.bonus_jackpot} onChange={handleChange} isCurrency={true} />
            </div>
          </div>
        )}

        {/* Tab 6: Pengurangan Gaji */}
        {activeTab === "potongan" && (
          <div className="bg-white border border-gray-200/80 rounded-2xl shadow-xs p-6 space-y-4">
            <h2 style={{ color: THEME_COLORS.hex.primary }} className="text-sm font-semibold border-b border-gray-100 pb-2">Pengurangan Gaji</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField label="Izin (/ hari)" type="number" name="potong_izin" value={formData.potong_izin} onChange={handleChange} isCurrency={true} />
              <FormField label="Terlambat (/ hari)" type="number" name="potong_terlambat" value={formData.potong_terlambat} onChange={handleChange} isCurrency={true} />
              <FormField label="Mangkir (/ hari)" type="number" name="potong_mangkir" value={formData.potong_mangkir} onChange={handleChange} isCurrency={true} />
              <FormField label="Saldo Kasbon (/ Tahun)" type="number" name="saldo_kasbon" value={formData.saldo_kasbon} onChange={handleChange} isCurrency={true} />
            </div>
          </div>
        )}

        {/* Tab 7: Tunjangan & Potongan */}
        {activeTab === "tunjangan" && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200/80 rounded-2xl shadow-xs p-6 space-y-4">
              <h2 style={{ color: THEME_COLORS.hex.primary }} className="text-sm font-semibold border-b border-gray-100 pb-2">Tunjangan & Potongan Pajak / BPJS</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Tunjangan BPJS Kesehatan (Rp)" type="number" name="tunjangan_bpjs_kesehatan" value={formData.tunjangan_bpjs_kesehatan} onChange={handleChange} isCurrency={true} />
                <FormField label="Tunjangan BPJS Ketenagakerjaan (Rp)" type="number" name="tunjangan_bpjs_ketenagakerjaan" value={formData.tunjangan_bpjs_ketenagakerjaan} onChange={handleChange} isCurrency={true} />
                <FormField label="Potongan BPJS Kesehatan (Rp)" type="number" name="potongan_bpjs_kesehatan" value={formData.potongan_bpjs_kesehatan} onChange={handleChange} isCurrency={true} />
                <FormField label="Potongan BPJS Ketenagakerjaan (Rp)" type="number" name="potongan_bpjs_ketenagakerjaan" value={formData.potongan_bpjs_ketenagakerjaan} onChange={handleChange} isCurrency={true} />
                <FormField label="Tunjangan Pajak (Gross Up)" type="number" name="tunjangan_pajak" value={formData.tunjangan_pajak} onChange={handleChange} isCurrency={true} className="md:col-span-2" />
              </div>
            </div>

            <div className="bg-white border border-gray-200/80 rounded-2xl shadow-xs p-6 space-y-4">
              <h2 style={{ color: THEME_COLORS.hex.primary }} className="text-sm font-semibold border-b border-gray-100 pb-2">Alokasi & Pemotongan Lainnya</h2>
              <div className="flex flex-col items-center justify-center text-center gap-3 py-10">
                <FileWarning size={36} className="text-amber-500" />
                <p className="text-sm font-semibold text-gray-700">Belum tersedia untuk pegawai baru.</p>
                <p className="text-xs text-gray-500 max-w-md">
                  Alokasi & pemotongan lainnya (investasi/amal) baru bisa ditambahkan setelah pegawai ini disimpan.
                  Simpan pegawai terlebih dahulu, lalu buka halaman Edit Pegawai untuk mengatur alokasinya.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={() => navigate("Employee")} className="px-5 py-2 border border-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer">
            Batal
          </button>
          <button
            type="submit"
            disabled={submitting}
            style={{ backgroundColor: THEME_COLORS.hex.primary }}
            className="px-5 py-2 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 hover:opacity-90"
          >
            {submitting ? "Menyimpan..." : "Simpan Pegawai"}
          </button>
        </div>
      </form>
    </div>
  );
}
