import { API_BASE_URL, getHeaders } from "@/shared/utils/api";
import { getCookie } from "@/shared/utils/cookies";

function getFormDataHeaders() {
  const token = getCookie("auth_token");
  return {
    "Accept": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  };
}

/**
 * Downloads employee import excel template with MD lokasi, MD jabatan, MD shift based on id_tenant
 * GET /v1/employees/import/template?id_tenant={id_tenant}
 */
export async function downloadEmployeeImportTemplate(tenantId: number | string): Promise<void> {
  const url = `${API_BASE_URL}/employees/import/template?id_tenant=${tenantId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || `Gagal mengunduh template import (Status: ${response.status})`);
  }

  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = `Template_Import_Pegawai_Tenant_${tenantId}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => {
    window.URL.revokeObjectURL(blobUrl);
  }, 1000);
}

export interface EmployeeImportUploadResponse {
  code?: number;
  status?: string | boolean;
  message?: string;
  batch_id?: string | number;
  id?: string | number;
  employees_created?: number;
  error_count?: number;
  errors?: any[];
  data?: {
    id?: string | number;
    batch_id?: string | number;
    total_rows?: number;
    success_count?: number;
    failed_count?: number;
    employees_created?: number;
    error_count?: number;
    errors?: any[];
    issues?: any[];
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * Upload employee import file
 * POST /v1/employees/import
 */
export async function uploadEmployeeImport(
  file: File,
  tenantId: number | string
): Promise<EmployeeImportUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("tenant_id", String(tenantId));
  formData.append("id_tenant", String(tenantId));

  const response = await fetch(`${API_BASE_URL}/employees/import`, {
    method: "POST",
    headers: getFormDataHeaders(),
    body: formData,
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(json.message || `Gagal mengunggah file import pegawai (Status: ${response.status})`);
  }

  return json;
}

/**
 * Fetch batch import issue / review result as JSON
 * GET /v1/employees/import/{batch_id}
 */
export async function fetchEmployeeImportBatchReview(batchId: string | number): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/employees/import/${batchId}`, {
    method: "GET",
    headers: getHeaders(),
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(json.message || `Gagal memuat review batch import (Status: ${response.status})`);
  }

  return json.data || json;
}

/**
 * Download review excel file with annotated issues or generated user credentials (sheet 3)
 * GET /v1/employees/import/{batch_id}/download
 */
export async function downloadEmployeeImportBatchReview(batchId: string | number): Promise<void> {
  const url = `${API_BASE_URL}/employees/import/${batchId}/download`;

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || `Gagal mengunduh file hasil import (Status: ${response.status})`);
  }

  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = `Hasil_Import_Pegawai_Batch_${batchId}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => {
    window.URL.revokeObjectURL(blobUrl);
  }, 1000);
}
