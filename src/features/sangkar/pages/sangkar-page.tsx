import { HeaderBanner } from "../components/header-banner";
import { MotivationQuote } from "../components/motivation-quote";
import { CelengankuCarousel } from "../components/celenganku-carousel";
import { StatistikCelengan } from "../components/statistik-celengan";
import { TunasLokerList } from "../components/tunas-loker-list";
import type { SangkarPageProps } from "../types/sangkar.type";

export function SangkarPage({ user }: SangkarPageProps) {
  return (
    <div className="space-y-4">
      {/* Collapsible Header Banner Wrapper */}
      <HeaderBanner user={user} />

      {/* Daily Motivation quote */}
      <MotivationQuote />

      {/* Celenganku Carousel Card Section */}
      <CelengankuCarousel />

      {/* Statistik Celengan Section */}
      <StatistikCelengan />

      {/* Daftar Tunas Terbaru Section */}
      <TunasLokerList />
    </div>
  );
}
