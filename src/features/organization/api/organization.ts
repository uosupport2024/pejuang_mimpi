import { API_BASE_URL, getHeaders } from "@/shared/utils/api";

export interface BackendGolongan {
  id: number;
  jabatan_id: number;
  name: string;
}

export interface BackendJabatan {
  id: number;
  nama_jabatan: string;
  manager: number | null;
  golongans?: BackendGolongan[];
}

export async function fetchJabatans(query?: string): Promise<BackendJabatan[]> {
  const url = query 
    ? `${API_BASE_URL}/jabatans?q=${encodeURIComponent(query)}`
    : `${API_BASE_URL}/jabatans`;
    
  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || "Failed to fetch divisions");
  }

  const json = await response.json();
  return json.data;
}

export async function createJabatan(data: { nama_jabatan: string; manager?: number | null }): Promise<BackendJabatan> {
  const response = await fetch(`${API_BASE_URL}/jabatans`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || "Failed to create division");
  }

  const json = await response.json();
  return json.data;
}

export async function updateJabatan(
  id: number,
  data: { nama_jabatan: string; manager?: number | null }
): Promise<BackendJabatan> {
  const response = await fetch(`${API_BASE_URL}/jabatans/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || "Failed to update division");
  }

  const json = await response.json();
  return json.data;
}

export async function deleteJabatan(id: number): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/jabatans/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || "Failed to delete division");
  }

  return true;
}

export async function fetchGolongans(jabatanId: number, query?: string): Promise<BackendGolongan[]> {
  const url = query
    ? `${API_BASE_URL}/jabatans/${jabatanId}/golongans?q=${encodeURIComponent(query)}`
    : `${API_BASE_URL}/jabatans/${jabatanId}/golongans`;

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || "Failed to fetch positions");
  }

  const json = await response.json();
  return json.data;
}

export async function createGolongan(jabatanId: number, name: string): Promise<BackendGolongan> {
  const response = await fetch(`${API_BASE_URL}/jabatans/${jabatanId}/golongans`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || "Failed to create position");
  }

  const json = await response.json();
  return json.data;
}

export async function updateGolongan(id: number, name: string): Promise<BackendGolongan> {
  const response = await fetch(`${API_BASE_URL}/golongans/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || "Failed to update position");
  }

  const json = await response.json();
  return json.data;
}

export async function deleteGolongan(id: number): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/golongans/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || "Failed to delete position");
  }

  return true;
}
