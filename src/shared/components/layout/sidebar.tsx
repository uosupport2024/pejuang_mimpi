import { LogOut } from "lucide-react";
import { useRouter } from "@/shared/router/router";
import logoImg from "@/assets/logo/POT–Pejuang_Mimpi–Logo.png";
import { menuItems } from "@/shared/router/menu";

interface SidebarProps {
  onLogout: () => void;
}

export function Sidebar({ onLogout }: SidebarProps) {
  const { currentRoute, navigate } = useRouter();

  return (
    <aside className="w-full lg:w-64 bg-white border-r border-gray-200 flex flex-col justify-between px-4 py-2 shrink-0 h-screen lg:h-auto overflow-y-auto">
      <div>
        {/* Pejuang Mimpi Brand Logo */}
        <div className="flex items-center gap-3 mb-5">
          <img src={logoImg} alt="Pejuang Mimpi Logo" className="w-10 h-10 object-contain rounded-xl" />
          <span className="text-lg font-bold tracking-tight text-gray-900 leading-tight">
            Pejuang Mimpi
          </span>
        </div>

        {/* Menu groups */}
        <div className="space-y-3.5">
          {["Menu", "Management"].map((group) => (
            <div key={group} className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 pl-4 block">
                {group}
              </span>
              <div className="space-y-0.5">
                {menuItems
                  .filter((item) => item.group === group)
                  .map((item) => {
                    const Icon = item.icon;
                    const isActive = currentRoute === item.name;
                    return (
                      <button
                        key={item.name}
                        onClick={() => navigate(item.name)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${isActive
                          ? "bg-[#e0542c] text-white shadow-sm shadow-[#e0542c]/20"
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={18} weight="Bold" className="shrink-0" />
                          <span>{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${isActive ? "bg-white/20 text-white" : "bg-rose-500/10 text-rose-600"
                            }`}>
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

      {/* Logout Button */}
      <div className="mt-8 pt-4 border-t border-gray-100">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2.5 py-3 px-4 bg-[#fff1f0] text-[#e0542c] hover:bg-[#ffe4e1] rounded-xl text-xs font-bold transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}
