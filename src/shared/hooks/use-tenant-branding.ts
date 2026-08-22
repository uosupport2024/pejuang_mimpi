import { useState, useEffect } from "react";
import { getTenantBranding, subscribeTenantBranding, loadTenantBranding, type TenantBranding } from "../utils/tenant-branding";
import logoWhiteImg from "@/assets/logo/POT–PejuangMimpi–Logo.png";

export function useTenantBranding() {
  const [branding, setBranding] = useState<TenantBranding | null>(() => getTenantBranding());

  useEffect(() => {
    // Initial fetch if not yet loaded
    if (!branding) {
      loadTenantBranding().then((data) => {
        if (data) setBranding(data);
      });
    }

    const unsubscribe = subscribeTenantBranding(() => {
      setBranding(getTenantBranding());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    branding,
    logoUrl: branding?.logo_url || null,
    defaultLogo: logoWhiteImg,
    effectiveLogo: branding?.logo_url || logoWhiteImg,
    tenantName: branding?.name || "Pejuang Mimpi",
    mainColor: branding?.main_color || null,
    subColor: branding?.sub_color || null,
  };
}
