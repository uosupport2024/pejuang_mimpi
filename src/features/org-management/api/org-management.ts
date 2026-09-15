import { API_BASE_URL, getHeaders } from "@/shared/utils/api";

export interface HierarchyNode {
  contract_id: number;
  user_id: number;
  name: string | null;
  username: string | null;
  jabatan: { id: number; nama_jabatan: string } | null;
  lokasi: { id: number; nama_lokasi: string } | null;
  golongan: { id: number; name: string } | null;
  manager_contract_id: number | null;
  direct_report_count: number;
  contract_start_date: string | null;
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

export async function fetchHierarchy(): Promise<HierarchyNode[]> {
  const response = await fetch(`${API_BASE_URL}/user-contracts/hierarchy`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw await parseError(response, "Gagal memuat struktur organisasi");
  }

  const json = await response.json();
  return json.data || [];
}

export async function reassignManager(
  contractId: number,
  managerContractId: number | null
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/user-contracts/${contractId}`, {
    method: "PUT",
    headers: { ...getHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ manager_contract_id: managerContractId }),
  });

  if (!response.ok) {
    throw await parseError(response, "Gagal mengubah atasan");
  }
}
