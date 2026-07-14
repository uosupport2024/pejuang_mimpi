import {
  UsersGroupRounded,
  Refresh,
  Structure,
  MapPoint,
  Calendar,
  ClockCircle,
  Dollar,
  DocumentText,
  Widget2
} from "@solar-icons/react";
import type { RouteType } from "./router";

export interface SubMenuItem {
  name: string;
  route: RouteType;
}

export interface MenuItem {
  name: string;
  route?: RouteType;
  icon: any;
  group: "Utama" | "Data Master" | "Operasional" | "Layanan";
  badge?: string | null;
  subItems?: SubMenuItem[];
}

export const menuItems: MenuItem[] = [
  // Utama Group
  { name: "Dashboard", route: "Dashboard", icon: Widget2, group: "Utama" },

  // Data Master Group
  { name: "Pegawai", route: "Employee", icon: UsersGroupRounded, group: "Data Master" },
  { name: "Shift", route: "Shift", icon: Refresh, group: "Data Master" },
  { name: "Divisi", route: "Organization", icon: Structure, group: "Data Master" },
  { name: "Lokasi", route: "Location", icon: MapPoint, group: "Data Master" },

  // Operasional Group
  {
    name: "Absensi",
    icon: Calendar,
    group: "Operasional",
    subItems: [
      { name: "Rekap Data", route: "Attendance" },
      { name: "Absensi Hari Ini", route: "AttendanceToday" }
    ]
  },
  { name: "Lembur", route: "Overtime", icon: ClockCircle, group: "Operasional" },

  // Layanan Group
  {
    name: "Keuangan",
    icon: Dollar,
    group: "Layanan",
    subItems: [
      { name: "Rekap Data", route: "Payroll" },
      { name: "Riwayat", route: "PayrollHistory" }
    ]
  },
  {
    name: "Pengajuan",
    icon: DocumentText,
    group: "Layanan",
    subItems: [
      { name: "Cuti & Izin", route: "Leave" },
      { name: "Absensi", route: "KoreksiAbsenApproval" }
    ]
  }
];
