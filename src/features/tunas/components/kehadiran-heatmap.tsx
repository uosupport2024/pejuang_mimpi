import { useState } from "react";
import Chart from "react-apexcharts";
import { Calendar, ChevronDown } from "lucide-react";
import { toast } from "sonner";

export function KehadiranHeatmap() {
  const [selectedYear, setSelectedYear] = useState(2026);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const years = [2026, 2025, 2024];

  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: "heatmap",
      toolbar: {
        show: false
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      width: 1.5,
      colors: ["#ffffff"] // White gap border between cells
    },
    plotOptions: {
      heatmap: {
        radius: 3,
        enableShades: false,
        colorScale: {
          ranges: [
            { from: 0, to: 0, color: "#ba3c3c" }, // Red for 0 Hari
            { from: 1, to: 1, color: "#99b3df" }, // Light blue for 1 Hari
            { from: 2, to: 2, color: "#7797cd" }, // Medium-light blue for 2 Hari
            { from: 3, to: 3, color: "#567abb" }, // Medium-dark blue for 3 Hari
            { from: 4, to: 4, color: "#385fa8" }, // Dark blue for 4 Hari
            { from: 5, to: 10, color: "#1e2a4a" } // Navy blue for 5+ Hari
          ]
        }
      }
    },
    xaxis: {
      type: "category",
      categories: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"],
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      labels: {
        offsetY: -2,
        style: {
          colors: "#71717a",
          fontSize: "9px",
          fontWeight: 700
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: "#71717a",
          fontSize: "9px",
          fontWeight: 700
        }
      }
    },
    grid: {
      show: false,
      padding: {
        top: -15,
        right: 5,
        bottom: 15,
        left: 10
      }
    },
    legend: {
      show: false // Hide default legends to use our custom clean HTML legend
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: (val) => `${val} Hari Hadir`
      }
    }
  };

  // 12 months, 5 weeks each (Jan-Des)
  // Reversed series order to draw W1 at the top and W5 at the bottom
  const chartSeries = [
    {
      name: "W5",
      data: [
        { x: "Jan", y: 3 }, { x: "Feb", y: 5 }, { x: "Mar", y: 2 }, { x: "Apr", y: 4 }, { x: "Mei", y: 0 },
        { x: "Jun", y: 0 }, { x: "Jul", y: 0 }, { x: "Agu", y: 0 }, { x: "Sep", y: 0 }, { x: "Okt", y: 0 }, { x: "Nov", y: 0 }, { x: "Des", y: 0 }
      ]
    },
    {
      name: "W4",
      data: [
        { x: "Jan", y: 4 }, { x: "Feb", y: 5 }, { x: "Mar", y: 3 }, { x: "Apr", y: 5 }, { x: "Mei", y: 0 },
        { x: "Jun", y: 0 }, { x: "Jul", y: 0 }, { x: "Agu", y: 0 }, { x: "Sep", y: 0 }, { x: "Okt", y: 0 }, { x: "Nov", y: 0 }, { x: "Des", y: 0 }
      ]
    },
    {
      name: "W3",
      data: [
        { x: "Jan", y: 5 }, { x: "Feb", y: 5 }, { x: "Mar", y: 5 }, { x: "Apr", y: 5 }, { x: "Mei", y: 5 },
        { x: "Jun", y: 0 }, { x: "Jul", y: 0 }, { x: "Agu", y: 0 }, { x: "Sep", y: 0 }, { x: "Okt", y: 0 }, { x: "Nov", y: 0 }, { x: "Des", y: 0 }
      ]
    },
    {
      name: "W2",
      data: [
        { x: "Jan", y: 5 }, { x: "Feb", y: 5 }, { x: "Mar", y: 5 }, { x: "Apr", y: 5 }, { x: "Mei", y: 5 },
        { x: "Jun", y: 0 }, { x: "Jul", y: 0 }, { x: "Agu", y: 0 }, { x: "Sep", y: 0 }, { x: "Okt", y: 0 }, { x: "Nov", y: 0 }, { x: "Des", y: 0 }
      ]
    },
    {
      name: "W1",
      data: [
        { x: "Jan", y: 5 }, { x: "Feb", y: 5 }, { x: "Mar", y: 5 }, { x: "Apr", y: 5 }, { x: "Mei", y: 5 },
        { x: "Jun", y: 0 }, { x: "Jul", y: 0 }, { x: "Agu", y: 0 }, { x: "Sep", y: 0 }, { x: "Okt", y: 0 }, { x: "Nov", y: 0 }, { x: "Des", y: 0 }
      ]
    }
  ];

  return (
    <div className="flex flex-col text-left gap-0">
      {/* Header Row */}
      <div className="flex justify-between items-center px-0.5 animate-in fade-in duration-200">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#e0542c]" />
          <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
            Kehadiran Tahun Ini
          </span>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#1e2a4a] hover:bg-[#151e36] text-white text-[9px] font-bold cursor-pointer active:scale-95 transition-all shadow-xs z-50 relative"
          >
            <span>{selectedYear}</span>
            <ChevronDown className="w-3 h-3 text-white/80" />
          </button>

          {isDropdownOpen && (
            <>
              {/* Invisible overlay to catch clicks outside the dropdown */}
              <div
                className="fixed inset-0 z-40 bg-transparent"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-1.5 w-24 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 text-[10px] font-bold text-gray-700 animate-in fade-in slide-in-from-top-1 duration-100">
                {years.map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => {
                      setSelectedYear(year);
                      setIsDropdownOpen(false);
                      toast.success(`Menampilkan data tahun ${year}`);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-zinc-50 transition-colors cursor-pointer flex items-center justify-between ${selectedYear === year ? "text-[#1e2a4a] bg-zinc-50" : ""
                      }`}
                  >
                    <span>{year}</span>
                    {selectedYear === year && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1e2a4a]" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Heatmap Chart Wrapper */}
      <div className="w-full -mt-2 -mb-2 pb-3">
        <Chart
          options={chartOptions}
          series={chartSeries}
          type="heatmap"
          height={195}
          width="100%"
        />
      </div>

      {/* Custom HTML Legend Row */}
      <div className="flex flex-wrap justify-center gap-x-2.5 gap-y-1.5 pt-2 text-[8px] font-bold text-zinc-500">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-[#ba3c3c] rounded-xs shrink-0" />
          <span>0 Hari</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-[#99b3df] rounded-xs shrink-0" />
          <span>1 Hari</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-[#7797cd] rounded-xs shrink-0" />
          <span>2 Hari</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-[#567abb] rounded-xs shrink-0" />
          <span>3 Hari</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-[#385fa8] rounded-xs shrink-0" />
          <span>4 Hari</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-[#1e2a4a] rounded-xs shrink-0" />
          <span>5+ Hari</span>
        </div>
      </div>
    </div>
  );
}
