import Chart from "react-apexcharts";

export function StatistikCelengan() {
  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'radialBar',
      sparkline: {
        enabled: true
      }
    },
    plotOptions: {
      radialBar: {
        startAngle: 0,
        endAngle: 270,
        hollow: {
          margin: 5,
          size: '30%',
          background: 'transparent',
        },
        track: {
          show: false,
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            show: false,
          }
        }
      }
    },
    stroke: {
      lineCap: 'round'
    },
    colors: ["#7c3aed", "#ec4899", "#06b6d4", "#eab308"],
    labels: ['Rumah', 'Motor', 'Liburan Bali', 'Laptop Baru'],
  };

  const chartSeries = [20, 40, 70, 90];

  const formatCompactRupiah = (val: number) => {
    if (val >= 1000000000) {
      return "Rp " + (val / 1000000000).toLocaleString("id-ID", { maximumFractionDigits: 1 }).replace(",", ".") + " M";
    }
    if (val >= 1000000) {
      return "Rp " + (val / 1000000).toLocaleString("id-ID", { maximumFractionDigits: 1 }).replace(",", ".") + " jt";
    }
    if (val >= 1000) {
      return "Rp " + (val / 1000).toLocaleString("id-ID", { maximumFractionDigits: 1 }).replace(",", ".") + " rb";
    }
    return "Rp " + val.toLocaleString("id-ID");
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center px-0.5">
        <span className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">Statistik Celengan</span>
        <span className="text-[10px] text-zinc-400 font-bold">Progres Target</span>
      </div>

      <div className="flex items-center gap-3">
        {/* Chart Wrapper (Left Side) */}
        <div className="w-[43%] flex justify-center items-center py-1 bg-zinc-50/50 rounded-2xl">
          <Chart
            options={chartOptions}
            series={chartSeries}
            type="radialBar"
            height={160}
            width="100%"
          />
        </div>

        {/* Custom Legend list (Right Side) */}
        <div className="w-[57%] flex flex-col gap-1.5">
          {[
            { name: "Rumah", filled: 40000000, target: 200000000, gradient: "from-[#7c3aed] to-[#5b21b6]", pct: 20 },
            { name: "Motor", filled: 12000000, target: 30000000, gradient: "from-[#ec4899] to-[#be185d]", pct: 40 },
            { name: "Liburan Bali", filled: 7000000, target: 10000000, gradient: "from-[#06b6d4] to-[#0891b2]", pct: 70 },
            { name: "Laptop Baru", filled: 18000000, target: 20000000, gradient: "from-[#eab308] to-[#ca8a04]", pct: 90 },
          ].map((item, idx) => (
            <div key={idx} className={`flex flex-col gap-0.5 text-[10px] font-semibold text-white/90 bg-gradient-to-br ${item.gradient} p-2 rounded-xl shadow-xs border border-white/5`}>
              <div className="flex justify-between items-center">
                <span className="text-white font-extrabold truncate leading-none">{item.name}</span>
                <span className="font-mono text-[9px] text-white/95 font-bold shrink-0 leading-none">{item.pct}%</span>
              </div>
              <div className="text-[9px] text-white/80 font-medium leading-none mt-0.5">
                {formatCompactRupiah(item.filled)} / {formatCompactRupiah(item.target)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
