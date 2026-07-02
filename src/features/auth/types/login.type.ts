export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    telepon?: string;
    gender?: string;
    tgl_join?: string;
    status_nikah?: string;
    rekening?: string;
    bank?: string;
    gaji_pokok?: number;
    lembur?: number;
    izin?: number;
    status?: string;
  };
  error?: string;
}
