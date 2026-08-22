import { useState, useEffect } from "react"
import { LoginPage } from "@/features/auth"
import { MainContainer } from "@/shared/components/layout/main-container"
import type { LoginResponse } from "@/features/auth"
import { Toaster } from "@/shared/components/ui/sonner"
import { ConfirmationModal } from "@/shared/components/ui/confirmation-modal"
import { setCookie, getCookie, eraseCookie } from "@/shared/utils/cookies"

import { RouterProvider, useRouter } from "@/shared/router/router"
import { loadTenantPermissions, isMenuEnabled, subscribePermissions } from "@/shared/utils/tenant-permissions"
import { loadTenantBranding } from "@/shared/utils/tenant-branding"
import { AppLoadingSkeleton } from "@/shared/components/layout/app-loading-skeleton"
import { toast } from "sonner"

interface UserProfile {
  name: string;
  email: string;
  role: string;
  tenant_id?: number | string;
  tenant?: any;
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
  const [isPermLoading, setIsPermLoading] = useState(true);

  const userTenantId = session?.user?.tenant_id || (session?.user as any)?.tenant?.id || (session?.user as any)?.tenant_list?.[0]?.tenant_id || 3;

  // Load tenant permissions and branding on session startup
  useEffect(() => {
    if (!session) {
      setIsPermLoading(false);
      return;
    }

    let isMounted = true;
    loadTenantBranding();
    loadTenantPermissions(userTenantId).then(() => {
      if (isMounted) setIsPermLoading(false);
    });

    const unsubscribe = subscribePermissions(() => {
      if (isMounted) setIsPermLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [session, userTenantId]);

  // Redirect and route guards based on login session, role, and tenant permissions
  useEffect(() => {
    // Wait until cookies and tenant permissions have finished loading
    if (isInitializing || isPermLoading) return;

    if (!session) {
      console.warn(
        "%c[AUTH GUARD] %cUnauthenticated access attempt! Redirecting to Login...",
        "background: #e0542c; color: #fff; font-weight: bold; padding: 2px 6px; border-radius: 4px;",
        "color: #e0542c; font-weight: bold;"
      );
      if (currentRoute !== "Login") {
        navigate("Login");
      }
    } else {
      const isMobileRoute = currentRoute === "MobileHome" ||
        currentRoute === "MobileLumbung" ||
        currentRoute === "MobileAyamku" ||
        currentRoute === "MobilePakan" ||
        currentRoute === "MobilePakanLearn" ||
        currentRoute === "MobileProfile" ||
        currentRoute === "MobileCelenganDetail" ||
        currentRoute === "MobileCelenganAdd" ||
        currentRoute === "MobileLokerDetail" ||
        currentRoute === "MobileAbsensi" ||
        currentRoute === "MobileLemburAbsensi" ||
        currentRoute === "MobileLemburHistory" ||
        currentRoute === "MobileKoreksiAbsen" ||
        currentRoute === "MobileHistory" ||
        currentRoute === "MobileLeaveRequest" ||
        currentRoute === "MobileLeaveHistory" ||
        currentRoute === "MobileIdCard";

      // 🛑 TENANT PERMISSION ROUTE BLOCKING GUARD
      // Even if user types/hardcodes link directly in address bar, block if menu is OFF for tenant!
      if (!isMenuEnabled(currentRoute, userTenantId)) {
        console.warn(
          `%c[TENANT PERMISSION BLOCKED] %cRoute '${currentRoute}' is OFF for this tenant. Access Denied. Redirecting...`,
          "background: #e0542c; color: #fff; font-weight: bold; padding: 2px 6px; border-radius: 4px;",
          "color: #e0542c; font-weight: bold;"
        );
        toast.error("Akses Fitur Dibatasi", {
          description: `Fitur/menu ${currentRoute} telah dinonaktifkan oleh Administrator Tenant.`,
        });

        if (session.user.role === "Administrator") {
          navigate("Dashboard");
        } else {
          navigate("MobileHome");
        }
        return;
      }

      if (session.user.role === "Administrator") {
        // Strict guard for Super Admin routes (admin@gmail.com only)
        if (
          (currentRoute === "TenantMapping" || currentRoute === "TenantManagement") &&
          session.user.email?.toLowerCase() !== "admin@gmail.com"
        ) {
          console.warn(
            `%c[SUPER ADMIN GUARD] %cUser '${session.user.email}' is not admin@gmail.com. Redirecting to Dashboard...`,
            "background: #e0542c; color: #fff; font-weight: bold; padding: 2px 6px; border-radius: 4px;",
            "color: #1e2a4a; font-weight: bold;"
          );
          navigate("Dashboard");
          return;
        }

        // Administrator role must stay on desktop routes
        if (currentRoute === "Login" || window.location.pathname === "/" || isMobileRoute) {
          console.warn(
            `%c[ROLE GUARD REDIRECT] %cAdmin '${session.user.name}' tried accessing mobile/login route. Redirecting to Dashboard...`,
            "background: #e0542c; color: #fff; font-weight: bold; padding: 2px 6px; border-radius: 4px;",
            "color: #1e2a4a; font-weight: bold;"
          );
          navigate("Dashboard");
        } else {
          console.log(
            `%c[ROLE GUARD PASSED] %cRole: ${session.user.role} | User: ${session.user.name} | Route: ${currentRoute}`,
            "background: #1e2a4a; color: #fee279; font-weight: bold; padding: 2px 6px; border-radius: 4px;",
            "color: #1e2a4a; font-weight: bold;"
          );
        }
      } else {
        // User (Staff) role must stay on mobile routes
        if (currentRoute === "Login" || window.location.pathname === "/" || !isMobileRoute) {
          console.warn(
            `%c[ROLE GUARD REDIRECT] %cUser '${session.user.name}' tried accessing desktop/login route. Redirecting to Mobile Home...`,
            "background: #e0542c; color: #fff; font-weight: bold; padding: 2px 6px; border-radius: 4px;",
            "color: #e0542c; font-weight: bold;"
          );
          navigate("MobileHome");
        } else {
          console.log(
            `%c[ROLE GUARD PASSED] %cRole: ${session.user.role || "User"} | User: ${session.user.name} | Mobile Route: ${currentRoute}`,
            "background: #7FA46D; color: #fff; font-weight: bold; padding: 2px 6px; border-radius: 4px;",
            "color: #5e804d; font-weight: bold;"
          );
        }
      }
    }
  }, [session, isInitializing, isPermLoading, currentRoute, navigate]);

  // Skeleton Loading Screen while reading session cookies & tenant permissions
  if (isInitializing || isPermLoading) {
    return <AppLoadingSkeleton />;
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

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // isInitializing=true until we've attempted to read cookies
  const [isInitializing, setIsInitializing] = useState(true)

  // Load session from cookies on mount
  useEffect(() => {
    const token = getCookie("auth_token")
    const userProfileStr = getCookie("user_profile")

    if (token && userProfileStr) {
      try {
        const user = JSON.parse(userProfileStr) as UserProfile
        const userTenantId = (user as any).tenant_id || (user as any).tenant?.id || (user as any).tenant_list?.[0]?.tenant_id || 3;
        setSession({ token, user })
        console.info(
          `%c[AUTH SESSION LOADED] %cLogged in as '${user.name}' (${user.role || "User"}) | Tenant ID: ${userTenantId}`,
          "background: #7FA46D; color: #fff; font-weight: bold; padding: 2px 6px; border-radius: 4px;",
          "color: #1f2937; font-weight: bold;",
          user
        );
      } catch (e) {
        console.error("[AUTH SESSION] Failed to parse user profile from cookies", e)
        // Clean up corrupt cookies
        eraseCookie("auth_token")
        eraseCookie("user_profile")
      }
    } else {
      console.info(
        "%c[AUTH SESSION] %cNo active session found in cookies.",
        "background: #9ca3af; color: #fff; font-weight: bold; padding: 2px 6px; border-radius: 4px;",
        "color: #6b7280;"
      );
    }

    // Mark initialization complete regardless of whether session was found
    setIsInitializing(false)
  }, [])

  const handleLoginSuccess = (response: LoginResponse) => {
    if (response.success && response.token && response.user) {
      const userTenantId = (response.user as any).tenant_id || (response.user as any).tenant?.id || (response.user as any).tenant_list?.[0]?.tenant_id || 3;

      const userProfile: UserProfile = {
        name: response.user.name,
        email: response.user.email,
        role: response.user.role,
        tenant_id: userTenantId,
        tenant: (response.user as any).tenant,
        is_admin: response.user.is_admin,
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

      console.info(
        `%c[LOGIN SUCCESS LOG] %cUser '${userProfile.name}' logged in successfully with Role: '${userProfile.role}' | Tenant ID: ${userTenantId}`,
        "background: #7FA46D; color: #fff; font-weight: bold; padding: 2px 6px; border-radius: 4px;",
        "color: #1f2937; font-weight: bold;",
        userProfile
      );

      // Save token and profile in cookies
      setCookie("auth_token", response.token)
      setCookie("user_profile", JSON.stringify(userProfile))

      setSession({
        token: response.token,
        user: userProfile,
      })
    }
  }

  const handleUpdateUser = (updatedUser: UserProfile) => {
    console.info(
      `%c[PROFILE UPDATE LOG] %cUser profile updated:`,
      "background: #5C8A90; color: #fff; font-weight: bold; padding: 2px 6px; border-radius: 4px;",
      "color: #1f2937; font-weight: bold;",
      updatedUser
    );
    setSession(prev => prev ? { ...prev, user: updatedUser } : null)
    setCookie("user_profile", JSON.stringify(updatedUser))
  }

  const handleLogout = () => {
    setShowLogoutConfirm(true)
  }

  const executeLogout = () => {
    console.warn(
      "%c[LOGOUT LOG] %cUser session cleared & logged out.",
      "background: #e0542c; color: #fff; font-weight: bold; padding: 2px 6px; border-radius: 4px;",
      "color: #e0542c; font-weight: bold;"
    );
    // Clear cookies
    eraseCookie("auth_token")
    eraseCookie("user_profile")
    setSession(null)
    setShowLogoutConfirm(false)
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
      <ConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={executeLogout}
        title="Konfirmasi Keluar"
        message="Apakah Anda yakin ingin keluar dari akun ini?"
        confirmText="Ya, Keluar"
        cancelText="Batal"
        variant="danger"
      />
    </RouterProvider>
  )
}

export default App

