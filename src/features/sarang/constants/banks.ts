export interface BankItem {
  name: string;
  code: string;
}

// Static fallback list of major Indonesian banks, used when the remote
// bank list API is unreachable (see profile-drawers.tsx EditPayrollDrawer).
export const INDONESIAN_BANKS: BankItem[] = [
  { name: "Bank Central Asia (BCA)", code: "014" },
  { name: "Bank Mandiri", code: "008" },
  { name: "Bank Negara Indonesia (BNI)", code: "009" },
  { name: "Bank Rakyat Indonesia (BRI)", code: "002" },
  { name: "Bank Syariah Indonesia (BSI)", code: "451" },
  { name: "Bank Tabungan Negara (BTN)", code: "200" },
  { name: "CIMB Niaga", code: "022" },
  { name: "Bank Danamon", code: "011" },
  { name: "Bank Permata", code: "013" },
  { name: "Bank Panin", code: "019" },
  { name: "Maybank Indonesia", code: "016" },
  { name: "OCBC NISP", code: "028" },
  { name: "Bank Mega", code: "426" },
  { name: "Bank Bukopin", code: "441" },
  { name: "Bank BTPN", code: "213" },
  { name: "Bank Jago", code: "542" },
  { name: "Bank Sinarmas", code: "153" },
  { name: "Bank UOB Indonesia", code: "023" },
  { name: "HSBC Indonesia", code: "041" },
  { name: "Citibank", code: "031" },
  { name: "Bank DKI", code: "111" },
  { name: "Bank Jabar Banten (BJB)", code: "110" },
  { name: "Bank Jateng", code: "113" },
  { name: "Bank Jatim", code: "114" },
  { name: "SeaBank", code: "535" },
];
