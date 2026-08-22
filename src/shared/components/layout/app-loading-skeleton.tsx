import { Loader2 } from "lucide-react";
import { useTenantBranding } from "@/shared/hooks/use-tenant-branding";
import { THEME_COLORS } from "@/shared/constants/colors";

export function AppLoadingSkeleton() {
  const { effectiveLogo, tenantName } = useTenantBranding();

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white p-4 select-none">
      <div className="flex flex-col items-center justify-center text-center space-y-4 max-w-xs animate-in fade-in duration-300">
        {/* Tenant / App Logo */}
        {effectiveLogo && (
          <div className="w-14 h-14 rounded-2xl bg-zinc-50 border border-zinc-100 p-2.5 flex items-center justify-center shadow-xs">
            <img
              src={effectiveLogo}
              alt={tenantName || "Logo"}
              className="w-full h-full object-contain"
            />
          </div>
        )}

        {/* Spinner */}
        <div className="relative flex items-center justify-center">
          <Loader2
            className="w-7 h-7 animate-spin"
            style={{ color: THEME_COLORS.hex.primary }}
          />
        </div>

        {/* Text Notice */}
        <div className="space-y-0.5">
          <p className="text-sm font-bold text-zinc-800 tracking-tight">
            Memuat Aplikasi
          </p>
          <p className="text-xs text-zinc-500 font-normal">
            Mohon tunggu sebentar...
          </p>
        </div>
      </div>
    </div>
  );
}
