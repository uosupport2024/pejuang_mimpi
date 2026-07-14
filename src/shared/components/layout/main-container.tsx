import { useRouter, PageTransition } from "@/shared/router/router";
import { DashboardLayout } from "./dashboard-layout";
import { MobileLayout } from "./mobile-layout";

// Feature page imports (Desktop)
import { DashboardPage } from "@/features/dashboard";
import { EmployeePage, EmployeeAddPage, EmployeeEditPage } from "@/features/employee";
import { AttendancePage, TodayAttendancePage } from "@/features/attendance";
import { LeavePage } from "@/features/leave";
import { PayrollPage, PayrollHistoryPage } from "@/features/payroll";
import { OvertimePage } from "@/features/overtime";
import { ShiftPage } from "@/features/shift";
import { RecruitmentPage } from "@/features/recruitment";
import { OnboardingPage } from "@/features/onboarding";
import { AppraisalPage } from "@/features/appraisal";
import { TrainingPage } from "@/features/training";
import { DocumentPage } from "@/features/document";
import { AnnouncementPage } from "@/features/announcement";
import { OrganizationPage } from "@/features/organization";
import { LocationPage, LocationAddPage, LocationEditPage } from "@/features/location";

// Feature page imports (Mobile)
import { SangkarPage, CelenganDetailPage, CelenganAddPage, LokerDetailPage } from "@/features/sangkar";
import { TunasPage, MobileAbsensiPage, MobileHistoryPage, MobileLemburAbsensiPage, MobileLemburHistoryPage, MobileKoreksiAbsenPage, KoreksiAbsenApprovalPage } from "@/features/tunas";
import { AyamkuPage } from "@/features/ayamku";
import { PakanPage } from "../../../features/pakan";
import { SarangPage } from "../../../features/sarang";
import { LeaveRequestPage } from "@/features/leave-request";
import { IdCardPage } from "@/features/id-card";

interface MainContainerProps {
  user: {
    name: string;
    role: string;
    email: string;
    is_admin?: string;
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
  onUpdateUser?: (user: any) => void;
}

export function MainContainer({ user, onLogout, onUpdateUser }: MainContainerProps) {
  const { currentRoute } = useRouter();

  // Desktop Page Router
  const renderDesktopPage = () => {
    switch (currentRoute) {
      case "Dashboard":
        return <DashboardPage />;
      case "Employee":
        return <EmployeePage />;
      case "EmployeeAdd":
        return <EmployeeAddPage />;
      case "EmployeeEdit":
        return <EmployeeEditPage />;
      case "Attendance":
        return <AttendancePage />;
      case "AttendanceToday":
        return <TodayAttendancePage />;
      case "Leave":
        return <LeavePage />;
      case "Payroll":
        return <PayrollPage />;
      case "PayrollHistory":
        return <PayrollHistoryPage />;
      case "Overtime":
        return <OvertimePage />;
      case "Shift":
        return <ShiftPage />;
      case "KoreksiAbsenApproval":
        return <KoreksiAbsenApprovalPage />;
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
      case "Location":
        return <LocationPage />;
      case "LocationAdd":
        return <LocationAddPage />;
      case "LocationEdit":
        return <LocationEditPage />;
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
        return <SarangPage user={user} onLogout={onLogout} onUpdateUser={onUpdateUser} />;
      case "MobileCelenganDetail":
        return <CelenganDetailPage />;
      case "MobileCelenganAdd":
        return <CelenganAddPage />;
      case "MobileLokerDetail":
        return <LokerDetailPage />;
      case "MobileAbsensi":
        return <MobileAbsensiPage />;
      case "MobileLemburAbsensi":
        return <MobileLemburAbsensiPage />;
      case "MobileLemburHistory":
        return <MobileLemburHistoryPage />;
      case "MobileKoreksiAbsen":
        return <MobileKoreksiAbsenPage />;
      case "MobileHistory":
        return <MobileHistoryPage />;
      case "MobileLeaveRequest":
        return <LeaveRequestPage user={user} />;
      case "MobileIdCard":
        return <IdCardPage user={user} />;
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

