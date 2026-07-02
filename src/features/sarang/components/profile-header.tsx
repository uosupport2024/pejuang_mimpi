import { Camera } from "lucide-react";
import type { SarangUser } from "../types/sarang.type";
import patternBg from "@/assets/bg/pattern-background.png";

interface ProfileHeaderProps {
  user: SarangUser;
  onBack: () => void;
  onNotificationClick: () => void;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  // Get initials from user name
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="-mt-6 -mx-5 px-5 pt-6 pb-6 bg-[#1e2a4a] text-white flex items-center relative overflow-hidden rounded-b-[32px] shadow-md z-10">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `url(${patternBg})`,
          backgroundSize: "150px 150px",
        }}
      />

      {/* Profile info row */}
      <div className="flex items-center gap-4 relative z-10 w-full">
        {/* Avatar Container on the left (Square with rounded 12px) */}
        <div className="relative shrink-0">
          <div className="p-0.5 rounded-xl bg-white/10 backdrop-blur-xs shadow-md">
            <div className="w-14 h-14 rounded-xl bg-zinc-100 border border-white flex items-center justify-center font-bold text-lg text-zinc-700 shadow-inner">
              {initials}
            </div>
          </div>
          <button className="absolute -bottom-1 -right-1 bg-[#e0542c] hover:bg-[#c23f1b] text-white p-1 rounded-full border border-[#1e2a4a] hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm">
            <Camera className="w-2.5 h-2.5" />
          </button>
        </div>

        {/* Name and Email details on the right - height matched to avatar */}
        <div className="h-14 flex flex-col justify-between text-left min-w-0 flex-1 py-0.5">
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold text-white leading-none tracking-wide truncate">
              {user.name}
            </h2>
            <p className="text-[10px] text-zinc-300 font-semibold tracking-wide truncate leading-none">
              {user.email}
            </p>
          </div>
          <div className="flex">
            {(() => {
              const isUserActive = !user.status || 
                user.status.toLowerCase() === "active" || 
                user.status.toLowerCase() === "aktif";
              return (
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8.5px] font-bold border leading-none ${
                  isUserActive
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                    : "bg-zinc-500/15 text-zinc-400 border-zinc-500/25"
                }`}>
                  <span className={`w-1.2 h-1.2 rounded-full ${isUserActive ? "bg-emerald-400 animate-pulse" : "bg-zinc-400"}`} />
                  <span>{isUserActive ? "Aktif" : "Tidak Aktif"}</span>
                </span>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
