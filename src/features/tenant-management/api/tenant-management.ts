import { API_BASE_URL, getHeaders, dedupFetch } from "@/shared/utils/api";
import { getCookie } from "@/shared/utils/cookies";
import { serializeSubColor, type TenantSubColors } from "@/shared/constants/colors";

export interface TenantAdminItem {
  id: number | string;
  name: string;
  slug: string;
  is_active?: boolean | number;
  description?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  web?: string | null;
  logo?: string | null;
  logo_url?: string | null;
  main_color?: string | null;
  sub_color?: string | TenantSubColors | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTenantPayload {
  name: string;
  slug: string;
  is_active?: boolean;
  email?: string;
  phone?: string;
  address?: string;
  web?: string;
  description?: string;
  main_color?: string;
  sub_color?: string | TenantSubColors;
  logoFile?: File | null;
}

export interface CreateTenantResult {
  tenant: TenantAdminItem;
  admin_user?: {
    id: number | string;
    name: string;
    username: string;
    password?: string;
    email?: string;
    telepon?: string;
  };
  note?: string;
}

export interface UpdateTenantPayload extends Partial<CreateTenantPayload> {
  removeLogo?: boolean;
}

/**
 * GET /tenants/admin
 * Fetch full list of tenants for Super Admin
 */
export async function fetchTenantsAdminAPI(search?: string, perPage: number = 50): Promise<TenantAdminItem[]> {
  try {
    const query = new URLSearchParams();
    if (search) query.append("q", search);
    query.append("per_page", String(perPage));

    let response = await dedupFetch(`${API_BASE_URL}/tenants/admin?${query.toString()}`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      response = await dedupFetch(`${API_BASE_URL}/tenants?${query.toString()}`, {
        method: "GET",
        headers: getHeaders(),
      });
    }

    if (!response.ok) {
      return [];
    }

    const json = await response.json();
    const list = json.data?.data || json.data || [];
    return Array.isArray(list) ? list : [];
  } catch (err) {
    console.error("[Tenant Management API] Error fetching tenants:", err);
    return [];
  }
}

/**
 * POST /tenants
 * Super Admin creates a new tenant with auto-provisioned first admin user
 */
export async function createTenantAPI(payload: CreateTenantPayload): Promise<CreateTenantResult> {
  const token = getCookie("auth_token");

  if (payload.logoFile) {
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("slug", payload.slug);
    formData.append("is_active", payload.is_active !== false ? "1" : "0");
    if (payload.email) formData.append("email", payload.email);
    if (payload.phone) formData.append("phone", payload.phone);
    if (payload.address) formData.append("address", payload.address);
    if (payload.web) formData.append("web", payload.web);
    if (payload.description) formData.append("description", payload.description);
    if (payload.main_color) formData.append("main_color", payload.main_color);
    if (payload.sub_color) formData.append("sub_color", serializeSubColor(payload.sub_color));
    formData.append("logo", payload.logoFile);

    const response = await fetch(`${API_BASE_URL}/tenants`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const message = errJson.message || `Gagal membuat tenant (${response.status})`;
      throw new Error(message);
    }

    const json = await response.json();
    return json.data || json;
  }

  // JSON POST
  const { logoFile: _file, ...jsonData } = payload;
  const processedData = {
    ...jsonData,
    ...(payload.sub_color !== undefined
      ? {
          sub_color:
            typeof payload.sub_color === "string" && payload.sub_color.startsWith("{")
              ? JSON.parse(payload.sub_color)
              : typeof payload.sub_color === "string" && payload.sub_color.startsWith("#")
              ? { sub: payload.sub_color }
              : payload.sub_color,
        }
      : {}),
  };

  const response = await fetch(`${API_BASE_URL}/tenants`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(processedData),
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    const message = errJson.message || `Gagal membuat tenant (${response.status})`;
    throw new Error(message);
  }

  const json = await response.json();
  return json.data || json;
}

/**
 * PUT /tenants/{id}
 * Update existing tenant details
 */
export async function updateTenantAPI(
  tenantId: number | string,
  payload: UpdateTenantPayload
): Promise<TenantAdminItem> {
  const token = getCookie("auth_token");

  if (payload.logoFile || payload.removeLogo) {
    const formData = new FormData();
    formData.append("_method", "PUT");
    if (payload.name) formData.append("name", payload.name);
    if (payload.slug) formData.append("slug", payload.slug);
    if (payload.is_active !== undefined) formData.append("is_active", payload.is_active ? "1" : "0");
    if (payload.email !== undefined) formData.append("email", payload.email || "");
    if (payload.phone !== undefined) formData.append("phone", payload.phone || "");
    if (payload.address !== undefined) formData.append("address", payload.address || "");
    if (payload.web !== undefined) formData.append("web", payload.web || "");
    if (payload.description !== undefined) formData.append("description", payload.description || "");
    if (payload.main_color !== undefined) formData.append("main_color", payload.main_color || "");
    if (payload.sub_color !== undefined) formData.append("sub_color", payload.sub_color ? serializeSubColor(payload.sub_color) : "");

    if (payload.logoFile) {
      formData.append("logo", payload.logoFile);
    } else if (payload.removeLogo) {
      formData.append("remove_logo", "1");
      formData.append("delete_logo", "1");
      formData.append("logo", "");
    }

    const response = await fetch(`${API_BASE_URL}/tenants/${tenantId}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const message = errJson.message || `Gagal memperbarui tenant (${response.status})`;
      throw new Error(message);
    }

    const json = await response.json();
    return json.data || json;
  }

  const { logoFile: _file, removeLogo: _rem, ...jsonData } = payload;
  const processedData = {
    ...jsonData,
    ...(payload.sub_color !== undefined
      ? {
          sub_color:
            typeof payload.sub_color === "string" && payload.sub_color.startsWith("{")
              ? JSON.parse(payload.sub_color)
              : typeof payload.sub_color === "string" && payload.sub_color.startsWith("#")
              ? { sub: payload.sub_color }
              : payload.sub_color,
        }
      : {}),
  };

  const response = await fetch(`${API_BASE_URL}/tenants/${tenantId}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(processedData),
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    const message = errJson.message || `Gagal memperbarui tenant (${response.status})`;
    throw new Error(message);
  }

  const json = await response.json();
  return json.data || json;
}
