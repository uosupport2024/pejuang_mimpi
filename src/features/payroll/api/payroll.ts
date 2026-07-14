import { API_BASE_URL, getHeaders } from "@/shared/utils/api";

export interface RekapItem {
  id: number;
  name: string;
  jabatan_nama: string;
  gaji_harian: number;
  total_hari_kerja: number;
  total_hadir: number;
  sakit: number;
  izin_masuk: number;
  sakit_dan_izin: number;
  jam_lembur: number;
  menit_lembur: number;
  insentif_per_22_hari: number;
  total_gaji_pokok: number;
  insentif_per_hari_kerja: number;
  potongan: number;
  total_lembur_rp: number;
  aktual_gaji: number;
  nama_rekening: string | null;
  bank: string | null;
  rekening: string | null;
  has_payroll: boolean;
}

export interface RekapResponse {
  current_page: number;
  data: RekapItem[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: any[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export async function fetchRekapData(params: {
  mulai: string;
  akhir: string;
  lokasi?: string;
  sort?: string;
  direction?: string;
  page?: number;
}): Promise<RekapResponse> {
  const queryParams = new URLSearchParams({
    mulai: params.mulai,
    akhir: params.akhir,
    ...(params.lokasi && { lokasi: params.lokasi }),
    ...(params.sort && { sort: params.sort }),
    ...(params.direction && { direction: params.direction }),
    ...(params.page && { page: String(params.page) }),
  });

  const response = await fetch(`${API_BASE_URL}/rekap-data?${queryParams.toString()}`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || "Gagal memuat rekap data");
  }

  const json = await response.json();
  return json.data;
}

export interface PayrollHistoryItem {
  id: number;
  no_gaji: string;
  user_id: number;
  name: string;
  jabatan_nama: string;
  bulan: number;
  tahun: number;
  grand_total: number;
}

export interface PayrollHistoryResponse {
  current_page: number;
  data: PayrollHistoryItem[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: any[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export async function fetchPayrollHistory(params: {
  bulan?: string;
  tahun?: string;
  page?: number;
}): Promise<PayrollHistoryResponse> {
  const queryParams = new URLSearchParams({
    ...(params.bulan && { bulan: params.bulan }),
    ...(params.tahun && { tahun: params.tahun }),
    ...(params.page && { page: String(params.page) }),
  });

  const response = await fetch(`${API_BASE_URL}/payroll-history?${queryParams.toString()}`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || "Gagal memuat riwayat payroll");
  }

  const json = await response.json();
  return json.data;
}

export async function deletePayrollHistory(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/payroll-history/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || "Gagal menghapus data payroll");
  }
}
