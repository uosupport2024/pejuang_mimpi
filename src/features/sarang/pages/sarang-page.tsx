import { useState } from "react";
import { ProfileHeader } from "../components/profile-header";
import { useSarang } from "../hooks/use-sarang";
import type { SarangPageProps } from "../types/sarang.type";
import { toast } from "sonner";
import { updateProfileOnBackend, changePasswordOnBackend } from "../api/profile";
import {
  EditProfileDrawer,
  EditPayrollDrawer,
  ChangePasswordDrawer,
  JadwalShiftDrawer,
  HelpCenterDrawer,
  TermsAndPrivacyDrawer,
} from "../components/profile-drawers";
import patternBg from "@/assets/bg/pattern-background.png";
import { useRouter } from "@/shared/router/router";
import { Button } from "@/shared/components/ui/button";
import { Logout } from "@solar-icons/react";
import {
  CreditCard,
  Clock,
  Lock,
  HelpCircle,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";

export function SarangPage({ user, onLogout, onUpdateUser }: SarangPageProps) {
  const { goBack } = useSarang();
  const { navigate } = useRouter();

  // State for controlling drawers
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isEditPayrollOpen, setIsEditPayrollOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isJadwalShiftOpen, setIsJadwalShiftOpen] = useState(false);
  const [isHelpCenterOpen, setIsHelpCenterOpen] = useState(false);
  const [isTermsAndPrivacyOpen, setIsTermsAndPrivacyOpen] = useState(false);

  // Card Number visibility toggle
  const [showCardNumber, setShowCardNumber] = useState(false);

  const handleSaveProfile = async (updatedData: any) => {
    try {
      const res = await updateProfileOnBackend(updatedData);
      if (onUpdateUser) {
        onUpdateUser({
          ...user,
          ...res,
        });
      }
      toast.success("Profil berhasil diperbarui!");
    } catch (err) {
      toast.error("Gagal memperbarui profil.");
    }
  };

  const handleSavePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const res = await changePasswordOnBackend(currentPassword, newPassword);
      if (res.success) {
        toast.success(res.message || "Password berhasil diganti!");
        return true;
      } else {
        toast.error(res.message || "Gagal mengganti password.");
        return false;
      }
    } catch (err) {
      toast.error("Gagal mengganti password.");
      return false;
    }
  };

  // Format payroll account number like card groups (e.g. 1730 0189 4805 0)
  const formatCardNumber = (num?: string) => {
    if (!num) return "••••  ••••  ••••  ••••";
    const clean = num.replace(/\s+/g, "");
    const chunks = clean.match(/.{1,4}/g);
    return chunks ? chunks.join("  ") : num;
  };

  const maskCardNumber = (num?: string) => {
    if (!num) return "••••  ••••  ••••  ••••";
    const clean = num.replace(/\s+/g, "");
    if (clean.length <= 4) return "••••  ••••  ••••  " + clean;
    const lastFour = clean.slice(-4);
    return `••••  ••••  ••••  ${lastFour}`;
  };

  return (
    <div className="space-y-5">
      {/* Profile Header Block */}
      <ProfileHeader
        user={user}
        onBack={goBack}
        onNotificationClick={() => toast.info("Membuka Kotak Masuk Notifikasi...")}
      />

      {/* Warning banner if payroll account is not set */}
      {!user.rekening && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/15 text-left text-xs font-semibold text-zinc-700">
          <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-zinc-900 text-sm">Rekening Payroll Belum Diatur</h4>
            <p className="text-[10px] text-zinc-500 leading-normal">
              Rekening bank untuk penggajian belum diatur. Silakan atur nomor rekening Anda melalui menu di bawah.
            </p>
          </div>
        </div>
      )}

      {/* ATM Card: Payroll Account Info (If present) */}
      {user.rekening && (
        <div className="space-y-2">
          <div
            onClick={() => setIsEditPayrollOpen(true)}
            className="w-full aspect-[1.586/1] bg-gradient-to-br from-[#1e2a4a] via-[#24345d] to-[#151f38] text-white p-5 rounded-[24px] shadow-lg relative overflow-hidden flex flex-col justify-between text-left cursor-pointer group border border-white/5 active:scale-[0.99] transition-transform"
          >
            {/* Cloud Pattern Overlay */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none group-hover:opacity-15 transition-opacity"
              style={{
                backgroundImage: `url(${patternBg})`,
                backgroundSize: "120px 120px",
              }}
            />

            {/* Diagonal Reflection Glow & Shine Sweep */}
            <div className="absolute -inset-y-24 -inset-x-40 w-44 bg-white/5 blur-2xl rounded-full rotate-45 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent -translate-x-full -translate-y-full group-hover:translate-x-full group-hover:translate-y-full transition-transform duration-1000 ease-out pointer-events-none" />

            {/* Header: EMV Chip and Bank Name */}
            <div className="flex justify-between items-center relative z-10">
              {/* Gold Chip */}
              <div className="w-9 h-7 bg-amber-400/90 rounded-md border border-amber-300/40 relative overflow-hidden flex flex-col justify-between p-1 shadow-xs">
                <div className="grid grid-cols-3 gap-0.5 w-full h-full opacity-60">
                  <div className="border border-amber-900/10" />
                  <div className="border border-amber-900/10" />
                  <div className="border border-amber-900/10" />
                  <div className="border border-amber-900/10" />
                  <div className="border border-amber-900/10" />
                  <div className="border border-amber-900/10" />
                </div>
              </div>
              {/* Bank Name */}
              <div className="text-right">
                <p className="text-[10px] font-extrabold tracking-wider text-white/90">
                  {user.bank ? user.bank.toUpperCase() : "MANDIRI"}
                </p>
                <p className="text-[7.5px] font-semibold text-white/60 tracking-widest leading-none">
                  PAYROLL ACCOUNT
                </p>
              </div>
            </div>

            {/* Card Number with Hide/Show Toggle */}
            <div className="relative z-10 pt-2 flex justify-between items-center pr-1">
              <p className="text-[14px] sm:text-base font-bold tracking-widest font-mono text-zinc-100 filter drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.5)]">
                {showCardNumber ? formatCardNumber(user.rekening) : maskCardNumber(user.rekening)}
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCardNumber(!showCardNumber);
                }}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
              >
                {showCardNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Footer: Cardholder Name, Expired/Join, and Card Brand */}
            <div className="flex justify-between items-end relative z-10">
              <div className="space-y-0.5">
                <p className="text-[7px] text-white/50 font-bold tracking-wider leading-none">
                  CARDHOLDER
                </p>
                <p className="text-[10px] font-bold tracking-wide uppercase truncate max-w-[200px] text-white/90 leading-none">
                  {user.name}
                </p>
              </div>

              <div className="space-y-0.5 px-3">
                <p className="text-[7px] text-white/50 font-bold tracking-wider leading-none">
                  VALID THRU
                </p>
                <p className="text-[9px] font-mono font-bold tracking-wide text-white/90 leading-none">
                  09/29
                </p>
              </div>

              <div>
                <span className="text-[11px] font-black italic tracking-wider text-white/80 select-none flex items-center gap-0.5">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>POT</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Informasi Pekerjaan & Pengaturan List (Unified flat cards layout) */}
      <div className="space-y-3">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block text-left px-1.5">
          Informasi Pekerjaan
        </span>

        <div className="space-y-2.5">
          {/* Payroll Account Row (If no card/fallback view) */}
          {!user.rekening && (
            <div
              onClick={() => setIsEditPayrollOpen(true)}
              className="bg-white rounded-[24px] border border-gray-100/70 p-4 shadow-xs text-left flex items-center justify-between cursor-pointer hover:bg-zinc-50/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center text-[#e0542c] shrink-0">
                  <CreditCard className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-800">Rekening Payroll</p>
                  <p className="text-[9.5px] text-[#e0542c] font-semibold mt-0.5">Belum diatur</p>
                </div>
              </div>
              <ChevronRight className="w-4.5 h-4.5 text-zinc-400" />
            </div>
          )}

          {/* Work Schedule */}
          <div
            onClick={() => setIsJadwalShiftOpen(true)}
            className="bg-white rounded-[24px] border border-gray-100/70 p-4 shadow-xs text-left flex items-center justify-between cursor-pointer hover:bg-zinc-50/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#5c8a90] flex items-center justify-center text-white shrink-0 shadow-xs shadow-[#5c8a90]/10">
                <Clock className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-800">Jadwal & Shift Kerja</p>
                <p className="text-[9.5px] text-zinc-400 font-semibold mt-0.5">Shift Pagi (08:00 - 17:00)</p>
              </div>
            </div>
            <ChevronRight className="w-4.5 h-4.5 text-zinc-400" />
          </div>

          {/* Digital Employee ID Card */}
          <div
            onClick={() => navigate("MobileIdCard")}
            className="bg-white rounded-[24px] border border-gray-100/70 p-4 shadow-xs text-left flex items-center justify-between cursor-pointer hover:bg-zinc-50/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#e0542c]/10 flex items-center justify-center text-[#e0542c] shrink-0 shadow-xs shadow-[#e0542c]/5">
                <CreditCard className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-800">Kartu Pegawai Digital</p>
                <p className="text-[9.5px] text-zinc-400 font-semibold mt-0.5">Lihat kartu identitas pegawai</p>
              </div>
            </div>
            <ChevronRight className="w-4.5 h-4.5 text-zinc-400" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block text-left px-1.5">
          Keamanan & Bantuan
        </span>

        <div className="space-y-2.5">
          {/* Security */}
          <div
            onClick={() => setIsChangePasswordOpen(true)}
            className="bg-white rounded-[24px] border border-gray-100/70 p-4 shadow-xs text-left flex items-center justify-between cursor-pointer hover:bg-zinc-50/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#334c7a] flex items-center justify-center text-white shrink-0 shadow-xs shadow-[#334c7a]/10">
                <Lock className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-800">Keamanan Akun</p>
                <p className="text-[9.5px] text-zinc-400 font-semibold mt-0.5">Ganti kata sandi akun</p>
              </div>
            </div>
            <ChevronRight className="w-4.5 h-4.5 text-zinc-400" />
          </div>

          {/* Help */}
          <div
            onClick={() => setIsHelpCenterOpen(true)}
            className="bg-white rounded-[24px] border border-gray-100/70 p-4 shadow-xs text-left flex items-center justify-between cursor-pointer hover:bg-zinc-50/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#7fa46d] flex items-center justify-center text-white shrink-0 shadow-xs shadow-[#7fa46d]/10">
                <HelpCircle className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-800">Bantuan & Kontak</p>
                <p className="text-[9.5px] text-zinc-400 font-semibold mt-0.5">Hubungi CS & panduan aplikasi</p>
              </div>
            </div>
            <ChevronRight className="w-4.5 h-4.5 text-zinc-400" />
          </div>

          {/* Terms */}
          <div
            onClick={() => setIsTermsAndPrivacyOpen(true)}
            className="bg-white rounded-[24px] border border-gray-100/70 p-4 shadow-xs text-left flex items-center justify-between cursor-pointer hover:bg-zinc-50/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#f25c2a] flex items-center justify-center text-white shrink-0 shadow-xs shadow-[#f25c2a]/10">
                <ShieldAlert className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-800">Syarat & Ketentuan</p>
                <p className="text-[9.5px] text-zinc-400 font-semibold mt-0.5">Kebijakan privasi & aturan</p>
              </div>
            </div>
            <ChevronRight className="w-4.5 h-4.5 text-zinc-400" />
          </div>
        </div>
      </div>

      {/* Logout Button at the bottom */}
      {onLogout && (
        <div className="pt-2">
          <Button
            onClick={onLogout}
            className="w-full h-10 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs text-xs border-0"
          >
            <Logout className="w-4 h-4" />
            <span>Keluar Akun</span>
          </Button>
        </div>
      )}

      {/* Drawers */}
      <EditProfileDrawer
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        user={user}
        onSave={handleSaveProfile}
      />

      <EditPayrollDrawer
        isOpen={isEditPayrollOpen}
        onClose={() => setIsEditPayrollOpen(false)}
        user={user}
        onSave={handleSaveProfile}
      />

      <ChangePasswordDrawer
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        onSave={handleSavePassword}
      />

      <JadwalShiftDrawer
        isOpen={isJadwalShiftOpen}
        onClose={() => setIsJadwalShiftOpen(false)}
      />

      <HelpCenterDrawer
        isOpen={isHelpCenterOpen}
        onClose={() => setIsHelpCenterOpen(false)}
      />

      <TermsAndPrivacyDrawer
        isOpen={isTermsAndPrivacyOpen}
        onClose={() => setIsTermsAndPrivacyOpen(false)}
      />
    </div>
  );
}
