import { API_BASE_URL, getHeaders, dedupFetch } from "@/shared/utils/api";

export interface BackendTenant {
  id: number | string;
  name: string;
  slug?: string;
  code?: string;
  is_active?: boolean;
  plan?: "Enterprise" | "Pro" | "Basic";
  userCount?: number;
  email?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BackendTenantRolePermission {
  id?: number;
  tenant_id: number | null;
  role: string;
  access_endpoint_id: number;
  is_allowed: boolean;
  endpoint?: {
    id: number;
    menu_name?: string;
    group_name?: string;
    route_name?: string;
  };
}

// Fallback Initial Tenants matching backend schema
const FALLBACK_TENANTS: BackendTenant[] = [
  { id: 1, name: "PT Pejuang Mimpi Utama", slug: "pjm-001", code: "PJM-001", plan: "Enterprise", userCount: 142, is_active: true },
  { id: 2, name: "PT Solusi Digital Perkasa", slug: "sdp-002", code: "SDP-002", plan: "Pro", userCount: 58, is_active: true },
  { id: 3, name: "CV Tunas Harapan Bangsa", slug: "thb-003", code: "THB-003", plan: "Basic", userCount: 24, is_active: true },
  { id: 4, name: "PT Lumbung Pangan Nusantara", slug: "lpn-004", code: "LPN-004", plan: "Enterprise", userCount: 210, is_active: true },
];

/**
 * GET /tenants/admin or GET /tenants
 * Fetch full tenant listing from backend
 */
export async function fetchTenantsAPI(search?: string): Promise<BackendTenant[]> {
  try {
    const query = new URLSearchParams();
    if (search) query.append("q", search);

    // Primary endpoint: /tenants/admin
    let response = await dedupFetch(`${API_BASE_URL}/tenants/admin?${query.toString()}`, {
      method: "GET",
      headers: getHeaders(),
    });

    // Fallback endpoint: /tenants
    if (!response.ok) {
      response = await dedupFetch(`${API_BASE_URL}/tenants?${query.toString()}`, {
        method: "GET",
        headers: getHeaders(),
      });
    }

    if (!response.ok) {
      console.warn("[Tenant API] Backend tenants endpoint returned non-200, using fallback list.");
      return FALLBACK_TENANTS;
    }

    const json = await response.json();
    const list = json.data?.data || json.data || json;
    
    if (Array.isArray(list) && list.length > 0) {
      return list.map((t: any) => ({
        id: t.id,
        name: t.name,
        slug: t.slug || String(t.id),
        code: t.slug ? t.slug.toUpperCase() : `TNT-${t.id}`,
        plan: t.plan || (t.id % 2 === 0 ? "Pro" : "Enterprise"),
        userCount: t.userCount || 50,
        is_active: t.is_active ?? true,
      }));
    }

    return FALLBACK_TENANTS;
  } catch (error) {
    console.warn("[Tenant API] Exception fetching tenants, using fallback list.", error);
    return FALLBACK_TENANTS;
  }
}

/**
 * GET /permission-endpoints
 * Fetch governable route catalog endpoints from backend
 */
export async function fetchPermissionEndpointsAPI(): Promise<Record<string, any[]>> {
  try {
    const response = await dedupFetch(`${API_BASE_URL}/permission-endpoints`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      return {};
    }

    const json = await response.json();
    return json.data || {};
  } catch (error) {
    console.warn("[Tenant API] Failed to fetch /permission-endpoints", error);
    return {};
  }
}

/**
 * GET /tenant-role-permissions?tenant_id={tenantId}
 * Fetch current menu permissions for a specific tenant
 */
export async function fetchTenantMenuPermissionsAPI(
  tenantId: number | string
): Promise<BackendTenantRolePermission[]> {
  try {
    const response = await dedupFetch(`${API_BASE_URL}/tenant-role-permissions?tenant_id=${tenantId}`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      return [];
    }

    const json = await response.json();
    return json.data || [];
  } catch (error) {
    console.warn(`[Tenant API] Failed to fetch tenant-role-permissions for tenant ${tenantId}`, error);
    return [];
  }
}

/**
 * PUT /tenant-role-permissions/batch
 * Upsert multiple menu permission grants for a tenant & role in a single HTTP batch request
 */
export async function batchUpsertTenantRolePermissionsAPI(payload: {
  tenant_id: number | null;
  role: string;
  permissions: Array<{
    access_endpoint_id: number;
    is_allowed: boolean;
  }>;
}): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/tenant-role-permissions/batch`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    const message = errorJson.message || `Backend API error (${response.status})`;
    throw new Error(message);
  }

  const json = await response.json();
  return json.data || json;
}

/**
 * PUT /tenant-role-permissions
 * Upsert a single menu permission grant for a tenant & role
 */
export async function upsertTenantRolePermissionAPI(payload: {
  tenant_id: number | null;
  role: string;
  access_endpoint_id: number;
  is_allowed: boolean;
}): Promise<BackendTenantRolePermission> {
  const response = await fetch(`${API_BASE_URL}/tenant-role-permissions`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    const message = errorJson.message || `Backend API error (${response.status})`;
    throw new Error(message);
  }

  const json = await response.json();
  return json.data || json;
}

/**
 * DELETE /tenant-role-permissions/{id}
 * Remove a permission override for a tenant
 */
export async function deleteTenantRolePermissionAPI(permissionId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/tenant-role-permissions/${permissionId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || "Failed to delete permission override");
  }
}

/**
 * GET /tenant-menu-config?tenant_id={tenantId}
 * Fetch the menu visibility config for a tenant from the dedicated table.
 * Returns { "mobile-ayamku": false, "admin-dashboard": true, ... }
 */
export async function fetchTenantMenuConfigAPI(
  tenantId: number | string
): Promise<Record<string, boolean>> {
  try {
    const response = await dedupFetch(`${API_BASE_URL}/tenant-menu-config?tenant_id=${tenantId}`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      return {};
    }

    const json = await response.json();
    return json.data || {};
  } catch (error) {
    console.warn(`[Tenant API] Failed to fetch tenant-menu-config for tenant ${tenantId}`, error);
    return {};
  }
}

/**
 * PUT /tenant-menu-config
 * Batch upsert menu visibility for a tenant.
 * Payload: { tenant_id: 3, menus: { "mobile-ayamku": false, ... } }
 */
export async function upsertTenantMenuConfigAPI(payload: {
  tenant_id: number;
  menus: Record<string, boolean>;
}): Promise<Record<string, boolean>> {
  const response = await fetch(`${API_BASE_URL}/tenant-menu-config`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    const message = errorJson.message || `Backend API error (${response.status})`;
    throw new Error(message);
  }

  const json = await response.json();
  return json.data || {};
}
