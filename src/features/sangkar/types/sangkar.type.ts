export interface SangkarUser {
  name: string;
  role: string;
  gender?: string;
  lembur?: number;
}

export interface SangkarPageProps {
  user: SangkarUser;
}
