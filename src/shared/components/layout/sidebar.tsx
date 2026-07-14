import { useState, useEffect, useCallback } from "react";
import { useRouter } from "@/shared/router/router";
import logoImg from "@/assets/logo/POT–Pejuang_Mimpi–Logo.png";
import { menuItems } from "@/shared/router/menu";
import { API_BASE_URL, getHeaders } from "@/shared/utils/api";


export function Sidebar() {
  const { currentRoute, navigate } = useRouter();
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingCutiCount, setPendingCutiCount] = useState(0);

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

    window.addEventListener("koreksi-approval-updated", handleUpdate);
    return () => {
      window.removeEventListener("koreksi-approval-updated", handleUpdate);
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

  const groups = ["Utama", "Data Master", "Operasional", "Layanan"] as const;

  return (
    <aside className="w-full lg:w-64 bg-white border-r border-gray-200 flex flex-col pl-4 pr-[11px] py-2 shrink-0 h-screen lg:h-screen overflow-hidden">
      {/* Pejuang Mimpi Brand Logo */}
      <div className="flex items-center gap-3 mb-6 shrink-0 pt-4 pb-3 px-3 mx-1 bg-gradient-to-r from-zinc-50 to-white rounded-2xl relative overflow-hidden">
        {/* Logo (Directly, no border) */}
        <img src={logoImg} alt="Pejuang Mimpi Logo" className="w-10 h-10 object-contain shrink-0" />

        {/* Title and Subtitle */}
        <div className="flex flex-col min-w-0">
          <span className="text-[13px] font-extrabold tracking-tight text-gray-900 leading-tight">
            Pejuang <span className="text-[#e0542c]">Mimpi</span>
          </span>
          <span className="text-[8px] font-bold tracking-widest text-[#5C8A90] uppercase mt-0.5">
            Attendance Core
          </span>
        </div>
      </div>

      {/* Menu groups */}
      <div className="flex-1 overflow-y-auto sidebar-scrollbar pb-6 pr-0.5">
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group} className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 pl-4 block">
                {group}
              </span>
              <div className="space-y-0.5">
                {menuItems
                  .filter((item) => item.group === group)
                  .map((item) => {
                    const Icon = item.icon;
                    const hasSubItems = !!item.subItems;
                    const isOpen = openDropdowns[item.name] !== undefined
                      ? openDropdowns[item.name]
                      : !!(item.subItems?.some((sub) => currentRoute === sub.route));
                    const isAnySubActive = hasSubItems && item.subItems?.some((sub) => currentRoute === sub.route);
                    const isActive = !hasSubItems && item.route && currentRoute === item.route;

                    if (hasSubItems) {
                      return (
                        <div key={item.name} className="space-y-0.5">
                          <button
                            type="button"
                            onClick={() => toggleDropdown(item.name)}
                            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${isAnySubActive
                              ? "bg-[#e0542c] text-white shadow-sm shadow-[#e0542c]/20"
                              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon
                                size={18}
                                weight="Linear"
                                className={`shrink-0 transition-colors ${isAnySubActive
                                  ? "text-white"
                                  : "text-gray-400"
                                  }`}
                              />
                              <span>{item.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {((item.name === "Pengajuan" && (pendingCount + pendingCutiCount) > 0) || item.badge) && (
                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-semibold ${isAnySubActive
                                  ? "bg-white/20 text-white"
                                  : "bg-rose-500/10 text-rose-600"
                                  }`}>
                                  {item.name === "Pengajuan" && (pendingCount + pendingCutiCount) > 0 ? (pendingCount + pendingCutiCount) : item.badge}
                                </span>
                              )}
                              <svg
                                className={`w-3 h-3 transition-all duration-200 ${isAnySubActive
                                  ? "text-white"
                                  : "text-gray-400"
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
                            <div className="pl-9 pr-2 py-0.5 space-y-0.5 transition-all">
                              {item.subItems?.map((sub) => {
                                const isSubActive = currentRoute === sub.route;
                                return (
                                  <button
                                    key={sub.name}
                                    type="button"
                                    onClick={() => navigate(sub.route)}
                                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-xs transition-all cursor-pointer ${isSubActive
                                      ? "text-[#e0542c] font-bold bg-[#e0542c]/5"
                                      : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
                                      }`}
                                  >
                                    <span>{sub.name}</span>
                                    {sub.route === "KoreksiAbsenApproval" && pendingCount > 0 && (
                                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${isSubActive
                                        ? "bg-[#e0542c]/20 text-[#e0542c]"
                                        : "bg-rose-500/10 text-rose-600"
                                        }`}>
                                        {pendingCount}
                                      </span>
                                    )}
                                    {sub.route === "Leave" && pendingCutiCount > 0 && (
                                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${isSubActive
                                        ? "bg-[#e0542c]/20 text-[#e0542c]"
                                        : "bg-rose-500/10 text-rose-600"
                                        }`}>
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
                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${isActive
                          ? "bg-[#e0542c] text-white shadow-sm shadow-[#e0542c]/20"
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={18} weight="Linear" className="shrink-0" />
                          <span>{item.name}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`px-2 py-0.5 rounded-md text-[9px] font-medium ${isActive ? "bg-white/20 text-white" : "bg-rose-500/10 text-rose-600"
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
          ))}
        </div>
      </div>
    </aside>
  );
}
