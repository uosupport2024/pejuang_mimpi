import { API_BASE_URL, getHeaders, dedupFetch } from "@/shared/utils/api";

// Mapping of Route Names (from router.tsx RouteType) to Menu IDs (from tenant_menu_configs table)
export const ROUTE_MENU_MAPPING: Record<string, string> = {
  // Admin Web Routes (exact RouteType values from router.tsx)
  Dashboard: "admin-dashboard",
  Employee: "admin-pegawai",
  EmployeeAdd: "admin-pegawai",
  EmployeeEdit: "admin-pegawai",
  EmployeeInputShift: "admin-shift-input",
  Shift: "admin-shift-master",
  Organization: "admin-divisi",    // "Divisi" menu in sidebar
  Location: "admin-lokasi",        // "Lokasi" menu in sidebar
  LocationAdd: "admin-lokasi",
  LocationEdit: "admin-lokasi",
  Attendance: "admin-absensi-rekap",
  AttendanceToday: "admin-absensi-today",
  ScheduleShift: "admin-jadwal-shift",
  Overtime: "admin-lembur",
  Training: "admin-pelatihan",
  TrainingAdd: "admin-pelatihan",
  TrainingEdit: "admin-pelatihan",
  TrainingDetail: "admin-pelatihan",
  Payroll: "admin-keuangan",
  PayrollHistory: "admin-keuangan",
  Leave: "admin-cuti",
  KoreksiAbsenApproval: "admin-koreksi",
  TenantConfig: "admin-tenant-config",

  // Mobile App Routes
  MobileHome: "mobile-home",
  MobileAbsensi: "mobile-absensi",
  MobileIdCard: "mobile-idcard",
  MobileLumbung: "mobile-lumbung",
  MobileAyamku: "mobile-ayamku",
  MobilePakan: "mobile-pakan",
  MobilePakanLearn: "mobile-pakan",
  MobileProfile: "mobile-profile",
  MobileLeaveRequest: "mobile-leave",
  MobileLeaveHistory: "mobile-leave",
  MobileLemburAbsensi: "mobile-lembur",
  MobileLemburHistory: "mobile-lembur",
  MobileKoreksiAbsen: "mobile-koreksi",
  MobileHistory: "mobile-absensi",
  MobileCelenganDetail: "mobile-lumbung",
  MobileCelenganAdd: "mobile-lumbung",
  MobileLokerDetail: "mobile-home",
  MobilePayroll: "mobile-lumbung",
};

// ============================================================
// SIMPLE APPROACH: Direct API call, no localStorage, no cookie
// The menu config is stored in a single module-level variable.
// ============================================================

let menuConfig: Record<string, boolean> = {};
let isLoaded = false;
const listeners = new Set<() => void>();

export function subscribePermissions(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners() {
  listeners.forEach((fn) => fn());
}

/**
 * Load tenant menu config from Backend API:
 * GET /api/v1/tenant-menu-config?tenant_id=X
 *
 * Returns { "mobile-ayamku": false, "admin-dashboard": true, ... }
 * directly from database (role='*' tenant-level switches).
 */
export async function loadTenantPermissions(tenantId: string | number = 3): Promise<void> {
  const numericId = typeof tenantId === "number" ? tenantId : (parseInt(String(tenantId).replace(/\D/g, ""), 10) || 3);
  try {
    const response = await dedupFetch(`${API_BASE_URL}/tenant-menu-config?tenant_id=${numericId}`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      console.warn(`[Permission] API returned ${response.status}, defaulting all menus to enabled.`);
      menuConfig = {};
      return;
    }

    const json = await response.json();
    const data = json.data;

    if (data && typeof data === "object" && !Array.isArray(data)) {
      // data is { "mobile-ayamku": false, "admin-dashboard": true, ... }
      menuConfig = {};
      for (const [menuId, allowed] of Object.entries(data)) {
        menuConfig[menuId] = Boolean(allowed);
      }
      console.info(
        `%c[Permission] %cLoaded menu config for tenant ${tenantId}:`,
        "background: #1e2a4a; color: #fee279; font-weight: bold; padding: 2px 6px; border-radius: 4px;",
        "color: #1e2a4a; font-weight: bold;",
        menuConfig
      );
    } else {
      console.warn("[Permission] Unexpected response format, defaulting all menus to enabled.", data);
      menuConfig = {};
    }
  } catch (err) {
    console.warn("[Permission] Failed to fetch menu config from API, defaulting all menus to enabled.", err);
    menuConfig = {};
  } finally {
    isLoaded = true;
    notifyListeners();
  }
}

export function isPermissionsLoading(): boolean {
  return !isLoaded;
}

/**
 * Check if a menu item or route is enabled.
 * Uses the data loaded from GET /tenant-menu-config directly.
 */
export function isMenuEnabled(menuIdOrRoute: string, _tenantId?: string | number): boolean {
  const menuId = ROUTE_MENU_MAPPING[menuIdOrRoute] || menuIdOrRoute;

  // Always allow Dashboard, MobileHome, TenantMapping, TenantManagement, TenantConfig, MasterCelenganIcon
  if (
    menuIdOrRoute === "Dashboard" ||
    menuIdOrRoute === "MobileHome" ||
    menuIdOrRoute === "TenantMapping" ||
    menuIdOrRoute === "TenantManagement" ||
    menuIdOrRoute === "TenantConfig" ||
    menuIdOrRoute === "MasterCelenganIcon" ||
    menuId === "admin-dashboard" ||
    menuId === "mobile-home"
  ) {
    return true;
  }

  // If menuConfig has an explicit false for this menu, it's disabled
  if (menuConfig[menuId] === false) {
    return false;
  }

  // Default to true (enabled) if not found or true
  return true;
}

/**
 * Update menu config in-memory when tenant mapping page changes toggles.
 * This is just for instant UI feedback on the mapping page itself;
 * the real source of truth is always the database via the API.
 */
export function setTenantMenuState(menuId: string, enabled: boolean, _tenantId: string | number = 1) {
  menuConfig[menuId] = enabled;
  notifyListeners();
}
