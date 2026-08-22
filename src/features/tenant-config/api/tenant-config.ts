import { API_BASE_URL, getHeaders, dedupFetch } from "@/shared/utils/api";
import { getCookie } from "@/shared/utils/cookies";

export interface TenantConfigData {
  id: number | string;
  name: string;
  slug: string;
  is_active?: boolean;
  description?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  web?: string | null;
  logo?: string | null;
  logo_url?: string | null;
  main_color?: string | null;
  sub_color?: string | null;
}

/**
 * GET /tenants/current
 * Fetch the currently active tenant details for the logged in user
 */
export async function fetchCurrentTenantAPI(): Promise<TenantConfigData | null> {
  try {
    const response = await dedupFetch(`${API_BASE_URL}/tenants/current`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      // Fallback to /tenants/admin if current is not available or user is superadmin
      return fetchFallbackAdminTenant();
    }

    const json = await response.json();
    return json.data || null;
  } catch (error) {
    console.warn("[Tenant Config API] Failed to fetch current tenant", error);
    return fetchFallbackAdminTenant();
  }
}

/**
 * Fallback to /tenants/admin
 */
async function fetchFallbackAdminTenant(): Promise<TenantConfigData | null> {
  try {
    const response = await dedupFetch(`${API_BASE_URL}/tenants/admin`, {
      method: "GET",
      headers: getHeaders(),
    });
    if (!response.ok) return null;
    const json = await response.json();
    const list = json.data?.data || json.data || [];
    return list[0] || null;
  } catch {
    return null;
  }
}

/**
 * GET /tenants/admin
 * Fetch list of all tenants (for admin/superadmin)
 */
export async function fetchAllTenantsAPI(): Promise<TenantConfigData[]> {
  try {
    const response = await dedupFetch(`${API_BASE_URL}/tenants/admin?per_page=50`, {
      method: "GET",
      headers: getHeaders(),
    });
    if (!response.ok) return [];
    const json = await response.json();
    return json.data?.data || json.data || [];
  } catch {
    return [];
  }
}

export interface UpdateTenantPayload extends Partial<TenantConfigData> {
  logoFile?: File | null;
  removeLogo?: boolean;
}

/**
 * PUT /tenants/{id}
 * Update tenant details including brand colors (main_color, sub_color), logo, name, etc.
 */
export async function updateTenantAPI(
  tenantId: number | string,
  payload: UpdateTenantPayload
): Promise<TenantConfigData> {
  const token = getCookie("auth_token");

  // If there's a logo file or logo deletion, use FormData with _method=PUT
  if (payload.logoFile || payload.removeLogo) {
    const formData = new FormData();
    formData.append("_method", "PUT");
    if (payload.name) formData.append("name", payload.name);
    if (payload.slug) formData.append("slug", payload.slug);
    if (payload.main_color !== undefined) formData.append("main_color", payload.main_color || "");
    if (payload.sub_color !== undefined) formData.append("sub_color", payload.sub_color || "");
    if (payload.email !== undefined) formData.append("email", payload.email || "");
    if (payload.phone !== undefined) formData.append("phone", payload.phone || "");
    if (payload.address !== undefined) formData.append("address", payload.address || "");
    if (payload.web !== undefined) formData.append("web", payload.web || "");
    if (payload.description !== undefined) formData.append("description", payload.description || "");

    if (payload.logoFile) {
      formData.append("logo", payload.logoFile);
    } else if (payload.removeLogo) {
      formData.append("remove_logo", "1");
      formData.append("delete_logo", "1");
      formData.append("logo", "");
    }

    const response = await fetch(`${API_BASE_URL}/tenants/${tenantId}`, {
      method: "POST", // POST with _method=PUT for multipart support
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      const message = errorJson.message || `Gagal menyimpan konfigurasi (${response.status})`;
      throw new Error(message);
    }

    const json = await response.json();
    return json.data || json;
  }

  // Otherwise standard JSON PUT
  const { logoFile, removeLogo, ...jsonData } = payload;
  const response = await fetch(`${API_BASE_URL}/tenants/${tenantId}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(jsonData),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    const message = errorJson.message || `Gagal menyimpan konfigurasi (${response.status})`;
    throw new Error(message);
  }

  const json = await response.json();
  return json.data || json;
}
