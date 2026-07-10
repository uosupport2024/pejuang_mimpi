import { useState, useEffect } from "react";
import { X, Check, Loader2, Calendar, FileText, Download, Mail, ShieldAlert, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import type { SarangUser } from "../types/sarang.type";
import { fetchJadwalHistoryAPI } from "@/features/tunas/api/absensi";

interface BaseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function BaseProfileDrawer({ isOpen, onClose, title, children }: BaseDrawerProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 z-50 transition-opacity backdrop-blur-xs"
      />

      {/* Slide-up bottom drawer */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white rounded-t-[32px] shadow-2xl z-50 flex flex-col max-h-[85vh] overflow-hidden animate-slide-up text-left">
        {/* Top Drag bar */}
        <div className="w-12 h-1 bg-zinc-200 rounded-full mx-auto my-3 shrink-0" />

        {/* Modal Header */}
        <div className="px-5 pb-3 flex justify-between items-center border-b border-zinc-100">
          <h2 className="text-sm font-bold text-zinc-900">{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-150 active:scale-95 flex items-center justify-center text-zinc-500 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {children}
        </div>
      </div>
    </>
  );
}

// 1. Edit Profile Drawer
interface EditProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: SarangUser;
  onSave: (updatedUser: Partial<SarangUser>) => Promise<void>;
}

export function EditProfileDrawer({ isOpen, onClose, user, onSave }: EditProfileDrawerProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [telepon, setTelepon] = useState(user.telepon || "");
  const [gender, setGender] = useState(user.gender || "Laki-Laki");
  const [statusNikah, setStatusNikah] = useState(user.status_nikah || "TK/0");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
    setTelepon(user.telepon || "");
    setGender(user.gender || "Laki-Laki");
    setStatusNikah(user.status_nikah || "TK/0");
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await onSave({ name, email, telepon, gender, status_nikah: statusNikah });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <BaseProfileDrawer isOpen={isOpen} onClose={onClose} title="Ubah Profil">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-zinc-700">
        <div className="space-y-1.5">
          <label className="text-zinc-500 block">Nama Lengkap</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-[#e0542c] focus:bg-white transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-zinc-500 block">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-[#e0542c] focus:bg-white transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-zinc-500 block">Nomor Telepon</label>
          <input
            type="tel"
            value={telepon}
            onChange={(e) => setTelepon(e.target.value)}
            className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-[#e0542c] focus:bg-white transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label className="text-zinc-500 block">Jenis Kelamin</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-[#e0542c] focus:bg-white transition-colors"
            >
              <option value="Laki-Laki">Laki-Laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-zinc-500 block">Status Pernikahan</label>
            <select
              value={statusNikah}
              onChange={(e) => setStatusNikah(e.target.value)}
              className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-[#e0542c] focus:bg-white transition-colors"
            >
              <option value="TK/0">Belum Menikah (TK/0)</option>
              <option value="K/0">Menikah (K/0)</option>
              <option value="K/1">Menikah Anak 1 (K/1)</option>
              <option value="K/2">Menikah Anak 2 (K/2)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full h-10 bg-[#e0542c] text-white rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs hover:bg-[#c23f1b] transition-colors mt-2"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </>
          )}
        </button>
      </form>
    </BaseProfileDrawer>
  );
}

// 2. Edit Payroll Drawer
interface EditPayrollDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: SarangUser;
  onSave: (updatedUser: Partial<SarangUser>) => Promise<void>;
}

export function EditPayrollDrawer({ isOpen, onClose, user, onSave }: EditPayrollDrawerProps) {
  const [bank, setBank] = useState(user.bank || "Mandiri");
  const [rekening, setRekening] = useState(user.rekening || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setBank(user.bank || "Mandiri");
    setRekening(user.rekening || "");
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await onSave({ bank, rekening });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <BaseProfileDrawer isOpen={isOpen} onClose={onClose} title="Rekening Payroll">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-zinc-700">
        <div className="space-y-1.5">
          <label className="text-zinc-500 block">Nama Bank</label>
          <select
            value={bank}
            onChange={(e) => setBank(e.target.value)}
            className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-[#e0542c] focus:bg-white transition-colors"
          >
            <option value="Mandiri">Bank Mandiri</option>
            <option value="BCA">Bank Central Asia (BCA)</option>
            <option value="BRI">Bank Rakyat Indonesia (BRI)</option>
            <option value="BNI">Bank Negara Indonesia (BNI)</option>
            <option value="BSI">Bank Syariah Indonesia (BSI)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-zinc-500 block">Nomor Rekening</label>
          <input
            type="text"
            required
            placeholder="Masukkan nomor rekening payroll"
            value={rekening}
            onChange={(e) => setRekening(e.target.value)}
            className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-[#e0542c] focus:bg-white transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full h-10 bg-[#e0542c] text-white rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs hover:bg-[#c23f1b] transition-colors mt-2"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>Simpan Rekening</span>
            </>
          )}
        </button>
      </form>
    </BaseProfileDrawer>
  );
}

// 3. Change Password Drawer
interface ChangePasswordDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

export function ChangePasswordDrawer({ isOpen, onClose, onSave }: ChangePasswordDrawerProps) {
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setOldPassword("");
    setPassword("");
    setConfirmPassword("");
    setError("");
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword) {
      setError("Password lama wajib diisi.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Konfirmasi password baru tidak cocok.");
      return;
    }
    if (password.length < 6) {
      setError("Password baru minimal 6 karakter.");
      return;
    }

    try {
      setIsSaving(true);
      setError("");
      const success = await onSave(oldPassword, password);
      if (success) {
        onClose();
      } else {
        setError("Gagal mengganti password. Periksa kembali password lama Anda.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <BaseProfileDrawer isOpen={isOpen} onClose={onClose} title="Ganti Password">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-zinc-700">
        {error && (
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 text-[11px]">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-zinc-500 block">Password Lama</label>
          <input
            type="password"
            required
            placeholder="Masukkan password lama"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-[#e0542c] focus:bg-white transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-zinc-500 block">Password Baru</label>
          <input
            type="password"
            required
            placeholder="Minimal 6 karakter"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-[#e0542c] focus:bg-white transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-zinc-500 block">Konfirmasi Password Baru</label>
          <input
            type="password"
            required
            placeholder="Ketik ulang password baru"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-[#e0542c] focus:bg-white transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full h-10 bg-[#e0542c] text-white rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs hover:bg-[#c23f1b] transition-colors mt-2"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>Perbarui Password</span>
            </>
          )}
        </button>
      </form>
    </BaseProfileDrawer>
  );
}

// 4. Jadwal & Shift Kerja Drawer
export function JadwalShiftDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [schedules, setSchedules] = useState<Record<string, any>>({});
  const [todayShift, setTodayShift] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load schedules for the current viewed month
  const loadMonthSchedules = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // First day and last day of month YYYY-MM-DD
    const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    setIsLoading(true);
    fetchJadwalHistoryAPI(1, 50, startDate, endDate)
      .then((data) => {
        const schedMap: Record<string, any> = {};
        if (Array.isArray(data)) {
          data.forEach((item: any) => {
            if (item.tanggal) {
              schedMap[item.tanggal] = item;
            }
          });
        }
        setSchedules(schedMap);

        // Find today's shift
        const todayStr = new Date().toLocaleDateString("sv-SE"); // sv-SE returns YYYY-MM-DD
        if (schedMap[todayStr]) {
          setTodayShift(schedMap[todayStr]);
        } else {
          setTodayShift(null);
        }
      })
      .catch((err) => console.error("Failed to load month schedules:", err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      setCurrentDate(now);
      setSelectedDate(now);
      loadMonthSchedules(now);
    }
  }, [isOpen]);

  const prevMonth = () => {
    const prev = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(prev);
    loadMonthSchedules(prev);
  };

  const nextMonth = () => {
    const next = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(next);
    loadMonthSchedules(next);
  };

  // Calendar math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  // Helper to match dates
  const getDateString = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    return (
      day === selectedDate.getDate() &&
      month === selectedDate.getMonth() &&
      year === selectedDate.getFullYear()
    );
  };

  // Determine shift dot color
  const getShiftColorClass = (shiftMasuk?: string) => {
    if (!shiftMasuk) return null;
    const hour = parseInt(shiftMasuk.split(":")[0]);
    if (hour >= 5 && hour < 14) {
      return "bg-emerald-500"; // Morning Shift
    }
    if (hour >= 14 && hour < 22) {
      return "bg-[#e0542c]"; // Evening Shift
    }
    return "bg-indigo-500"; // Night Shift
  };

  // Generate cells
  const dayCells = [];
  // 1. Previous month padding spacers
  for (let i = 0; i < firstDayOfWeek; i++) {
    dayCells.push(<div key={`empty-${i}`} className="w-8.5 h-8.5" />);
  }
  // 2. Actual days
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const dateStr = getDateString(day);
    const daySchedule = schedules[dateStr];
    const shift = daySchedule?.shift;
    const dotColor = shift ? getShiftColorClass(shift.jam_masuk) : null;
    const isDayToday = isToday(day);
    const isDaySelected = isSelected(day);

    dayCells.push(
      <button
        key={`day-${day}`}
        type="button"
        onClick={() => setSelectedDate(new Date(year, month, day))}
        className={`w-8.5 h-8.5 rounded-full flex flex-col items-center justify-center relative cursor-pointer font-bold transition-all text-xs active:scale-90 ${
          isDaySelected
            ? "bg-[#1e2a4a] text-white"
            : isDayToday
              ? "bg-[#e0542c]/10 text-[#e0542c] border border-[#e0542c]/30"
              : "text-zinc-700 hover:bg-zinc-100"
        }`}
      >
        <span className="leading-none">{day}</span>
        {dotColor && !isDaySelected && (
          <span className={`w-1 h-1 rounded-full absolute bottom-1 ${dotColor}`} />
        )}
      </button>
    );
  }

  // Selected date schedule details
  const selectedDateStr = selectedDate.toLocaleDateString("sv-SE");
  const selectedSchedule = schedules[selectedDateStr];

  return (
    <BaseProfileDrawer isOpen={isOpen} onClose={onClose} title="Jadwal & Shift Kerja">
      <div className="space-y-4 text-xs font-semibold">
        {/* Today's Shift Card */}
        <div className="space-y-1.5 text-left">
          <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">Shift Hari Ini</span>
          <div className="bg-[#1e2a4a] text-white p-4.5 rounded-2xl flex items-center justify-between shadow-xs border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#e0542c]/10 flex items-center justify-center text-[#e0542c] shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="font-extrabold text-sm text-white">
                  {todayShift?.shift?.nama_shift || "Tidak Ada Shift"}
                </p>
                <p className="text-[10px] text-zinc-400 mt-1 font-bold">
                  {todayShift?.shift
                    ? `Jam Kerja: ${todayShift.shift.jam_masuk.substring(0, 5)} - ${todayShift.shift.jam_keluar.substring(0, 5)} (WIB)`
                    : "Libur / Hari Bebas"}
                </p>
              </div>
            </div>
            {todayShift?.lokasi?.nama_lokasi && (
              <span className="text-[8.5px] font-extrabold tracking-wide uppercase px-2 py-1 bg-white/10 rounded-md text-white/90">
                {todayShift.lokasi.nama_lokasi}
              </span>
            )}
          </div>
        </div>

        {/* Calendar Card Container */}
        <div className="bg-zinc-50 border border-zinc-150 p-4 rounded-2xl text-left space-y-3">
          {/* Calendar Month Header */}
          <div className="flex justify-between items-center px-1">
            <span className="text-sm font-black text-zinc-800 uppercase tracking-wide">
              {currentDate.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1.5 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 cursor-pointer active:scale-95 transition-all text-zinc-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1.5 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 cursor-pointer active:scale-95 transition-all text-zinc-600"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="space-y-2">
            {/* Weekday titles */}
            <div className="grid grid-cols-7 gap-1 text-center font-extrabold text-[9px] text-zinc-400 uppercase tracking-widest pb-1 border-b border-zinc-100">
              {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            {isLoading ? (
              <div className="h-36 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[#e0542c]" />
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-y-1.5 justify-items-center">
                {dayCells}
              </div>
            )}
          </div>

          {/* Color Legend */}
          <div className="pt-2 border-t border-zinc-100 flex items-center justify-start gap-4 text-[9px] font-bold text-zinc-400 uppercase tracking-wide">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Shift Pagi</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e0542c]" />
              <span>Shift Sore</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span>Shift Malam</span>
            </div>
          </div>
        </div>

        {/* Selected Date Details */}
        <div className="space-y-1.5 text-left pt-1">
          <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">
            Detail Shift terpilih: {selectedDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </span>
          <div className="bg-zinc-50 border border-zinc-150 p-4.5 rounded-2xl space-y-3">
            {selectedSchedule ? (
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-extrabold text-zinc-800 text-sm">{selectedSchedule.shift.nama_shift}</h4>
                    <p className="text-[10.5px] font-bold text-[#e0542c] mt-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{selectedSchedule.shift.jam_masuk.substring(0, 5)} - {selectedSchedule.shift.jam_keluar.substring(0, 5)} WIB</span>
                    </p>
                  </div>
                  {selectedSchedule.lokasi?.nama_lokasi && (
                    <span className="text-[8px] font-extrabold tracking-wide uppercase px-2 py-1 bg-zinc-200 text-zinc-600 rounded-md">
                      {selectedSchedule.lokasi.nama_lokasi}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-zinc-400 text-xs font-bold text-center py-2 uppercase tracking-wide select-none">
                Hari Libur (Tidak Ada Jadwal Shift)
              </div>
            )}
          </div>
        </div>
      </div>
    </BaseProfileDrawer>
  );
}

// 5. Dokumen Kontrak Drawer
export function ContractDrawer({ isOpen, onClose, user }: { isOpen: boolean; onClose: () => void; user: SarangUser }) {
  return (
    <BaseProfileDrawer isOpen={isOpen} onClose={onClose} title="Dokumen Kontrak">
      <div className="space-y-4 text-xs font-semibold">
        <div className="bg-[#F7F3EB] border border-[#e2dcd0] p-4 rounded-2xl flex items-start gap-3">
          <FileText className="w-8 h-8 text-[#e0542c] mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="font-bold text-zinc-900 text-sm">Kontrak Kerja Karyawan Waktu Tertentu (PKWT)</p>
            <p className="text-[10px] text-zinc-500">Status: <span className="text-emerald-600">Aktif</span></p>
            <p className="text-[10px] text-zinc-500">Tanggal Mulai: {user.tgl_join || "2025-04-14"}</p>
          </div>
        </div>

        <button
          onClick={() => {}}
          className="w-full h-11 bg-white border border-[#e0542c] text-[#e0542c] hover:bg-[#e0542c]/5 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Unduh Salinan Kontrak (PDF)</span>
        </button>
      </div>
    </BaseProfileDrawer>
  );
}

// 6. Pusat Bantuan & Kontak Drawer
export function HelpCenterDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <BaseProfileDrawer isOpen={isOpen} onClose={onClose} title="Pusat Bantuan">
      <div className="space-y-5 text-xs font-semibold text-zinc-700">
        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-sm">
            <Mail className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1 space-y-1 text-left">
            <h4 className="font-bold text-zinc-900 text-sm">Kontak Layanan Pengguna</h4>
            <p className="text-[10px] text-zinc-500 leading-normal">
              Ada kendala pembayaran gaji, absensi, atau masalah teknis aplikasi? Hubungi tim support kami via email.
            </p>
          </div>
        </div>

        <div className="bg-zinc-50 rounded-2xl border border-zinc-150 p-4 space-y-3.5 text-left">
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">ALAMAT EMAIL RESMI</span>
            <span className="text-sm font-bold text-zinc-800 font-mono">icons@portotalents.com</span>
          </div>

          <a
            href="mailto:icons@portotalents.com"
            className="w-full h-10 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] text-xs shadow-sm shadow-emerald-500/10"
          >
            <Mail className="w-4 h-4" />
            <span>Kirim Email Sekarang</span>
          </a>
        </div>

        <div className="text-zinc-400 text-[10px] text-center font-medium leading-relaxed px-2">
          Jam operasional tim bantuan: Senin - Jumat (09:00 - 17:00 WIB). Email balasan akan dikirim maksimal dalam 1x24 jam kerja.
        </div>
      </div>
    </BaseProfileDrawer>
  );
}

// 7. Syarat & Ketentuan Drawer (UU PDP No. 27/2022 Compliant)
export function TermsAndPrivacyDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">("privacy");

  return (
    <BaseProfileDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={activeTab === "privacy" ? "Kebijakan Privasi" : "Syarat & Ketentuan"}
    >
      <div className="space-y-4 text-xs font-semibold text-zinc-700 text-left">
        {/* Pills style switcher */}
        <div className="grid grid-cols-2 p-1 bg-zinc-100 rounded-xl shrink-0">
          <button
            onClick={() => setActiveTab("privacy")}
            className={`py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "privacy" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            Kebijakan Privasi
          </button>
          <button
            onClick={() => setActiveTab("terms")}
            className={`py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "terms" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            Syarat & Ketentuan
          </button>
        </div>

        {/* Scrollable Document Content Area */}
        <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-1 text-[11px] leading-relaxed font-medium text-zinc-650">
          {activeTab === "privacy" ? (
            <>
              <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 text-emerald-700 text-[10px] leading-normal mb-2 flex gap-2">
                <ShieldAlert className="w-4.5 h-4.5 shrink-0 mt-0.5 text-emerald-600" />
                <span>
                  Dokumen ini disusun mematuhi <strong>Undang-Undang Republik Indonesia Nomor 27 Tahun 2022</strong> tentang Perlindungan Data Pribadi (UU PDP).
                </span>
              </div>

              <h4 className="font-bold text-zinc-900 uppercase text-[10px] tracking-wide mt-2">1. Jenis Data Pribadi Yang Dikumpulkan</h4>
              <p className="text-zinc-500">
                Kami mengumpulkan data pribadi berupa Nama Lengkap, Alamat Surat Elektronik (Email), Nomor Telepon, Jenis Kelamin, Status Pernikahan, Tanggal Bergabung, nama Bank, dan Nomor Rekening Payroll demi pelaksanaan fungsi ketenagakerjaan dan administrasi penggajian.
              </p>

              <h4 className="font-bold text-zinc-900 uppercase text-[10px] tracking-wide mt-2">2. Dasar Hukum & Tujuan Pemrosesan Data</h4>
              <p className="text-zinc-500">
                Pemrosesan data didasarkan pada hubungan kontraktual ketenagakerjaan antara Anda dan perusahaan. Seluruh pemrosesan dilakukan semata-mata untuk mengelola profil kerja, memverifikasi pencatatan kehadiran (absensi), dan memproses penyaluran penggajian (payroll) bulanan.
              </p>

              <h4 className="font-bold text-zinc-900 uppercase text-[10px] tracking-wide mt-2">3. Hak Anda Sebagai Subjek Data Pribadi (Pasal 5-12 UU PDP)</h4>
              <p className="text-zinc-500">
                Sesuai UU PDP RI, Anda memiliki hak penuh untuk:
              </p>
              <ul className="list-disc list-inside pl-1 space-y-1 text-zinc-500">
                <li>Mengakses dan mendapatkan salinan data pribadi Anda.</li>
                <li>Memperbaiki, melengkapi, atau memperbarui kesalahan data pribadi Anda (melalui drawer ubah profil/rekening).</li>
                <li>Menarik kembali persetujuan pemrosesan data pribadi Anda.</li>
                <li>Mengakhiri pemrosesan, menghapus, atau memusnahkan data pribadi Anda sesuai dengan ketentuan hukum yang berlaku.</li>
              </ul>

              <h4 className="font-bold text-zinc-900 uppercase text-[10px] tracking-wide mt-2">4. Keamanan dan Jaminan Kerahasiaan</h4>
              <p className="text-zinc-500">
                Data Anda dienkripsi dan disimpan dalam server dengan tingkat pengawasan ketat. Informasi sensitif seperti nomor rekening payroll dilindungi menggunakan enkripsi end-to-end dan pembatasan akses karyawan. Kami tidak akan pernah membagikan atau menjual data pribadi Anda kepada pihak ketiga mana pun tanpa persetujuan eksplisit tertulis dari Anda.
              </p>
            </>
          ) : (
            <>
              <h4 className="font-bold text-zinc-900 uppercase text-[10px] tracking-wide mt-1">1. Ruang Lingkup Layanan Aplikasi</h4>
              <p className="text-zinc-500">
                Aplikasi Pejuang Mimpi menyediakan platform digital ketenagakerjaan internal untuk pencatatan absensi, pengelolaan profil karyawan, monitoring tabungan impian, serta integrasi nomor rekening payroll bagi penyaluran gaji periodik.
              </p>

              <h4 className="font-bold text-zinc-900 uppercase text-[10px] tracking-wide mt-2">2. Persetujuan Pemrosesan Data Karyawan</h4>
              <p className="text-zinc-500">
                Dengan menyetujui syarat ini, Anda memberikan persetujuan eksplisit yang sah kepada platform untuk memproses informasi profil pribadi dan nomor rekening Anda untuk keperluan pelaporan internal kerja dan payroll gaji bulanan.
              </p>

              <h4 className="font-bold text-zinc-900 uppercase text-[10px] tracking-wide mt-2">3. Kewajiban & Keakuratan Informasi Karyawan</h4>
              <p className="text-zinc-500">
                Anda bertanggung jawab penuh atas keakuratan nomor rekening, nama bank, dan data pribadi yang diinput. Kelalaian atau kesalahan pengisian rekening yang mengakibatkan gangguan pada proses payroll berada di luar tanggung jawab sistem.
              </p>

              <h4 className="font-bold text-zinc-900 uppercase text-[10px] tracking-wide mt-2">4. Penangguhan & Pemutusan Akses</h4>
              <p className="text-zinc-500">
                Sistem berhak menangguhkan akses aplikasi apabila ditemukan penyalahgunaan akun, upaya pemalsuan data identitas kerja, atau aktivitas mencurigakan yang membahayakan keamanan server database.
              </p>
            </>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full h-10 bg-zinc-900 hover:bg-zinc-850 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.99] text-xs shadow-xs"
        >
          <span>Saya Mengerti & Setuju</span>
        </button>
      </div>
    </BaseProfileDrawer>
  );
}
