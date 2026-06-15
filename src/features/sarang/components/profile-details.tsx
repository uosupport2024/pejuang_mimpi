import type { SarangUser } from "../types/sarang.type";

interface ProfileDetailsProps {
  user: SarangUser;
  isOpen: boolean;
}

export function ProfileDetails({ user, isOpen }: ProfileDetailsProps) {
  if (!isOpen) return null;

  return (
    <div className="bg-white p-4 rounded-2xl border border-zinc-150 shadow-xs space-y-3.5 animate-slide-up duration-200">
      <h3 className="text-xs font-extrabold text-zinc-950 uppercase tracking-wide text-left">
        Informasi Karyawan
      </h3>
      
      <div className="divide-y divide-zinc-100 text-xs font-semibold space-y-2.5">
        <div className="flex justify-between items-center pt-2">
          <span className="text-zinc-400">Email</span>
          <span className="text-zinc-800 truncate max-w-[200px]">{user.email}</span>
        </div>
        <div className="flex justify-between items-center pt-2">
          <span className="text-zinc-400">Telepon</span>
          <span className="text-zinc-800">{user.telepon || "081382440615"}</span>
        </div>
        <div className="flex justify-between items-center pt-2">
          <span className="text-zinc-400">Gender</span>
          <span className="text-zinc-800">{user.gender || "Laki-Laki"}</span>
        </div>
        <div className="flex justify-between items-center pt-2">
          <span className="text-zinc-400">Status Nikah</span>
          <span className="text-zinc-800">{user.status_nikah || "K/0"}</span>
        </div>
        <div className="flex justify-between items-center pt-2">
          <span className="text-zinc-400">Tanggal Gabung</span>
          <span className="text-zinc-800">{user.tgl_join || "2025-04-14"}</span>
        </div>
      </div>
    </div>
  );
}
