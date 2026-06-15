import { LoginForm } from "../components/login-form"
import type { LoginResponse } from "../types/login.type"
import { THEME_COLORS } from "@/shared/constants/colors"
import coinImg from "@/assets/illustrations/Coins-amico.png"

interface LoginPageProps {
  onLoginSuccess: (response: LoginResponse) => void
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {

  const c = THEME_COLORS.classes

  return (
    <div className={`min-h-screen w-full flex items-center justify-center ${c.outerBg} p-4 md:p-8 lg:p-12 font-sans relative overflow-hidden`}>


      {/* Inner Rounded Board Container */}
      <div className="w-full max-w-5xl bg-white rounded-[32px] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px] border border-white/10">

        {/* Left Side: Login Form (Warm Cream Background) */}
        <div className="lg:col-span-6 bg-[#f5f4ed] p-8 md:p-12 flex flex-col justify-center items-center">
          <LoginForm onLoginSuccess={onLoginSuccess} />
        </div>

        {/* Right Side: Introduction & Skyline illustration (Solid White Background) */}
        <div className="hidden lg:col-span-6 lg:flex flex-col justify-between bg-white pt-12 px-12 relative overflow-hidden">

          {/* Quote Block with tight margins */}
          <div className="max-w-md z-10 text-left">
            {/* Yellow Quote Mark */}
            <span className="text-5xl font-serif text-[#fee279] leading-none block select-none -mb-3">“</span>

            <p className="text-gray-800 text-sm font-semibold leading-relaxed pl-2 relative z-10">
              Konsistensi dimulai dari kehadiran setiap hari. Bekerjalah dengan sepenuh hati hari ini, dan tabunglah hasilnya demi membangun mimpi esok hari. Langkah kecil kita saat ini adalah pondasi kesuksesan di masa depan.
            </p>

            {/* Yellow Quote Mark Right */}
            <span className="text-5xl font-serif text-[#fee279] leading-none block text-right select-none -mt-4">”</span>
          </div>

          {/* Enlarged Coin Image Illustration at Bottom */}
          <div className="w-full max-w-[340px] mx-auto mt-auto mb-6 relative z-0 select-none pointer-events-none">
            <img
              src={coinImg}
              alt="Coins Illustration"
              className="w-full h-auto max-h-[280px] object-contain mx-auto"
            />
          </div>
        </div>

      </div>
    </div>
  )
}
