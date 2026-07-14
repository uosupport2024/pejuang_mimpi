import { API_BASE_URL, getHeaders } from "@/shared/utils/api";

export async function fetchAdminDashboardAPI(date?: string, lokasiId?: number) {
  let url = `${API_BASE_URL}/admin/dashboard`;
  const params: string[] = [];
  if (date) {
    params.push(`date=${encodeURIComponent(date)}`);
  }
  if (lokasiId) {
    params.push(`lokasi_id=${lokasiId}`);
  }
  if (params.length > 0) {
    url += `?${params.join("&")}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Gagal mengambil data dashboard");
  }

  const json = await response.json();
  return json.data;
}
