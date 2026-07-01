import { useRouter, PageTransition } from "@/shared/router/router";
import { DashboardLayout } from "./dashboard-layout";
import { MobileLayout } from "./mobile-layout";

// Feature page imports (Desktop)
import { DashboardPage } from "@/features/dashboard";
import { EmployeePage } from "@/features/employee";
import { AttendancePage } from "@/features/attendance";
import { LeavePage } from "@/features/leave";
import { PayrollPage } from "@/features/payroll";
import { OvertimePage } from "@/features/overtime";
import { ShiftPage } from "@/features/shift";
import { ReimbursementPage } from "@/features/reimbursement";
import { RecruitmentPage } from "@/features/recruitment";
import { OnboardingPage } from "@/features/onboarding";
import { AppraisalPage } from "@/features/appraisal";
import { TrainingPage } from "@/features/training";
import { DocumentPage } from "@/features/document";
import { AnnouncementPage } from "@/features/announcement";
import { OrganizationPage } from "@/features/organization";

// Feature page imports (Mobile)
import { SangkarPage, CelenganDetailPage } from "@/features/sangkar";
import { TunasPage } from "@/features/tunas";
import { AyamkuPage } from "@/features/ayamku";
import { PakanPage } from "../../../features/pakan";
import { SarangPage } from "../../../features/sarang";

interface MainContainerProps {
  user: {
    name: string;
    role: string;
    email: string;
    telepon?: string;
    gender?: string;
    tgl_join?: string;
    status_nikah?: string;
    rekening?: string;
    bank?: string;
    gaji_pokok?: number;
    lembur?: number;
    izin?: number;
  };
  onLogout: () => void;
}

export function MainContainer({ user, onLogout }: MainContainerProps) {
  const { currentRoute } = useRouter();

  // Desktop Page Router
  const renderDesktopPage = () => {
    switch (currentRoute) {
      case "Dashboard":
        return <DashboardPage />;
      case "Employee":
        return <EmployeePage />;
      case "Attendance":
        return <AttendancePage />;
      case "Leave":
        return <LeavePage />;
      case "Payroll":
        return <PayrollPage />;
      case "Overtime":
        return <OvertimePage />;
      case "Shift":
        return <ShiftPage />;
      case "Reimbursement":
        return <ReimbursementPage />;
      case "Recruitment":
        return <RecruitmentPage />;
      case "Onboarding":
        return <OnboardingPage />;
      case "Appraisal":
        return <AppraisalPage />;
      case "Training":
        return <TrainingPage />;
      case "Document":
        return <DocumentPage />;
      case "Announcement":
        return <AnnouncementPage />;
      case "Organization":
        return <OrganizationPage />;
      default:
        return <DashboardPage />;
    }
  };

  // Mobile Page Router
  const renderMobilePage = () => {
    switch (currentRoute) {
      case "MobileHome":
        return <SangkarPage user={user} />;
      case "MobileLumbung":
        return <TunasPage user={user} />;
      case "MobileAyamku":
        return <AyamkuPage user={user} />;
      case "MobilePakan":
        return <PakanPage user={user} />;
      case "MobileProfile":
        return <SarangPage user={user} onLogout={onLogout} />;
      case "MobileCelenganDetail":
        return <CelenganDetailPage />;
      default:
        return <SangkarPage user={user} />;
    }
  };

  if (user.role === "User") {
    return (
      <MobileLayout>
        <PageTransition route={currentRoute}>
          {renderMobilePage()}
        </PageTransition>
      </MobileLayout>
    );
  }

  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <PageTransition route={currentRoute}>
        {renderDesktopPage()}
      </PageTransition>
    </DashboardLayout>
  );
}

