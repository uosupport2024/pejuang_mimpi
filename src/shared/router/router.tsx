import { createContext, useContext, useEffect, useCallback, useMemo, type ReactNode } from "react";
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
  | "KoreksiAbsenApproval"
  | "Recruitment"
  | "Onboarding"
  | "Appraisal"
  | "Training"
  | "TrainingAdd"
  | "TrainingEdit"
  | "TrainingDetail"
  | "Document"
  | "Announcement"
  | "Organization"
  | "Login"
  | "MobileHome"
  | "MobileLumbung"
  | "MobileAyamku"
  | "MobilePakan"
  | "MobilePakanLearn"
  | "MobileProfile"
  | "MobileCelenganDetail"
  | "MobileCelenganAdd"
  | "MobileLokerDetail"
  | "MobileAbsensi"
  | "MobileLemburAbsensi"
  | "MobileLemburHistory"
  | "MobileKoreksiAbsen"
  | "MobileHistory"
  | "MobileLeaveRequest"
  | "MobileLeaveHistory"
  | "MobileIdCard"
  | "EmployeeAdd"
  | "EmployeeEdit"
  | "EmployeeInputShift"
  | "Location"
  | "LocationAdd"
  | "LocationEdit"
  | "Profile"
  | "TenantMapping";

export const ROUTE_TITLE_MAP: Record<RouteType, string> = {
  Dashboard: "Dashboard",
  Employee: "Pegawai",
  EmployeeAdd: "Tambah Pegawai",
  EmployeeEdit: "Edit Pegawai",
  EmployeeInputShift: "Shift Pegawai",
  Attendance: "Rekap Absensi",
  AttendanceToday: "Absensi Hari Ini",
  Leave: "Cuti & Izin",
  Payroll: "Rekap Keuangan",
  PayrollHistory: "Riwayat Keuangan",
  Overtime: "Lembur",
  Shift: "Shift",
  KoreksiAbsenApproval: "Persetujuan Absen",
  Recruitment: "Rekrutmen",
  Onboarding: "Onboarding",
  Appraisal: "Penilaian",
  Training: "Pelatihan",
  TrainingAdd: "Tambah Pelatihan",
  TrainingEdit: "Edit Pelatihan",
  TrainingDetail: "Detail Pelatihan",
  Document: "Dokumen",
  Announcement: "Pengumuman",
  Organization: "Divisi",
  Location: "Lokasi",
  LocationAdd: "Tambah Lokasi",
  LocationEdit: "Edit Lokasi",
  Login: "Login",
  Profile: "Profil",
  TenantMapping: "Mapping Menu Tenant",
  MobileHome: "Sangkar",
  MobileLumbung: "Lumbung",
  MobileAyamku: "Ayamku",
  MobilePakan: "Tunas",
  MobilePakanLearn: "Pembelajaran",
  MobileProfile: "Profil",
  MobileCelenganDetail: "Detail Sangkar",
  MobileCelenganAdd: "Tambah Sangkar",
  MobileLokerDetail: "Detail Loker",
  MobileAbsensi: "Absensi",
  MobileLemburAbsensi: "Absen Lembur",
  MobileLemburHistory: "Riwayat Lembur",
  MobileKoreksiAbsen: "Koreksi Absen",
  MobileHistory: "Riwayat",
  MobileLeaveRequest: "Pengajuan Cuti",
  MobileLeaveHistory: "Riwayat Cuti",
  MobileIdCard: "Kartu Identitas",
};

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
  KoreksiAbsenApproval: "/persetujuan-absen",
  Recruitment: "/recruitment",
  Onboarding: "/onboarding",
  Appraisal: "/appraisal",
  Training: "/training",
  TrainingAdd: "/training/tambah",
  TrainingEdit: "/training/edit",
  TrainingDetail: "/training/detail",
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
  MobilePakanLearn: "/mobile/pakan/learn",
  MobileProfile: "/mobile/profile",
  MobileCelenganDetail: "/mobile/celengan",
  MobileCelenganAdd: "/mobile/celengan/add",
  MobileLokerDetail: "/mobile/loker",
  MobileAbsensi: "/mobile/absensi",
  MobileLemburAbsensi: "/mobile/lembur",
  MobileLemburHistory: "/mobile/lembur/history",
  MobileKoreksiAbsen: "/mobile/koreksi-absen",
  MobileHistory: "/mobile/history",
  MobileLeaveRequest: "/mobile/leave-request",
  MobileLeaveHistory: "/mobile/leave-history",
  MobileIdCard: "/mobile/id-card",
  EmployeeAdd: "/pegawai/tambah",
  EmployeeEdit: "/pegawai/edit",
  EmployeeInputShift: "/pegawai/shift",
  Profile: "/profile",
  TenantMapping: "/tenant-mapping",
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
  "/persetujuan-absen": "KoreksiAbsenApproval",
  "/recruitment": "Recruitment",
  "/onboarding": "Onboarding",
  "/appraisal": "Appraisal",
  "/training": "Training",
  "/training/tambah": "TrainingAdd",
  "/training/edit": "TrainingEdit",
  "/training/detail": "TrainingDetail",
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
  "/mobile/pakan/learn": "MobilePakanLearn",
  "/mobile/profile": "MobileProfile",
  "/mobile/celengan": "MobileCelenganDetail",
  "/mobile/celengan/add": "MobileCelenganAdd",
  "/mobile/loker": "MobileLokerDetail",
  "/mobile/absensi": "MobileAbsensi",
  "/mobile/lembur": "MobileLemburAbsensi",
  "/mobile/lembur/history": "MobileLemburHistory",
  "/mobile/koreksi-absen": "MobileKoreksiAbsen",
  "/mobile/history": "MobileHistory",
  "/mobile/leave-request": "MobileLeaveRequest",
  "/mobile/leave-history": "MobileLeaveHistory",
  "/mobile/id-card": "MobileIdCard",
  "/pegawai/tambah": "EmployeeAdd",
  "/pegawai/edit": "EmployeeEdit",
  "/pegawai/shift": "EmployeeInputShift",
  "/profile": "Profile",
  "/tenant-mapping": "TenantMapping",
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
  if (resolvedPath.startsWith("/mobile/pakan/learn/")) {
    resolvedPath = "/mobile/pakan/learn";
  }

  const currentRoute = PATH_TO_ROUTE[resolvedPath] || "Dashboard";

  useEffect(() => {
    const pageTitle = ROUTE_TITLE_MAP[currentRoute] || "Menu";
    document.title = `Pejuang Mimpi | ${pageTitle}`;
    console.log(
      `%c[NAVIGATION LOG] %c${pageTitle} %c(${resolvedPath})`,
      "background: #1e2a4a; color: #fee279; font-weight: bold; padding: 2px 6px; border-radius: 4px;",
      "color: #1f2937; font-weight: bold;",
      "color: #6b7280; font-size: 11px;"
    );
  }, [currentRoute, resolvedPath]);

  const navigate = useCallback((route: RouteType, state?: any) => {
    const path = ROUTE_TO_PATH[route] || "/dashboard";
    navigateFn(path, { state });
  }, [navigateFn]);

  const contextValue = useMemo(() => ({ currentRoute, navigate }), [currentRoute, navigate]);

  return (
    <RouterContext.Provider value={contextValue}>
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
    return {
      currentRoute: "Dashboard" as RouteType,
      navigate: (route: RouteType) => {
        const path = ROUTE_TO_PATH[route] || "/dashboard";
        window.location.pathname = path;
      },
    };
  }
  return context;
}

