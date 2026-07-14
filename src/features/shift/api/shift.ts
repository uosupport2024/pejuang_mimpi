import { API_BASE_URL, getHeaders } from "@/shared/utils/api";

export interface BackendShift {
  id: number;
  nama_shift: string;
  jam_masuk: string;
  jam_keluar: string;
  created_at?: string;
  updated_at?: string;
}

export async function fetchShifts(
  search?: string,
  signal?: AbortSignal
): Promise<BackendShift[]> {
  const query = new URLSearchParams();
  if (search) query.append("search", search);

  const response = await fetch(`${API_BASE_URL}/shifts?${query.toString()}`, {
    method: "GET",
    headers: getHeaders(),
    signal,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch shifts");
  }

  const json = await response.json();
  return json.data;
}

export async function createShift(data: Omit<BackendShift, "id">): Promise<BackendShift> {
  const response = await fetch(`${API_BASE_URL}/shifts`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || "Failed to create shift");
  }

  const json = await response.json();
  return json.data;
}

export async function updateShift(id: number, data: Partial<Omit<BackendShift, "id">>): Promise<BackendShift> {
  const response = await fetch(`${API_BASE_URL}/shifts/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || "Failed to update shift");
  }

  const json = await response.json();
  return json.data;
}

export async function deleteShift(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/shifts/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || "Failed to delete shift");
  }
}
