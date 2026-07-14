import { createContext, useContext, type ReactNode } from "react";
import { BrowserRouter, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export type RouteType =
  | "Dashboard"
  | "Employee"
  | "Attendance"
  | "AttendanceToday"
  | "Leave"
  | "Payroll"
  | "PayrollHistory"
  | "Overtime"
  | "Shift"
  | "Reimbursement"
  | "Recruitment"
  | "Onboarding"
  | "Appraisal"
  | "Training"
  | "Document"
  | "Announcement"
  | "Organization"
  | "Login"
  | "MobileHome"
  | "MobileLumbung"
  | "MobileAyamku"
  | "MobilePakan"
  | "MobileProfile"
  | "MobileCelenganDetail"
  | "MobileCelenganAdd"
  | "MobileLokerDetail"
  | "MobileAbsensi"
  | "MobileLemburAbsensi"
  | "MobileLemburHistory"
  | "MobileHistory"
  | "MobileLeaveRequest"
  | "MobileIdCard"
  | "EmployeeAdd"
  | "EmployeeEdit"
  | "Location"
  | "LocationAdd"
  | "LocationEdit";

export const ROUTE_TO_PATH: Record<RouteType, string> = {
  Dashboard: "/dashboard",
  Employee: "/pegawai",
  Attendance: "/absensi",
  AttendanceToday: "/absensi-hari-ini",
  Leave: "/cuti",
  Payroll: "/keuangan",
  PayrollHistory: "/keuangan/riwayat",
  Overtime: "/overtime",
  Shift: "/shift",
  Reimbursement: "/reimbursement",
  Recruitment: "/recruitment",
  Onboarding: "/onboarding",
  Appraisal: "/appraisal",
  Training: "/training",
  Document: "/document",
  Announcement: "/announcement",
  Organization: "/divisi",
  Location: "/lokasi",
  LocationAdd: "/lokasi/tambah",
  LocationEdit: "/lokasi/edit",
  Login: "/auth/login",
  MobileHome: "/mobile/home",
  MobileLumbung: "/mobile/lumbung",
  MobileAyamku: "/mobile/ayamku",
  MobilePakan: "/mobile/pakan",
  MobileProfile: "/mobile/profile",
  MobileCelenganDetail: "/mobile/celengan",
  MobileCelenganAdd: "/mobile/celengan/add",
  MobileLokerDetail: "/mobile/loker",
  MobileAbsensi: "/mobile/absensi",
  MobileLemburAbsensi: "/mobile/lembur",
  MobileLemburHistory: "/mobile/lembur/history",
  MobileHistory: "/mobile/history",
  MobileLeaveRequest: "/mobile/leave-request",
  MobileIdCard: "/mobile/id-card",
  EmployeeAdd: "/pegawai/tambah",
  EmployeeEdit: "/pegawai/edit",
};

export const PATH_TO_ROUTE: Record<string, RouteType> = {
  "/dashboard": "Dashboard",
  "/pegawai": "Employee",
  "/absensi": "Attendance",
  "/absensi-hari-ini": "AttendanceToday",
  "/cuti": "Leave",
  "/keuangan": "Payroll",
  "/keuangan/riwayat": "PayrollHistory",
  "/overtime": "Overtime",
  "/shift": "Shift",
  "/reimbursement": "Reimbursement",
  "/recruitment": "Recruitment",
  "/onboarding": "Onboarding",
  "/appraisal": "Appraisal",
  "/training": "Training",
  "/document": "Document",
  "/announcement": "Announcement",
  "/divisi": "Organization",
  "/lokasi": "Location",
  "/lokasi/tambah": "LocationAdd",
  "/lokasi/edit": "LocationEdit",
  "/auth/login": "Login",
  "/mobile/home": "MobileHome",
  "/mobile/lumbung": "MobileLumbung",
  "/mobile/ayamku": "MobileAyamku",
  "/mobile/pakan": "MobilePakan",
  "/mobile/profile": "MobileProfile",
  "/mobile/celengan": "MobileCelenganDetail",
  "/mobile/celengan/add": "MobileCelenganAdd",
  "/mobile/loker": "MobileLokerDetail",
  "/mobile/absensi": "MobileAbsensi",
  "/mobile/lembur": "MobileLemburAbsensi",
  "/mobile/lembur/history": "MobileLemburHistory",
  "/mobile/history": "MobileHistory",
  "/mobile/leave-request": "MobileLeaveRequest",
  "/mobile/id-card": "MobileIdCard",
  "/pegawai/tambah": "EmployeeAdd",
  "/pegawai/edit": "EmployeeEdit",
};

interface RouterContextType {
  currentRoute: RouteType;
  navigate: (route: RouteType, state?: any) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

function RouterInnerProvider({ children }: { children: ReactNode }) {
  const navigateFn = useNavigate();
  const location = useLocation();

  let resolvedPath = location.pathname;
  if (resolvedPath.startsWith("/mobile/loker/")) {
    resolvedPath = "/mobile/loker";
  }

  const currentRoute = PATH_TO_ROUTE[resolvedPath] || "Dashboard";

  const navigate = (route: RouteType, state?: any) => {
    const path = ROUTE_TO_PATH[route] || "/dashboard";
    navigateFn(path, { state });
  };

  return (
    <RouterContext.Provider value={{ currentRoute, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function RouterProvider({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <RouterInnerProvider>{children}</RouterInnerProvider>
    </BrowserRouter>
  );
}

export function PageTransition({ children, route }: { children: ReactNode; route: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={route}
        initial={{ opacity: 0, y: 15, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -15, scale: 0.97 }}
        transition={{
          duration: 0.3,
          ease: [0.34, 1.56, 0.64, 1] // Spring/hatch overshoot curve
        }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error("useRouter must be used within a RouterProvider");
  }
  return context;
}
