import { useState, useEffect } from "react";
import { X, Lock, KeyRound, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { changePasswordOnBackend } from "@/features/sarang/api/profile";
import { toast } from "sonner";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isAnimating, setIsAnimating] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
      setErrorMessage("");
      const timer = setTimeout(() => setIsAnimating(true), 30);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setShouldRender(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  const isMatching = confirmPassword.length > 0 && newPassword === confirmPassword;
  const isMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const isMinLength = newPassword.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!currentPassword) {
      setErrorMessage("Kata sandi saat ini wajib diisi.");
      return;
    }
    if (!newPassword) {
      setErrorMessage("Kata sandi baru wajib diisi.");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage("Kata sandi baru minimal harus 6 karakter.");
      return;
    }
    if (newPassword === currentPassword) {
      setErrorMessage("Kata sandi baru tidak boleh sama dengan kata sandi saat ini.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("Konfirmasi kata sandi baru tidak cocok.");
      return;
    }

    try {
      setLoading(true);
      const res = await changePasswordOnBackend(currentPassword, newPassword);
      if (res.success) {
        toast.success(res.message || "Kata sandi berhasil diperbarui!");
        onClose();
      } else {
        setErrorMessage(res.message || "Gagal memperbarui kata sandi. Periksa kata sandi lama Anda.");
      }
    } catch (err: any) {
      setErrorMessage("Terjadi kesalahan. Gagal memperbarui kata sandi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden text-left">
      {/* Backdrop Overlay with 500ms Smooth Fade */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity duration-500 ease-in-out ${
          isAnimating ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Right Side Drawer with 500ms Smooth Slide Transition */}
      <div
        className={`fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col h-full overflow-hidden transition-transform duration-500 ease-out transform ${
          isAnimating ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1e2a4a]/10 text-[#1e2a4a] flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-zinc-900 leading-tight">Ubah Kata Sandi</h3>
              <p className="text-[11px] font-medium text-zinc-400 mt-0.5">
                Perbarui kata sandi akun Anda demi keamanan
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500 hover:text-zinc-800 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs font-semibold text-zinc-700">
            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl text-rose-700 text-xs font-medium flex items-start gap-2.5 animate-in fade-in duration-300">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Current Password Field */}
            <div className="space-y-1.5">
              <label className="text-zinc-700 font-extrabold block text-[11px] uppercase tracking-wider">
                Kata Sandi Saat Ini
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  required
                  placeholder="Masukkan kata sandi saat ini"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full h-11 pl-3.5 pr-10 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-800 focus:outline-none focus:border-[#1e2a4a] focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-zinc-700 font-extrabold block text-[11px] uppercase tracking-wider">
                  Kata Sandi Baru
                </label>
                {newPassword.length > 0 && (
                  <span className={`text-[10px] font-bold ${isMinLength ? "text-emerald-600" : "text-amber-600"}`}>
                    {isMinLength ? "✓ Minimal 6 karakter" : "Minimal 6 karakter"}
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  required
                  placeholder="Masukkan kata sandi baru (min. 6 karakter)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full h-11 pl-3.5 pr-10 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-800 focus:outline-none focus:border-[#1e2a4a] focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-zinc-700 font-extrabold block text-[11px] uppercase tracking-wider">
                  Konfirmasi Kata Sandi Baru
                </label>
                {isMatching && (
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Cocok
                  </span>
                )}
                {isMismatch && (
                  <span className="text-[10px] font-bold text-rose-500">
                    Tidak cocok
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  placeholder="Ketik ulang kata sandi baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full h-11 pl-3.5 pr-10 bg-zinc-50 border rounded-xl text-xs font-medium text-zinc-800 focus:outline-none transition-all ${
                    isMismatch
                      ? "border-rose-400 focus:border-rose-500 bg-rose-50/20"
                      : isMatching
                      ? "border-emerald-400 focus:border-emerald-500 bg-emerald-50/10"
                      : "border-zinc-200 focus:border-[#1e2a4a] focus:bg-white"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Fixed Drawer Footer Actions */}
          <div className="p-6 border-t border-zinc-100 bg-zinc-50/60 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 font-bold text-xs hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#e0542c] hover:bg-[#c84420] text-white rounded-xl font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2 active:scale-95 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
