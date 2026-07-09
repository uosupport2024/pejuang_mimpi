import { useState, useEffect } from "react"
import { LoginPage } from "@/features/auth"
import { MainContainer } from "@/shared/components/layout/main-container"
import type { LoginResponse } from "@/features/auth"
import { Toaster } from "@/shared/components/ui/sonner"
import { setCookie, getCookie, eraseCookie } from "@/shared/utils/cookies"

import { RouterProvider, useRouter } from "@/shared/router/router"

interface UserProfile {
  name: string;
  email: string;
  role: string;
  telepon?: string;
  gender?: string;
  tgl_join?: string;
  status_nikah?: string;
  rekening?: string;
  bank?: string;
  gaji_pokok?: number;
  lembur?: number;
  izin?: number;
  status?: string;
}

interface AppContentProps {
  session: { token: string; user: UserProfile } | null;
  isInitializing: boolean;
  handleLoginSuccess: (response: LoginResponse) => void;
  handleLogout: () => void;
  onUpdateUser: (user: UserProfile) => void;
}

function AppContent({ session, isInitializing, handleLoginSuccess, handleLogout, onUpdateUser }: AppContentProps) {
  const { currentRoute, navigate } = useRouter();

  // Redirect and route guards based on login session and path
  useEffect(() => {
    // Wait until cookies have been read before running any guard
    if (isInitializing) return;

    if (!session) {
      // If not logged in, force navigation to Login (/auth/login)
      if (currentRoute !== "Login") {
        navigate("Login");
      }
    } else {
      const isMobileRoute = currentRoute === "MobileHome" || 
                            currentRoute === "MobileLumbung" ||
                            currentRoute === "MobileAyamku" ||
                            currentRoute === "MobilePakan" || 
                            currentRoute === "MobileProfile" ||
                            currentRoute === "MobileCelenganDetail" ||
                            currentRoute === "MobileCelenganAdd" ||
                            currentRoute === "MobileLokerDetail" ||
                            currentRoute === "MobileAbsensi" ||
                            currentRoute === "MobileHistory";

      if (session.user.role === "Administrator") {
        // Administrator role must stay on desktop routes
        if (currentRoute === "Login" || window.location.pathname === "/" || isMobileRoute) {
          navigate("Dashboard");
        }
      } else {
        // User (Staff) role must stay on mobile routes
        if (currentRoute === "Login" || window.location.pathname === "/" || !isMobileRoute) {
          navigate("MobileHome");
        }
      }
    }
  }, [session, isInitializing, currentRoute, navigate]);

  // Render nothing during initialization to prevent flash-to-login on refresh
  if (isInitializing) {
    return null;
  }

  if (!session) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Prevent flash of page content if logged in but still on the Login route internally
  if (currentRoute === "Login") {
    return null;
  }

  return <MainContainer user={session.user} onLogout={handleLogout} onUpdateUser={onUpdateUser} />;
}

function App() {
  const [session, setSession] = useState<{
    token: string;
    user: UserProfile;
  } | null>(null)

  // isInitializing=true until we've attempted to read cookies
  const [isInitializing, setIsInitializing] = useState(true)

  // Load session from cookies on mount
  useEffect(() => {
    const token = getCookie("auth_token")
    const userProfileStr = getCookie("user_profile")
    
    if (token && userProfileStr) {
      try {
        const user = JSON.parse(userProfileStr) as UserProfile
        setSession({ token, user })
      } catch (e) {
        console.error("Failed to parse user profile from cookies", e)
        // Clean up corrupt cookies
        eraseCookie("auth_token")
        eraseCookie("user_profile")
      }
    }

    // Mark initialization complete regardless of whether session was found
    setIsInitializing(false)
  }, [])

  const handleLoginSuccess = (response: LoginResponse) => {
    if (response.success && response.token && response.user) {
      const userProfile: UserProfile = {
        name: response.user.name,
        email: response.user.email,
        role: response.user.role,
        telepon: response.user.telepon,
        gender: response.user.gender,
        tgl_join: response.user.tgl_join,
        status_nikah: response.user.status_nikah,
        rekening: response.user.rekening,
        bank: response.user.bank,
        gaji_pokok: response.user.gaji_pokok,
        lembur: response.user.lembur,
        izin: response.user.izin,
        status: response.user.status,
      }

      // Save token and profile in cookies (not localStorage)
      setCookie("auth_token", response.token)
      setCookie("user_profile", JSON.stringify(userProfile))

      setSession({
        token: response.token,
        user: userProfile,
      })
    }
  }

  const handleUpdateUser = (updatedUser: UserProfile) => {
    setSession(prev => prev ? { ...prev, user: updatedUser } : null)
    setCookie("user_profile", JSON.stringify(updatedUser))
  }

  const handleLogout = () => {
    // Clear cookies
    eraseCookie("auth_token")
    eraseCookie("user_profile")
    setSession(null)
  }

  return (
    <RouterProvider>
      <AppContent 
        session={session}
        isInitializing={isInitializing}
        handleLoginSuccess={handleLoginSuccess}
        handleLogout={handleLogout}
        onUpdateUser={handleUpdateUser}
      />
      <Toaster position="top-center" richColors />
    </RouterProvider>
  )
}

export default App

