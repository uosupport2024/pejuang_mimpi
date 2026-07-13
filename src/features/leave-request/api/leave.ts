import { API_BASE_URL, getHeaders } from "@/shared/utils/api";

export async function fetchCutiHistoryAPI(startDate?: string, endDate?: string, page = 1, perPage = 10) {
  let url = `${API_BASE_URL}/cuti?page=${page}&per_page=${perPage}`;
  if (startDate && endDate) {
    url += `&start_date=${startDate}&end_date=${endDate}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch leave history");
  }

  const json = await response.json();
  return json.data || [];
}

export async function postCutiRequestAPI(payload: FormData) {
  const headers = getHeaders();
  const multipartHeaders: Record<string, string> = {};
  if (headers["Authorization"]) {
    multipartHeaders["Authorization"] = headers["Authorization"];
  }
  multipartHeaders["Accept"] = "application/json";

  const response = await fetch(`${API_BASE_URL}/cuti`, {
    method: "POST",
    headers: multipartHeaders,
    body: payload,
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || "Gagal mengajukan permohonan cuti");
  }
  return await response.json();
}
