import { API_BASE_URL, getHeaders } from "@/shared/utils/api";

export interface AnnouncementItem {
  id: number;
  tenant_id: number;
  created_by: number;
  title: string;
  message: string;
  target_role: string;
  total_recipients: number;
  metadata?: {
    creator_name?: string;
    creator_email?: string;
  };
  creator?: {
    id: number;
    name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
}

export interface AnnouncementsResponse {
  data: AnnouncementItem[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

export async function fetchAnnouncementsAPI(page = 1, perPage = 15): Promise<AnnouncementsResponse> {
  const response = await fetch(`${API_BASE_URL}/announcements?page=${page}&per_page=${perPage}`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || `Gagal memuat pengumuman (Status: ${response.status})`);
  }

  const json = await response.json();
  // Backend BaseApiController returns { code, message, data: { current_page, data: [...], total } }
  const payload = json.data;
  return {
    data: payload.data || [],
    current_page: payload.current_page || 1,
    last_page: payload.last_page || 1,
    total: payload.total || 0,
    per_page: payload.per_page || perPage,
  };
}

export async function sendAnnouncementAPI(data: {
  title: string;
  message: string;
  target_role?: string;
}): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/announcements`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || `Gagal mengirim pengumuman (Status: ${response.status})`);
  }

  return await response.json();
}
