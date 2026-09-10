import { API_BASE_URL } from "@/shared/utils/api";
import { getCookie } from "@/shared/utils/cookies";

export interface UserDocument {
  id: number;
  tenant_id: number;
  user_id: number;
  uploaded_by_user_id: number;
  document_type: string;
  title: string | null;
  file_path: string;
  original_filename: string | null;
  file_size: number | null;
  created_at: string;
  updated_at: string;
  // Only eager-loaded on POST /user-documents and GET /user-documents/tenant
  // — the self-scoped GET /user-documents doesn't include these at all.
  user?: { id: number; name: string } | null;
  uploader?: { id: number; name: string; roles?: { id: number; name: string }[] } | null;
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  last_page: number;
  per_page: number;
  total: number;
}

async function parseError(response: Response, fallback: string): Promise<Error> {
  const json = await response.json().catch(() => ({} as any));
  if (json?.data && typeof json.data === "object") {
    const firstField = Object.values(json.data)[0];
    if (Array.isArray(firstField) && firstField.length > 0) {
      return new Error(String(firstField[0]));
    }
  }
  return new Error(json?.message || fallback);
}

function authHeaders() {
  const token = getCookie("auth_token");
  return {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchTenantDocuments(params?: {
  user_id?: number;
  document_type?: string;
}): Promise<UserDocument[]> {
  const query = new URLSearchParams();
  query.append("per_page", "100");
  if (params?.user_id) query.append("user_id", String(params.user_id));
  if (params?.document_type) query.append("document_type", params.document_type);

  const response = await fetch(`${API_BASE_URL}/user-documents/tenant?${query.toString()}`, {
    method: "GET",
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw await parseError(response, "Gagal memuat daftar dokumen");
  }

  const json = await response.json();
  const paginated: PaginatedResponse<UserDocument> = json.data;
  return paginated?.data || [];
}

export async function fetchMyDocuments(params?: { document_type?: string }): Promise<UserDocument[]> {
  const query = new URLSearchParams();
  query.append("per_page", "100");
  if (params?.document_type) query.append("document_type", params.document_type);

  const response = await fetch(`${API_BASE_URL}/user-documents?${query.toString()}`, {
    method: "GET",
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw await parseError(response, "Gagal memuat dokumen saya");
  }

  const json = await response.json();
  const paginated: PaginatedResponse<UserDocument> = json.data;
  return paginated?.data || [];
}

export interface UploadDocumentPayload {
  document_type: string;
  title?: string;
  user_id?: number;
  file: File;
}

export async function uploadDocument(payload: UploadDocumentPayload): Promise<UserDocument> {
  const formData = new FormData();
  formData.append("document_type", payload.document_type);
  if (payload.title) formData.append("title", payload.title);
  if (payload.user_id) formData.append("user_id", String(payload.user_id));
  formData.append("file", payload.file);

  const response = await fetch(`${API_BASE_URL}/user-documents`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

  if (!response.ok) {
    throw await parseError(response, "Gagal mengunggah dokumen");
  }

  const json = await response.json();
  return json.data;
}

export async function deleteDocument(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/user-documents/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw await parseError(response, "Gagal menghapus dokumen");
  }
}

export async function downloadDocumentBlob(id: number): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/user-documents/${id}/download`, {
    method: "GET",
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw await parseError(response, "Gagal mengunduh dokumen");
  }

  return response.blob();
}
