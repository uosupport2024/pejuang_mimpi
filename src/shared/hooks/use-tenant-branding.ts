import { useState, useEffect, useMemo } from "react";
import { getTenantBranding, subscribeTenantBranding, loadTenantBranding, type TenantBranding } from "../utils/tenant-branding";
import { getSubColorHex, parseSubColor, buildCssBackground, THEME_COLORS } from "@/shared/constants/colors";
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

  const subColors = useMemo(() => {
    return branding?.subColors || parseSubColor(branding?.sub_color);
  }, [branding]);

  const subColor = useMemo(() => {
    return getSubColorHex(branding?.sub_color, subColors.sub || THEME_COLORS.hex.primary);
  }, [branding, subColors]);

  const sidebarBg = useMemo(() => {
    return buildCssBackground(subColors.sidebar || branding?.main_color, THEME_COLORS.hex.navBg);
  }, [subColors, branding]);

  const navbarBg = useMemo(() => {
    return buildCssBackground(subColors.navbar || subColors.navBg || branding?.main_color, THEME_COLORS.hex.navBg);
  }, [subColors, branding]);

  const buttonColor = useMemo(() => {
    return subColors.button || subColors.accent || subColor || THEME_COLORS.hex.primary;
  }, [subColors, subColor]);

  const sidebarBgStyle = useMemo(() => ({ background: sidebarBg }), [sidebarBg]);
  const navbarBgStyle = useMemo(() => ({ background: navbarBg }), [navbarBg]);
  const buttonColorStyle = useMemo(() => ({ background: buttonColor }), [buttonColor]);

  return {
    branding,
    logoUrl: branding?.logo_url || null,
    defaultLogo: logoWhiteImg,
    effectiveLogo: branding?.logo_url || logoWhiteImg,
    tenantName: branding?.name || "Pejuang Mimpi",
    mainColor: branding?.main_color || null,
    subColor: subColor || null,
    subColors,
    sidebarBg,
    sidebarBgStyle,
    navbarBg,
    navbarBgStyle,
    buttonColor,
    buttonColorStyle,
  };
}


