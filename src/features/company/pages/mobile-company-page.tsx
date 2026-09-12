import { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Users,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  FolderTree,
  GitFork,
  ChevronDown,
  ChevronRight,
  Search,
  Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "@/shared/router/router";
import { useTenantBranding } from "@/shared/hooks/use-tenant-branding";
import { THEME_COLORS } from "@/shared/constants/colors";
import patternBg from "@/assets/bg/pattern-background.png";
import { fetchCurrentTenantAPI, type TenantConfigData } from "@/features/tenant-config/api/tenant-config";
import { fetchHierarchy, type HierarchyNode } from "@/features/org-management/api/org-management";
import { OrgChartTree } from "@/features/org-management/components/org-chart-tree";
import { fetchProfileAPI } from "@/features/tunas/api/absensi";
import { Skeleton } from "@/shared/components/ui/skeleton";

interface MobileCompanyPageProps {
  user: any;
}

type MainTab = "bagan" | "tim";
type BaganMode = "vertikal" | "diagram";

function getInitials(name: string): string {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface TreeNodeProps {
  node: HierarchyNode;
  childrenMap: Map<number, HierarchyNode[]>;
  level?: number;
  myContractId?: number;
  primaryAccent: string;
}

function MobileTreeNode({
  node,
  childrenMap,
  level = 1,
  myContractId,
  primaryAccent,
}: TreeNodeProps) {
  const children = childrenMap.get(node.contract_id) || [];
  const hasChildren = children.length > 0;
  const isMe = node.contract_id === myContractId;
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="relative">
      {/* Kartu Pegawai */}
      <div
        style={
          isMe
            ? {
                borderColor: `color-mix(in srgb, ${primaryAccent} 60%, transparent)`,
                background: `color-mix(in srgb, ${primaryAccent} 5%, white)`,
              }
            : undefined
        }
        className={`p-3 rounded-2xl border transition-all ${
          isMe
            ? "border-2 shadow-xs ring-2 ring-orange-500/10"
            : "bg-white border-gray-200/90 hover:border-gray-300 shadow-2xs"
        }`}
      >
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {/* Lingkaran Avatar Inisial Elegan */}
            <div
              style={
                isMe
                  ? { background: primaryAccent }
                  : { background: "#1E2A4A" }
              }
              className="w-10 h-10 rounded-full text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs border-2 border-white"
            >
              {getInitials(node.name || "?")}
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-black text-gray-900 leading-tight truncate">
                  {node.name || "Pegawai"}
                </span>
                {isMe && (
                  <span
                    style={{ background: primaryAccent }}
                    className="text-[8.5px] font-black uppercase text-white px-1.5 py-0.5 rounded shadow-2xs"
                  >
                    Posisi Anda
                  </span>
                )}
                {level === 1 && !isMe && (
                  <span className="text-[8.5px] font-extrabold uppercase text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                    Tingkat 1
                  </span>
                )}
              </div>

              <span className="text-[11px] text-gray-600 font-semibold truncate mt-0.5">
                {node.jabatan?.nama_jabatan || "Karyawan"}
              </span>

              {node.lokasi && (
                <span className="text-[9.5px] text-gray-400 font-medium truncate flex items-center gap-1 mt-0.5">
                  <MapPin className="w-2.5 h-2.5 shrink-0 text-gray-400" />
                  {node.lokasi.nama_lokasi}
                </span>
              )}
            </div>
          </div>

          {/* Subordinate counter button */}
          {hasChildren && (
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-gray-700 text-[10px] font-bold transition-all shrink-0 cursor-pointer"
              title={collapsed ? "Tampilkan Cabang" : "Sembunyikan Cabang"}
            >
              <span>{children.length} Tim</span>
              {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3 text-gray-500" />}
            </button>
          )}
        </div>
      </div>

      {/* Cabang Anak di Bawahnya dengan Connector |_ */}
      {hasChildren && !collapsed && (
        <div className="mt-3 space-y-3 relative pl-7">
          {children.map((child, index) => {
            const isFirst = index === 0;
            const isLast = index === children.length - 1;
            return (
              <div key={child.contract_id} className="relative">
                {/* Garis vertikal menyambung ke anak berikutnya melewati gap margin */}
                {!isLast && (
                  <div
                    className="absolute -left-[14px] top-0 w-0.5 bg-slate-300 pointer-events-none z-0"
                    style={{ height: "calc(100% + 14px)" }}
                  />
                )}

                {/* Konektor Siku |_ */}
                <svg
                  className="absolute -left-[14px] top-0 pointer-events-none overflow-visible z-0"
                  width="14"
                  height="36"
                  viewBox="0 0 14 36"
                  fill="none"
                >
                  {/* Garis vertikal penyambung dari induk jika anak pertama */}
                  {isFirst && <line x1="1" y1="-14" x2="1" y2="0" stroke="#cbd5e1" strokeWidth="2" />}

                  {isLast ? (
                    /* Siku melengkung |_ */
                    <path d="M 1 0 L 1 20 Q 1 28 9 28 L 14 28" stroke="#cbd5e1" strokeWidth="2" fill="none" />
                  ) : (
                    /* Cabang siku horizontal ├── */
                    <line x1="1" y1="28" x2="14" y2="28" stroke="#cbd5e1" strokeWidth="2" />
                  )}
                </svg>

                <div className="relative z-10">
                  <MobileTreeNode
                    node={child}
                    childrenMap={childrenMap}
                    level={level + 1}
                    myContractId={myContractId}
                    primaryAccent={primaryAccent}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function MobileCompanyPage({ user }: MobileCompanyPageProps) {
  const { navigate } = useRouter();
  const { navbarBgStyle, buttonColor, defaultLogo } = useTenantBranding();

  const [tenant, setTenant] = useState<TenantConfigData | null>(null);
  const [hierarchy, setHierarchy] = useState<HierarchyNode[]>([]);
  const [profile, setProfile] = useState<any>(user);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<MainTab>("bagan");
  const [baganMode, setBaganMode] = useState<BaganMode>("vertikal");
  const [searchQuery, setSearchQuery] = useState("");
  const [descExpanded, setDescExpanded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const [tenantRes, hierarchyRes, profileRes] = await Promise.all([
          fetchCurrentTenantAPI().catch(() => null),
          fetchHierarchy().catch(() => []),
          fetchProfileAPI().catch(() => user),
        ]);

        if (isMounted) {
          if (tenantRes) setTenant(tenantRes);
          if (hierarchyRes) setHierarchy(hierarchyRes);
          if (profileRes) setProfile(profileRes);
        }
      } catch (err) {
        console.error("Gagal memuat data perusahaan:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Current user identification in hierarchy
  const resolvedUserId = profile?.id || user?.id;
  const resolvedUserName = (profile?.name || user?.name || "").trim().toLowerCase();

  // Map of children for hierarchical tree traversal
  const childrenMap = useMemo(() => {
    const m = new Map<number, HierarchyNode[]>();
    hierarchy.forEach((n) => {
      if (n.manager_contract_id != null) {
        const arr = m.get(n.manager_contract_id) || [];
        arr.push(n);
        m.set(n.manager_contract_id, arr);
      }
    });
    return m;
  }, [hierarchy]);

  // Find the current employee's node
  const myNode = useMemo(() => {
    if (!hierarchy.length) return null;
    return (
      hierarchy.find((n) => resolvedUserId && n.user_id === Number(resolvedUserId)) ||
      hierarchy.find((n) => n.name && n.name.trim().toLowerCase() === resolvedUserName) ||
      null
    );
  }, [hierarchy, resolvedUserId, resolvedUserName]);

  // Roots of the organization tree (e.g. Demo Admin / CEO / Direktur)
  const roots = useMemo(() => {
    const r = hierarchy.filter((n) => n.manager_contract_id == null);
    return r.length > 0 ? r : hierarchy.slice(0, 1);
  }, [hierarchy]);

  // Filtered members for the "Daftar Tim" tab
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return hierarchy;
    const q = searchQuery.toLowerCase();
    return hierarchy.filter(
      (m) =>
        (m.name && m.name.toLowerCase().includes(q)) ||
        (m.jabatan?.nama_jabatan && m.jabatan.nama_jabatan.toLowerCase().includes(q)) ||
        (m.lokasi?.nama_lokasi && m.lokasi.nama_lokasi.toLowerCase().includes(q))
    );
  }, [hierarchy, searchQuery]);

  const companyLogo = tenant?.logo_url || profile?.tenant?.logo_url || defaultLogo;
  const companyName = tenant?.name || profile?.tenant?.name || "PT Pelita Optima Talenta";
  const companySlug = tenant?.slug || profile?.tenant?.slug || "POT";
  const companyDesc =
    tenant?.description ||
    "Perusahaan berdedikasi dalam menciptakan ekosistem kerja yang profesional, kolaboratif, dan bertumbuh bersama untuk mewujudkan visi dan misi masa depan.";

  const primaryAccent = typeof buttonColor === "string" && buttonColor ? buttonColor : THEME_COLORS.hex.primary;

  return (
    <div className="space-y-4 pb-12 font-sans antialiased text-left">
      {/* Top Header Bar (Clean, no inner card) */}
      <div
        style={navbarBgStyle}
        className="relative -mx-5 -mt-6 overflow-hidden rounded-b-2xl text-white shadow-xs border-b border-white/10"
      >
        {/* Subtle Batik Pattern */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `url(${patternBg})`,
            backgroundSize: "180px auto",
            backgroundRepeat: "repeat",
          }}
        />

        {/* Navigation & Title Bar */}
        <div className="relative z-10 flex items-center justify-between px-5 pt-10 pb-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("MobileLumbung")}
              className="p-2 hover:bg-white/15 active:scale-95 rounded-full transition-all cursor-pointer text-white border border-white/15 bg-white/10 backdrop-blur-xs"
              title="Kembali"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold tracking-widest uppercase text-white/70 leading-none">
                Layanan Mandiri
              </span>
              <h1 className="text-base font-bold tracking-tight text-white mt-1.5 leading-none">
                Profil Perusahaan
              </h1>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-white text-[10px] font-extrabold tracking-wide uppercase shadow-2xs backdrop-blur-xs">
            <Building2 className="w-3.5 h-3.5" />
            <span>{companySlug}</span>
          </div>
        </div>
      </div>

      {/* Detail Perusahaan Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4.5 shadow-xs space-y-4">
        {/* Company Identity Header */}
        <div className="flex items-center gap-3.5 pb-3.5 border-b border-gray-100">
          <div className="w-14 h-14 rounded-2xl bg-zinc-50 p-2 flex items-center justify-center shrink-0 border border-gray-200/80 shadow-2xs overflow-hidden">
            <img src={companyLogo} alt={companyName} className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                Tenant Resmi
              </span>
            </div>
            <h2 className="text-base font-extrabold text-gray-900 mt-1 leading-snug truncate" title={companyName}>
              {companyName}
            </h2>
            <p className="text-[11px] text-gray-500 font-medium line-clamp-1 mt-0.5">
              {tenant?.address || "Kantor Pusat Operasional"}
            </p>
          </div>
        </div>

        {/* Tentang Perusahaan Header */}
        <div className="flex items-center gap-2">
          <div
            style={{ background: `color-mix(in srgb, ${primaryAccent} 15%, transparent)` }}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#e0542c]"
          >
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-black text-gray-850 uppercase tracking-wider">Tentang Perusahaan</h3>
        </div>

        {/* Deskripsi */}
        <div className="text-xs text-gray-650 leading-relaxed font-normal">
          <p className={descExpanded ? "" : "line-clamp-3"}>{companyDesc}</p>
          {companyDesc.length > 150 && (
            <button
              type="button"
              onClick={() => setDescExpanded(!descExpanded)}
              className="text-[10px] font-extrabold text-[#e0542c] hover:underline mt-1 cursor-pointer block"
            >
              {descExpanded ? "Tampilkan Lebih Sedikit" : "Baca Selengkapnya"}
            </button>
          )}
        </div>

        {/* Contact Info Pills */}
        <div className="grid grid-cols-1 gap-2 pt-1 border-t border-gray-100">
          {tenant?.address && (
            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/60 text-xs">
              <MapPin className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Alamat</span>
                <span className="text-xs text-gray-700 font-semibold leading-relaxed">{tenant.address}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {tenant?.email && (
              <a
                href={`mailto:${tenant.email}`}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/60 text-xs hover:border-[#e0542c]/40 transition-colors"
              >
                <Mail className="w-4 h-4 text-gray-500 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email</span>
                  <span className="text-xs text-gray-700 font-semibold truncate">{tenant.email}</span>
                </div>
              </a>
            )}

            {tenant?.phone && (
              <a
                href={`tel:${tenant.phone}`}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/60 text-xs hover:border-[#e0542c]/40 transition-colors"
              >
                <Phone className="w-4 h-4 text-gray-500 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Telepon</span>
                  <span className="text-xs text-gray-700 font-semibold truncate">{tenant.phone}</span>
                </div>
              </a>
            )}
          </div>

          {tenant?.web && (
            <a
              href={tenant.web.startsWith("http") ? tenant.web : `https://${tenant.web}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/60 text-xs hover:border-[#e0542c]/40 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Globe className="w-4 h-4 text-gray-500 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Situs Web</span>
                  <span className="text-xs text-gray-700 font-semibold truncate">{tenant.web}</span>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            </a>
          )}
        </div>
      </div>

      {/* Bagan & Struktur Organisasi Section */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4.5 shadow-xs space-y-4">
        {/* Section Header */}
        <div className="flex flex-col gap-1 border-b border-gray-100 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                style={{ background: `color-mix(in srgb, ${primaryAccent} 15%, transparent)` }}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[#e0542c]"
              >
                <FolderTree className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-black text-gray-850 uppercase tracking-wider">Bagan Organisasi</h2>
            </div>

            <span className="text-[10px] font-extrabold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
              {hierarchy.length} Anggota
            </span>
          </div>
          <p className="text-[11px] text-gray-500 font-medium">
            Struktur hierarki dan alur koordinasi tim perusahaan.
          </p>
        </div>

        {/* View Switcher: Bagan vs Daftar Tim */}
        <div className="flex items-center bg-zinc-100 p-1 rounded-xl gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("bagan")}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "bagan"
                ? "bg-white text-gray-900 shadow-xs"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>Bagan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("tim")}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "tim"
                ? "bg-white text-gray-900 shadow-xs"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Daftar Tim ({hierarchy.length})</span>
          </button>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="space-y-3 py-2">
            <Skeleton className="h-16 w-full rounded-2xl" />
            <div className="ml-6 space-y-2">
              <Skeleton className="h-16 w-full rounded-2xl" />
              <div className="ml-6 space-y-2">
                <Skeleton className="h-16 w-full rounded-2xl" />
              </div>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* TAB 1: BAGAN ORGANISASI */}
            {activeTab === "bagan" && (
              <motion.div
                key="tab-bagan"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="space-y-3 py-1"
              >
                {/* Mode Switcher: Vertikal vs Diagram Interaktif */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-extrabold uppercase text-gray-400 tracking-wider">
                    Alur Hierarki
                  </span>
                  <div className="flex items-center bg-gray-100 p-0.5 rounded-lg text-[10.5px]">
                    <button
                      type="button"
                      onClick={() => setBaganMode("vertikal")}
                      className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        baganMode === "vertikal"
                          ? "bg-white text-gray-900 shadow-2xs"
                          : "text-gray-500 hover:text-gray-800"
                      }`}
                    >
                      <GitFork className="w-3 h-3" />
                      <span>Pohon Vertikal</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBaganMode("diagram")}
                      className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        baganMode === "diagram"
                          ? "bg-white text-gray-900 shadow-2xs"
                          : "text-gray-500 hover:text-gray-800"
                      }`}
                    >
                      <Layers className="w-3 h-3" />
                      <span>Diagram Horizontal</span>
                    </button>
                  </div>
                </div>

                {/* Sub-view: Pohon Vertikal (Mudah dibaca di HP dari Demo Admin s/d Bagas Wicaksono) */}
                {baganMode === "vertikal" && (
                  <div className="space-y-3 pt-1">
                    {roots.length > 0 ? (
                      roots.map((rootNode) => (
                        <MobileTreeNode
                          key={rootNode.contract_id}
                          node={rootNode}
                          childrenMap={childrenMap}
                          level={1}
                          myContractId={myNode?.contract_id}
                          primaryAccent={primaryAccent}
                        />
                      ))
                    ) : (
                      <div className="p-6 text-center text-gray-500 text-xs bg-gray-50 rounded-xl">
                        Tidak ada data bagan yang dapat ditampilkan.
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-view: Diagram Horizontal (Persis seperti tampilan web desktop) */}
                {baganMode === "diagram" && (
                  <div className="space-y-2 pt-1">
                    <p className="text-[10px] text-gray-400 italic">
                      * Geser layar ke samping untuk melihat seluruh cabang bagan
                    </p>
                    <div className="w-full overflow-x-auto rounded-2xl border border-gray-200/90 bg-zinc-50/50 p-4 scrollbar-thin">
                      <div className="min-w-[680px]">
                        <OrgChartTree
                          roots={roots}
                          childrenMap={childrenMap}
                          collapsed={new Set()}
                          onToggleCollapse={() => {}}
                          highlightIds={myNode ? new Set([myNode.contract_id]) : new Set()}
                          forceExpandIds={new Set()}
                          crossSiteIds={new Set()}
                          onReassign={() => {}}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 2: DAFTAR TIM / SEMUA ANGGOTA */}
            {activeTab === "tim" && (
              <motion.div
                key="tab-tim"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="space-y-3 py-1"
              >
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama, jabatan, atau divisi..."
                    className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#e0542c] focus:border-[#e0542c]"
                  />
                </div>

                {/* Member List */}
                <div className="space-y-2">
                  {filteredMembers.map((member) => {
                    const isMe = member.contract_id === myNode?.contract_id;
                    return (
                      <div
                        key={member.contract_id}
                        style={
                          isMe
                            ? {
                                borderColor: `color-mix(in srgb, ${primaryAccent} 50%, transparent)`,
                                background: `color-mix(in srgb, ${primaryAccent} 4%, white)`,
                              }
                            : undefined
                        }
                        className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                          isMe
                            ? "border-2 shadow-2xs"
                            : "bg-zinc-50/80 border-gray-200/80 hover:bg-zinc-50"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            style={
                              isMe
                                ? { background: primaryAccent }
                                : { background: "#1E2A4A" }
                            }
                            className="w-9 h-9 rounded-full text-white font-black text-xs flex items-center justify-center shrink-0 border border-white"
                          >
                            {getInitials(member.name || "?")}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-gray-850 truncate">{member.name}</span>
                              {isMe && (
                                <span
                                  style={{ background: primaryAccent }}
                                  className="text-[8.5px] font-black uppercase text-white px-1.5 py-0.5 rounded shadow-2xs"
                                >
                                  Anda
                                </span>
                              )}
                            </div>
                            <span className="text-[10.5px] text-gray-500 font-medium truncate">
                              {member.jabatan?.nama_jabatan || "Karyawan"}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end shrink-0 ml-2">
                          {member.lokasi && (
                            <span className="text-[9.5px] font-semibold text-gray-400">
                              {member.lokasi.nama_lokasi}
                            </span>
                          )}
                          {member.direct_report_count > 0 && (
                            <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded mt-0.5">
                              {member.direct_report_count} Tim
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {filteredMembers.length === 0 && (
                    <div className="text-center py-6 text-xs text-gray-400 bg-zinc-50 rounded-xl border border-dashed border-gray-200">
                      Tidak ada anggota yang cocok dengan pencarian.
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
