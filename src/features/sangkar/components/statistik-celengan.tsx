import Chart from "react-apexcharts";

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

export function StatistikCelengan() {
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
    colors: ["#7c3aed", "#ec4899", "#06b6d4", "#eab308"],
    labels: ["Rumah", "Motor", "Liburan Bali", "Laptop Baru"],
  };

  const mainSeries = [20, 40, 70, 90];

  const formatCompactRupiah = (val: number) => {
    if (val >= 1_000_000_000)
      return "Rp " + (val / 1_000_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 }).replace(",", ".") + " M";
    if (val >= 1_000_000)
      return "Rp " + (val / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 }).replace(",", ".") + " jt";
    if (val >= 1_000)
      return "Rp " + (val / 1_000).toLocaleString("id-ID", { maximumFractionDigits: 1 }).replace(",", ".") + " rb";
    return "Rp " + val.toLocaleString("id-ID");
  };

  const items = [
    { name: "Rumah", filled: 40_000_000, target: 200_000_000, color: "#7c3aed", pct: 20 },
    { name: "Motor", filled: 12_000_000, target: 30_000_000, color: "#ec4899", pct: 40 },
    { name: "Liburan Bali", filled: 7_000_000, target: 10_000_000, color: "#06b6d4", pct: 70 },
    { name: "Laptop Baru", filled: 18_000_000, target: 20_000_000, color: "#eab308", pct: 90 },
  ];

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center px-0.5">
        <span className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">
          Statistik Celengan
        </span>
        <span className="text-[10px] text-zinc-400 font-bold">Progres Target</span>
      </div>

      <div className="flex items-stretch gap-2.5">
        {/* Main radialBar chart — Left, stretches to match card list height */}
        <div className="w-1/2 flex justify-center items-center bg-zinc-50/50 rounded-2xl">
          <Chart
            options={mainChartOptions}
            series={mainSeries}
            type="radialBar"
            height={180}
            width="100%"
          />
        </div>

        {/* Card list — Right */}
        <div className="w-1/2 flex flex-col gap-1.5">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-xl px-2.5 py-1 shadow-sm flex-1"
              style={{ background: item.color }}
            >
              {/* Left: name + amount */}
              <div className="flex flex-col gap-0.5 flex-1 min-w-0 pr-1">
                <span className="text-[10px] font-extrabold leading-none truncate text-white">
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
