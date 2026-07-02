import { useState } from "react";
import { getCelenganStyle } from "./celenganku-carousel";
import type { Celengan } from "../types/celengan";
import logoSad from "@/assets/illustrations/logo_sad.png";
import { getChickenIcon } from "@/shared/utils/icons";
import { motion, AnimatePresence } from "motion/react";

function getMotivationalQuote(name: string, pct: number): string {
  const lowerName = name.toLowerCase();

  // 1. Rumah / Kebun / Properti
  if (lowerName.includes("rumah") || lowerName.includes("kebun") || lowerName.includes("kamar")) {
    if (pct === 0) return "Satu bata pertama dimulai dari sini. Ayo kumpulkan uang awalmu!";
    if (pct < 30) return "Pondasi rumah impianmu mulai terbentuk. Terus konsisten menabung!";
    if (pct < 70) return "Dinding-dinding impian sudah tegak berdiri. Setengah jalan lagi menuju kunci rumah baru!";
    if (pct < 100) return "Atap rumah impian hampir terpasang sempurna! Tinggal sedikit lagi untuk bisa dihuni.";
    return "Selamat! Rumah impianmu sudah lunas dan siap ditinggali. Kerja kerasmu luar biasa!";
  }

  // 2. Motor / Sepeda / Mobil / Kendaraan
  if (lowerName.includes("motor") || lowerName.includes("sepeda") || lowerName.includes("mobil") || lowerName.includes("perahu")) {
    if (pct === 0) return "Mesin impian baru siap dinyalakan. Masukkan bahan bakar tabungan pertamamu!";
    if (pct < 30) return "Kunci kontak sudah siap, roda mulai berputar perlahan. Tetap gas terus!";
    if (pct < 70) return "Kecepatan menabungmu mantap! Setengah rute perjalanan sudah terlewati.";
    if (pct < 100) return "Garis finish sudah terlihat di depan mata! Sedikit gas lagi untuk bawa pulang kendaraan impianmu.";
    return "Brum brum! Tabungan lunas. Selamat menikmati perjalanan dengan kendaraan impian barumu!";
  }

  // 3. Restoran / Usaha / Kuliner
  if (lowerName.includes("restoran") || lowerName.includes("usaha") || lowerName.includes("bisnis") || lowerName.includes("toko")) {
    if (pct === 0) return "Resep sukses sudah ditulis. Kumpulkan modal awal untuk buka dapur usahamu!";
    if (pct < 30) return "Bahan-bahan modal mulai terkumpul. Aromanya sudah mulai tercium harum!";
    if (pct < 70) return "Modal usaha sudah setengah matang! Pengunjung pertama sudah menunggumu.";
    if (pct < 100) return "Dapur siap mengebul! Sedikit lagi modal terkumpul dan usahamu siap grand opening.";
    return "Tokomu resmi dibuka! Modal impian telah terkumpul penuh. Semoga usahamu sukses besar!";
  }

  // 4. Laptop / Gadget / HP / Komputer
  if (lowerName.includes("laptop") || lowerName.includes("hp") || lowerName.includes("smartphone") || lowerName.includes("gadget") || lowerName.includes("komputer")) {
    if (pct === 0) return "Spesifikasi impian sudah dipilih. Yuk, nyalakan daya tabungan pertamamu!";
    if (pct < 30) return "Sinyal tabungan stabil. Proses booting impianmu berjalan lancar!";
    if (pct < 70) return "Download progres sudah 50%! Gadget impianmu sudah setengah jalan terkumpul.";
    if (pct < 100) return "Progres sudah 90%, tinggal instalan akhir! Sedikit lagi gadget baru ada di genggamanmu.";
    return "Selesai! Gadget baru siap di-unboxing. Selamat menikmati hasil jerih payahmu!";
  }

  // 5. Wisuda / Kuliah / Sekolah / Pendidikan
  if (lowerName.includes("wisuda") || lowerName.includes("kuliah") || lowerName.includes("sekolah") || lowerName.includes("buku") || lowerName.includes("guru")) {
    if (pct === 0) return "Langkah awal menuju toga kebanggaan. Mulai isi celengan pendidikanmu sekarang!";
    if (pct < 30) return "Semester awal perjuangan tabungan dimulai. Tetap semangat belajar dan menabung!";
    if (pct < 70) return "Setengah masa studi terlewati. Skripsi tabunganmu sudah mulai dikerjakan!";
    if (pct < 100) return "Sidang akhir tabungan sudah dekat! Sedikit lagi toga kelulusan siap dipakai.";
    return "Wisuda sukses! Tabungan pendidikanmu telah lunas. Masa depan cerah menantimu!";
  }

  // Generic Fallback
  if (pct === 0) return "Setiap mimpi besar dimulai dari satu langkah kecil. Ayo mulai menabung hari ini!";
  if (pct < 30) return "Langkah awal yang baik! Benih tabunganmu mulai tumbuh. Jaga terus konsistensinya.";
  if (pct < 70) return "Hebat! Kamu sudah setengah jalan menuju impianmu. Pertahankan momentum ini!";
  if (pct < 100) return "Luar biasa! Target impianmu sudah sangat dekat. Dorongan terakhir untuk mencapainya!";
  return "Impianmu tercapai! Selamat menikmati hasil perjuangan menabungmu yang luar biasa.";
}

export function StatistikCelengan({ celengans, loading }: { celengans: Celengan[]; loading?: boolean }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const formatCompactRupiah = (val: number) => {
    if (val >= 1_000_000_000)
      return "Rp " + (val / 1_000_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 }).replace(",", ".") + " M";
    if (val >= 1_000_000)
      return "Rp " + (val / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 }).replace(",", ".") + " jt";
    if (val >= 1_000)
      return "Rp " + (val / 1_000).toLocaleString("id-ID", { maximumFractionDigits: 1 }).replace(",", ".") + " rb";
    return "Rp " + val.toLocaleString("id-ID");
  };

  // Limit display to top 4 celengans
  const activeCelengans = celengans.slice(0, 4);

  const items = activeCelengans.map((item) => {
    const pct = item.target_amount > 0 ? Math.min(Math.round((item.current_amount / item.target_amount) * 100), 100) : 0;
    return {
      id: item.id,
      name: item.name,
      filled: item.current_amount,
      target: item.target_amount,
      icon: item.icon,
      pct,
    };
  });

  if (loading) {
    return (
      <div className="space-y-3.5 text-left animate-pulse">
        {/* Title */}
        <div className="flex justify-between items-center px-0.5">
          <div className="h-3.5 bg-slate-300 rounded w-28" />
          <div className="h-3 bg-slate-200 rounded w-16" />
        </div>

        {/* Pill buttons skeleton */}
        <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-8 w-24 bg-white border border-slate-200 rounded-full shrink-0"
            />
          ))}
        </div>

        {/* Focus Card skeleton */}
        <div className="bg-white border border-slate-200/50 rounded-3xl p-5 flex flex-col items-center space-y-4 min-h-[176px]">
          <div className="w-24 h-24 bg-slate-100 rounded-full" />
          <div className="w-full space-y-2.5">
            <div className="h-4 bg-slate-150 rounded w-1/2 mx-auto" />
            <div className="h-3 bg-slate-100 rounded w-1/3 mx-auto" />
            <div className="h-2 bg-slate-100 rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (celengans.length === 0) {
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center px-0.5">
          <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Statistik Celengan
          </span>
          <span className="text-[10px] text-zinc-400 font-bold">Progres Target</span>
        </div>
        <div className="h-44 flex flex-col items-center justify-center bg-zinc-50/50 rounded-2xl border border-dashed border-gray-250 p-4 text-center">
          <img src={logoSad} alt="Sedih" className="w-14 h-14 mb-2 opacity-80" />
          <span className="text-xs text-slate-500 font-bold">Belum ada data celengan</span>
          <span className="text-[10px] text-slate-405 mt-0.5">Silakan buat celengan baru di atas.</span>
        </div>
      </div>
    );
  }

  const selectedCelengan = items[selectedIndex] || items[0];
  const selectedStyle = getCelenganStyle(selectedCelengan.id);

  return (
    <div className="space-y-3.5 text-left">
      {/* Title */}
      <div className="flex justify-between items-center px-0.5">
        <span className="text-xs font-bold text-gray-900 uppercase tracking-wider font-sans">
          Statistik Celengan
        </span>
        <span className="text-[10px] text-zinc-400 font-bold">Progres Target</span>
      </div>

      {/* Pill buttons horizontal selector */}
      <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none snap-x">
        {items.map((item, idx) => {
          const isSelected = selectedIndex === idx;
          const itemStyle = getCelenganStyle(item.id);
          return (
            <motion.button
              key={item.id}
              onClick={() => setSelectedIndex(idx)}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-1.5 pl-4 pr-4 py-1.5 rounded-full border text-[11px] font-extrabold whitespace-nowrap transition-all duration-200 snap-start cursor-pointer ${isSelected
                ? "border-transparent text-white shadow-md shadow-slate-900/10"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              style={isSelected ? { background: itemStyle.solid } : {}}
            >
              <img src={getChickenIcon(item.icon)} alt={item.name} className="w-4 h-4 object-contain" />
              <span>{item.name}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black leading-none flex items-center justify-center shrink-0 mr-1.5 ${isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                {item.pct}%
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Main Focus Dashboard Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCelengan.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className={`bg-gradient-to-br ${selectedStyle.gradient} text-white p-5 rounded-3xl shadow-lg relative overflow-hidden flex flex-col items-center text-center`}
        >
          {/* Giant semi-transparent decorative chicken icon */}
          <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
            <img src={getChickenIcon(selectedCelengan.icon)} alt="" className="w-40 h-40 object-contain" />
          </div>

          {/* Large chicken avatar inside circular progress border */}
          <div className="relative w-36 h-36 flex items-center justify-center mb-3">
            {/* Stable design border ring */}
            <div className="absolute inset-0" />

            <motion.img
              src={getChickenIcon(selectedCelengan.icon)}
              alt={selectedCelengan.name}
              className="w-32 h-32 object-contain relative z-10"
              animate={{
                y: [0, -10, 0],
                rotate: [0, 6, -6, 0],
                scale: [1, 1.06, 0.98, 1.03, 1]
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>

          {/* Content & Progress Stats */}
          <div className="w-full space-y-3 z-10">
            <div>
              <h4 className="text-sm font-extrabold tracking-tight truncate px-2">{selectedCelengan.name}</h4>
              <p className="text-[9px] text-white/95 mt-0.5 font-bold uppercase tracking-wider">
                {formatCompactRupiah(selectedCelengan.filled)} dari {formatCompactRupiah(selectedCelengan.target)} ({selectedCelengan.pct}%)
              </p>
              {/* Unique Motivational Phrase */}
              <p className="text-[10px] text-white/90 mt-2 px-3 italic leading-relaxed font-semibold">
                "{getMotivationalQuote(selectedCelengan.name, selectedCelengan.pct)}"
              </p>
            </div>

            {/* Glowing Linear Progress Bar */}
            <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden shadow-inner">
              <motion.div
                className="bg-white h-full rounded-full shadow-md"
                initial={{ width: 0 }}
                animate={{ width: `${selectedCelengan.pct}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
