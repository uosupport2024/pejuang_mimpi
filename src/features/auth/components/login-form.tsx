import { useState } from "react"
import { useLogin } from "../hooks/use-login"
import type { LoginResponse } from "../types/login.type"
import { Button } from "@/shared/components/ui/button"
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react"
import { THEME_COLORS } from "@/shared/constants/colors"

interface LoginFormProps {
  onLoginSuccess: (response: LoginResponse) => void
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const {
    username,
    setUsername,
    password,
    setPassword,
    errors,
    isLoading,
    handleSubmit,
  } = useLogin(onLoginSuccess)

  const [showPassword, setShowPassword] = useState(false)
  const c = THEME_COLORS.classes

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2
          style={{ color: THEME_COLORS.hex.outerBg }}
          className="text-3xl font-bold tracking-tight mb-2"
        >
          Masuk
        </h2>
        <p className="text-xs text-gray-500 font-light">
          Selamat datang kembali! Silakan masukkan detail Anda untuk melanjutkan
        </p>
      </div>

      {errors.form && (
        <div className="mb-6 p-3 rounded-xl bg-destructive/10 text-destructive text-sm border border-destructive/20 text-center animate-shake">
          {errors.form}
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username */}
        <div className="space-y-1.5 text-left">
          <label
            style={{ color: THEME_COLORS.hex.outerBg }}
            className="text-xs font-bold flex items-center"
          >
            Username <span style={{ color: THEME_COLORS.hex.accentBlue }} className="ml-0.5">*</span>
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 transition-colors">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Masukkan username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-transparent rounded-full text-xs transition-all focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400 shadow-xs placeholder:text-gray-400 text-gray-800"
              disabled={isLoading}
            />
          </div>
          {errors.username && (
            <p className="text-[10px] text-destructive mt-0.5 font-medium pl-2">{errors.username}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5 text-left">
          <div className="flex justify-between items-center">
            <label
              style={{ color: THEME_COLORS.hex.outerBg }}
              className="text-xs font-bold flex items-center"
            >
              Kata Sandi <span style={{ color: THEME_COLORS.hex.accentBlue }} className="ml-0.5">*</span>
            </label>
            <a
              href="#"
              style={{ color: THEME_COLORS.hex.accentBlue }}
              className="text-xs font-medium hover:underline"
            >
              Lupa kata sandi?
            </a>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 transition-colors">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Masukkan kata sandi"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-10 py-2.5 bg-white border border-transparent rounded-full text-xs transition-all focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400 shadow-xs placeholder:text-gray-400 text-gray-800"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-650"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[10px] text-destructive mt-0.5 font-medium pl-2">{errors.password}</p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className={`w-full justify-center py-2.5 ${c.buttonBg} ${c.buttonText} rounded-full font-bold ${c.buttonShadow} transition-all cursor-pointer mt-2`}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Menghubungkan...
            </>
          ) : (
            "Masuk"
          )}
        </Button>
      </form>

      {/* Sign Up Redirect */}
      <div className="text-center mt-4">
        <p className="text-xs text-gray-500 font-medium">
          Belum punya akun?{" "}
          <a
            href="#"
            style={{ color: THEME_COLORS.hex.accentBlue }}
            className="font-bold hover:underline"
          >
            Daftar
          </a>
        </p>
      </div>

    </div>
  )
}
