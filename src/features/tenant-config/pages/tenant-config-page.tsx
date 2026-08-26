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
  Sparkles,
  Sliders,
  Layout,
  Menu as MenuIcon,
  Bell,
  ChevronRight
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
  buildCssBackground,
  type TenantSubColors,
  type ColorOrGradient
} from "@/shared/constants/colors";
import { FigmaColorPicker } from "@/shared/components/ui/figma-color-picker";

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

  // 3 Primary Brand Colors
  const [sidebarColor, setSidebarColor] = useState<ColorOrGradient>(THEME_COLORS.hex.navBg);
  const [navbarColor, setNavbarColor] = useState<ColorOrGradient>(THEME_COLORS.hex.navBg);
  const [buttonColor, setButtonColor] = useState<string>(THEME_COLORS.hex.primary);

  // Inspector Panel Accordion State ('sidebar' | 'navbar' | 'button' | null)
  const [activeInspector, setActiveInspector] = useState<"sidebar" | "navbar" | "button" | null>(null);

  // Sub Color Tokens
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
    
    const parsedSub = parseSubColor(data.sub_color);
    setSidebarColor(parsedSub.sidebar || (data.main_color && data.main_color.startsWith("#") ? data.main_color : THEME_COLORS.hex.navBg));
    setNavbarColor(parsedSub.navbar || (data.main_color && data.main_color.startsWith("#") ? data.main_color : THEME_COLORS.hex.navBg));
    setButtonColor(parsedSub.button || parsedSub.sub || THEME_COLORS.hex.primary);

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

  const handleApplyPreset = (preset: (typeof COLOR_PRESETS)[number]) => {
    setSidebarColor(preset.sidebar);
    setNavbarColor(preset.navbar);
    setButtonColor(preset.button);
    toast.success(`Palet "${preset.name}" diterapkan`);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!tenant?.id) {
      toast.error("Tenant tidak ditemukan.");
      return;
    }

    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    if (typeof buttonColor === "string" && !hexRegex.test(buttonColor)) {
      toast.error("Format Warna Tombol tidak valid. Gunakan format HEX 6-karakter seperti #E0542C");
      return;
    }

    // Determine representative main_color HEX for backward compatibility
    let mainColorHex: string = THEME_COLORS.hex.primary;
    if (typeof sidebarColor === "string" && hexRegex.test(sidebarColor)) {
      mainColorHex = sidebarColor;
    } else if (typeof navbarColor === "string" && hexRegex.test(navbarColor)) {
      mainColorHex = navbarColor;
    } else if (typeof buttonColor === "string" && hexRegex.test(buttonColor)) {
      mainColorHex = buttonColor;
    }

    const subColorPayload: TenantSubColors = {
      sidebar: sidebarColor,
      navbar: navbarColor,
      button: buttonColor,
      sub: buttonColor,
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
        main_color: mainColorHex,
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
          main_color: mainColorHex,
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
      toast.success("Konfigurasi tema 3 warna & profil tenant berhasil disimpan!");
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
        {/* Kolom Kiri: Pengaturan 3 Warna Brand, Inspector & Live Preview (5 Kolom) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card Warna Brand (3 Warna Utama) */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <div
                style={{ backgroundColor: `${THEME_COLORS.hex.primary}15`, color: THEME_COLORS.hex.primary }}
                className="w-7 h-7 rounded-lg flex items-center justify-center"
              >
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-gray-800">Warna Brand Organisasi (3 Warna)</h2>
                <p className="text-[11px] text-gray-500">Kustomisasi mandiri untuk Sidebar, Navbar, dan Tombol</p>
              </div>
            </div>

            {/* 3 Color Pickers (Sidebar, Navbar, Button) */}
            <div className="space-y-3">
              {/* 1. Warna Sidebar */}
              <div className="p-3 bg-gray-50/90 rounded-xl border border-gray-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layout className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-[11px] font-bold text-gray-800">Warna Sidebar</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveInspector(activeInspector === "sidebar" ? null : "sidebar")}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                      activeInspector === "sidebar"
                        ? "bg-gray-800 text-white shadow-2xs"
                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <Sliders className="w-3 h-3" />
                    <span>{activeInspector === "sidebar" ? "Tutup" : "Kustomisasi"}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg border border-black/15 shadow-2xs shrink-0"
                    style={{ background: buildCssBackground(sidebarColor, THEME_COLORS.hex.navBg) }}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-mono text-gray-600 truncate block">
                      {typeof sidebarColor === "string" ? sidebarColor : "Linear / Gradient Custom"}
                    </span>
                    <span className="text-[9px] text-gray-400">Latar panel navigasi menu sebelah kiri</span>
                  </div>
                </div>

                {activeInspector === "sidebar" && (
                  <div className="pt-2 border-t border-gray-200/60">
                    <FigmaColorPicker
                      value={sidebarColor}
                      label="Inspector Warna Sidebar"
                      fallbackColor={THEME_COLORS.hex.navBg}
                      onChange={(val) => setSidebarColor(val)}
                      allowGradient={true}
                    />
                  </div>
                )}
              </div>

              {/* 2. Warna Navbar */}
              <div className="p-3 bg-gray-50/90 rounded-xl border border-gray-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MenuIcon className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-[11px] font-bold text-gray-800">Warna Navbar</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveInspector(activeInspector === "navbar" ? null : "navbar")}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                      activeInspector === "navbar"
                        ? "bg-gray-800 text-white shadow-2xs"
                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <Sliders className="w-3 h-3" />
                    <span>{activeInspector === "navbar" ? "Tutup" : "Kustomisasi"}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg border border-black/15 shadow-2xs shrink-0"
                    style={{ background: buildCssBackground(navbarColor, THEME_COLORS.hex.navBg) }}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-mono text-gray-600 truncate block">
                      {typeof navbarColor === "string" ? navbarColor : "Linear / Gradient Custom"}
                    </span>
                    <span className="text-[9px] text-gray-400">Latar bar header navigasi bagian atas</span>
                  </div>
                </div>

                {activeInspector === "navbar" && (
                  <div className="pt-2 border-t border-gray-200/60">
                    <FigmaColorPicker
                      value={navbarColor}
                      label="Inspector Warna Navbar"
                      fallbackColor={THEME_COLORS.hex.navBg}
                      onChange={(val) => setNavbarColor(val)}
                      allowGradient={true}
                    />
                  </div>
                )}
              </div>

              {/* 3. Warna Tombol & Aksen */}
              <div className="p-3 bg-gray-50/90 rounded-xl border border-gray-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-[11px] font-bold text-gray-800">Warna Tombol & Aksen</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveInspector(activeInspector === "button" ? null : "button")}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                      activeInspector === "button"
                        ? "bg-gray-800 text-white shadow-2xs"
                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <Sliders className="w-3 h-3" />
                    <span>{activeInspector === "button" ? "Tutup" : "Kustomisasi"}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg border border-black/15 shadow-2xs shrink-0"
                    style={{ background: buildCssBackground(buttonColor, THEME_COLORS.hex.primary) }}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-mono text-gray-600 truncate block">
                      {typeof buttonColor === "string" ? buttonColor : "Linear / Gradient Custom"}
                    </span>
                    <span className="text-[9px] text-gray-400">Aksen tombol aksi utama, badge, dan menu aktif</span>
                  </div>
                </div>

                {activeInspector === "button" && (
                  <div className="pt-2 border-t border-gray-200/60">
                    <FigmaColorPicker
                      value={buttonColor}
                      label="Inspector Warna Tombol & Aksen"
                      fallbackColor={THEME_COLORS.hex.primary}
                      onChange={(val) => setButtonColor(typeof val === "string" ? val : val.css || THEME_COLORS.hex.primary)}
                      allowGradient={true}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Pilihan Palet Populer (3 Warna: Sidebar, Navbar, Button) */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Palet Rekomendasi 3 Warna
              </span>
              <div className="grid grid-cols-2 gap-2">
                {COLOR_PRESETS.map((preset) => {
                  const isSelected =
                    (typeof sidebarColor === "string" ? sidebarColor.toLowerCase() : "") === preset.sidebar.toLowerCase() &&
                    (typeof navbarColor === "string" ? navbarColor.toLowerCase() : "") === preset.navbar.toLowerCase() &&
                    (typeof buttonColor === "string" ? buttonColor.toLowerCase() : "") === preset.button.toLowerCase();

                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      style={isSelected ? { borderColor: THEME_COLORS.hex.primary, backgroundColor: `${THEME_COLORS.hex.primary}0D` } : undefined}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "text-gray-900 shadow-2xs font-semibold"
                          : "border-gray-200/80 hover:border-gray-300 hover:bg-gray-50/50 text-gray-700"
                      }`}
                    >
                      <div className="flex -space-x-1 shrink-0">
                        {/* 1. Sidebar Swatch */}
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs"
                          style={{ backgroundColor: preset.sidebar }}
                          title={`Sidebar: ${preset.sidebar}`}
                        />
                        {/* 2. Navbar Swatch */}
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs"
                          style={{ backgroundColor: preset.navbar }}
                          title={`Navbar: ${preset.navbar}`}
                        />
                        {/* 3. Button Swatch */}
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs"
                          style={{ backgroundColor: preset.button }}
                          title={`Button: ${preset.button}`}
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

          {/* Card Pratinjau Tampilan (Live Mockup Mini Dashboard) */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-gray-400" />
                <h2 className="text-xs font-bold text-gray-800">Live Mockup Dashboard</h2>
              </div>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Simulasi Real-time
              </span>
            </div>

            {/* Mini Dashboard Frame */}
            <div className="rounded-xl border border-gray-300 shadow-sm overflow-hidden bg-gray-100 flex flex-col">
              {/* Mini Navbar (Header) */}
              <div
                style={{ background: buildCssBackground(navbarColor, THEME_COLORS.hex.navBg) }}
                className="px-3 py-2 flex items-center justify-between text-white border-b border-white/10 transition-all duration-200"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white/40" />
                  <span className="text-[10px] font-bold tracking-tight truncate max-w-[120px]">
                    {name || "Dashboard"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Bell className="w-3.5 h-3.5 text-white/80" />
                    <span
                      style={{ background: buildCssBackground(buttonColor, THEME_COLORS.hex.primary) }}
                      className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ring-1 ring-white"
                    />
                  </div>
                  <div className="w-4 h-4 rounded-full bg-white/20 border border-white/30" />
                </div>
              </div>

              {/* Mini Body (Sidebar + Content) */}
              <div className="flex h-36">
                {/* Mini Sidebar */}
                <div
                  style={{ background: buildCssBackground(sidebarColor, THEME_COLORS.hex.navBg) }}
                  className="w-28 p-2 text-white flex flex-col justify-between border-r border-white/10 transition-all duration-200"
                >
                  <div className="space-y-1.5">
                    {/* Mini Org Brand */}
                    <div className="flex items-center gap-1.5 pb-1 border-b border-white/10">
                      <div className="w-4 h-4 rounded bg-white/20 flex items-center justify-center text-[8px] font-bold">
                        {name ? name.substring(0, 1).toUpperCase() : "P"}
                      </div>
                      <span className="text-[9px] font-bold truncate opacity-90">
                        {name || "Pejuang"}
                      </span>
                    </div>

                    {/* Mini Active Nav Item */}
                    <div
                      style={{ background: buildCssBackground(buttonColor, THEME_COLORS.hex.primary) }}
                      className="px-2 py-1 rounded-md text-[8px] font-bold text-white shadow-2xs flex items-center justify-between"
                    >
                      <span className="truncate">Dashboard</span>
                      <ChevronRight className="w-2.5 h-2.5 opacity-80" />
                    </div>

                    {/* Mini Inactive Nav Items */}
                    <div className="px-2 py-0.5 rounded text-[8px] font-medium text-white/60 hover:text-white truncate">
                      Pegawai
                    </div>
                    <div className="px-2 py-0.5 rounded text-[8px] font-medium text-white/60 hover:text-white truncate">
                      Absensi
                    </div>
                  </div>

                  <div className="text-[7px] text-white/40 truncate">v2.0 • Pro</div>
                </div>

                {/* Mini Main Content */}
                <div className="flex-1 p-2.5 bg-gray-50 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-gray-700">Ringkasan Operasional</span>
                      <span
                        className="px-1.5 py-0.2 rounded text-[7px] font-bold border"
                        style={{
                          backgroundColor: `${typeof buttonColor === "string" ? buttonColor : "#E0542C"}15`,
                          color: typeof buttonColor === "string" ? buttonColor : "#E0542C",
                          borderColor: `${typeof buttonColor === "string" ? buttonColor : "#E0542C"}30`,
                        }}
                      >
                        Aktif
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="p-1.5 bg-white rounded-md border border-gray-200 shadow-2xs">
                        <span className="text-[7px] text-gray-400 block">Total Pegawai</span>
                        <span className="text-[10px] font-bold text-gray-800">128</span>
                      </div>
                      <div className="p-1.5 bg-white rounded-md border border-gray-200 shadow-2xs">
                        <span className="text-[7px] text-gray-400 block">Hadir Hari Ini</span>
                        <span className="text-[10px] font-bold text-emerald-600">96%</span>
                      </div>
                    </div>
                  </div>

                  {/* Mini Sample Buttons */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      type="button"
                      style={{ background: buildCssBackground(buttonColor, THEME_COLORS.hex.primary) }}
                      className="px-2 py-1 rounded-md text-[8px] font-bold text-white shadow-2xs"
                    >
                      Tombol Utama
                    </button>
                    <button
                      type="button"
                      className="px-2 py-1 rounded-md text-[8px] font-semibold bg-white border border-gray-200 text-gray-700 shadow-2xs"
                    >
                      Batal
                    </button>
                  </div>
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
