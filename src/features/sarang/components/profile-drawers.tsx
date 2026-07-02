import { useState, useEffect } from "react";
import { X, Check, Loader2, Calendar, FileText, Download } from "lucide-react";
import type { SarangUser } from "../types/sarang.type";

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
  onSave: (password: string) => Promise<boolean>;
}

export function ChangePasswordDrawer({ isOpen, onClose, onSave }: ChangePasswordDrawerProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setPassword("");
    setConfirmPassword("");
    setError("");
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }
    if (password.length < 6) {
      setError("Password baru minimal 6 karakter.");
      return;
    }

    try {
      setIsSaving(true);
      setError("");
      const success = await onSave(password);
      if (success) {
        onClose();
      } else {
        setError("Gagal mengganti password pada server.");
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
  const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
  return (
    <BaseProfileDrawer isOpen={isOpen} onClose={onClose} title="Jadwal & Shift Kerja">
      <div className="space-y-4 text-xs">
        <div className="bg-[#1e2a4a] text-white p-4 rounded-2xl flex items-center gap-3">
          <Calendar className="w-8 h-8 text-[#e0542c]" />
          <div>
            <p className="font-bold text-sm">Shift Pagi Utama</p>
            <p className="text-[10px] text-zinc-300">Jam Kerja: 08:00 - 17:00 (WIB)</p>
          </div>
        </div>

        <div className="space-y-2">
          <span className="font-bold text-zinc-500 uppercase tracking-wide block">Rincian Hari Kerja</span>
          <div className="divide-y divide-zinc-100 bg-zinc-50 rounded-2xl border border-zinc-150 overflow-hidden">
            {days.map((day) => (
              <div key={day} className="flex justify-between items-center px-4 py-3 font-semibold">
                <span className="text-zinc-700">{day}</span>
                <span className="text-[#e0542c]">08:00 - 17:00</span>
              </div>
            ))}
            <div className="flex justify-between items-center px-4 py-3 font-semibold bg-zinc-100/50">
              <span className="text-zinc-400">Sabtu & Minggu</span>
              <span className="text-zinc-400">Libur Akhir Pekan</span>
            </div>
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
