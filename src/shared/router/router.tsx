import { createContext, useContext, type ReactNode } from "react";
import { BrowserRouter, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

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
  | "MobileProfile"
  | "MobileCelenganDetail"
  | "MobileCelenganAdd";

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
  MobileCelenganDetail: "/mobile/celengan",
  MobileCelenganAdd: "/mobile/celengan/add",
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
  "/mobile/celengan": "MobileCelenganDetail",
  "/mobile/celengan/add": "MobileCelenganAdd",
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
        className="w-full h-full"
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
