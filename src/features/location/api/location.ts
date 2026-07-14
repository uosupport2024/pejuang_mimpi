import { API_BASE_URL, getHeaders } from "@/shared/utils/api";

export interface BackendLocation {
  id: number;
  nama_lokasi: string;
  lat_kantor: string;
  long_kantor: string;
  radius: number;
  keterangan: string | null;
  status: string | null;
}

export async function fetchLocations(): Promise<BackendLocation[]> {
  const response = await fetch(`${API_BASE_URL}/lokasis`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || "Failed to fetch locations");
  }

  const json = await response.json();
  return json.data;
}

export async function fetchLocationById(id: number): Promise<BackendLocation> {
  const response = await fetch(`${API_BASE_URL}/lokasi/${id}`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || "Failed to fetch location details");
  }

  const json = await response.json();
  return json.data;
}

export async function createLocation(data: {
  nama_lokasi: string;
  lat_kantor: string;
  long_kantor: string;
  radius: number;
  keterangan?: string | null;
}): Promise<BackendLocation> {
  const response = await fetch(`${API_BASE_URL}/lokasis`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || "Failed to create location");
  }

  const json = await response.json();
  return json.data;
}

export async function updateLocation(
  id: number,
  data: {
    nama_lokasi: string;
    lat_kantor: string;
    long_kantor: string;
    radius: number;
    keterangan?: string | null;
  }
): Promise<BackendLocation> {
  const response = await fetch(`${API_BASE_URL}/lokasis/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || "Failed to update location");
  }

  const json = await response.json();
  return json.data;
}

export async function deleteLocation(id: number): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/lokasis/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || "Failed to delete location");
  }

  return true;
}
