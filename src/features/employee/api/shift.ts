import { API_BASE_URL, getHeaders } from "@/shared/utils/api";

export async function fetchEmployeeMappingShiftsAPI(employeeId: number, startDate?: string, endDate?: string) {
  let url = `${API_BASE_URL}/pegawai/${employeeId}/mapping-shifts`;
  if (startDate && endDate) {
    url += `?start_date=${startDate}&end_date=${endDate}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Gagal mengambil data mapping shift pegawai");
  }

  const json = await response.json();
  return json.data || { employee: {}, mappings: [] };
}

export async function postMappingShiftAPI(payload: {
  user_id: number;
  shift_id: number;
  tanggal_mulai: string;
  tanggal_akhir: string;
  lock_location?: boolean;
}) {
  const response = await fetch(`${API_BASE_URL}/mapping-shifts`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || "Gagal menyimpan data mapping shift");
  }

  return await response.json();
}

export async function updateMappingShiftAPI(
  id: number,
  payload: {
    shift_id: number;
    lock_location?: boolean;
  }
) {
  const response = await fetch(`${API_BASE_URL}/mapping-shifts/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || "Gagal memperbarui data mapping shift");
  }

  return await response.json();
}

export async function deleteMappingShiftAPI(id: number) {
  const response = await fetch(`${API_BASE_URL}/mapping-shifts/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || "Gagal menghapus data mapping shift");
  }

  return await response.json();
}

export async function fetchShiftsAPI() {
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
