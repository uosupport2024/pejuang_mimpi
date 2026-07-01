import Chart from "react-apexcharts";
import { getCelenganStyle } from "./celenganku-carousel";
import type { Celengan } from "../types/celengan";
import logoSad from "@/assets/illustrations/logo_sad.png";

// Mini radialBar ApexCharts per card (dengan animasi)
function MiniRadial({ pct }: { pct: number; color: string }) {
  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "radialBar",
      sparkline: { enabled: true },
      animations: {
        enabled: true,
        speed: 800,
        animateGradually: { enabled: true, delay: 100 },
        dynamicAnimation: { enabled: true, speed: 400 },
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -130,
        endAngle: 130,
        hollow: {
          size: "52%",
          background: "transparent",
        },
        track: {
          background: "rgba(255,255,255,0.25)",
          strokeWidth: "100%",
          margin: 0,
        },
        dataLabels: {
          name: { show: false },
          value: {
            show: true,
            fontSize: "9px",
            fontWeight: 800,
            color: "#ffffff",
            offsetY: 4,
            formatter: (val) => `${val}%`,
          },
        },
      },
    },
    fill: {
      type: "solid",
      colors: ["#ffffff"],
    },
    stroke: { lineCap: "round" },
    states: {
      hover: { filter: { type: "none" } },
      active: { filter: { type: "none" } },
    },
  };

  return (
    <Chart
      options={options}
      series={[pct]}
      type="radialBar"
      height={52}
      width={52}
    />
  );
}

export function StatistikCelengan({ celengans }: { celengans: Celengan[] }) {
  const formatCompactRupiah = (val: number) => {
    if (val >= 1_000_000_000)
      return "Rp " + (val / 1_000_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 }).replace(",", ".") + " M";
    if (val >= 1_000_000)
      return "Rp " + (val / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 }).replace(",", ".") + " jt";
    if (val >= 1_000)
      return "Rp " + (val / 1_000).toLocaleString("id-ID", { maximumFractionDigits: 1 }).replace(",", ".") + " rb";
    return "Rp " + val.toLocaleString("id-ID");
  };

  // Limit display to top 4 celengans to avoid breaking layout
  const activeCelengans = celengans.slice(0, 4);

  const items = activeCelengans.map((item) => {
    const pct = item.target_amount > 0 ? Math.min(Math.round((item.current_amount / item.target_amount) * 100), 100) : 0;
    const style = getCelenganStyle(item.icon);
    return {
      name: item.name,
      filled: item.current_amount,
      target: item.target_amount,
      color: style.solid,
      pct,
    };
  });

  const mainChartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: "radialBar",
      sparkline: { enabled: true },
      animations: { enabled: true, speed: 900 },
    },
    plotOptions: {
      radialBar: {
        startAngle: 0,
        endAngle: 270,
        hollow: {
          margin: 5,
          size: "30%",
          background: "transparent",
        },
        track: { show: false },
        dataLabels: {
          name: { show: false },
          value: { show: false },
        },
      },
    },
    stroke: { lineCap: "round" },
    colors: items.map((item) => item.color),
    labels: items.map((item) => item.name),
  };

  const mainSeries = items.map((item) => item.pct);

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

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center px-0.5">
        <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
          Statistik Celengan
        </span>
        <span className="text-[10px] text-zinc-400 font-bold">Progres Target</span>
      </div>

      <div className="flex items-stretch gap-2.5">
        {/* Main radialBar chart — Left, stretches to match card list height */}
        <div className="w-1/2 flex justify-center items-center bg-zinc-50/50 rounded-2xl p-2">
          {mainSeries.length > 0 ? (
            <Chart
              options={mainChartOptions}
              series={mainSeries}
              type="radialBar"
              height={180}
              width="100%"
            />
          ) : (
            <span className="text-xs text-slate-400">Loading chart...</span>
          )}
        </div>

        {/* Card list — Right */}
        <div className="w-1/2 flex flex-col gap-1.5 justify-center">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-xl px-2.5 py-1 shadow-sm flex-1 min-h-[38px]"
              style={{ background: item.color }}
            >
              {/* Left: name + amount */}
              <div className="flex flex-col gap-0.5 flex-1 min-w-0 pr-1 text-left">
                <span className="text-[10px] font-bold leading-none truncate text-white">
                  {item.name}
                </span>
                <span className="text-[8.5px] font-medium leading-none text-white/75 mt-0.5">
                  {formatCompactRupiah(item.filled)} / {formatCompactRupiah(item.target)}
                </span>
              </div>

              {/* Right: mini ApexCharts radialBar */}
              <div className="shrink-0 -mr-1.5">
                <MiniRadial pct={item.pct} color={item.color} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
