import { useState, useEffect, useRef, type ChangeEvent, type FormEvent } from "react";
import { 
  Building2, 
  Palette, 
  UploadCloud, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Save, 
  RefreshCw, 
  Eye, 
  Layers,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { 
  fetchCurrentTenantAPI, 
  updateTenantAPI, 
  type TenantConfigData 
} from "../api/tenant-config";
import { setTenantBranding } from "@/shared/utils/tenant-branding";
import { 
  THEME_COLORS, 
  parseSubColor, 
  type TenantSubColors 
} from "@/shared/constants/colors";

interface TenantConfigPageProps {
  user?: any;
}

const COLOR_PRESETS = THEME_COLORS.presets;

export function TenantConfigPage({ user: _user }: TenantConfigPageProps) {
  const [tenant, setTenant] = useState<TenantConfigData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [mainColor, setMainColor] = useState<string>(THEME_COLORS.hex.primary);
  const [subColor, setSubColor] = useState<string>(THEME_COLORS.hex.padiKemakmuran);
  const [accentColor, setAccentColor] = useState<string>(THEME_COLORS.hex.accent);
  const [accentBlueColor, setAccentBlueColor] = useState<string>(THEME_COLORS.hex.accentBlue);
  const [sawahColor, setSawahColor] = useState<string>(THEME_COLORS.hex.sawahPertumbuhan);
  const [apiColor, setApiColor] = useState<string>(THEME_COLORS.hex.apiSemangat);
  const [airColor, setAirColor] = useState<string>(THEME_COLORS.hex.airKehidupan);
  const [padiColor, setPadiColor] = useState<string>(THEME_COLORS.hex.padiKemakmuran);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [web, setWeb] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [showSubColorDetails, setShowSubColorDetails] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load current user's tenant on mount
  useEffect(() => {
    loadTenant();
  }, []);

  const loadTenant = async () => {
    try {
      setLoading(true);
      const current = await fetchCurrentTenantAPI();
      if (current) {
        populateForm(current);
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal memuat data tenant");
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (data: TenantConfigData) => {
    setTenant(data);
    setName(data.name || "");
    setSlug(data.slug || "");
    setMainColor(data.main_color && data.main_color.startsWith("#") ? data.main_color : THEME_COLORS.hex.primary);
    
    const parsedSub = parseSubColor(data.sub_color);
    setSubColor(parsedSub.sub || THEME_COLORS.hex.padiKemakmuran);
    setAccentColor(parsedSub.accent || THEME_COLORS.hex.accent);
    setAccentBlueColor(parsedSub.accentBlue || THEME_COLORS.hex.accentBlue);
    setSawahColor(parsedSub.sawahPertumbuhan || THEME_COLORS.hex.sawahPertumbuhan);
    setApiColor(parsedSub.apiSemangat || THEME_COLORS.hex.apiSemangat);
    setAirColor(parsedSub.airKehidupan || THEME_COLORS.hex.airKehidupan);
    setPadiColor(parsedSub.padiKemakmuran || THEME_COLORS.hex.padiKemakmuran);

    setEmail(data.email || "");
    setPhone(data.phone || "");
    setWeb(data.web || "");
    setAddress(data.address || "");
    setDescription(data.description || "");
    setLogoPreview(data.logo_url || data.logo || null);
    setLogoFile(null);
    setRemoveLogo(false);

    setTenantBranding({
      id: data.id,
      name: data.name,
      slug: data.slug,
      logo_url: data.logo_url || data.logo,
      main_color: data.main_color,
      sub_color: data.sub_color,
      subColors: parsedSub,
    });
  };

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Ukuran file logo maksimal 10MB");
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setRemoveLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setLogoFile(null);
    setRemoveLogo(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleApplyPreset = (main: string, sub: string) => {
    setMainColor(main);
    setSubColor(sub);
    toast.success("Palet warna diterapkan");
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!tenant?.id) {
      toast.error("Tenant tidak ditemukan.");
      return;
    }

    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    if (!hexRegex.test(mainColor)) {
      toast.error("Format Warna Utama tidak valid. Gunakan format HEX 6-karakter seperti #E0542C");
      return;
    }
    if (!hexRegex.test(subColor)) {
      toast.error("Format Warna Sekunder tidak valid. Gunakan format HEX 6-karakter seperti #F2B233");
      return;
    }

    const subColorPayload: TenantSubColors = {
      sub: subColor,
      accent: accentColor,
      accentBlue: accentBlueColor,
      sawahPertumbuhan: sawahColor,
      apiSemangat: apiColor,
      airKehidupan: airColor,
      padiKemakmuran: padiColor,
    };

    try {
      setSaving(true);
      const updated = await updateTenantAPI(tenant.id, {
        name,
        slug,
        main_color: mainColor,
        sub_color: subColorPayload,
        email,
        phone,
        web,
        address,
        description,
        logoFile,
        removeLogo,
      });

      if (removeLogo) {
        setTenantBranding({
          logo: null,
          logo_url: null,
          main_color: mainColor,
          sub_color: subColorPayload,
          subColors: subColorPayload,
        });
      } else if (updated) {
        setTenantBranding({
          id: updated.id,
          name: updated.name,
          slug: updated.slug,
          logo_url: updated.logo_url || updated.logo || logoPreview,
          main_color: updated.main_color,
          sub_color: updated.sub_color,
          subColors: parseSubColor(updated.sub_color),
        });
      }
      toast.success("Konfigurasi tenant berhasil disimpan!");
      await loadTenant();
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan konfigurasi tenant");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-3">
        <div
          style={{ borderColor: THEME_COLORS.hex.primary, borderTopColor: "transparent" }}
          className="w-8 h-8 border-3 rounded-full animate-spin"
        />
        <p className="text-xs font-medium text-gray-500">Memuat data tenant...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header Halaman Konsisten */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200/80 pb-4">
        <div>
          <h1 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <Building2 style={{ color: THEME_COLORS.hex.primary }} className="w-5 h-5" />
            Konfigurasi Tenant
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Atur profil organisasi dan kustomisasi warna brand tema aplikasi untuk instansi Anda.
          </p>
        </div>

        {tenant && (
          <div
            style={{ color: THEME_COLORS.hex.primary, backgroundColor: `${THEME_COLORS.hex.primary}15`, borderColor: `${THEME_COLORS.hex.primary}33` }}
            className="inline-flex items-center gap-2 px-3 py-1.5 border rounded-xl text-xs font-semibold self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{tenant.name}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri: Pengaturan Warna Brand & Live Preview (5 Kolom) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card Warna Brand */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <div
                style={{ backgroundColor: `${THEME_COLORS.hex.primary}15`, color: THEME_COLORS.hex.primary }}
                className="w-7 h-7 rounded-lg flex items-center justify-center"
              >
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-gray-800">Warna Brand Organisasi</h2>
                <p className="text-[11px] text-gray-500">Warna utama dan aksen sekunder aplikasi</p>
              </div>
            </div>

            {/* Input Warna Utama & Sekunder */}
            <div className="grid grid-cols-2 gap-3">
              {/* Warna Utama */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-600 block">
                  Warna Utama (Main)
                </label>
                <div className="flex items-center gap-2 p-1.5 bg-gray-50/80 rounded-xl border border-gray-200">
                  <input
                    type="color"
                    value={mainColor}
                    onChange={(e) => setMainColor(e.target.value.toUpperCase())}
                    className="w-8 h-8 rounded-lg border-0 cursor-pointer p-0 bg-transparent shrink-0"
                  />
                  <input
                    type="text"
                    maxLength={7}
                    value={mainColor}
                    onChange={(e) => setMainColor(e.target.value.toUpperCase())}
                    className="w-full text-xs font-mono font-bold text-gray-700 bg-transparent focus:outline-none uppercase"
                    placeholder="#E0542C"
                  />
                </div>
              </div>

              {/* Warna Sekunder */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-600 block">
                  Warna Sekunder (Sub)
                </label>
                <div className="flex items-center gap-2 p-1.5 bg-gray-50/80 rounded-xl border border-gray-200">
                  <input
                    type="color"
                    value={subColor}
                    onChange={(e) => setSubColor(e.target.value.toUpperCase())}
                    className="w-8 h-8 rounded-lg border-0 cursor-pointer p-0 bg-transparent shrink-0"
                  />
                  <input
                    type="text"
                    maxLength={7}
                    value={subColor}
                    onChange={(e) => setSubColor(e.target.value.toUpperCase())}
                    className="w-full text-xs font-mono font-bold text-gray-700 bg-transparent focus:outline-none uppercase"
                    placeholder="#F2B233"
                  />
                </div>
              </div>
            </div>

            {/* Pilihan Palet Populer */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Palet Warna Rekomendasi
              </span>
              <div className="grid grid-cols-2 gap-2">
                {COLOR_PRESETS.map((preset) => {
                  const isSelected =
                    mainColor.toLowerCase() === preset.main.toLowerCase() &&
                    subColor.toLowerCase() === preset.sub.toLowerCase();
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleApplyPreset(preset.main, preset.sub)}
                      style={isSelected ? { borderColor: THEME_COLORS.hex.primary, backgroundColor: `${THEME_COLORS.hex.primary}0D` } : undefined}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "text-gray-900 shadow-2xs font-semibold"
                          : "border-gray-200/80 hover:border-gray-300 hover:bg-gray-50/50 text-gray-700"
                      }`}
                    >
                      <div className="flex -space-x-1 shrink-0">
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs"
                          style={{ backgroundColor: preset.main }}
                          title={`Utama: ${preset.main}`}
                        />
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs"
                          style={{ backgroundColor: preset.sub }}
                          title={`Sekunder: ${preset.sub}`}
                        />
                      </div>
                      <span className="text-[11px] font-medium truncate">
                        {preset.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Token Detail Sub Color (JSON Palette) */}
            <div className="pt-2 border-t border-gray-100 space-y-3">
              <button
                type="button"
                onClick={() => setShowSubColorDetails(!showSubColorDetails)}
                className="w-full flex items-center justify-between text-[11px] font-semibold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer py-1"
              >
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-gray-400" />
                  <span>Detail Token Sub Color (JSON)</span>
                </span>
                <span className="text-[10px] text-gray-400 font-mono">
                  {showSubColorDetails ? "Tutup ▲" : "Sesuaikan ▼"}
                </span>
              </button>

              {showSubColorDetails && (
                <div className="p-3 bg-gray-50/90 rounded-xl border border-gray-200/80 space-y-3">
                  <p className="text-[10px] text-gray-500">
                    Kustomisasi token sub color tema aplikasi yang disinkronkan dalam format JSON ke server.
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Aksen Kuning */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-gray-600 block">
                        Aksen Kuning (accent)
                      </label>
                      <div className="flex items-center gap-1.5 p-1 bg-white rounded-lg border border-gray-200">
                        <input
                          type="color"
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value.toUpperCase())}
                          className="w-6 h-6 rounded border-0 cursor-pointer p-0 bg-transparent shrink-0"
                        />
                        <input
                          type="text"
                          maxLength={7}
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value.toUpperCase())}
                          className="w-full text-[10px] font-mono text-gray-700 bg-transparent focus:outline-none uppercase"
                        />
                      </div>
                    </div>

                    {/* Aksen Biru */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-gray-600 block">
                        Aksen Biru (accentBlue)
                      </label>
                      <div className="flex items-center gap-1.5 p-1 bg-white rounded-lg border border-gray-200">
                        <input
                          type="color"
                          value={accentBlueColor}
                          onChange={(e) => setAccentBlueColor(e.target.value.toUpperCase())}
                          className="w-6 h-6 rounded border-0 cursor-pointer p-0 bg-transparent shrink-0"
                        />
                        <input
                          type="text"
                          maxLength={7}
                          value={accentBlueColor}
                          onChange={(e) => setAccentBlueColor(e.target.value.toUpperCase())}
                          className="w-full text-[10px] font-mono text-gray-700 bg-transparent focus:outline-none uppercase"
                        />
                      </div>
                    </div>

                    {/* Sawah Pertumbuhan */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-gray-600 block">
                        Sawah Pertumbuhan
                      </label>
                      <div className="flex items-center gap-1.5 p-1 bg-white rounded-lg border border-gray-200">
                        <input
                          type="color"
                          value={sawahColor}
                          onChange={(e) => setSawahColor(e.target.value.toUpperCase())}
                          className="w-6 h-6 rounded border-0 cursor-pointer p-0 bg-transparent shrink-0"
                        />
                        <input
                          type="text"
                          maxLength={7}
                          value={sawahColor}
                          onChange={(e) => setSawahColor(e.target.value.toUpperCase())}
                          className="w-full text-[10px] font-mono text-gray-700 bg-transparent focus:outline-none uppercase"
                        />
                      </div>
                    </div>

                    {/* Api Semangat */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-gray-600 block">
                        Api Semangat
                      </label>
                      <div className="flex items-center gap-1.5 p-1 bg-white rounded-lg border border-gray-200">
                        <input
                          type="color"
                          value={apiColor}
                          onChange={(e) => setApiColor(e.target.value.toUpperCase())}
                          className="w-6 h-6 rounded border-0 cursor-pointer p-0 bg-transparent shrink-0"
                        />
                        <input
                          type="text"
                          maxLength={7}
                          value={apiColor}
                          onChange={(e) => setApiColor(e.target.value.toUpperCase())}
                          className="w-full text-[10px] font-mono text-gray-700 bg-transparent focus:outline-none uppercase"
                        />
                      </div>
                    </div>

                    {/* Air Kehidupan */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-gray-600 block">
                        Air Kehidupan
                      </label>
                      <div className="flex items-center gap-1.5 p-1 bg-white rounded-lg border border-gray-200">
                        <input
                          type="color"
                          value={airColor}
                          onChange={(e) => setAirColor(e.target.value.toUpperCase())}
                          className="w-6 h-6 rounded border-0 cursor-pointer p-0 bg-transparent shrink-0"
                        />
                        <input
                          type="text"
                          maxLength={7}
                          value={airColor}
                          onChange={(e) => setAirColor(e.target.value.toUpperCase())}
                          className="w-full text-[10px] font-mono text-gray-700 bg-transparent focus:outline-none uppercase"
                        />
                      </div>
                    </div>

                    {/* Padi Kemakmuran */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-gray-600 block">
                        Padi Kemakmuran
                      </label>
                      <div className="flex items-center gap-1.5 p-1 bg-white rounded-lg border border-gray-200">
                        <input
                          type="color"
                          value={padiColor}
                          onChange={(e) => setPadiColor(e.target.value.toUpperCase())}
                          className="w-6 h-6 rounded border-0 cursor-pointer p-0 bg-transparent shrink-0"
                        />
                        <input
                          type="text"
                          maxLength={7}
                          value={padiColor}
                          onChange={(e) => setPadiColor(e.target.value.toUpperCase())}
                          className="w-full text-[10px] font-mono text-gray-700 bg-transparent focus:outline-none uppercase"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setAccentColor(THEME_COLORS.hex.accent);
                        setAccentBlueColor(THEME_COLORS.hex.accentBlue);
                        setSawahColor(THEME_COLORS.hex.sawahPertumbuhan);
                        setApiColor(THEME_COLORS.hex.apiSemangat);
                        setAirColor(THEME_COLORS.hex.airKehidupan);
                        setPadiColor(THEME_COLORS.hex.padiKemakmuran);
                        toast.info("Token sub color direset ke default");
                      }}
                      className="text-[10px] text-gray-500 hover:text-gray-800 underline cursor-pointer"
                    >
                      Reset Token ke Default
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card Pratinjau Tampilan */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2.5">
              <Eye className="w-4 h-4 text-gray-400" />
              <h2 className="text-xs font-bold text-gray-800">Pratinjau Elemen</h2>
            </div>

            {/* Simulasi Card UI Sederhana */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shadow-2xs"
                    style={{ backgroundColor: mainColor }}
                  >
                    {name ? name.substring(0, 2).toUpperCase() : "TM"}
                  </div>
                  <span className="text-xs font-bold text-gray-800 truncate max-w-[160px]">
                    {name || "Nama Organisasi"}
                  </span>
                </div>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                  style={{
                    backgroundColor: `${subColor}18`,
                    color: subColor,
                    borderColor: `${subColor}40`,
                  }}
                >
                  Aktif
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <div
                  className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white shadow-2xs"
                  style={{ backgroundColor: mainColor }}
                >
                  Tombol Utama
                </div>
                <div
                  className="px-3 py-1.5 rounded-lg text-[11px] font-semibold border"
                  style={{
                    backgroundColor: `${subColor}15`,
                    color: subColor,
                    borderColor: `${subColor}30`,
                  }}
                >
                  Aksen Tambahan
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Detail Informasi Profil Organisasi (7 Kolom) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-gray-800">Informasi Profil Organisasi</h2>
                <p className="text-[11px] text-gray-500">Detail identitas dan kontak tenant</p>
              </div>
            </div>

            {/* Upload Logo */}
            <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-200/80 flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-white border border-gray-200 shadow-2xs flex items-center justify-center overflow-hidden shrink-0">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-1.5" />
                ) : (
                  <Building2 className="w-7 h-7 text-gray-300" />
                )}
              </div>
              <div className="flex-1 space-y-1.5">
                <div>
                  <h3 className="text-xs font-semibold text-gray-800">Logo Instansi</h3>
                  <p className="text-[11px] text-gray-500">
                    PNG/SVG latar belakang transparan (Maks. 10MB).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg border border-gray-200 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    Pilih File
                  </button>
                  {logoPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="px-2 py-1 text-rose-500 hover:bg-rose-50 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Input Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Nama Organisasi */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-600 block">
                  Nama Organisasi / Perusahaan <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: PT Pejuang Mimpi"
                    className="w-full h-9 pl-8.5 pr-3 text-xs bg-gray-50/80 border border-gray-200 rounded-lg focus:outline-none focus:border-[#E0542C] focus:bg-white text-gray-800 font-medium transition-colors"
                  />
                </div>
              </div>

              {/* Slug / Kode */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-600 block">
                  Kode / Slug Identifier <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Layers className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                    placeholder="contoh: pejuang-mimpi"
                    className="w-full h-9 pl-8.5 pr-3 text-xs font-mono bg-gray-50/80 border border-gray-200 rounded-lg focus:outline-none focus:border-[#E0542C] focus:bg-white text-gray-800 font-medium transition-colors lowercase"
                  />
                </div>
              </div>

              {/* Email Kontak */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-600 block">Email Kontak</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="kontak@perusahaan.com"
                    className="w-full h-9 pl-8.5 pr-3 text-xs bg-gray-50/80 border border-gray-200 rounded-lg focus:outline-none focus:border-[#E0542C] focus:bg-white text-gray-800 font-medium transition-colors"
                  />
                </div>
              </div>

              {/* Nomor Telepon */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-600 block">Nomor Telepon</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0812-3456-7890"
                    className="w-full h-9 pl-8.5 pr-3 text-xs bg-gray-50/80 border border-gray-200 rounded-lg focus:outline-none focus:border-[#E0542C] focus:bg-white text-gray-800 font-medium transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Website */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-600 block">Website Resmi</label>
              <div className="relative">
                <Globe className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={web}
                  onChange={(e) => setWeb(e.target.value)}
                  placeholder="https://perusahaan.co.id"
                  className="w-full h-9 pl-8.5 pr-3 text-xs bg-gray-50/80 border border-gray-200 rounded-lg focus:outline-none focus:border-[#E0542C] focus:bg-white text-gray-800 font-medium transition-colors"
                />
              </div>
            </div>

            {/* Alamat */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-600 block">Alamat Kantor</label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Alamat lengkap kantor..."
                  className="w-full pl-8.5 pr-3 py-2 text-xs bg-gray-50/80 border border-gray-200 rounded-lg focus:outline-none focus:border-[#E0542C] focus:bg-white text-gray-800 font-medium transition-colors resize-none"
                />
              </div>
            </div>

            {/* Deskripsi */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-600 block">Deskripsi Singkat</label>
              <div className="relative">
                <FileText className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Deskripsi singkat profil organisasi..."
                  className="w-full pl-8.5 pr-3 py-2 text-xs bg-gray-50/80 border border-gray-200 rounded-lg focus:outline-none focus:border-[#E0542C] focus:bg-white text-gray-800 font-medium transition-colors resize-none"
                />
              </div>
            </div>

            {/* Tombol Simpan & Reset */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={loadTenant}
                disabled={saving}
                className="px-3.5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-[#E0542C] hover:bg-[#c23f1b] active:scale-98 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    Simpan Konfigurasi
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
