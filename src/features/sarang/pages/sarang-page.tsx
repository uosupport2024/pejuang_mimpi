import { ProfileHeader } from "../components/profile-header";
import { ProfileMenu } from "../components/profile-menu";
import { ProfileDetails } from "../components/profile-details";
import { useSarang } from "../hooks/use-sarang";
import type { SarangPageProps } from "../types/sarang.type";
import { toast } from "sonner";

export function SarangPage({ user, onLogout }: SarangPageProps) {
  const { isDetailsOpen, toggleDetails, handleMenuClick, goBack } = useSarang();

  return (
    <div className="space-y-4">
      {/* Profile Header Block */}
      <ProfileHeader
        user={user}
        onBack={goBack}
        onNotificationClick={() => toast.info("Membuka Kotak Masuk Notifikasi...")}
      />

      {/* Profile Details (Collapsible Panel) */}
      <ProfileDetails user={user} isOpen={isDetailsOpen} />

      {/* Settings Menu List (Logout is integrated as Group 4 card block) */}
      <ProfileMenu
        user={user}
        isDetailsOpen={isDetailsOpen}
        onToggleDetails={toggleDetails}
        onMenuClick={handleMenuClick}
        onLogout={onLogout}
      />
    </div>
  );
}
