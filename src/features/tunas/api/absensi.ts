import { API_BASE_URL, getHeaders } from "@/shared/utils/api";

export async function fetchProfileAPI() {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    method: "GET",
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch profile");
  }
  
  const json = await response.json();
  return json.data || json;
}

export async function fetchLokasiAPI(id: number | string) {
  const response = await fetch(`${API_BASE_URL}/lokasi/${id}`, {
    method: "GET",
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch location details");
  }
  
  const json = await response.json();
  return json.data || json;
}

export async function fetchJadwalHariIniAPI(dateString: string) {
  const response = await fetch(`${API_BASE_URL}/jadwal?start_date=${dateString}&end_date=${dateString}`, {
    method: "GET",
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch today's schedule");
  }
  
  const json = await response.json();
  return json.data?.data || json.data || [];
}

export async function postAbsenMasukAPI(payload: FormData) {
  const headers = getHeaders();
  const multipartHeaders: Record<string, string> = {};
  if (headers["Authorization"]) {
    multipartHeaders["Authorization"] = headers["Authorization"];
  }
  multipartHeaders["Accept"] = "application/json";

  const response = await fetch(`${API_BASE_URL}/attendance/absenMasuk`, {
    method: "POST",
    headers: multipartHeaders,
    body: payload,
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || "Gagal melakukan Absen Masuk");
  }
  return await response.json();
}

export async function postAbsenPulangAPI(payload: FormData) {
  const headers = getHeaders();
  const multipartHeaders: Record<string, string> = {};
  if (headers["Authorization"]) {
    multipartHeaders["Authorization"] = headers["Authorization"];
  }
  multipartHeaders["Accept"] = "application/json";

  const response = await fetch(`${API_BASE_URL}/attendance/absenPulang`, {
    method: "POST",
    headers: multipartHeaders,
    body: payload,
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || "Gagal melakukan Absen Pulang");
  }
  return await response.json();
}

export async function fetchJadwalHistoryAPI(page = 1, perPage = 10, startDate?: string, endDate?: string, shiftId?: number | null) {
  let url = `${API_BASE_URL}/jadwal?page=${page}&per_page=${perPage}`;
  if (startDate && endDate) {
    url += `&start_date=${startDate}&end_date=${endDate}`;
  }
  if (shiftId) {
    url += `&shift_id=${shiftId}`;
  }
  
  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch schedule history");
  }
  
  const json = await response.json();
  return json.data?.data || json.data || [];
}

export async function fetchShiftsAPI() {
  const response = await fetch(`${API_BASE_URL}/shifts`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch shifts");
  }

  const json = await response.json();
  return json.data || [];
}
