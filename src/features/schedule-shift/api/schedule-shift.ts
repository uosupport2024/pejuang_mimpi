import { API_BASE_URL, getHeaders } from "@/shared/utils/api";

export interface ShiftOption {
  id: number;
  nama_shift: string;
  jam_masuk: string;
  jam_keluar: string;
}

export interface ScheduleEmployee {
  id: number;
  name: string;
  username: string;
  email: string;
  telepon: string | null;
  lokasi: { id: number; nama_lokasi: string } | null;
}

export interface FetchScheduleEmployeesResponse {
  current_page: number;
  data: ScheduleEmployee[];
  last_page: number;
  per_page: number;
  total: number;
}

export interface ScheduleUserShift {
  mapping_shift_id: number;
  shift_id: number;
  shift_name: string | null;
  date: string;
  start: string | null;
  end: string | null;
}

export interface ScheduleUserEntry {
  id: number;
  name: string;
  location_name: string | null;
  shifts: ScheduleUserShift[];
}

export async function fetchShiftOptions(): Promise<ShiftOption[]> {
  const response = await fetch(`${API_BASE_URL}/shifts`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Gagal mengambil daftar shift");
  }

  const json = await response.json();
  return json.data || [];
}

export async function createShiftOption(data: {
  nama_shift: string;
  jam_masuk: string;
  jam_keluar: string;
}): Promise<ShiftOption> {
  const response = await fetch(`${API_BASE_URL}/shifts`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(json.message || "Gagal menambahkan shift baru");
  }

  return json.data;
}

export async function fetchScheduleEmployees(params: {
  q?: string;
  page?: number;
  per_page?: number;
  lokasi_id?: number | string;
}): Promise<FetchScheduleEmployeesResponse> {
  const query = new URLSearchParams();
  if (params.q) query.append("q", params.q);
  query.append("page", String(params.page || 1));
  query.append("per_page", String(params.per_page || 10));
  if (params.lokasi_id) query.append("lokasi_id", String(params.lokasi_id));

  const response = await fetch(`${API_BASE_URL}/employees?${query.toString()}`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Gagal mengambil daftar pegawai");
  }

  const json = await response.json();
  return json.data;
}

export interface FetchMappingShiftsResponse {
  current_page: number;
  data: ScheduleUserEntry[];
  last_page: number;
  per_page: number;
  total: number;
}

/**
 * Tenant-wide "who's working what, when" view for the given date range —
 * paginated by employee (the whole matching roster, not just those with a
 * mapped shift in range).
 */
export async function fetchMappingShifts(params: {
  start_date: string;
  end_date: string;
  lokasi_id?: number | string;
  per_page?: number;
  page?: number;
}): Promise<FetchMappingShiftsResponse> {
  const query = new URLSearchParams();
  query.append("start_date", params.start_date);
  query.append("end_date", params.end_date);
  if (params.lokasi_id) query.append("lokasi_id", String(params.lokasi_id));
  query.append("per_page", String(params.per_page || 10));
  query.append("page", String(params.page || 1));

  const response = await fetch(`${API_BASE_URL}/mapping-shifts?${query.toString()}`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Gagal mengambil jadwal shift");
  }

  const json = await response.json();
  return json.data;
}

export async function bulkAssignShift(payload: {
  user_ids: number[];
  shift_id: number;
  start_date: string;
  end_date: string;
}): Promise<{ summary: { users_affected: number; dates_affected: number; total_mappings: number } }> {
  const response = await fetch(`${API_BASE_URL}/mapping-shifts/bulk`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    const invalidIds = json?.data?.invalid_user_ids;
    const message = invalidIds
      ? `Beberapa pegawai tidak valid: ${invalidIds.join(", ")}`
      : json.message || "Gagal menugaskan shift secara massal";
    throw new Error(message);
  }

  return json.data;
}

export async function updateMappingShift(
  id: number,
  payload: { shift_id: number }
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/mapping-shifts/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || "Gagal memperbarui jadwal shift");
  }
}

export async function deleteMappingShift(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/mapping-shifts/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || "Gagal menghapus jadwal shift");
  }
}
