import patternBg from "@/assets/bg/pattern-background.png";
import logoWhite from "@/assets/logo/POT–PejuangMimpi–Logo.png";

export function AppLoadingSkeleton() {
  return (
    <div className="w-full min-h-screen bg-zinc-950 flex justify-center font-sans antialiased overflow-hidden">
      {/* Clean centered mobile view */}
      <div className="w-full max-w-[480px] h-[100dvh] bg-[#F7F3EB] shadow-2xl flex flex-col relative overflow-hidden">
        
        {/* Scrollable Main Content Skeleton */}
        <div className="flex-1 overflow-y-auto pt-6 px-5 space-y-4">
          
          {/* Header Banner Appbar Card Skeleton */}
          <div className="-mt-6 -mx-5 relative mb-4">
            <div className="w-full bg-[#1e2a4a] text-white rounded-t-none rounded-b-[40px] shadow-lg shadow-[#1e2a4a]/20 border-b border-white/10 flex flex-col p-6 pt-11 pb-6 relative overflow-hidden">
              {/* Subtle Pattern Background */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: `url(${patternBg})`,
                  backgroundSize: "180px auto",
                  backgroundRepeat: "repeat",
                }}
              />

              {/* Top Row: User & Date */}
              <div className="flex justify-between items-center z-10 mb-5 relative">
                {/* Left: Avatar & Name */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/15 border border-white/10 flex items-center justify-center p-1.5 animate-pulse">
                    <img src={logoWhite} alt="Pejuang Mimpi" className="w-full h-full object-contain opacity-70" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="w-20 h-2.5 bg-white/20 rounded-sm animate-pulse" />
                    <div className="w-28 h-3.5 bg-white/30 rounded-sm animate-pulse" />
                  </div>
                </div>

                {/* Right: Date & Time */}
                <div className="flex flex-col items-end gap-1.5">
                  <div className="w-20 h-2.5 bg-white/20 rounded-sm animate-pulse" />
                  <div className="w-14 h-3.5 bg-white/30 rounded-sm animate-pulse" />
                </div>
              </div>

              {/* Middle: Total Wealth */}
              <div className="z-10 relative flex flex-col gap-1.5 mb-2">
                <div className="w-24 h-2.5 bg-white/20 rounded-sm animate-pulse" />
                <div className="w-44 h-7 bg-white/25 rounded-lg animate-pulse" />
              </div>

              {/* Footer Block */}
              <div className="flex flex-col gap-2 mt-2 z-10 relative">
                <div className="h-[1px] bg-white/15 w-full" />
                <div className="flex justify-between items-center pt-1">
                  <div className="w-36 h-3 bg-white/20 rounded-sm animate-pulse" />
                  <div className="w-24 h-5 bg-[#e0542c]/70 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Daily Motivation Quote Card Skeleton */}
          <div className="w-full bg-white rounded-2xl border border-zinc-200/70 p-4 shadow-xs flex items-center justify-between gap-3">
            <div className="flex-1 space-y-2">
              <div className="w-3/4 h-3 bg-zinc-200 rounded-sm animate-pulse" />
              <div className="w-full h-3 bg-zinc-200 rounded-sm animate-pulse" />
              <div className="w-1/2 h-3 bg-zinc-200 rounded-sm animate-pulse" />
            </div>
            <div className="w-14 h-14 rounded-xl bg-amber-100/60 border border-amber-200/50 animate-pulse shrink-0" />
          </div>

          {/* Celenganku Header Skeleton */}
          <div className="flex justify-between items-center pt-1">
            <div className="w-24 h-3.5 bg-zinc-300 rounded-sm animate-pulse" />
            <div className="w-16 h-3 bg-[#e0542c]/40 rounded-sm animate-pulse" />
          </div>

          {/* Celenganku Horizontal Cards Skeleton */}
          <div className="flex gap-3 overflow-hidden pb-1">
            {/* Card 1 */}
            <div className="w-32 h-36 rounded-2xl bg-gradient-to-b from-[#E3A330]/20 to-[#E3A330]/10 border border-[#E3A330]/30 p-3.5 flex flex-col justify-between shadow-xs shrink-0 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-[#E3A330]/30" />
              <div className="space-y-1.5">
                <div className="w-20 h-3 bg-zinc-400/40 rounded-sm" />
                <div className="w-14 h-2.5 bg-zinc-400/30 rounded-sm" />
              </div>
            </div>

            {/* Card 2 */}
            <div className="w-32 h-36 rounded-2xl bg-gradient-to-b from-[#4A7C82]/20 to-[#4A7C82]/10 border border-[#4A7C82]/30 p-3.5 flex flex-col justify-between shadow-xs shrink-0 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-[#4A7C82]/30" />
              <div className="space-y-1.5">
                <div className="w-20 h-3 bg-zinc-400/40 rounded-sm" />
                <div className="w-14 h-2.5 bg-zinc-400/30 rounded-sm" />
              </div>
            </div>

            {/* Card 3 (Add Card) */}
            <div className="w-32 h-36 rounded-2xl bg-white/60 border-2 border-dashed border-zinc-300/80 p-3.5 flex flex-col justify-between shrink-0 animate-pulse">
              <div className="w-6 h-6 rounded-md bg-zinc-200" />
              <div className="w-20 h-3 bg-zinc-300 rounded-sm" />
            </div>
          </div>

          {/* Statistik Celengan Section Skeleton */}
          <div className="flex justify-between items-center pt-2">
            <div className="w-32 h-3.5 bg-zinc-300 rounded-sm animate-pulse" />
            <div className="w-20 h-3 bg-zinc-250 rounded-sm animate-pulse" />
          </div>

          {/* Big Illustration Area Skeleton */}
          <div className="w-full h-44 rounded-3xl bg-gradient-to-b from-amber-100/60 to-amber-50/40 border border-amber-200/50 p-4 flex flex-col items-center justify-center gap-3 animate-pulse shadow-xs">
            <div className="w-20 h-20 rounded-full bg-amber-200/60" />
            <div className="w-32 h-3 bg-amber-300/60 rounded-sm" />
          </div>

          {/* Spacer */}
          <div className="h-28 w-full shrink-0" />
        </div>

        {/* Bottom Tab Bar Navigation Skeleton */}
        <div className="absolute bottom-0 left-0 right-0 h-[74px] pb-3 pt-1 bg-[#1e2a4a] border-t border-white/10 px-2 flex items-center justify-around z-30">
          <div className="w-full max-w-[440px] flex items-center justify-between relative h-full">
            
            {/* Active Pill Skeleton on Sangkar */}
            <div className="w-14 h-12 bg-gradient-to-tr from-[#e0542c] to-[#ff7e5a] rounded-2xl flex flex-col items-center justify-center gap-1 shadow-md shadow-black/20 animate-pulse">
              <div className="w-5 h-5 bg-white/40 rounded-sm" />
              <div className="w-8 h-2 bg-white/50 rounded-xs" />
            </div>

            {/* Lumbung tab */}
            <div className="w-14 h-12 flex flex-col items-center justify-center gap-1 opacity-50">
              <div className="w-5 h-5 bg-zinc-400/40 rounded-sm" />
              <div className="w-8 h-2 bg-zinc-400/30 rounded-xs" />
            </div>

            {/* Center Ayamku button */}
            <div className="w-14 h-14 -translate-y-4 rounded-full bg-gradient-to-tr from-[#e0542c] to-[#ff7e5a] flex items-center justify-center shadow-lg border-4 border-[#1e2a4a] animate-pulse">
              <div className="w-7 h-7 rounded-full bg-white/30" />
            </div>

            {/* Tunas tab */}
            <div className="w-14 h-12 flex flex-col items-center justify-center gap-1 opacity-50">
              <div className="w-5 h-5 bg-zinc-400/40 rounded-sm" />
              <div className="w-8 h-2 bg-zinc-400/30 rounded-xs" />
            </div>

            {/* Induk tab */}
            <div className="w-14 h-12 flex flex-col items-center justify-center gap-1 opacity-50">
              <div className="w-5 h-5 bg-zinc-400/40 rounded-sm" />
              <div className="w-8 h-2 bg-zinc-400/30 rounded-xs" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
