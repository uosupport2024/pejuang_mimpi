import { ChevronLeft, Bell, Camera } from "lucide-react";
import type { SarangUser } from "../types/sarang.type";

interface ProfileHeaderProps {
  user: SarangUser;
  onBack: () => void;
  onNotificationClick: () => void;
}

export function ProfileHeader({ user, onBack, onNotificationClick }: ProfileHeaderProps) {
  // Get initials from user name
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="-mt-6 -mx-5 px-5 pt-5 pb-8 bg-[#1e2a4a] text-white flex flex-col items-center relative rounded-b-none z-10">
      {/* Top Header Bar */}
      <div className="w-full flex justify-between items-center mb-6">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/15 active:scale-95 flex items-center justify-center text-white transition-all cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 -ml-0.5" />
        </button>

        {/* Title */}
        <span className="text-sm font-bold tracking-wide">Account</span>

        {/* Notification Bell */}
        <button
          onClick={onNotificationClick}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/15 active:scale-95 flex items-center justify-center text-white transition-all cursor-pointer relative"
        >
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border border-[#1e2a4a]" />
        </button>
      </div>

      {/* Avatar Container */}
      <div className="relative mb-3">
        <div className="w-20 h-20 rounded-full bg-zinc-200 border-2 border-white/90 flex items-center justify-center font-bold text-2xl text-zinc-700 shadow-md">
          {initials}
        </div>
        <button className="absolute bottom-0 right-0 bg-[#e0542c] hover:bg-[#c23f1b] text-white p-1.5 rounded-full border border-[#1e2a4a] hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm">
          <Camera className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Name and Email */}
      <div className="space-y-0.5 text-center">
        <h2 className="text-base font-bold text-white leading-tight">
          {user.name}
        </h2>
        <p className="text-[10.5px] text-zinc-300 font-medium tracking-wide">
          {user.email}
        </p>
      </div>
    </div>
  );
}
