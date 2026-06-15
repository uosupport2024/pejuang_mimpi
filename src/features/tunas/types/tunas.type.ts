export interface TunasUser {
  name: string;
  role: string;
  gaji_pokok?: number;
  lembur?: number;
  izin?: number;
  bank?: string;
  rekening?: string;
}

export interface TunasPageProps {
  user: TunasUser;
}
