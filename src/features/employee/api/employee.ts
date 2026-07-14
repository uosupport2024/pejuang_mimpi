import { API_BASE_URL, getHeaders } from "@/shared/utils/api";

export interface BackendEmployee {
  id: number;
  name: string;
  username: string;
  email: string;
  telepon: string | null;
  gender: "Laki-Laki" | "Perempuan" | null;
  lokasi_id: number | null;
  jabatan_id: number | null;
  is_admin: string;
  lokasi: {
    id: number;
    nama_lokasi: string;
  } | null;
  jabatan: {
    id: number;
    nama_jabatan: string;
  } | null;
  roles: {
    id: number;
    name: string;
  }[];
  foto_karyawan?: string | null;
  tenant_id?: number | null;
  tgl_lahir?: string | null;
  tgl_join?: string | null;
  masa_berlaku?: string | null;
  status_nikah?: string | null;
  status_pajak?: string | null;
  ktp?: string | null;
  kartu_keluarga?: string | null;
  bpjs_kesehatan?: string | null;
  bpjs_ketenagakerjaan?: string | null;
  npwp?: string | null;
  sim?: string | null;
  pkwt?: string | null;
  kontrak?: string | null;
  tgl_mulai_pkwt?: string | null;
  tgl_berakhir_pkwt?: string | null;
  rekening?: string | null;
  bank?: string | null;
  nama_rekening?: string | null;
  izin_cuti?: number | null;
  izin_lainnya?: number | null;
  izin_telat?: number | null;
  izin_pulang_cepat?: number | null;
  gaji_harian?: number | null;
  gaji_pokok?: number | null;
  makan_transport?: number | null;
  lembur?: number | null;
  kehadiran_full?: number | null;
  thr?: number | null;
  bonus_pribadi?: number | null;
  bonus_team?: number | null;
  bonus_jackpot?: number | null;
  potong_izin?: number | null;
  potong_terlambat?: number | null;
  potong_mangkir?: number | null;
  saldo_kasbon?: number | null;
  tunjangan_bpjs_kesehatan?: number | null;
  tunjangan_bpjs_ketenagakerjaan?: number | null;
  potongan_bpjs_kesehatan?: number | null;
  potongan_bpjs_ketenagakerjaan?: number | null;
  tunjangan_pajak?: number | null;
}

export interface FetchEmployeesResponse {
  current_page: number;
  data: BackendEmployee[];
  last_page: number;
  per_page: number;
  total: number;
}

export async function fetchEmployees(
  params?: {
    q?: string;
    page?: number;
    per_page?: number;
  },
  signal?: AbortSignal
): Promise<FetchEmployeesResponse> {
  const query = new URLSearchParams();
  if (params?.q) query.append("q", params.q);
  if (params?.page) query.append("page", String(params.page));
  if (params?.per_page) query.append("per_page", String(params.per_page));

  const response = await fetch(`${API_BASE_URL}/employees?${query.toString()}`, {
    method: "GET",
    headers: getHeaders(),
    signal,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch employees");
  }

  const json = await response.json();
  return json.data;
}

export async function createEmployee(data: any): Promise<BackendEmployee> {
  const response = await fetch(`${API_BASE_URL}/employees`, {
    method: "POST",
    headers: {
      ...getHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || "Failed to create employee");
  }

  const json = await response.json();
  return json.data;
}

export async function updateEmployee(id: number, data: any): Promise<BackendEmployee> {
  const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
    method: "PUT",
    headers: {
      ...getHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || "Failed to update employee");
  }

  const json = await response.json();
  return json.data;
}

export async function deleteEmployee(id: number): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || "Failed to delete employee");
  }

  return true;
}

export interface MasterData {
  lokasi: {
    id: number;
    nama_lokasi: string;
  }[];
  jabatan: {
    id: number;
    nama_jabatan: string;
  }[];
}

export async function fetchMasters(): Promise<MasterData> {
  const response = await fetch(`${API_BASE_URL}/masters`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch master references");
  }

  const json = await response.json();
  return json.data;
}

export async function fetchEmployeeById(id: number): Promise<BackendEmployee> {
  const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || "Failed to fetch employee details");
  }

  const json = await response.json();
  return json.data;
}
