import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { FormField } from "@/shared/components/ui/form-field";

interface ProfilePageProps {
  user: {
    name: string;
    role: string;
    email: string;
    is_admin?: string;
    telepon?: string;
    gender?: string;
    tgl_join?: string;
    status_nikah?: string;
    rekening?: string;
    bank?: string;
    gaji_pokok?: number;
    lembur?: number;
    izin?: number;
  };
}

const TABS = [
  { id: "pribadi", label: "Informasi Pribadi" },
  { id: "status", label: "Status & Jabatan" },
  { id: "identitas", label: "Dokumen Identitas" },
  { id: "cuti", label: "Cuti & Izin" },
  { id: "gaji", label: "Penjumlahan Gaji" },
  { id: "potongan", label: "Pengurangan Gaji" },
  { id: "tunjangan", label: "Tunjangan & Potongan" },
];

export function ProfilePage({ user }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState<string>("pribadi");
  const [copied, setCopied] = useState(false);

  const initials = user.name
    ? user.name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  const formatRupiah = (amount?: number) => {
    if (amount === undefined || amount === null) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getMasaKerjaStr = (joinDateStr?: string) => {
    if (!joinDateStr) return "0 Tahun, 0 Bulan, 0 Hari.";
    const joinDate = new Date(joinDateStr);
    if (isNaN(joinDate.getTime())) return "0 Tahun, 0 Bulan, 0 Hari.";
    const now = new Date();
    let years = now.getFullYear() - joinDate.getFullYear();
    let months = now.getMonth() - joinDate.getMonth();
    let days = now.getDate() - joinDate.getDate();

    if (days < 0) {
      months -= 1;
      const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += lastMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    return `${years} Tahun, ${months} Bulan, ${days} Hari.`;
  };

  const handleCopyRekening = () => {
    if (user.rekening) {
      navigator.clipboard.writeText(user.rekening);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Left Column - Clean Profile Card (Sticky) */}
        <div className="md:col-span-4 bg-white border border-gray-200/80 rounded-2xl p-6 space-y-6 shadow-xs md:sticky md:top-0">
          
          {/* Avatar and Name */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center font-bold text-gray-800 text-xl shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-gray-900 truncate leading-snug">{user.name}</h2>
              <p className="text-[11px] font-medium text-gray-500 truncate">{user.role}</p>
            </div>
          </div>

          {/* Details Section */}
          <div className="border-t border-gray-100 pt-4 space-y-4">
            <h3 className="text-xs font-bold text-gray-800">Detail Profil</h3>

            <div className="space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Email</span>
              <a href={`mailto:${user.email}`} className="text-xs font-medium text-[#e0542c] hover:underline block truncate">
                {user.email}
              </a>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Telepon</span>
              <span className="text-xs font-semibold text-gray-700 block">{user.telepon || "—"}</span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Jenis Kelamin</span>
              <span className="text-xs font-semibold text-gray-700 block">{user.gender || "—"}</span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Status Pernikahan</span>
              <span className="text-xs font-semibold text-gray-700 block">
                {user.status_nikah === "TK/0"
                  ? "Belum Menikah (TK/0)"
                  : user.status_nikah === "K/0"
                    ? "Menikah (K/0)"
                    : user.status_nikah || "—"}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Tanggal Bergabung</span>
              <span className="text-xs font-semibold text-gray-700 block">
                {user.tgl_join
                  ? new Date(user.tgl_join).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column - Classic Line Tabs & Panels (Sticky height with scrollable content) */}
        <div className="md:col-span-8 bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs md:h-[calc(100vh-140px)] md:min-h-[500px] flex flex-col justify-between">
          
          <div className="flex flex-col flex-1 min-h-0">
            {/* Horizontal Line Tab Bar (Sticky/Fixed inside card) */}
            <div className="flex items-center gap-2 border-b border-gray-100 pb-px overflow-x-auto scrollbar-none shrink-0">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 px-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "border-[#e0542c] text-[#e0542c]"
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Scrollable Tab content area */}
            <div className="flex-1 overflow-y-auto pr-1 mt-4 scrollbar-thin">
              {activeTab === "pribadi" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 animate-in fade-in duration-200">
                  <FormField label="Nama Pegawai" type="text" disabled value={user.name || "—"} />
                  <FormField label="Email" type="text" disabled value={user.email || "—"} />
                  <FormField label="Nomor Handphone" type="text" disabled value={user.telepon || "—"} />
                  <FormField label="Username" type="text" disabled value={user.email || "—"} />
                  <FormField label="Tanggal Lahir" type="text" disabled value="—" />
                  <FormField label="Tanggal Masuk Perusahaan" type="text" disabled value={user.tgl_join ? new Date(user.tgl_join).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "—"} />
                  <FormField label="Masa Kerja" type="text" disabled value={getMasaKerjaStr(user.tgl_join)} />
                  <FormField label="Role" type="text" disabled value={user.role || "—"} />
                  <FormField label="Gender" type="text" disabled value={user.gender || "—"} />
                  <FormField label="Dashboard" type="text" disabled value={user.is_admin || "—"} />
                </div>
              )}

              {activeTab === "status" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 animate-in fade-in duration-200">
                  <FormField label="Status Pernikahan" type="text" disabled value={user.status_nikah || "—"} />
                  <FormField label="Divisi" type="text" disabled value={user.role || "—"} />
                  <FormField label="Status Pajak" type="text" disabled value={user.status_nikah || "—"} />
                </div>
              )}

              {activeTab === "identitas" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 animate-in fade-in duration-200">
                  <FormField label="Nomor KTP" type="text" disabled value="—" />
                  <FormField label="Nomor Kartu Keluarga" type="text" disabled value="—" />
                  <FormField label="Nomor BPJS Kesehatan" type="text" disabled value="—" />
                  <FormField label="Nomor BPJS Ketenagakerjaan" type="text" disabled value="—" />
                  <FormField label="Nomor NPWP" type="text" disabled value="—" />
                  <FormField label="Nomor SIM" type="text" disabled value="—" />
                  <FormField label="Nomor PKWT" type="text" disabled value="—" />
                  <FormField label="Nomor Kontrak" type="text" disabled value="—" />
                  <FormField label="Tanggal Mulai PKWT" type="text" disabled value="—" />
                  <FormField label="Tanggal Berakhir PKWT" type="text" disabled value="—" />
                  <div className="flex items-end gap-2">
                    <FormField label="Nomor Rekening" type="text" disabled value={user.rekening || "—"} className="flex-1" />
                    {user.rekening && (
                      <button
                        type="button"
                        onClick={handleCopyRekening}
                        className="h-9 px-3 bg-white border border-gray-250 hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer flex items-center justify-center shrink-0 shadow-xs"
                        title="Salin"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                  <FormField label="Bank" type="text" disabled value={user.bank || "—"} />
                  <FormField label="Nama Pemilik Rekening" type="text" disabled value={user.name || "—"} />
                  <FormField label="Masa Berlaku" type="text" disabled value="—" />
                </div>
              )}

              {activeTab === "cuti" && (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-1 animate-in fade-in duration-200">
                  <FormField label="Cuti" type="text" disabled value={user.izin !== undefined ? String(user.izin) : "12"} />
                  <FormField label="Izin Masuk" type="text" disabled value="0" />
                  <FormField label="Izin Telat" type="text" disabled value="0" />
                  <FormField label="Izin Pulang Cepat" type="text" disabled value="0" />
                </div>
              )}

              {activeTab === "gaji" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 animate-in fade-in duration-200">
                  <FormField label="Gaji Harian (/ Hari)" type="text" disabled value="—" />
                  <FormField label="Gaji Pokok (/ Bulan)" type="text" disabled value={user.gaji_pokok ? formatRupiah(user.gaji_pokok) : "—"} />
                  <FormField label="Makan Dan Transport (/ Bulan)" type="text" disabled value="—" />
                  <FormField label="Lembur (/ Jam)" type="text" disabled value={user.lembur ? formatRupiah(user.lembur) : "—"} />
                  <FormField label="100% Kehadiran (/ Bulan)" type="text" disabled value="—" />
                  <FormField label="THR (/ Bulan)" type="text" disabled value="—" />
                  <FormField label="Bonus Pribadi (/ Bulan)" type="text" disabled value="—" />
                  <FormField label="Bonus Team (/ Bulan)" type="text" disabled value="—" />
                  <FormField label="Bonus Jackpot (/ Bulan)" type="text" disabled value="—" />
                </div>
              )}

              {activeTab === "potongan" && (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-1 animate-in fade-in duration-200">
                  <FormField label="Izin (/ hari)" type="text" disabled value="—" />
                  <FormField label="Terlambat (/ hari)" type="text" disabled value="—" />
                  <FormField label="Mangkir (/ hari)" type="text" disabled value="—" />
                  <FormField label="Saldo Kasbon (/ Tahun)" type="text" disabled value="—" />
                </div>
              )}

              {activeTab === "tunjangan" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 animate-in fade-in duration-200">
                  <FormField label="Tunjangan BPJS Kesehatan" type="text" disabled value="—" />
                  <FormField label="Tunjangan BPJS Ketenagakerjaan" type="text" disabled value="—" />
                  <FormField label="Potongan BPJS Kesehatan" type="text" disabled value="—" />
                  <FormField label="Potongan BPJS Ketenagakerjaan" type="text" disabled value="—" />
                  <FormField label="Tunjangan Pajak (Gross Up)" type="text" disabled value="—" />
                </div>
              )}
            </div>
          </div>

          {/* Motivational quote block from Pejuang Mimpi (Sticky at bottom of card) */}
          <div className="border border-orange-100/50 rounded-xl p-4 bg-orange-50/20 text-[11px] text-gray-500 italic leading-relaxed mt-4 shrink-0">
            "Semangat bekerja! Setiap kontribusi kecil Anda sangat berarti. Teruslah menjadi bagian dari perjuangan mewujudkan impian bersama di Pejuang Mimpi."
          </div>

        </div>

      </div>
    </div>
  );
}
