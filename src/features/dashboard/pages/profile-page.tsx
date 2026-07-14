import { User, Mail, Phone, Calendar, Landmark, CreditCard, UserCheck } from "lucide-react";

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

export function ProfilePage({ user }: ProfilePageProps) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const formatRupiah = (amount?: number) => {
    if (amount === undefined || amount === null) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Card Profile Overview */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-xs relative overflow-hidden flex flex-col items-center text-center">
            {/* Design accents */}
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#e0542c] to-[#ff7e5a]" />

            {/* Avatar container */}
            <div className="relative mt-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#1e2a4a] to-[#2a3c6b] text-white flex items-center justify-center font-black text-3xl shadow-md border-4 border-white">
                {initials}
              </div>
              <div className="absolute bottom-1 right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white shadow-xs flex items-center justify-center">
                <UserCheck className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* User credentials */}
            <div className="mt-4 space-y-1">
              <h2 className="text-base font-black text-gray-900 tracking-tight leading-tight">
                {user.name}
              </h2>
              <p className="text-xs font-bold text-[#e0542c] bg-[#e0542c]/10 px-3 py-1 rounded-full inline-block">
                {user.role}
              </p>
            </div>

            {/* Mini Details Divider */}
            <div className="w-full my-5 border-t border-gray-100" />

            {/* Key stats */}
            <div className="w-full space-y-3.5 text-left">
              <div className="flex items-center gap-3 text-xs">
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Email</p>
                  <p className="font-semibold text-gray-700 truncate mt-0.5">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Telepon</p>
                  <p className="font-semibold text-gray-700 truncate mt-0.5">{user.telepon || "—"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Tanggal Bergabung</p>
                  <p className="font-semibold text-gray-700 truncate mt-0.5">
                    {user.tgl_join
                      ? new Date(user.tgl_join).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Detailed Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Personal details */}
          <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-xs space-y-5">
            <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-zinc-50 border border-zinc-100 text-gray-500">
                <User className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-gray-800">
                Informasi Pribadi
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nama Lengkap</span>
                <p className="text-xs font-semibold text-gray-750">{user.name}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Jenis Kelamin</span>
                <p className="text-xs font-semibold text-gray-750">{user.gender || "—"}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status Pernikahan</span>
                <p className="text-xs font-semibold text-gray-750">
                  {user.status_nikah === "TK/0"
                    ? "Belum Menikah (TK/0)"
                    : user.status_nikah === "K/0"
                      ? "Menikah (K/0)"
                      : user.status_nikah || "—"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nomor HP / Whatsapp</span>
                <p className="text-xs font-semibold text-gray-750">{user.telepon || "—"}</p>
              </div>
            </div>
          </div>

          {/* Card: Career & Financial */}
          <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-xs space-y-5">
            <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-zinc-50 border border-zinc-100 text-gray-500">
                <Landmark className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-gray-800">
                Karir & Payroll Finansial
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Jabatan / Role</span>
                <p className="text-xs font-semibold text-gray-750">{user.role}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Gaji Pokok</span>
                <p className="text-xs font-extrabold text-[#7FA46D]">
                  {user.gaji_pokok ? formatRupiah(user.gaji_pokok) : "—"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nama Bank</span>
                <p className="text-xs font-semibold text-gray-750 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                  {user.bank || "—"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nomor Rekening</span>
                <p className="text-xs font-bold text-gray-800">{user.rekening || "—"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
