import { ArrowLeft } from "lucide-react";
import { useRouter } from "@/shared/router/router";
import { useAddCelengan } from "../hooks/use-celengan";
import patternBg from "@/assets/bg/pattern-background.png";
import { formatThousands } from "@/shared/utils/format";
import { Input } from "@/shared/components/ui/input";
import { CHICKEN_ICONS, getChickenIconLabel } from "@/shared/utils/icons";
import { motion } from "motion/react";

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

  const iconKeys = Object.keys(CHICKEN_ICONS);

  const handleIconSelect = (key: string) => {
    setIcon(key);
    // Autofill name if it is empty or matches a previous chicken icon label
    if (!name.trim() || Object.values(CHICKEN_ICONS).some((item) => name === item.name)) {
      setName(getChickenIconLabel(key));
    }
  };

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
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="p-5 max-w-md mx-auto w-full"
      >
        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          {/* Nama Celengan */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Nama Celengan</label>
            <Input
              type="text"
              required
              placeholder="Contoh: Beli Sepeda, Dana Darurat"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white border-slate-200/80 rounded-2xl px-4 py-3.5 h-12 text-sm font-semibold text-slate-800 shadow-sm focus-visible:ring-[#e0542c]/20"
            />
          </div>

          {/* Target Dana */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Target Dana (Rupiah)</label>
            <div className="relative shadow-sm rounded-2xl">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Rp</span>
              <Input
                type="text"
                required
                placeholder="Contoh: 15.000.000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(formatThousands(e.target.value))}
                className="bg-white border-slate-200/80 rounded-2xl pl-10 pr-4 py-3.5 h-12 text-sm font-bold text-slate-800 focus-visible:ring-[#e0542c]/20 text-left"
              />
            </div>
          </div>

          {/* Chicken Icon selector */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Pilih Icon Celengan</label>
              <span className="text-[9px] text-[#e0542c] font-black">{getChickenIconLabel(icon)}</span>
            </div>
            <div
              className="grid grid-cols-4 gap-2.5 max-h-60 overflow-y-auto p-2 bg-white rounded-2xl border border-slate-200/50 shadow-inner scrollbar-thin"
            >
              {iconKeys.map((key) => {
                const iconSrc = CHICKEN_ICONS[key].url;
                const isSelected = icon === key;
                return (
                  <motion.button
                    key={key}
                    type="button"
                    onClick={() => handleIconSelect(key)}
                    whileTap={{ scale: 0.94 }}
                    className={`flex items-center justify-center p-2 rounded-2xl border-2 transition-all cursor-pointer shadow-sm w-16 h-16 bg-white mx-auto ${
                      isSelected
                        ? "border-[#e0542c] bg-orange-50/10"
                        : "border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    <img src={iconSrc} alt={key} className="w-12 h-12 object-contain" />
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-[#e0542c] hover:bg-[#c23f1b] text-white py-3.5 rounded-2xl font-bold text-sm shadow-md shadow-[#e0542c]/15 transition-all cursor-pointer disabled:opacity-50 mt-4"
          >
            {isSubmitting ? "Memproses..." : "Buat Celengan"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
