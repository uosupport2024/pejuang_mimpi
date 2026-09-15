import { API_BASE_URL, getHeaders } from "@/shared/utils/api";

export type AllocationCategory =
  | "official_investment"
  | "official_charity"
  | "regular_investment"
  | "regular_charity";

export type DeductionMethod = "fixed_amount" | "percentage";

export interface PayrollAllocation {
  id: number;
  contract_id: number;
  category: AllocationCategory;
  deduction_method: DeductionMethod;
  value: string | number;
  destination_reference: string;
  effective_start_date: string;
  effective_end_date: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  last_page: number;
  per_page: number;
  total: number;
}

export interface UserContract {
  id: number;
  user_id: number;
  tenant_id: number;
  contract_start_date: string;
  contract_end_date: string | null;
  is_active: boolean;
  golongan_id?: number | null;
  manager_contract_id?: number | null;
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

// ── User Contracts (only what's needed to resolve/bootstrap a contract_id) ──

export async function fetchActiveContract(userId: number): Promise<UserContract | null> {
  const response = await fetch(`${API_BASE_URL}/user-contracts/active?user_id=${userId}&per_page=1`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw await parseError(response, "Gagal memuat data kontrak pegawai");
  }

  const json = await response.json();
  const rows: UserContract[] = json.data?.data || [];
  return rows[0] || null;
}

export async function createContract(payload: {
  user_id: number;
  tenant_id: number;
  contract_start_date: string;
}): Promise<UserContract> {
  const response = await fetch(`${API_BASE_URL}/user-contracts`, {
    method: "POST",
    headers: { ...getHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseError(response, "Gagal membuat kontrak pegawai");
  }

  const json = await response.json();
  return json.data;
}

export async function updateContractAssignment(
  contractId: number,
  payload: { golongan_id?: number | null; manager_contract_id?: number | null; jabatan_id?: number }
): Promise<UserContract> {
  const response = await fetch(`${API_BASE_URL}/user-contracts/${contractId}`, {
    method: "PUT",
    headers: { ...getHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseError(response, "Gagal memperbarui golongan/atasan pegawai");
  }

  const json = await response.json();
  return json.data;
}

// ── Payroll Allocations ──

export async function fetchPayrollAllocations(contractId: number): Promise<PayrollAllocation[]> {
  const response = await fetch(`${API_BASE_URL}/payroll-allocations?contract_id=${contractId}&per_page=50`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw await parseError(response, "Gagal memuat data alokasi & pemotongan");
  }

  const json = await response.json();
  const paginated: PaginatedResponse<PayrollAllocation> = json.data;
  return paginated?.data || [];
}

export interface PayrollAllocationPayload {
  contract_id: number;
  category: AllocationCategory;
  deduction_method: DeductionMethod;
  value: number;
  destination_reference: string;
  effective_start_date: string;
  effective_end_date?: string | null;
  is_active?: boolean;
}

export async function createPayrollAllocation(payload: PayrollAllocationPayload): Promise<PayrollAllocation> {
  const response = await fetch(`${API_BASE_URL}/payroll-allocations`, {
    method: "POST",
    headers: { ...getHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseError(response, "Gagal menambahkan alokasi");
  }

  const json = await response.json();
  return json.data;
}

export async function updatePayrollAllocation(
  id: number,
  payload: Partial<Omit<PayrollAllocationPayload, "contract_id">>
): Promise<PayrollAllocation> {
  const response = await fetch(`${API_BASE_URL}/payroll-allocations/${id}`, {
    method: "PUT",
    headers: { ...getHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseError(response, "Gagal memperbarui alokasi");
  }

  const json = await response.json();
  return json.data;
}

export async function deactivatePayrollAllocation(id: number): Promise<PayrollAllocation> {
  const response = await fetch(`${API_BASE_URL}/payroll-allocations/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw await parseError(response, "Gagal menonaktifkan alokasi");
  }

  const json = await response.json();
  return json.data;
}

export async function reactivatePayrollAllocation(id: number): Promise<PayrollAllocation> {
  return updatePayrollAllocation(id, { is_active: true } as any);
}
