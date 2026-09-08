import { API_BASE_URL, getHeaders } from "@/shared/utils/api";

export interface NotificationItem {
  id: string;
  tenant_id: number;
  type: string;
  notifiable_type: string;
  notifiable_id: number;
  data: {
    title?: string;
    message?: string;
    route?: string;
    type?: string;
    sender?: string;
    [key: string]: any;
  };
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationsListResponse {
  notifications: {
    data: NotificationItem[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
  unread_count: number;
}

export async function fetchNotificationsAPI(page = 1): Promise<NotificationsListResponse> {
  const response = await fetch(`${API_BASE_URL}/notifications?page=${page}`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || `Gagal memuat notifikasi (Status: ${response.status})`);
  }

  const json = await response.json();
  const payload = json.data;
  return {
    notifications: {
      data: payload.notifications?.data || [],
      current_page: payload.notifications?.current_page || 1,
      last_page: payload.notifications?.last_page || 1,
      total: payload.notifications?.total || 0,
      per_page: payload.notifications?.per_page || 20,
    },
    unread_count: payload.unread_count ?? 0,
  };
}

export async function markNotificationReadAPI(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
    method: "POST",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || "Gagal menandai notifikasi sudah dibaca");
  }
}

export async function markAllNotificationsReadAPI(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
    method: "POST",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || "Gagal menandai semua notifikasi");
  }
}
