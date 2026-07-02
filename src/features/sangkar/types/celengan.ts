export interface Celengan {
  id: number;
  user_id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  icon: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CelenganTransaction {
  id: number;
  celengan_id: number;
  user_id: number;
  type: "deposit" | "withdraw";
  amount: number;
  note: string | null;
  created_at?: string;
  updated_at?: string;
}
