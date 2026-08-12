import { API_BASE_URL, getHeaders } from "@/shared/utils/api";

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
