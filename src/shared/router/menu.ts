import {
  Widget,
  UsersGroupRounded,
  Calendar,
  DocumentText,
  Dollar,
  ClockCircle,
  Refresh,
  Bill,
  Case,
  Rocket,
  MedalStar,
  Book,
  Bell,
  Structure
} from "@solar-icons/react";
import type { RouteType } from "./router";

export interface MenuItem {
  name: RouteType;
  icon: any;
  group: "Menu" | "Management";
  badge: string | null;
}

export const menuItems: MenuItem[] = [
  // Menu Group
  { name: "Dashboard", icon: Widget, group: "Menu", badge: null },
  { name: "Employee", icon: UsersGroupRounded, group: "Menu", badge: null },
  { name: "Attendance", icon: Calendar, group: "Menu", badge: "20" },
  { name: "Leave", icon: DocumentText, group: "Menu", badge: null },
  { name: "Payroll", icon: Dollar, group: "Menu", badge: null },
  { name: "Overtime", icon: ClockCircle, group: "Menu", badge: null },
  { name: "Shift", icon: Refresh, group: "Menu", badge: null },
  { name: "Reimbursement", icon: Bill, group: "Menu", badge: null },
  
  // Management Group
  { name: "Recruitment", icon: Case, group: "Management", badge: "99+" },
  { name: "Onboarding", icon: Rocket, group: "Management", badge: null },
  { name: "Appraisal", icon: MedalStar, group: "Management", badge: null },
  { name: "Training", icon: Book, group: "Management", badge: null },
  { name: "Document", icon: DocumentText, group: "Management", badge: null },
  { name: "Announcement", icon: Bell, group: "Management", badge: null },
  { name: "Organization", icon: Structure, group: "Management", badge: null }
];
