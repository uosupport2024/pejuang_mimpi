export interface SarangUser {
  name: string;
  role: string;
  email: string;
  telepon?: string;
  gender?: string;
  status_nikah?: string;
  tgl_join?: string;
  bank?: string;
  rekening?: string;
  status?: string;
}

export interface SarangPageProps {
  user: SarangUser;
  onLogout?: () => void;
  onUpdateUser?: (user: any) => void;
}
