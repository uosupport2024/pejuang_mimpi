import { Home, Bike, Palmtree, Laptop, ArrowLeft } from "lucide-react";
import { useRouter } from "@/shared/router/router";
import { useAddCelengan } from "../hooks/use-celengan";
import patternBg from "@/assets/bg/pattern-background.png";

export function CelenganAddPage() {
  const { navigate } = useRouter();
  const {
    name,
    setName,
    targetAmount,
    setTargetAmount,
    icon,
    setIcon,
    isSubmitting,
    submit
  } = useAddCelengan();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submit();
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F3EB] text-slate-800 pb-20 relative -mt-6 -mx-5">
      {/* Top sticky navigation */}
      <div className="bg-[#1e2a4a] text-white flex items-center gap-3 px-5 pt-4 pb-4 sticky -top-6 z-20 shadow-md relative overflow-hidden">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `url(${patternBg})`,
            backgroundSize: "150px 150px",
            backgroundRepeat: "repeat"
          }}
        />
        <button
          onClick={() => navigate("MobileHome")}
          className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer animate-none relative z-10"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="text-base font-bold tracking-tight relative z-10">Tambah Celengan</span>
      </div>

      {/* Main Container */}
      <div className="p-5 max-w-md mx-auto w-full">
        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          {/* Nama Celengan */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Nama Celengan</label>
            <input
              type="text"
              required
              placeholder="Contoh: Beli Sepeda, Dana Darurat"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-slate-200/80 rounded-2xl px-4 py-3.5 text-sm font-semibold text-slate-800 shadow-sm focus:outline-none focus:border-[#e0542c] focus:ring-1 focus:ring-[#e0542c]/20 transition-all"
            />
          </div>

          {/* Target Dana */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Target Dana (Rupiah)</label>
            <div className="relative shadow-sm rounded-2xl">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Rp</span>
              <input
                type="number"
                required
                placeholder="Contoh: 15000000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full bg-white border border-slate-200/80 rounded-2xl pl-10 pr-4 py-3.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#e0542c] focus:ring-1 focus:ring-[#e0542c]/20 transition-all"
              />
            </div>
          </div>

          {/* Icon/Kategori selector */}
          <div className="space-y-2">
            <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Icon / Kategori</label>
            <div className="grid grid-cols-4 gap-2.5">
              {[
                { id: "rumah", label: "Rumah", Icon: Home },
                { id: "motor", label: "Motor", Icon: Bike },
                { id: "liburanBali", label: "Liburan", Icon: Palmtree },
                { id: "laptopBaru", label: "Laptop", Icon: Laptop },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setIcon(opt.id)}
                  className={`flex flex-col items-center justify-center py-3.5 px-2 rounded-2xl border-2 transition-all cursor-pointer shadow-sm ${
                    icon === opt.id
                      ? "border-[#e0542c] bg-white text-[#e0542c]"
                      : "border-transparent bg-white hover:border-slate-200 text-slate-400"
                  }`}
                >
                  <opt.Icon className="w-6 h-6 mb-1.5" />
                  <span className="text-[9px] font-bold tracking-tight">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#e0542c] hover:bg-[#c23f1b] text-white py-3.5 rounded-2xl font-bold text-sm shadow-md shadow-[#e0542c]/15 transition-all cursor-pointer disabled:opacity-50 mt-4"
          >
            {isSubmitting ? "Memproses..." : "Buat Celengan"}
          </button>
        </form>
      </div>
    </div>
  );
}
