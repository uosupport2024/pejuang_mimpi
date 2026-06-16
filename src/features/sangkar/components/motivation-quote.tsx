import { useMemo } from 'react';
import ayamLogo from '@/assets/illustrations/logo-talk.png';

const QUOTES = [
  "Konsistensi dimulai dari kehadiran setiap hari. Sedikit demi sedikit lama-lama menjadi bukit!",
  "Mimpi besar dimulai dari langkah kecil hari ini. Jangan lupa nabung ya!",
  "Setiap koin yang kamu simpan adalah investasi untuk masa depanmu yang lebih cerah.",
  "Disiplin adalah jembatan antara tujuan dan pencapaian. Yuk, semangat terus!",
  "Hari yang baik untuk mulai menyisihkan uang. Masa depanmu pasti berterima kasih!",
  "Tabungan yang sedikit, jika dikumpulkan terus, akan menjadi kebebasan finansialmu esok hari.",
  "Fokus pada tujuan, bukan pada rintangan. Ayo capai target impianmu bersama!"
];

export function MotivationQuote() {
  // Pilih quote harian berdasarkan hari dalam seminggu (0-6)
  const dailyQuote = useMemo(() => {
    const dayOfWeek = new Date().getDay();
    return QUOTES[dayOfWeek % QUOTES.length];
  }, []);

  return (
    <div className="mt-8 flex items-end gap-3 px-1">
      {/* Avatar Ayam */}
      <div className="shrink-0 relative">
        <div className="w-16 h-16 rounded-full flex items-center justify-center relative z-10 -ml-1">
          <img
            src={ayamLogo}
            alt="Maskot Pejuang Mimpi"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Bubble Chat - Retro/Pixel Style */}
      <div className="relative bg-white border-2 border-zinc-900 px-4 pt-4 pb-3.5 mb-2 flex-1 ml-3 shadow-[3px_3px_0px_0px_rgba(24,24,27,1)] rounded-lg">
        {/* Outline Ekor */}
        <div className="absolute -left-[10px] bottom-4 w-0 h-0 border-y-[8px] border-y-transparent border-r-[8px] border-r-zinc-900" />
        {/* Fill Ekor */}
        <div className="absolute -left-[6px] bottom-[18px] w-0 h-0 border-y-[6px] border-y-transparent border-r-[6px] border-r-white" />

        <p className="font-mono text-[10.5px] font-bold text-zinc-900 leading-relaxed relative z-10 tracking-tight">
          &ldquo;{dailyQuote}&rdquo;
        </p>
      </div>
    </div>
  );
}
