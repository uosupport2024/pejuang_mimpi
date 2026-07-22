import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "@/shared/router/router";
import logoWhiteImg from "@/assets/logo/logo-white.png";
import { menuItems } from "@/shared/router/menu";
import { API_BASE_URL, getHeaders } from "@/shared/utils/api";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Sidebar() {
  const { currentRoute, navigate } = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("sidebar_collapsed") === "true";
  });
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  const [activeHoverMenu, setActiveHoverMenu] = useState<string | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingCutiCount, setPendingCutiCount] = useState(0);

  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar_collapsed", String(next));
      return next;
    });
  };

  const fetchPendingCount = useCallback(async () => {
    try {
      const koreksiPromise = fetch(`${API_BASE_URL}/koreksi-absen?status=Pending&per_page=1`, {
        method: "GET",
        headers: getHeaders(),
      }).then((r) => (r.ok ? r.json() : null));

      const cutiPromise = fetch(`${API_BASE_URL}/cuti/admin?status=Pending&per_page=1`, {
        method: "GET",
        headers: getHeaders(),
      }).then((r) => (r.ok ? r.json() : null));

      const [koreksiJson, cutiJson] = await Promise.all([koreksiPromise, cutiPromise]);

      if (koreksiJson) {
        setPendingCount(koreksiJson.data?.total || 0);
      }
      if (cutiJson) {
        setPendingCutiCount(cutiJson.data?.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch pending counts:", err);
    }
  }, []);

  useEffect(() => {
    fetchPendingCount();

    const handleUpdate = () => {
      fetchPendingCount();
    };

    window.addEventListener("koreksi-absen-updated", handleUpdate);
    window.addEventListener("cuti-updated", handleUpdate);

    return () => {
      window.removeEventListener("koreksi-absen-updated", handleUpdate);
      window.removeEventListener("cuti-updated", handleUpdate);
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

  const groups = ["Utama", "Data Master", "Operasional", "Layanan"] as const;

  return (
    <aside
      className={`bg-[#1e2a4a] text-white flex flex-col py-3 shrink-0 h-screen lg:h-screen overflow-visible transition-all duration-300 ease-in-out relative z-40 select-none ${isCollapsed ? "w-full lg:w-20 px-2.5" : "w-full lg:w-64 pl-4 pr-[11px]"
        }`}
    >
      {/* Pejuang Mimpi Brand Logo Header */}
      <div className="flex items-center justify-center shrink-0 w-full py-1 transition-all duration-300">
        <img
          src={logoWhiteImg}
          alt="Pejuang Mimpi Logo"
          className={`object-contain transition-all duration-300 hover:scale-105 shrink-0 ${isCollapsed ? "w-10 h-10" : "h-12 w-auto max-w-[150px]"
            }`}
        />
      </div>

      {/* Menu groups */}
      <div className="flex-1 overflow-y-auto sidebar-scrollbar pb-4 pr-0.5 space-y-4">
        {groups.map((group) => {
          const groupItems = menuItems.filter((item) => item.group === group);
          if (groupItems.length === 0) return null;

          return (
            <div key={group} className="space-y-1.5">
              {!isCollapsed ? (
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

                  // -------------------------------------------------------------
                  // MODE COLLAPSED (MINIMIZED)
                  // -------------------------------------------------------------
                  if (isCollapsed) {
                    return (
                      <div
                        key={item.name}
                        className="relative group flex justify-center"
                        onMouseEnter={(e) => handleMouseEnterItem(item.name, e)}
                        onMouseLeave={handleMouseLeaveItem}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            if (!hasSubItems && item.route) {
                              navigate(item.route);
                            } else if (hasSubItems) {
                              handleMouseEnterItem(item.name, e);
                            }
                          }}
                          className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer relative active:scale-95 ${isActive || isAnySubActive
                            ? "bg-[#e0542c] text-white shadow-md shadow-[#e0542c]/30"
                            : "text-white/70 hover:text-white hover:bg-white/10"
                            }`}
                        >
                          <Icon size={20} weight="Linear" className="shrink-0 transition-transform group-hover:scale-110 duration-200" />

                          {/* Notification dot badge in collapsed mode */}
                          {totalPendingGroup > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-[#1e2a4a] animate-pulse" />
                          )}
                        </button>

                        {/* Fixed Tooltip for Single Items */}
                        {!hasSubItems && activeHoverMenu === item.name && popoverPos && (
                          <div
                            style={{ top: `${popoverPos.top + 4}px`, left: `${popoverPos.left}px` }}
                            className="fixed px-3 py-1.5 bg-[#161f36] text-white text-xs font-semibold rounded-xl shadow-2xl whitespace-nowrap opacity-100 z-[9999] border border-white/15 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150 pointer-events-none select-none"
                          >
                            <span>{item.name}</span>
                            {item.badge && (
                              <span className="px-1.5 py-0.5 rounded bg-rose-500/30 text-rose-200 text-[9px] font-bold">
                                {item.badge}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Fixed Floating Pop-up Dropdown Menu for Items with Sub-Items */}
                        {hasSubItems && activeHoverMenu === item.name && popoverPos && (
                          <div
                            onMouseEnter={handlePopoverMouseEnter}
                            onMouseLeave={handlePopoverMouseLeave}
                            style={{ top: `${popoverPos.top}px`, left: `${popoverPos.left}px` }}
                            className="fixed w-52 bg-[#161f36] border border-white/15 rounded-2xl shadow-2xl z-[9999] p-2 space-y-1 text-white animate-in fade-in zoom-in-95 slide-in-from-left-2 duration-150 select-none before:absolute before:-left-3 before:top-0 before:bottom-0 before:w-4"
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
                                    navigate(sub.route);
                                  }}
                                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-150 cursor-pointer ${isSubActive
                                    ? "text-[#fee279] font-bold bg-white/15"
                                    : "text-white/70 hover:text-white hover:bg-white/10"
                                    }`}
                                >
                                  <span>{sub.name}</span>
                                  {sub.route === "KoreksiAbsenApproval" && pendingCount > 0 && (
                                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-[#e0542c] text-white">
                                      {pendingCount}
                                    </span>
                                  )}
                                  {sub.route === "Leave" && pendingCutiCount > 0 && (
                                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-[#e0542c] text-white">
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

                  // -------------------------------------------------------------
                  // MODE EXPANDED (MAXIMIZED)
                  // -------------------------------------------------------------
                  if (hasSubItems) {
                    return (
                      <div key={item.name} className="space-y-0.5">
                        <button
                          type="button"
                          onClick={() => toggleDropdown(item.name)}
                          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${isAnySubActive
                            ? "bg-[#e0542c] text-white shadow-md shadow-[#e0542c]/25 font-semibold"
                            : "text-white/70 hover:text-white hover:bg-white/10"
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon
                              size={18}
                              weight="Linear"
                              className={`shrink-0 transition-colors duration-200 ${isAnySubActive ? "text-white" : "text-white/60"
                                }`}
                            />
                            <span>{item.name}</span>
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

                        {/* Sub-items */}
                        {isOpen && (
                          <div className="pl-9 pr-2 py-0.5 space-y-0.5 transition-all duration-200 animate-in fade-in slide-in-from-top-1">
                            {item.subItems?.map((sub) => {
                              const isSubActive = currentRoute === sub.route;
                              return (
                                <button
                                  key={sub.name}
                                  type="button"
                                  onClick={() => navigate(sub.route)}
                                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-all duration-150 cursor-pointer ${isSubActive
                                    ? "text-[#fee279] font-bold bg-white/10"
                                    : "text-white/60 hover:text-white hover:bg-white/5"
                                    }`}
                                >
                                  <span>{sub.name}</span>
                                  {sub.route === "KoreksiAbsenApproval" && pendingCount > 0 && (
                                    <span
                                      className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${isSubActive ? "bg-[#e0542c] text-white" : "bg-rose-500/20 text-rose-300"
                                        }`}
                                    >
                                      {pendingCount}
                                    </span>
                                  )}
                                  {sub.route === "Leave" && pendingCutiCount > 0 && (
                                    <span
                                      className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${isSubActive ? "bg-[#e0542c] text-white" : "bg-rose-500/20 text-rose-300"
                                        }`}
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
                      type="button"
                      onClick={() => item.route && navigate(item.route)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${isActive
                        ? "bg-[#e0542c] text-white shadow-md shadow-[#e0542c]/25 font-semibold"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} weight="Linear" className="shrink-0 text-white/80" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`px-2 py-0.5 rounded-md text-[9px] font-medium ${isActive ? "bg-white/20 text-white" : "bg-rose-500/20 text-rose-300"
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
              <div className="fixed px-3 py-1.5 bg-[#161f36] text-white text-xs font-semibold rounded-xl shadow-2xl whitespace-nowrap opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 pointer-events-none z-[9999] border border-white/15 origin-left" style={{ left: '90px' }}>
                Perluas Sidebar
              </div>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
