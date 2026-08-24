import { API_BASE_URL, getHeaders, dedupFetch } from "@/shared/utils/api";
import { getCookie } from "@/shared/utils/cookies";

export interface TenantIconItem {
  id: number | string;
  tenant_id: number | string;
  icon: string;
  icon_url: string;
  created_at?: string;
  updated_at?: string;
  tenant?: {
    id: number | string;
    name: string;
    slug: string;
  };
}

export async function fetchTenantIconsAPI(tenantId?: string | number): Promise<TenantIconItem[]> {
  try {
    const url = new URL(`${API_BASE_URL}/tenant-icons`);
    if (tenantId && tenantId !== "all") {
      url.searchParams.append("tenant_id", String(tenantId));
    }

    const response = await dedupFetch(url.toString(), {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tenant icons: ${response.status}`);
    }

    const resJson = await response.json();
    return resJson.data || resJson || [];
  } catch (err: any) {
    console.error("fetchTenantIconsAPI error:", err);
    return [];
  }
}

export async function createTenantIconAPI(file: File, tenantId?: string | number): Promise<TenantIconItem> {
  const token = getCookie("token") || getCookie("auth_token");
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const formData = new FormData();
  formData.append("icon", file);
  if (tenantId && tenantId !== "all") {
    formData.append("tenant_id", String(tenantId));
  }

  const response = await fetch(`${API_BASE_URL}/tenant-icons`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || `Gagal mengupload icon tenant (${response.status})`);
  }

  const resJson = await response.json();
  return resJson.data || resJson;
}

export async function deleteTenantIconAPI(id: number | string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/tenant-icons/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || `Gagal menghapus icon tenant (${response.status})`);
  }
}

export async function syncDefaultIconsAPI(tenantId?: string | number): Promise<{ inserted: number; skipped: number; message?: string }> {
  const token = getCookie("token") || getCookie("auth_token");
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/tenant-icons/seed-all`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      tenant_id: tenantId && tenantId !== "all" ? tenantId : null,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || `Gagal sinkronisasi icon (${response.status})`);
  }

  const resJson = await response.json();
  return {
    inserted: resJson.data?.inserted || 0,
    skipped: resJson.data?.skipped || 0,
    message: resJson.message,
  };
}
