import bgQuote from '@/assets/bg/bg-quote-1.png';

export function MotivationQuote() {
  return (
    <div 
      className="w-full rounded-[24px] relative overflow-hidden flex flex-col justify-center min-h-[135px] bg-no-repeat bg-[length:100%_100%] shadow-xs text-left"
      style={{ backgroundImage: `url(${bgQuote})` }}
    >
      {/* Blurred background overlay - flush left/top/bottom, fading to 0 opacity on the right */}
      <div 
        className="absolute inset-y-0 left-0 w-[45%] bg-gradient-to-r from-[#F7F3EB]/95 via-[#F7F3EB]/50 to-transparent backdrop-blur-xs pointer-events-none rounded-l-[24px]"
      />

      <div className="max-w-[40%] z-10 space-y-1 relative pl-5">
        <h3 className="text-[12px] font-black text-[#1e2a4a] leading-tight">
          Terus Berjuang, Tingkatkan Dirimu!
        </h3>
        <p className="text-[9px] font-bold text-zinc-700 leading-relaxed">
          Belajar, bekerja, menabung untuk masa depan yang lebih baik.
        </p>
      </div>
    </div>
  );
}
