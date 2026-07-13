import { HeaderBanner } from "../components/header-banner";
import { MotivationQuote } from "../components/motivation-quote";
import { CelengankuCarousel } from "../components/celenganku-carousel";
import { StatistikCelengan } from "../components/statistik-celengan";
import { TunasLokerList } from "../components/tunas-loker-list";
import type { SangkarPageProps } from "../types/sangkar.type";
import { useCelengans } from "../hooks/use-celengan";

export function SangkarPage({ user }: SangkarPageProps) {
  const { celengans, loading, refresh } = useCelengans();

  return (
    <div className="space-y-4">
      {/* Collapsible Header Banner Wrapper */}
      <HeaderBanner user={user} celengans={celengans} loading={loading} />

      {/* Daily Motivation quote */}
      <MotivationQuote />

      {/* Celenganku Carousel Card Section */}
      <CelengankuCarousel celengans={celengans} onRefresh={refresh} loading={loading} />

      {/* Statistik Celengan Section */}
      <StatistikCelengan celengans={celengans} loading={loading} />

      {/* Daftar Tunas Terbaru Section */}
      <TunasLokerList />
    </div>
  );
}
