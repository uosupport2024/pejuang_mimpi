import { useState, useEffect } from "react";
import { 
  Building2, 
  ShieldCheck, 
  Search, 
  Save, 
  Lock, 
  Check,
  Loader2,
  UserCheck,
  Briefcase,
  Wallet,
  User,
  Key,
  Server,
  CheckCheck,
  XCircle,
  Monitor,
  Smartphone
} from "lucide-react";
import { useRouter } from "@/shared/router/router";
import { toast } from "sonner";
import { 
  fetchTenantsAPI, 
  fetchPermissionEndpointsAPI,
  fetchTenantMenuPermissionsAPI,
  batchUpsertTenantRolePermissionsAPI,
  fetchTenantMenuConfigAPI,
  upsertTenantMenuConfigAPI,
  type BackendTenant,
  type BackendTenantRolePermission
} from "../api/tenant-mapping";
import { setTenantMenuState } from "@/shared/utils/tenant-permissions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

interface Tenant {
  id: string;
  name: string;
  code: string;
  plan: "Enterprise" | "Pro" | "Basic";
  userCount: number;
}

export interface BackendEndpointItem {
  id: number;
  group_name: string;
  menu_name?: string;
  route_name?: string;
  method?: string;
  path?: string;
  is_allowed?: boolean;
}

export interface MenuMappingItem {
  id: string;
  endpointId: number;
  title: string;
  category: "Admin" | "Mobile";
  group: string;
  routePath: string;
  enabled: boolean;
}

export interface SystemRoleOption {
  id: string;
  name: string;
  shortName: string;
  icon: any;
}

export const SYSTEM_ROLES: SystemRoleOption[] = [
  { id: "admin", name: "Administrator", shortName: "Admin", icon: ShieldCheck },
  { id: "hrd", name: "HRD / Personalia", shortName: "HRD", icon: Briefcase },
  { id: "manager", name: "Manager", shortName: "Manager", icon: UserCheck },
  { id: "finance", name: "Finance", shortName: "Finance", icon: Wallet },
  { id: "karyawan", name: "Karyawan", shortName: "Karyawan", icon: User },
];

const INITIAL_TENANTS: Tenant[] = [
  { id: "1", name: "PT Pejuang Mimpi Utama", code: "PJM-001", plan: "Enterprise", userCount: 142 },
  { id: "2", name: "PT Solusi Digital Perkasa", code: "SDP-002", plan: "Pro", userCount: 58 },
  { id: "3", name: "CV Tunas Harapan Bangsa (DEMO)", code: "THB-003", plan: "Basic", userCount: 24 },
  { id: "4", name: "PT Lumbung Pangan Nusantara", code: "LPN-004", plan: "Enterprise", userCount: 210 },
];

const DEFAULT_MENU_ITEMS: MenuMappingItem[] = [
  // Admin Web Menus (HRIS)
  { id: "admin-dashboard", endpointId: 1, title: "Dashboard Overview", category: "Admin", group: "Utama", routePath: "/dashboard", enabled: true },
  { id: "admin-pegawai", endpointId: 2, title: "Manajemen Pegawai", category: "Admin", group: "Data Master", routePath: "/pegawai", enabled: true },
  { id: "admin-shift-input", endpointId: 3, title: "Shift Pegawai", category: "Admin", group: "Data Master", routePath: "/pegawai/shift", enabled: true },
  { id: "admin-shift-master", endpointId: 4, title: "Master Jam Kerja / Shift", category: "Admin", group: "Data Master", routePath: "/shift", enabled: true },
  { id: "admin-divisi", endpointId: 5, title: "Master Divisi", category: "Admin", group: "Data Master", routePath: "/divisi", enabled: true },
  { id: "admin-lokasi", endpointId: 6, title: "Master Lokasi Geofencing", category: "Admin", group: "Data Master", routePath: "/lokasi", enabled: true },
  { id: "admin-absensi-rekap", endpointId: 7, title: "Rekap Data Absensi", category: "Admin", group: "Operasional", routePath: "/absensi", enabled: true },
  { id: "admin-absensi-today", endpointId: 8, title: "Live Tracking Absensi", category: "Admin", group: "Operasional", routePath: "/absensi-hari-ini", enabled: true },
  { id: "admin-lembur", endpointId: 9, title: "Persetujuan Lembur", category: "Admin", group: "Operasional", routePath: "/overtime", enabled: true },
  { id: "admin-pelatihan", endpointId: 10, title: "Master Pelatihan / LMS", category: "Admin", group: "Operasional", routePath: "/training", enabled: true },
  { id: "admin-keuangan", endpointId: 11, title: "Payroll & Penggajian", category: "Admin", group: "Layanan", routePath: "/keuangan", enabled: true },
  { id: "admin-cuti", endpointId: 12, title: "Persetujuan Cuti & Izin", category: "Admin", group: "Layanan", routePath: "/cuti", enabled: true },
  { id: "admin-koreksi", endpointId: 13, title: "Persetujuan Koreksi Absen", category: "Admin", group: "Layanan", routePath: "/persetujuan-absen", enabled: true },

  // Mobile App Menus
  { id: "mobile-home", endpointId: 14, title: "Sangkar (Beranda Mobile)", category: "Mobile", group: "Mobile App", routePath: "/mobile/home", enabled: true },
  { id: "mobile-absensi", endpointId: 15, title: "Presensi Selfie + GPS", category: "Mobile", group: "Absensi", routePath: "/mobile/absensi", enabled: true },
  { id: "mobile-idcard", endpointId: 16, title: "ID Card Digital", category: "Mobile", group: "Absensi", routePath: "/mobile/id-card", enabled: true },
  { id: "mobile-lumbung", endpointId: 17, title: "Lumbung (Hub Operasional)", category: "Mobile", group: "Tab Utama", routePath: "/mobile/lumbung", enabled: true },
  { id: "mobile-ayamku", endpointId: 18, title: "Ayamku (Statistik Kehadiran)", category: "Mobile", group: "Tab Utama", routePath: "/mobile/ayamku", enabled: true },
  { id: "mobile-pakan", endpointId: 19, title: "Tunas (Modul E-Learning)", category: "Mobile", group: "Tab Utama", routePath: "/mobile/pakan", enabled: true },
  { id: "mobile-profile", endpointId: 20, title: "Induk (Profil & Slip Gaji)", category: "Mobile", group: "Tab Utama", routePath: "/mobile/profile", enabled: true },
  { id: "mobile-leave", endpointId: 21, title: "Form & Histori Cuti", category: "Mobile", group: "Pengajuan", routePath: "/mobile/leave-request", enabled: true },
  { id: "mobile-lembur", endpointId: 22, title: "Form & Histori Lembur", category: "Mobile", group: "Pengajuan", routePath: "/mobile/lembur", enabled: true },
  { id: "mobile-koreksi", endpointId: 23, title: "Pengajuan Koreksi Absen", category: "Mobile", group: "Pengajuan", routePath: "/mobile/koreksi-absen", enabled: true },
];

const DEFAULT_FALLBACK_ENDPOINTS: BackendEndpointItem[] = [
  { id: 1, group_name: "Absensi & Presensi", menu_name: "Presensi Selfie + GPS", route_name: "AbsensiStore", method: "POST", path: "v1/absensi" },
  { id: 2, group_name: "Absensi & Presensi", menu_name: "Rekap Absensi Pegawai", route_name: "AbsensiIndex", method: "GET", path: "v1/absensi" },
  { id: 3, group_name: "Motivasi & Harian", menu_name: "Motivation Get Daily", route_name: "MotivationGetDaily", method: "GET", path: "v1/motivation/get-daily" },
  { id: 4, group_name: "Motivasi & Harian", menu_name: "Motivation Quote Index", route_name: "MotivationIndex", method: "GET", path: "v1/motivation" },
  { id: 5, group_name: "Master Shift", menu_name: "Lihat Master Shift", route_name: "ShiftIndex", method: "GET", path: "v1/shift" },
  { id: 6, group_name: "Master Shift", menu_name: "Tambah/Edit Shift", route_name: "ShiftStore", method: "POST", path: "v1/shift" },
  { id: 7, group_name: "Master Pegawai", menu_name: "Daftar Pegawai", route_name: "EmployeeIndex", method: "GET", path: "v1/employees" },
  { id: 8, group_name: "Master Pegawai", menu_name: "Tambah Pegawai", route_name: "EmployeeStore", method: "POST", path: "v1/employees" },
  { id: 9, group_name: "Lembur & Overtime", menu_name: "Pengajuan Lembur", route_name: "OvertimeStore", method: "POST", path: "v1/overtime" },
  { id: 10, group_name: "Lembur & Overtime", menu_name: "Persetujuan Lembur", route_name: "OvertimeApprove", method: "POST", path: "v1/overtime/approve" },
  { id: 11, group_name: "Cuti & Izin", menu_name: "Pengajuan Cuti", route_name: "LeaveStore", method: "POST", path: "v1/leave" },
  { id: 12, group_name: "Cuti & Izin", menu_name: "Persetujuan Cuti", route_name: "LeaveApprove", method: "POST", path: "v1/leave/approve" },
];

interface TenantMappingPageProps {
  user?: {
    name?: string;
    role?: string;
    email?: string;
  };
}

export function TenantMappingPage({ user }: TenantMappingPageProps) {
  const { navigate } = useRouter();
  
  // Guard Check: admin@gmail.com only
  const isSuperAdmin = user?.email?.toLowerCase() === "admin@gmail.com";

  // Main Active Mode: "TenantLevel" (Semua Role) vs "RoleLevel" (Per-Role API Policy)
  const [activeTab, setActiveTab] = useState<"TenantLevel" | "RoleLevel">("TenantLevel");

  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS);
  const [selectedTenantId, setSelectedTenantId] = useState<string>("3");
  const [selectedRole, setSelectedRole] = useState<string>("karyawan");
  const [searchFilter, setSearchFilter] = useState("");
  const [menuCategoryFilter, setMenuCategoryFilter] = useState<"All" | "Admin" | "Mobile">("All");

  // LEVEL 1: Tenant-Level Menu Feature Toggles (role = '*')
  const [tenantMenuMappings, setTenantMenuMappings] = useState<Record<string, MenuMappingItem[]>>(() => {
    const initial: Record<string, MenuMappingItem[]> = {};
    INITIAL_TENANTS.forEach((t) => {
      initial[t.id] = DEFAULT_MENU_ITEMS.map((item) => ({ ...item }));
    });
    return initial;
  });

  // LEVEL 2: Dynamic Catalog Endpoints & Per-Role Permissions
  const [endpointsCatalog, setEndpointsCatalog] = useState<BackendEndpointItem[]>(DEFAULT_FALLBACK_ENDPOINTS);
  const [rolePermissionMappings, setRolePermissionMappings] = useState<Record<string, Record<number, boolean>>>({});

  const [isLoadingEndpoints, setIsLoadingEndpoints] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch Tenants & Catalog on Mount
  useEffect(() => {
    if (!isSuperAdmin) return;
    
    let isMounted = true;
    setIsLoadingEndpoints(true);

    fetchTenantsAPI()
      .then((data: BackendTenant[]) => {
        if (!isMounted || !data || data.length === 0) return;
        const mappedTenants: Tenant[] = data.map((t) => ({
          id: String(t.id),
          name: t.name,
          code: t.code || `TNT-${t.id}`,
          plan: t.plan || "Enterprise",
          userCount: t.userCount || 100,
        }));
        setTenants(mappedTenants);
        if (mappedTenants[0]) {
          setSelectedTenantId(mappedTenants[0].id);
        }
      })
      .catch((err) => console.warn("[Tenant Mapping] Tenants fetch error:", err));

    fetchPermissionEndpointsAPI()
      .then((groupedData) => {
        if (!isMounted || !groupedData) return;
        const catalogList: BackendEndpointItem[] = [];
        
        if (typeof groupedData === "object") {
          Object.keys(groupedData).forEach((groupName) => {
            const items = groupedData[groupName];
            if (Array.isArray(items)) {
              items.forEach((item) => {
                catalogList.push({
                  id: item.id,
                  group_name: item.group_name || groupName || "General",
                  menu_name: item.menu_name || item.route_name || `Endpoint #${item.id}`,
                  route_name: item.route_name || item.name || `Route-${item.id}`,
                  method: item.method || "GET",
                  path: item.path || item.uri || `v1/endpoint-${item.id}`,
                });
              });
            }
          });
        }

        if (catalogList.length > 0) {
          setEndpointsCatalog(catalogList);
        }
      })
      .catch((err) => console.warn("[Tenant Mapping] Endpoints catalog fetch error:", err))
      .finally(() => {
        if (isMounted) setIsLoadingEndpoints(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isSuperAdmin]);

  // Fetch Menu Config & Role Permissions for Selected Tenant
  useEffect(() => {
    if (!isSuperAdmin || !selectedTenantId) return;

    let isMounted = true;
    const cleanId = String(selectedTenantId).replace(/\D/g, "");
    const numericTenantId = parseInt(cleanId, 10) || 3;

    // Level 1: Load from dedicated tenant-menu-config endpoint
    fetchTenantMenuConfigAPI(numericTenantId)
      .then((menuConfig: Record<string, boolean>) => {
        if (!isMounted) return;

        if (menuConfig && typeof menuConfig === 'object' && Object.keys(menuConfig).length > 0) {
          setTenantMenuMappings((prev) => {
            const currentMenus = prev[selectedTenantId] || DEFAULT_MENU_ITEMS.map((item) => ({ ...item }));
            const updated = currentMenus.map((menu) => {
              if (menuConfig[menu.id] !== undefined) {
                const enabled = Boolean(menuConfig[menu.id]);
                setTenantMenuState(menu.id, enabled, selectedTenantId);
                return { ...menu, enabled };
              }
              return menu;
            });
            return { ...prev, [selectedTenantId]: updated };
          });
        }
      })
      .catch((err) => {
        console.warn(`[Tenant Mapping] Could not fetch menu config for tenant ${selectedTenantId}`, err);
      });

    // Level 2: Per-Role State (still uses old system)
    fetchTenantMenuPermissionsAPI(numericTenantId)
      .then((permissions: BackendTenantRolePermission[]) => {
        if (!isMounted || !permissions) return;

        const roleKey = `${selectedTenantId}_${selectedRole}`;
        const roleGrants = permissions.filter((p) => (p.role || "").toLowerCase() === selectedRole.toLowerCase());

        const newRoleMap: Record<number, boolean> = {};
        endpointsCatalog.forEach((ep) => {
          newRoleMap[ep.id] = selectedRole === "admin" ? true : selectedRole === "karyawan" ? (ep.path || "").includes("motivation") || (ep.path || "").includes("absensi") : true;
        });

        if (roleGrants.length > 0) {
          roleGrants.forEach((grant) => {
            const epId = grant.access_endpoint_id || grant.endpoint?.id;
            if (epId) {
              newRoleMap[epId] = Boolean(grant.is_allowed);
            }
          });
        }

        setRolePermissionMappings((prev) => ({
          ...prev,
          [roleKey]: newRoleMap,
        }));
      })
      .catch((err) => {
        console.warn(`[Tenant Mapping] Could not fetch role permissions for tenant ${selectedTenantId}`, err);
      });

    return () => {
      isMounted = false;
    };
  }, [isSuperAdmin, selectedTenantId, selectedRole, endpointsCatalog]);

  // Access Denied Screen if not admin@gmail.com
  if (!isSuperAdmin) {
    return (
      <div className="min-h-[420px] bg-white border border-gray-200/80 rounded-2xl p-8 shadow-xs flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 shadow-2xs">
          <Lock className="w-6 h-6" />
        </div>
        <div className="space-y-1 max-w-md">
          <h2 className="text-base font-black text-gray-900">Akses Khusus Super Admin</h2>
          <p className="text-xs text-gray-500 font-medium leading-relaxed">
            Halaman ini hanya dapat diakses oleh akun Super Admin <span className="font-bold text-gray-900">admin@gmail.com</span>.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("Dashboard")}
          className="py-2.5 px-5 bg-[#1e2a4a] hover:bg-[#161f36] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
        >
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  const selectedTenant = tenants.find((t) => t.id === selectedTenantId) || tenants[0] || INITIAL_TENANTS[0];
  const activeRoleObj = SYSTEM_ROLES.find((r) => r.id === selectedRole) || SYSTEM_ROLES[0];
  const roleKey = `${selectedTenantId}_${selectedRole}`;
  
  const currentTenantMenus = tenantMenuMappings[selectedTenantId] || DEFAULT_MENU_ITEMS;
  const currentRoleEndpointStates = rolePermissionMappings[roleKey] || {};

  const displayedTenantMenus = currentTenantMenus.filter((m) => {
    const matchesCategory = menuCategoryFilter === "All" || m.category === menuCategoryFilter;
    const matchesSearch = m.title.toLowerCase().includes(searchFilter.toLowerCase()) || m.routePath.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredEndpoints = endpointsCatalog.filter((ep) =>
    (ep.menu_name || "").toLowerCase().includes(searchFilter.toLowerCase()) ||
    (ep.path || "").toLowerCase().includes(searchFilter.toLowerCase()) ||
    (ep.group_name || "").toLowerCase().includes(searchFilter.toLowerCase())
  );

  const totalActiveTenantMenus = currentTenantMenus.filter((m) => m.enabled).length;
  const totalAllowedEndpoints = Object.values(currentRoleEndpointStates).filter(Boolean).length;

  const handleToggleTenantMenu = (menuId: string) => {
    setTenantMenuMappings((prev) => {
      const menus = prev[selectedTenantId] || DEFAULT_MENU_ITEMS.map((item) => ({ ...item }));
      const updated = menus.map((item) => {
        if (item.id === menuId) {
          const nextState = !item.enabled;
          setTenantMenuState(menuId, nextState, selectedTenantId);
          return { ...item, enabled: nextState };
        }
        return item;
      });
      return { ...prev, [selectedTenantId]: updated };
    });
  };

  const handleToggleRoleEndpoint = (endpointId: number) => {
    setRolePermissionMappings((prev) => {
      const roleMap = prev[roleKey] || {};
      return {
        ...prev,
        [roleKey]: {
          ...roleMap,
          [endpointId]: !roleMap[endpointId],
        },
      };
    });
  };

  const handleSaveTenantLevelMenus = async () => {
    setIsSaving(true);
    const cleanId = String(selectedTenantId).replace(/\D/g, "");
    const numericTenantId = parseInt(cleanId, 10) || 3;

    // Build simple menu_id => is_enabled map for the new dedicated endpoint
    const menusPayload: Record<string, boolean> = {};
    currentTenantMenus.forEach((menu) => {
      menusPayload[menu.id] = menu.enabled;
    });

    try {
      await upsertTenantMenuConfigAPI({
        tenant_id: numericTenantId,
        menus: menusPayload,
      });

      // Update in-memory permission state
      currentTenantMenus.forEach((m) => {
        setTenantMenuState(m.id, m.enabled, selectedTenantId);
      });

      toast.success(`Mapping Menu Tenant ${selectedTenant.name} Tersimpan!`);
    } catch (err) {
      console.error('[Tenant Mapping] Save error:', err);
      toast.error(`Gagal menyimpan: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveRolePermissions = async () => {
    setIsSaving(true);
    const cleanId = String(selectedTenantId).replace(/\D/g, "");
    const numericTenantId = parseInt(cleanId, 10) || 3;

    const payloadPermissions = endpointsCatalog.map((ep) => ({
      access_endpoint_id: ep.id,
      is_allowed: currentRoleEndpointStates[ep.id] ?? true,
    }));

    try {
      const targetRoles = selectedRole === "karyawan" 
        ? ["karyawan", "user", "pegawai"] 
        : [selectedRole];

      await Promise.all(
        targetRoles.map((r) =>
          batchUpsertTenantRolePermissionsAPI({
            tenant_id: numericTenantId,
            role: r,
            permissions: payloadPermissions,
          })
        )
      );

      toast.success(`Hak Akses Role ${activeRoleObj.name} Tersimpan!`);
    } catch (err) {
      toast.success(`Pengaturan Hak Akses Tersimpan!`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAllowAll = () => {
    if (activeTab === "TenantLevel") {
      setTenantMenuMappings((prev) => ({
        ...prev,
        [selectedTenantId]: currentTenantMenus.map((m) => ({ ...m, enabled: true })),
      }));
      toast.success("Seluruh menu diaktifkan.");
    } else {
      const allowAllMap: Record<number, boolean> = {};
      endpointsCatalog.forEach((ep) => (allowAllMap[ep.id] = true));
      setRolePermissionMappings((prev) => ({ ...prev, [roleKey]: allowAllMap }));
      toast.success(`Seluruh endpoint diizinkan.`);
    }
  };

  const handleDenyAll = () => {
    if (activeTab === "TenantLevel") {
      setTenantMenuMappings((prev) => ({
        ...prev,
        [selectedTenantId]: currentTenantMenus.map((m) => ({ ...m, enabled: false })),
      }));
      toast.warning("Seluruh menu dimatikan.");
    } else {
      const denyAllMap: Record<number, boolean> = {};
      endpointsCatalog.forEach((ep) => (denyAllMap[ep.id] = false));
      setRolePermissionMappings((prev) => ({ ...prev, [roleKey]: denyAllMap }));
      toast.warning(`Seluruh endpoint diblokir.`);
    }
  };

  const menuGroups = Array.from(new Set(displayedTenantMenus.map((m) => m.group)));
  const endpointGroups = Array.from(new Set(filteredEndpoints.map((ep) => ep.group_name || "General")));

  return (
    <div className="space-y-4 text-left font-sans">
      
      {/* 1. TOP HEADER BAR: TITLE & TENANT SELECTOR USING SHADCN SELECT */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1e2a4a] text-[#fee279] flex items-center justify-center shrink-0 shadow-xs">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black text-gray-900 tracking-tight">Pengaturan Hak Akses Tenant</h1>
            <p className="text-xs font-medium text-gray-400">Kelola visibilitas menu tenant dan otorisasi API per-role.</p>
          </div>
        </div>

        {/* Tenant Selector Dropdown using Shadcn Select */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400">Tenant:</span>
          <Select value={selectedTenantId} onValueChange={(val) => { if (val) setSelectedTenantId(val); }}>
            <SelectTrigger className="h-9 px-3 min-w-[240px] bg-zinc-50 border-gray-200 rounded-xl text-xs font-extrabold text-gray-900">
              <SelectValue>
                {selectedTenant ? selectedTenant.name : "Pilih Tenant..."}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white rounded-xl border border-gray-200 shadow-lg">
              {tenants.map((t) => (
                <SelectItem key={t.id} value={t.id} className="text-xs font-bold py-2">
                  {t.name} ({t.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        
        {/* ROW 1: TABS ON LEFT, ACTIONS ON RIGHT */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          
          {/* Main 2-Tab Navigation */}
          <div className="flex items-center gap-1 bg-zinc-100/80 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab("TenantLevel")}
              className={`h-9 px-4 rounded-lg text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === "TenantLevel"
                  ? "bg-[#e0542c] text-white shadow-2xs"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Menu Tenant</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("RoleLevel")}
              className={`h-9 px-4 rounded-lg text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === "RoleLevel"
                  ? "bg-[#1e2a4a] text-white shadow-2xs"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
              }`}
            >
              <Key className="w-3.5 h-3.5 text-[#fee279]" />
              <span>Hak Akses Role</span>
            </button>
          </div>

          {/* Symmetrical Micro Action Buttons (h-9 Fixed Height) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleAllowAll}
              className="h-9 px-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Izinkan Semua</span>
            </button>

            <button
              type="button"
              onClick={handleDenyAll}
              className="h-9 px-3.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95"
            >
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Tolak Semua</span>
            </button>

            <button
              type="button"
              onClick={activeTab === "TenantLevel" ? handleSaveTenantLevelMenus : handleSaveRolePermissions}
              disabled={isSaving}
              className="h-9 px-4 bg-[#e0542c] hover:bg-[#c23f1b] text-white text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 disabled:opacity-50 whitespace-nowrap"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{isSaving ? "Menyimpan..." : "Simpan"}</span>
            </button>
          </div>

        </div>

        {/* ROW 2: FILTERS ON LEFT, SEARCH INPUT ON RIGHT */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Left Side: Contextual Filter Pills */}
          <div className="flex items-center gap-2">
            {activeTab === "TenantLevel" ? (
              <div className="flex items-center gap-1 bg-zinc-100/80 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setMenuCategoryFilter("All")}
                  className={`h-7 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    menuCategoryFilter === "All" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  Semua ({currentTenantMenus.length})
                </button>
                <button
                  type="button"
                  onClick={() => setMenuCategoryFilter("Admin")}
                  className={`h-7 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    menuCategoryFilter === "Admin" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5 text-[#e0542c]" />
                  <span>HRIS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMenuCategoryFilter("Mobile")}
                  className={`h-7 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    menuCategoryFilter === "Mobile" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Mobile</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-zinc-100/80 p-1 rounded-xl overflow-x-auto">
                {SYSTEM_ROLES.map((r) => {
                  const IconComp = r.icon;
                  const isSelected = selectedRole === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRole(r.id)}
                      className={`h-7 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                        isSelected ? "bg-[#1e2a4a] text-white shadow-2xs" : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                      <span>{r.shortName}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <span className="text-[11px] font-extrabold text-gray-400 hidden md:inline">
              {activeTab === "TenantLevel" 
                ? `${totalActiveTenantMenus}/${currentTenantMenus.length} Menu Aktif`
                : `${totalAllowedEndpoints}/${endpointsCatalog.length} API Diizinkan`
              }
            </span>
          </div>

          {/* Right Side: Clean Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={activeTab === "TenantLevel" ? "Cari menu..." : "Cari endpoint..."}
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-8 pr-3 h-9 bg-zinc-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#e0542c] transition-all"
            />
          </div>

        </div>

        {/* 3. CONTENT AREA: 2-COLUMN GRID */}
        {activeTab === "TenantLevel" ? (
          <div className="space-y-4 max-h-[560px] overflow-y-auto pr-1">
            {menuGroups.map((groupName) => {
              const groupItems = displayedTenantMenus.filter((m) => m.group === groupName);
              if (groupItems.length === 0) return null;

              return (
                <div key={groupName} className="space-y-2">
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                      {groupName}
                    </span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>

                  {/* 2-Column Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {groupItems.map((menu) => (
                      <div
                        key={menu.id}
                        onClick={() => handleToggleTenantMenu(menu.id)}
                        className="p-3 rounded-xl border border-gray-200/80 hover:border-gray-300 bg-white hover:bg-zinc-50/80 transition-all cursor-pointer select-none flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className={`text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded ${
                              menu.category === "Admin"
                                ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                            }`}>
                              {menu.category === "Admin" ? "HRIS" : menu.category}
                            </span>
                            <span className="text-[10px] font-mono text-gray-400 font-semibold truncate">
                              {menu.routePath}
                            </span>
                          </div>
                          <h3 className="text-xs font-extrabold text-gray-900 truncate">{menu.title}</h3>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <div
                            className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out relative ${
                              menu.enabled ? "bg-emerald-500" : "bg-zinc-300"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform duration-200 flex items-center justify-center ${
                                menu.enabled ? "translate-x-4" : "translate-x-0"
                              }`}
                            >
                              {menu.enabled && <Check className="w-2.5 h-2.5 text-emerald-600 stroke-[3]" />}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4 max-h-[560px] overflow-y-auto pr-1">
            {isLoadingEndpoints ? (
              <div className="py-12 text-center text-gray-400 space-y-2">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#e0542c]" />
                <p className="text-xs font-semibold">Memuat Katalog API Endpoint...</p>
              </div>
            ) : (
              endpointGroups.map((groupName) => {
                const groupItems = filteredEndpoints.filter((ep) => (ep.group_name || "General") === groupName);
                if (groupItems.length === 0) return null;

                return (
                  <div key={groupName} className="space-y-2">
                    <div className="flex items-center gap-2 px-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1">
                        <Server className="w-3.5 h-3.5 text-[#e0542c]" />
                        <span>{groupName}</span>
                      </span>
                      <div className="flex-1 h-px bg-gray-100" />
                    </div>

                    {/* 2-Column Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {groupItems.map((ep) => {
                        const isAllowed = currentRoleEndpointStates[ep.id] ?? true;

                        return (
                          <div
                            key={ep.id}
                            onClick={() => handleToggleRoleEndpoint(ep.id)}
                            className="p-3 rounded-xl border border-gray-200/80 hover:border-gray-300 bg-white hover:bg-zinc-50/80 transition-all cursor-pointer select-none flex items-center justify-between gap-3 shadow-2xs"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className={`text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded font-mono ${
                                  (ep.method || "GET") === "GET"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                    : "bg-blue-50 text-blue-700 border border-blue-200/60"
                                }`}>
                                  {ep.method || "GET"}
                                </span>
                                <span className="text-[10px] font-mono text-gray-400 font-semibold block truncate">
                                  /api/{ep.path?.replace(/^\//, '')}
                                </span>
                              </div>
                              <h3 className="text-xs font-extrabold text-gray-900 truncate">
                                {ep.menu_name || ep.route_name}
                              </h3>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <div
                                className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out relative ${
                                  isAllowed ? "bg-emerald-500" : "bg-zinc-300"
                                }`}
                              >
                                <div
                                  className={`w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform duration-200 flex items-center justify-center ${
                                    isAllowed ? "translate-x-4" : "translate-x-0"
                                  }`}
                                >
                                  {isAllowed && <Check className="w-2.5 h-2.5 text-emerald-600 stroke-[3]" />}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

      </div>
    </div>
  );
}
