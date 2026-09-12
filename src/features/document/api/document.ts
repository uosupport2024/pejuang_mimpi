import { API_BASE_URL } from "@/shared/utils/api";
import { getCookie } from "@/shared/utils/cookies";

export interface UserDocument {
  id: number;
  tenant_id: number;
  user_id: number;
  // null for a payslip_archive row — system-generated, no human uploader.
  // Never null for a real user_document row.
  uploaded_by_user_id: number | null;
  document_type: string;
  title: string | null;
  file_path: string;
  original_filename: string | null;
  file_size: number | null;
  created_at: string;
  updated_at: string;
  user?: { id: number; name: string } | null;
  // Always null for a payslip_archive row.
  uploader?: { id: number; name: string; roles?: { id: number; name: string }[] } | null;
  // Present when fetched via GET /documents(/tenant) — absent when fetched
  // via GET /user-documents(/tenant) directly.
  source?: "payslip_archive" | "user_document";
  download_url?: string;
}

export function isPayslip(doc: UserDocument): boolean {
  return doc.source === "payslip_archive";
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

// GET /documents(/tenant) — merged listing (payslips + user_documents),
// field-compatible with the old /user-documents(/tenant) response, plus
// source/download_url. Replaces direct calls to /user-documents(/tenant)
// for listing — /user-documents itself is still used for upload/delete/
// download of a single user_document, since the merged endpoints are
// read-only.
export async function fetchTenantDocuments(params?: {
  user_id?: number;
  document_type?: string;
}): Promise<UserDocument[]> {
  const query = new URLSearchParams();
  query.append("per_page", "100");
  if (params?.user_id) query.append("user_id", String(params.user_id));
  if (params?.document_type) query.append("document_type", params.document_type);

  const response = await fetch(`${API_BASE_URL}/documents/tenant?${query.toString()}`, {
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

  const response = await fetch(`${API_BASE_URL}/documents?${query.toString()}`, {
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

// Takes the full document, not just an id — a payslip's id is a
// payslip_archives id, not a user_documents id, so the endpoint can't be
// derived from the id alone. There's no delete for a payslip_archive row
// here at all — payslip deletion is a separate, more restricted admin
// action (DELETE /payslip-archives/{id}, "correcting a bad generation"),
// not something this generic document-delete flow should ever trigger.
export async function deleteDocument(doc: UserDocument): Promise<void> {
  if (isPayslip(doc)) {
    throw new Error("Slip gaji tidak dapat dihapus dari sini.");
  }

  const response = await fetch(`${API_BASE_URL}/user-documents/${doc.id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw await parseError(response, "Gagal menghapus dokumen");
  }
}

// Uses the row's own download_url when present (set by GET /documents(/
// tenant) — correctly points at /payslip-archives/{id}/download for a
// payslip row, /user-documents/{id}/download otherwise) rather than always
// assuming /user-documents/{id}/download, which would silently hit the
// wrong table — or a coincidentally-matching but unrelated row — for a
// payslip's id.
export async function downloadDocumentBlob(doc: UserDocument): Promise<Blob> {
  const url = doc.download_url || `${API_BASE_URL}/user-documents/${doc.id}/download`;

  const response = await fetch(url, {
    method: "GET",
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw await parseError(response, "Gagal mengunduh dokumen");
  }

  return response.blob();
}
