import {
  User,
  Lock,
  CreditCard,
  Briefcase,
  Clock,
  FileText,
  HelpCircle,
  ShieldAlert,
  ChevronRight,
  LogOut,
} from "lucide-react";
import type { SarangUser } from "../types/sarang.type";

interface ProfileMenuProps {
  user: SarangUser;
  isDetailsOpen: boolean;
  onToggleDetails: () => void;
  onMenuClick: (name: string) => void;
  onLogout?: () => void;
}

export function ProfileMenu({
  user,
  isDetailsOpen,
  onToggleDetails,
  onMenuClick,
  onLogout,
}: ProfileMenuProps) {
  const sections = [
    {
      title: "Pengaturan Akun",
      items: [
        {
          name: "Rekening Payroll",
          icon: CreditCard,
          sublabel: `${user.bank || "Mandiri"} - ${user.rekening || "1730018948050"}`,
          action: () => onMenuClick("Rekening Payroll"),
        },
        {
          name: "Ubah Profil",
          icon: User,
          action: () => onMenuClick("Ubah Profil"),
        },
      ],
    },
    {
      title: "Informasi Pekerjaan",
      items: [
        {
          name: "Detail Karyawan",
          icon: Briefcase,
          sublabel: isDetailsOpen ? "Tutup Detail" : "Lihat Detail",
          action: onToggleDetails,
          isActive: isDetailsOpen,
        },
        {
          name: "Jadwal & Shift Kerja",
          icon: Clock,
          sublabel: "Shift Pagi (08:00 - 17:00)",
          action: () => onMenuClick("Jadwal & Shift Kerja"),
        },
        {
          name: "Dokumen Kontrak",
          icon: FileText,
          action: () => onMenuClick("Dokumen Kontrak"),
        },
      ],
    },
    {
      title: "Pusat Informasi & Keamanan",
      items: [
        {
          name: "Keamanan Akun (Ganti Password)",
          icon: Lock,
          action: () => onMenuClick("Keamanan Akun"),
        },
        {
          name: "Bantuan & Kontak",
          icon: HelpCircle,
          action: () => onMenuClick("Bantuan & Kontak"),
        },
        {
          name: "Syarat & Ketentuan",
          icon: ShieldAlert,
          action: () => onMenuClick("Syarat & Ketentuan"),
        },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {sections.map((section, secIdx) => (
        <div key={secIdx} className="space-y-2">
          {/* Group Header Title (Simple, flat text, no border) */}
          <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block text-left px-1.5">
            {section.title}
          </span>

          {/* Stacking the individual borderless cards under the group header */}
          <div className="space-y-2">
            {section.items.map((item, itemIdx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={itemIdx}
                  className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden"
                >
                  <button
                    onClick={item.action}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-zinc-50/45 transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      {/* Flat round icon bg wrapper */}
                      <div className="w-8.5 h-8.5 rounded-full bg-zinc-100/70 flex items-center justify-center text-zinc-550 shrink-0">
                        <IconComp className="w-4 h-4" />
                      </div>

                      <div className="flex flex-col">
                        <span className="text-xs font-extrabold text-zinc-850">
                          {item.name}
                        </span>
                        {item.sublabel && (
                          <span className="text-[9px] text-zinc-400 font-bold mt-0.5 leading-none">
                            {item.sublabel}
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight
                      className={`w-4 h-4 text-zinc-350 transition-transform ${
                        (item as any).isActive ? "rotate-90 text-[#e0542c]" : ""
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Logout Button in its own matching borderless card block */}
      {onLogout && (
        <div className="space-y-2">
          <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block text-left px-1.5">
            Sesi
          </span>
          <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-between p-3.5 hover:bg-rose-50/20 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                {/* Soft flat red round icon container */}
                <div className="w-8.5 h-8.5 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                  <LogOut className="w-4 h-4" />
                </div>
                <span className="text-xs font-extrabold text-rose-600">
                  Keluar Akun
                </span>
              </div>

              <ChevronRight className="w-4 h-4 text-rose-300" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
