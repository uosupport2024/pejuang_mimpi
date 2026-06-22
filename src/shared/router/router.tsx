import { createContext, useContext, type ReactNode } from "react";
import { BrowserRouter, useNavigate, useLocation } from "react-router-dom";

export type RouteType =
  | "Dashboard"
  | "Employee"
  | "Attendance"
  | "Leave"
  | "Payroll"
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
  | "MobileProfile";

export const ROUTE_TO_PATH: Record<RouteType, string> = {
  Dashboard: "/dashboard",
  Employee: "/employee",
  Attendance: "/attendance",
  Leave: "/leave",
  Payroll: "/payroll",
  Overtime: "/overtime",
  Shift: "/shift",
  Reimbursement: "/reimbursement",
  Recruitment: "/recruitment",
  Onboarding: "/onboarding",
  Appraisal: "/appraisal",
  Training: "/training",
  Document: "/document",
  Announcement: "/announcement",
  Organization: "/organization",
  Login: "/auth/login",
  MobileHome: "/mobile/home",
  MobileLumbung: "/mobile/lumbung",
  MobileAyamku: "/mobile/ayamku",
  MobilePakan: "/mobile/pakan",
  MobileProfile: "/mobile/profile",
};

export const PATH_TO_ROUTE: Record<string, RouteType> = {
  "/dashboard": "Dashboard",
  "/employee": "Employee",
  "/attendance": "Attendance",
  "/leave": "Leave",
  "/payroll": "Payroll",
  "/overtime": "Overtime",
  "/shift": "Shift",
  "/reimbursement": "Reimbursement",
  "/recruitment": "Recruitment",
  "/onboarding": "Onboarding",
  "/appraisal": "Appraisal",
  "/training": "Training",
  "/document": "Document",
  "/announcement": "Announcement",
  "/organization": "Organization",
  "/auth/login": "Login",
  "/mobile/home": "MobileHome",
  "/mobile/lumbung": "MobileLumbung",
  "/mobile/ayamku": "MobileAyamku",
  "/mobile/pakan": "MobilePakan",
  "/mobile/profile": "MobileProfile",
};

interface RouterContextType {
  currentRoute: RouteType;
  navigate: (route: RouteType) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

function RouterInnerProvider({ children }: { children: ReactNode }) {
  const navigateFn = useNavigate();
  const location = useLocation();

  const currentRoute = PATH_TO_ROUTE[location.pathname] || "Dashboard";

  const navigate = (route: RouteType) => {
    const path = ROUTE_TO_PATH[route] || "/dashboard";
    navigateFn(path);
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

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error("useRouter must be used within a RouterProvider");
  }
  return context;
}
