import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "@/shared/router/router";
import { menuItems } from "@/shared/router/menu";
import { API_BASE_URL, getHeaders, dedupFetch } from "@/shared/utils/api";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { isMenuEnabled, subscribePermissions } from "@/shared/utils/tenant-permissions";
import { useTenantBranding } from "@/shared/hooks/use-tenant-branding";
import { THEME_COLORS } from "@/shared/constants/colors";

let pendingCountsCache: { koreksi: number; cuti: number; timestamp: number } | null = null;

interface SidebarProps {
  user?: {
    name?: string;
    role?: string;
    email?: string;
  };
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ user, isMobileOpen = false, onCloseMobile }: SidebarProps) {
  const { currentRoute, navigate } = useRouter();
  const { effectiveLogo, tenantName, sidebarBgStyle, sidebarBg, buttonColor } = useTenantBranding();
  const accentColor = buttonColor || THEME_COLORS.hex.primary;
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("sidebar_collapsed") === "true";
  });
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  const [activeHoverMenu, setActiveHoverMenu] = useState<string | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingCutiCount, setPendingCutiCount] = useState(0);
  const [, setPermissionTick] = useState(0);

  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return subscribePermissions(() => {
      setPermissionTick((t) => t + 1);
    });
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar_collapsed", String(next));
      return next;
    });
  };

  const handleNavigate = (route: any) => {
    onCloseMobile?.();
    navigate(route);
  };

  const fetchPendingCount = useCallback(async (force = false) => {
    if (!force && pendingCountsCache && Date.now() - pendingCountsCache.timestamp < 30000) {
      setPendingCount(pendingCountsCache.koreksi);
      setPendingCutiCount(pendingCountsCache.cuti);
      return;
    }

    try {
      const koreksiPromise = dedupFetch(`${API_BASE_URL}/koreksi-absen?status=Pending&per_page=1`, {
        method: "GET",
        headers: getHeaders(),
      }).then((r) => (r.ok ? r.json() : null));

      const cutiPromise = dedupFetch(`${API_BASE_URL}/cuti/admin?status=Pending&per_page=1`, {
        method: "GET",
        headers: getHeaders(),
      }).then((r) => (r.ok ? r.json() : null));

      const [koreksiJson, cutiJson] = await Promise.all([koreksiPromise, cutiPromise]);

      const koreksiTotal = koreksiJson?.data?.total || 0;
      const cutiTotal = cutiJson?.data?.total || 0;

      pendingCountsCache = {
        koreksi: koreksiTotal,
        cuti: cutiTotal,
        timestamp: Date.now(),
      };

      setPendingCount(koreksiTotal);
      setPendingCutiCount(cutiTotal);
    } catch (err) {
      console.error("Failed to fetch pending counts:", err);
    }
  }, []);

  useEffect(() => {
    fetchPendingCount();

    const handleUpdate = () => {
      pendingCountsCache = null;
      fetchPendingCount(true);
    };

    window.addEventListener("koreksi-absen-updated", handleUpdate);
    window.addEventListener("cuti-updated", handleUpdate);

    const handleOpenMenu = (e: any) => {
      if (e.detail?.menuName) {
        setOpenDropdowns((prev) => ({
          ...prev,
          [e.detail.menuName]: true,
        }));
      }
    };

    window.addEventListener("open-sidebar-menu", handleOpenMenu as any);

    return () => {
      window.removeEventListener("koreksi-absen-updated", handleUpdate);
      window.removeEventListener("cuti-updated", handleUpdate);
      window.removeEventListener("open-sidebar-menu", handleOpenMenu as any);
    };
  }, [fetchPendingCount]);

  const toggleDropdown = (name: string) => {
    setOpenDropdowns((prev) => {
      const isAnySubActive = menuItems
        .find((i) => i.name === name)
        ?.subItems?.some((sub) => currentRoute === sub.route);
      const currentlyOpen = prev[name] !== undefined ? prev[name] : !!isAnySubActive;
      return {
        ...prev,
        [name]: !currentlyOpen,
      };
    });
  };

  const handleMouseEnterItem = (name: string, e: React.MouseEvent<HTMLElement>) => {
    if (isCollapsed) {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = null;
      }
      const rect = e.currentTarget.getBoundingClientRect();
      setPopoverPos({ top: rect.top, left: rect.right + 6 });
      setActiveHoverMenu(name);
    }
  };

  const handleMouseLeaveItem = () => {
    if (isCollapsed) {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
      hoverTimerRef.current = setTimeout(() => {
        setActiveHoverMenu(null);
        setPopoverPos(null);
      }, 250);
    }
  };

  const handlePopoverMouseEnter = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  const handlePopoverMouseLeave = () => {
    handleMouseLeaveItem();
  };

  const isSuperAdmin = user?.email?.toLowerCase() === "admin@gmail.com";

  const groups = isSuperAdmin
    ? (["Utama", "Data Master", "Operasional", "Layanan", "Super Admin"] as const)
    : (["Utama", "Data Master", "Operasional", "Layanan"] as const);

  const renderNavGroupContent = (collapsedState: boolean, isMobileView: boolean = false) => {
    return (
      <div className="flex-1 overflow-y-auto sidebar-scrollbar pb-4 pr-0.5 space-y-4">
        {groups.map((group) => {
          const groupItems = menuItems.filter(
            (item) => item.group === group && (!item.route || isMenuEnabled(item.route))
          );
          if (groupItems.length === 0) return null;

          return (
            <div key={group} className="space-y-1.5">
              {!collapsedState ? (
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 pl-3 block select-none transition-all duration-300 opacity-100">
                  {group}
                </span>
              ) : (
                <div className="my-2 border-t border-white/10 mx-2 transition-all duration-300" />
              )}

              <div className="space-y-1">
                {groupItems.map((item) => {
                  const Icon = item.icon;
                  const hasSubItems = !!item.subItems;
                  const isOpen =
                    openDropdowns[item.name] !== undefined
                      ? openDropdowns[item.name]
                      : !!(item.subItems?.some((sub) => currentRoute === sub.route));
                  const isAnySubActive =
                    hasSubItems && item.subItems?.some((sub) => currentRoute === sub.route);
                  const isActive = !hasSubItems && item.route && currentRoute === item.route;
                  const totalPendingGroup =
                    (item.name === "Pengajuan" ? pendingCount + pendingCutiCount : 0) ||
                    (item.badge ? 1 : 0);

                  // MODE COLLAPSED (DESKTOP MINIMIZED ONLY)
                  if (collapsedState && !isMobileView) {
                    return (
                      <div
                        key={item.name}
                        data-menu-id={item.name}
                        className="relative group flex justify-center"
                        onMouseEnter={(e) => handleMouseEnterItem(item.name, e)}
                        onMouseLeave={handleMouseLeaveItem}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            if (!hasSubItems && item.route) {
                              handleNavigate(item.route);
                            } else if (hasSubItems) {
                              handleMouseEnterItem(item.name, e);
                            }
                          }}
                          className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer relative active:scale-95 ${isActive || isAnySubActive
                            ? "text-white shadow-md font-semibold"
                            : "text-white/70 hover:text-white hover:bg-white/10"
                            }`}
                          style={isActive || isAnySubActive ? { backgroundColor: accentColor } : undefined}
                        >
                          <Icon size={20} weight="Linear" className="shrink-0 transition-transform group-hover:scale-110 duration-200" />

                          {totalPendingGroup > 0 && (
                            <span
                              style={{ borderColor: sidebarBg }}
                              className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 animate-pulse"
                            />
                          )}
                        </button>

                        {!hasSubItems && activeHoverMenu === item.name && popoverPos && (
                          <div
                            style={{ top: `${popoverPos.top + 4}px`, left: `${popoverPos.left}px`, backgroundColor: sidebarBg }}
                            className="fixed px-3 py-1.5 text-white text-xs font-semibold rounded-xl shadow-2xl whitespace-nowrap opacity-100 z-[9999] border border-white/15 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150 pointer-events-none select-none"
                          >
                            <span>{item.name}</span>
                            {item.badge && (
                              <span className="px-1.5 py-0.5 rounded bg-rose-500/30 text-rose-200 text-[9px] font-bold">
                                {item.badge}
                              </span>
                            )}
                          </div>
                        )}

                        {hasSubItems && activeHoverMenu === item.name && popoverPos && (
                          <div
                            onMouseEnter={handlePopoverMouseEnter}
                            onMouseLeave={handlePopoverMouseLeave}
                            style={{ top: `${popoverPos.top}px`, left: `${popoverPos.left}px`, backgroundColor: sidebarBg }}
                            className="fixed w-52 border border-white/15 rounded-2xl shadow-2xl z-[9999] p-2 space-y-1 text-white animate-in fade-in zoom-in-95 slide-in-from-left-2 duration-150 select-none before:absolute before:-left-3 before:top-0 before:bottom-0 before:w-4"
                          >
                            <div className="px-3 py-1.5 border-b border-white/10 flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-white/90">{item.name}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-white/40" />
                            </div>
                            {item.subItems?.map((sub) => {
                              const isSubActive = currentRoute === sub.route;
                              return (
                                <button
                                  key={sub.name}
                                  type="button"
                                  onClick={() => {
                                    if (hoverTimerRef.current) {
                                      clearTimeout(hoverTimerRef.current);
                                      hoverTimerRef.current = null;
                                    }
                                    setActiveHoverMenu(null);
                                    setPopoverPos(null);
                                    handleNavigate(sub.route);
                                  }}
                                  style={isSubActive ? { color: THEME_COLORS.hex.accent } : undefined}
                                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-150 cursor-pointer ${isSubActive
                                    ? "font-bold bg-white/15"
                                    : "text-white/70 hover:text-white hover:bg-white/10"
                                    }`}
                                >
                                  <span>{sub.name}</span>
                                  {sub.route === "KoreksiAbsenApproval" && pendingCount > 0 && (
                                    <span
                                      style={{ backgroundColor: accentColor }}
                                      className="px-2 py-0.5 rounded-md text-[9px] font-bold text-white"
                                    >
                                      {pendingCount}
                                    </span>
                                  )}
                                  {sub.route === "Leave" && pendingCutiCount > 0 && (
                                    <span
                                      style={{ backgroundColor: accentColor }}
                                      className="px-2 py-0.5 rounded-md text-[9px] font-bold text-white"
                                    >
                                      {pendingCutiCount}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  // MODE EXPANDED (MAXIMIZED & MOBILE)
                  if (hasSubItems) {
                    return (
                      <div key={item.name} data-menu-id={item.name} className="space-y-0.5">
                        <button
                          type="button"
                          onClick={() => toggleDropdown(item.name)}
                          style={isAnySubActive ? { backgroundColor: accentColor } : undefined}
                          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${isAnySubActive
                            ? "text-white shadow-md font-semibold"
                            : "text-white/70 hover:text-white hover:bg-white/10"
                            }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Icon
                              size={18}
                              weight="Linear"
                              className={`shrink-0 transition-colors duration-200 ${isAnySubActive ? "text-white" : "text-white/60"
                                }`}
                            />
                            <span className="truncate">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {((item.name === "Pengajuan" && pendingCount + pendingCutiCount > 0) ||
                              item.badge) && (
                                <span
                                  className={`px-2 py-0.5 rounded-md text-[9px] font-semibold ${isAnySubActive ? "bg-white/20 text-white" : "bg-rose-500/20 text-rose-300"
                                    }`}
                                >
                                  {item.name === "Pengajuan" && pendingCount + pendingCutiCount > 0
                                    ? pendingCount + pendingCutiCount
                                    : item.badge}
                                </span>
                              )}
                            <svg
                              className={`w-3 h-3 transition-transform duration-200 ${isAnySubActive ? "text-white" : "text-white/60"
                                } ${isOpen ? "rotate-180" : ""}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>

                        {isOpen && (
                          <div className="pl-9 pr-2 py-0.5 space-y-0.5 transition-all duration-200 animate-in fade-in slide-in-from-top-1">
                            {item.subItems?.map((sub) => {
                              const isSubActive = currentRoute === sub.route;
                              return (
                                <button
                                  key={sub.name}
                                  data-menu-id={`${item.name} - ${sub.name}`}
                                  type="button"
                                  onClick={() => handleNavigate(sub.route)}
                                  style={isSubActive ? { color: THEME_COLORS.hex.accent } : undefined}
                                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-all duration-150 cursor-pointer ${isSubActive
                                    ? "font-bold bg-white/10"
                                    : "text-white/60 hover:text-white hover:bg-white/5"
                                    }`}
                                >
                                  <span>{sub.name}</span>
                                  {sub.route === "KoreksiAbsenApproval" && pendingCount > 0 && (
                                    <span
                                      style={{ backgroundColor: accentColor }}
                                      className="px-2 py-0.5 rounded-md text-[9px] font-bold text-white"
                                    >
                                      {pendingCount}
                                    </span>
                                  )}
                                  {sub.route === "Leave" && pendingCutiCount > 0 && (
                                    <span
                                      style={{ backgroundColor: accentColor }}
                                      className="px-2 py-0.5 rounded-md text-[9px] font-bold text-white"
                                    >
                                      {pendingCutiCount}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <button
                      key={item.name}
                      data-menu-id={item.name}
                      type="button"
                      onClick={() => item.route && handleNavigate(item.route)}
                      style={isActive ? { backgroundColor: accentColor } : undefined}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${isActive
                        ? "text-white shadow-md font-semibold"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                        }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon size={18} weight="Linear" className="shrink-0 text-white/80" />
                        <span className="truncate">{item.name}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`px-2 py-0.5 rounded-md text-[9px] font-medium shrink-0 ml-2 ${isActive ? "bg-white/20 text-white" : "bg-rose-500/20 text-rose-300"
                            }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* ------------------------------------------------------------- */}
      {/* DESKTOP FIXED SIDEBAR (DISPLAYED ONLY ON LG AND UP)           */}
      {/* ------------------------------------------------------------- */}
      <aside
        style={sidebarBgStyle}
        className={`text-white hidden lg:flex flex-col py-3 shrink-0 h-screen overflow-visible transition-all duration-300 ease-in-out relative z-40 select-none ${isCollapsed ? "w-20 px-2.5" : "w-64 pl-4 pr-[11px]"
          }`}
      >
        {/* Brand Logo Header */}
        <div className="flex items-center justify-center shrink-0 w-full py-1 transition-all duration-300">
          <img
            src={effectiveLogo}
            alt={tenantName || "Logo"}
            className={`object-contain transition-all duration-300 hover:scale-105 shrink-0 ${isCollapsed ? "w-9 h-9" : "h-[43px] w-auto max-w-[135px]"
              }`}
          />
        </div>

        {/* Menu Groups */}
        {renderNavGroupContent(isCollapsed, false)}

        {/* Bottom Collapse / Expand Toggle Button */}
        <div className="pt-2 mt-auto border-t border-white/10 shrink-0">
          <button
            onClick={toggleCollapse}
            type="button"
            className={`flex items-center rounded-xl transition-all duration-200 cursor-pointer active:scale-98 ${isCollapsed
              ? "w-11 h-11 justify-center mx-auto text-white/70 hover:text-white hover:bg-white/10 relative group"
              : "w-full justify-between px-3.5 py-2 text-xs font-medium text-white/70 hover:text-white hover:bg-white/10"
              }`}
            title={isCollapsed ? "Perluas Sidebar" : "Ciutkan Sidebar"}
          >
            {!isCollapsed ? (
              <>
                <span className="font-semibold">Ciutkan</span>
                <ChevronLeft className="w-4 h-4 text-white/70 transition-transform duration-300 group-hover:-translate-x-0.5" />
              </>
            ) : (
              <>
                <ChevronRight className="w-4 h-4 text-white/80 transition-transform duration-300 group-hover:translate-x-0.5" />
                <div
                  style={{ left: "90px", ...sidebarBgStyle }}
                  className="fixed px-3 py-1.5 text-white text-xs font-semibold rounded-xl shadow-2xl whitespace-nowrap opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 pointer-events-none z-[9999] border border-white/15 origin-left"
                >
                  Perluas Sidebar
                </div>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* MOBILE SLIDE-OVER DRAWER SIDEBAR (DISPLAYED ON < LG)           */}
      {/* ------------------------------------------------------------- */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${isMobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
      >
        {/* Backdrop Overlay */}
        <div
          onClick={onCloseMobile}
          className={`absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${isMobileOpen ? "opacity-100" : "opacity-0"
            }`}
        />

        {/* Drawer Container */}
        <div
          style={sidebarBgStyle}
          className={`absolute top-0 bottom-0 left-0 w-72 max-w-[85vw] text-white flex flex-col py-4 px-4 shadow-2xl transition-transform duration-300 ease-out select-none ${isMobileOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          {/* Header with Logo + Close X Button */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-3.5">
            <img src={effectiveLogo} alt={tenantName || "Logo"} className="h-9 w-auto max-w-[130px] object-contain" />
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer active:scale-95 flex items-center justify-center border border-white/15"
              title="Tutup Menu"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Scrollable Navigation Groups */}
          {renderNavGroupContent(false, true)}
        </div>
      </div>
    </>
  );
}

