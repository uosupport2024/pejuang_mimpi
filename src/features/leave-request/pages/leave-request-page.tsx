import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "@/shared/router/router";
import { useLeave } from "../hooks/use-leave";
import { LeaveForm } from "../components/leave-form";
import patternBg from "@/assets/bg/pattern-background.png";

interface LeaveRequestPageProps {
  user: any;
}

export function LeaveRequestPage({ user }: LeaveRequestPageProps) {
  const { navigate } = useRouter();
  const location = useLocation();
  const selectedType = location.state?.selectedType;
  const editItem = location.state?.editItem;
  const hook = useLeave(user, selectedType);

  useEffect(() => {
    if (editItem) {
      hook.startEdit(editItem);
    }
  }, [editItem]);

  return (
    <div className="space-y-4 pb-12">
      {/* Redesigned Premium Header Bar with Pattern Background */}
      <div className="relative -mx-5 -mt-6 mb-4 overflow-hidden rounded-b-2xl bg-[#1e2a4a] text-white">
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `url(${patternBg})`,
            backgroundSize: "150px 150px",
            backgroundRepeat: "repeat"
          }}
        />
        <div className="relative z-10 flex items-center justify-between px-6 pt-7 pb-20 gap-3.5">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => navigate("MobileLumbung")}
              className="p-2 hover:bg-white/10 active:scale-95 rounded-full transition-all cursor-pointer text-white border border-white/10 bg-white/5 backdrop-blur-xs"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold tracking-widest uppercase text-white/70 leading-none">Layanan Mandiri</span>
              <h1 className="text-base font-bold tracking-tight text-white mt-1.5 leading-none">
                {hook.isEditMode ? "Edit Pengajuan Cuti & Izin" : "Permintaan Cuti Karyawan"}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Leave Form (Inside White Card) */}
      <div className="-mt-18 relative z-10 mx-1">
        <LeaveForm hook={hook} />
      </div>
    </div>
  );
}
