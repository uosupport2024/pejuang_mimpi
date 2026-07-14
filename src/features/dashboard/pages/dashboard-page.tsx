import { useState, useEffect } from "react";
import {
  Calendar,
  ChevronDown,
  CheckCircle,
  XCircle,
  Activity,
  FileText
} from "lucide-react";
import Chart from "react-apexcharts";
import { fetchAdminDashboardAPI } from "@/features/dashboard/api/dashboard";
import { useRouter } from "@/shared/router/router";

export function DashboardPage() {
  const { navigate } = useRouter();

  // Filters state
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toLocaleDateString("en-CA"); // YYYY-MM-DD format
  });
  const [selectedLokasiId, setSelectedLokasiId] = useState<number | undefined>(undefined);

  // Dashboard data state
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const data = await fetchAdminDashboardAPI(selectedDate, selectedLokasiId);
        setDashboardData(data);
      } catch (err) {
        console.error("Gagal memuat data dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [selectedDate, selectedLokasiId]);

  // Reset row selection when filters/data changes
  useEffect(() => {
    setSelectedIds([]);
  }, [selectedDate, selectedLokasiId, dashboardData]);

  const locations = dashboardData?.filters?.locations || [];
  const stats = dashboardData?.statistics || { masuk: 0, alfa: 0, sakit: 0, izin: 0 };
  const charts = dashboardData?.charts || [];
  const pendingLeaves = dashboardData?.pending_leaves || [];
  const birthdayList = dashboardData?.birthday_employees || [];

  // Determine max value dynamically for scaling bar charts
  const maxVal = Math.max(
    10,
    ...charts.map((c: any) => Number(c.masuk) + Number(c.alfa)),
    30
  );

  const statCards = [
    {
      title: "Masuk",
      value: stats.masuk.toString(),
      icon: CheckCircle,
      badgeStyle: "bg-emerald-500/10 text-emerald-600",
      subtext: "Pegawai hadir hari ini",
    },
    {
      title: "Alfa",
      value: stats.alfa.toString(),
      icon: XCircle,
      badgeStyle: "bg-rose-500/10 text-rose-600",
      subtext: "Absen tanpa keterangan",
    },
    {
      title: "Sakit",
      value: stats.sakit.toString(),
      icon: Activity,
      badgeStyle: "bg-amber-500/10 text-amber-600",
      subtext: "Pegawai dengan surat sakit",
    },
    {
      title: "Izin",
      value: stats.izin.toString(),
      icon: FileText,
      badgeStyle: "bg-blue-500/10 text-blue-600",
      subtext: "Pegawai dengan persetujuan izin",
    },
  ];

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(pendingLeaves.map((item: any) => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  // Days calculations for current month mini calendar
  const getDaysInMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon...
    const numDays = new Date(year, month + 1, 0).getDate();

    // Fill offset with null
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= numDays; i++) {
      days.push(i);
    }
    return days;
  };

  const currentMonthName = new Date().toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric"
  });

  const getBirthdaysForDay = (day: number | null) => {
    if (!day) return [];
    return birthdayList.filter((emp: any) => {
      const birthDate = new Date(emp.tgl_lahir);
      return birthDate.getDate() === day;
    });
  };

  // ApexCharts Option 1: Weekly Attendance Bar Chart
  const chart1Options: ApexCharts.ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      animations: {
        enabled: true,
        speed: 1000,
        animateGradually: { enabled: true, delay: 100 }
      }
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: "45%",
        distributed: false
      }
    },
    colors: ["#7FA46D"],
    dataLabels: { enabled: false },
    xaxis: {
      categories: charts.map((c: any) => c.label),
      labels: {
        style: {
          colors: "#9ca3af",
          fontSize: "10px",
          fontWeight: 600,
          fontFamily: "Poppins"
        }
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      min: 0,
      max: maxVal,
      tickAmount: 5,
      labels: {
        style: {
          colors: "#9ca3af",
          fontSize: "10px",
          fontWeight: 600,
          fontFamily: "Poppins"
        }
      }
    },
    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } }
    },
    tooltip: {
      theme: "light",
      style: { fontSize: "10px", fontFamily: "Poppins" },
      y: {
        formatter: (val: number) => `${val} Pegawai Hadir`
      }
    }
  };

  const chart1Series = [
    {
      name: "Kehadiran",
      data: charts.map((c: any) => c.masuk)
    }
  ];

  // ApexCharts Option 2: Stacked Bar Chart (Present vs Alfa)
  const chart2Options: ApexCharts.ApexOptions = {
    chart: {
      type: "bar",
      stacked: true,
      stackType: "100%",
      toolbar: { show: false },
      animations: {
        enabled: true,
        speed: 1000,
        animateGradually: { enabled: true, delay: 100 }
      }
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: "40%",
      }
    },
    colors: ["#7FA46D", "#F25C2A"],
    dataLabels: { enabled: false },
    xaxis: {
      categories: charts.map((c: any) => c.label),
      labels: {
        style: {
          colors: "#9ca3af",
          fontSize: "10px",
          fontWeight: 600,
          fontFamily: "Poppins"
        }
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: { show: false }
    },
    grid: { show: false },
    legend: { show: false },
    tooltip: {
      theme: "light",
      style: { fontSize: "10px", fontFamily: "Poppins" },
      y: {
        formatter: (val: number) => `${val} Pegawai`
      }
    }
  };

  const chart2Series = [
    {
      name: "Masuk",
      data: charts.map((c: any) => c.masuk)
    },
    {
      name: "Alfa",
      data: charts.map((c: any) => c.alfa)
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Title & Date/Location picker */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Ringkasan Kehadiran
        </h1>
        
        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          {/* Location Dropdown */}
          <div className="relative">
            <select
              value={selectedLokasiId || ""}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedLokasiId(val ? Number(val) : undefined);
              }}
              className="appearance-none flex items-center gap-2 px-3.5 py-2 pr-9 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 shadow-xs hover:bg-gray-50 transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#e0542c]"
            >
              <option value="">Semua Lokasi</option>
              {locations.map((loc: any) => (
                <option key={loc.id} value={loc.id}>
                  {loc.nama_lokasi}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>

          {/* Date Picker Input */}
          <div className="relative flex items-center bg-white border border-gray-200 rounded-lg px-3.5 py-2 shadow-xs hover:bg-gray-50 transition-colors">
            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-0 text-xs font-bold text-gray-600 focus:outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="p-4 bg-white border border-gray-200 rounded-2xl shadow-xs">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{card.title}</span>
                <div className={`p-1.5 rounded-lg ${card.badgeStyle} flex items-center justify-center shrink-0`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-1 flex items-baseline">
                <span className="text-2xl font-black text-gray-900 tracking-tight leading-tight">
                  {loading ? "..." : card.value}
                </span>
              </div>
              <span className="text-[9.5px] text-gray-400 font-semibold mt-0.5 block leading-none">
                {card.subtext}
              </span>
            </div>
          );
        })}
      </div>

      {/* Middle Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Attendance Analytics (2/3 width) */}
        <div className="lg:col-span-7 p-6 bg-white border border-gray-200 rounded-2xl flex flex-col justify-between shadow-xs relative">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm font-bold text-gray-900">Statistik Kehadiran Mingguan</span>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[10px] font-bold text-gray-500 cursor-pointer">
              Minggu Ini
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Interactive Apex Bar Chart */}
          <div className="relative w-full min-h-[200px]">
            {loading ? (
              <div className="h-48 w-full flex items-center justify-center text-xs text-gray-400">
                Memuat grafik...
              </div>
            ) : (
              <Chart
                options={chart1Options}
                series={chart1Series}
                type="bar"
                height={200}
                width="100%"
              />
            )}
          </div>
        </div>

        {/* Chart 2: Presence vs Alfa comparison (1/3 width) */}
        <div className="lg:col-span-5 p-6 bg-white border border-gray-200 rounded-2xl flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Perbandingan Kehadiran & Alfa</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Rasio harian pegawai masuk dibandingkan mangkir (alfa)</p>
              </div>
            </div>

            {/* Legends */}
            <div className="flex gap-4 mt-4 text-[10px] font-bold">
              <span className="flex items-center gap-1.5 text-gray-700">
                <span className="w-2 h-2 rounded-full bg-[#7FA46D]"></span> Masuk
              </span>
              <span className="flex items-center gap-1.5 text-gray-700">
                <span className="w-2 h-2 rounded-full bg-[#F25C2A]"></span> Alfa
              </span>
            </div>
          </div>

          {/* Stacked Bar Apex Chart */}
          <div className="relative w-full min-h-[150px] mt-4">
            {loading ? (
              <div className="h-36 w-full flex items-center justify-center text-xs text-gray-400">
                Memuat grafik...
              </div>
            ) : (
              <Chart
                options={chart2Options}
                series={chart2Series}
                type="bar"
                height={150}
                width="100%"
              />
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid for Approvals & Birthday Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pending Approval Izin Card (2/3 width) */}
        <div className="lg:col-span-8 p-6 bg-white border border-gray-200 rounded-2xl shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Pending Approval Izin</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Daftar 10 pengajuan izin dan cuti karyawan tertua yang memerlukan persetujuan
              </p>
            </div>
          </div>

          {/* Table data */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400">
                  <th className="py-3 px-4 w-12">
                    <input
                      type="checkbox"
                      checked={pendingLeaves.length > 0 && selectedIds.length === pendingLeaves.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4.5 h-4.5 rounded border border-[#e0542c] bg-white checked:bg-[#e0542c] checked:border-[#e0542c] cursor-pointer appearance-none flex items-center justify-center after:content-['✓'] after:text-[10px] after:font-extrabold after:text-white after:hidden checked:after:block transition-all focus:outline-none focus:ring-1 focus:ring-[#e0542c]/30"
                    />
                  </th>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Nama Pegawai</th>
                  <th className="py-3 px-4">Tipe Izin</th>
                  <th className="py-3 px-4">Tanggal Pengajuan</th>
                  <th className="py-3 px-4">Alasan</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400">
                      Memuat data pengajuan...
                    </td>
                  </tr>
                ) : pendingLeaves.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400">
                      Tidak ada pengajuan izin pending.
                    </td>
                  </tr>
                ) : (
                  pendingLeaves.map((item: any) => (
                    <tr key={item.id} className="text-gray-800 hover:bg-zinc-50/50 transition-colors">
                      <td className="py-4 px-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={(e) => handleSelectRow(item.id, e.target.checked)}
                          className="w-4.5 h-4.5 rounded border border-[#e0542c] bg-white checked:bg-[#e0542c] checked:border-[#e0542c] cursor-pointer appearance-none flex items-center justify-center after:content-['✓'] after:text-[10px] after:font-extrabold after:text-white after:hidden checked:after:block transition-all focus:outline-none focus:ring-1 focus:ring-[#e0542c]/30"
                        />
                      </td>
                      <td className="py-4 px-4 text-[#e0542c]">#{item.id}</td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-gray-900">{item.User?.name || "Pegawai"}</div>
                        <div className="text-[10px] text-gray-400 font-semibold">{item.User?.email || "—"}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 bg-zinc-50 border border-zinc-200 text-zinc-700 rounded-md text-[10px] font-bold">
                          {item.nama_cuti || "Izin"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-500 font-medium">
                        {item.tanggal
                          ? new Date(item.tanggal).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="py-4 px-4 text-gray-500 font-medium max-w-[200px] truncate">
                        {item.alasan_cuti || "—"}
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-[10px] font-extrabold uppercase tracking-wide">
                          Pending
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => navigate("Leave")}
                          className="px-3 py-1 bg-[#e0542c] hover:bg-[#c84420] text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer border-0"
                        >
                          Proses
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ulang Tahun Bulan Ini Mini Calendar Card (1/3 width) */}
        <div className="lg:col-span-4 p-6 bg-white border border-gray-200 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Ulang Tahun Bulan Ini</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">{currentMonthName}</p>
              </div>
              <div className="text-xl">🎂</div>
            </div>

            {/* Calendar Grid Header */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-gray-400 mb-2">
              <span>M</span>
              <span>S</span>
              <span>S</span>
              <span>R</span>
              <span>K</span>
              <span>J</span>
              <span>S</span>
            </div>

            {/* Calendar Grid Body */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold">
              {getDaysInMonth().map((day, idx) => {
                if (day === null) {
                  return <div key={`empty-${idx}`} />;
                }

                const dayBirthdays = getBirthdaysForDay(day);
                const hasBirthday = dayBirthdays.length > 0;
                const isToday = day === new Date().getDate();

                return (
                  <div
                    key={`day-${day}`}
                    className={`h-7 w-7 rounded-full flex items-center justify-center mx-auto relative group ${
                      hasBirthday
                        ? "bg-[#e0542c]/10 text-[#e0542c] font-black border border-[#e0542c]/30 cursor-pointer"
                        : isToday
                        ? "bg-zinc-100 text-gray-900 border border-gray-300"
                        : "text-gray-600 hover:bg-zinc-50"
                    }`}
                    title={
                      hasBirthday
                        ? `Ulang Tahun: ${dayBirthdays.map((e: any) => e.name).join(", ")}`
                        : undefined
                    }
                  >
                    <span>{day}</span>
                    {hasBirthday && (
                      <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-[#e0542c]" />
                    )}

                    {/* Simple Custom Tooltip on Hover */}
                    {hasBirthday && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-50 w-max max-w-[150px] bg-gray-900 text-white text-[9px] font-bold rounded-lg px-2 py-1 shadow-md leading-tight text-center">
                        {dayBirthdays.map((e: any) => e.name).join(", ")}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-gray-900 rotate-45 -mt-[3px]"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Birthday list below calendar */}
          <div className="mt-6 border-t border-gray-100 pt-4 flex-1">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-2">Daftar Ulang Tahun</span>
            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {loading ? (
                <div className="text-center text-[10px] text-gray-400 py-4">Memuat data...</div>
              ) : birthdayList.length === 0 ? (
                <div className="text-center text-[10px] text-gray-400 py-4">Tidak ada yang berulang tahun.</div>
              ) : (
                birthdayList.map((emp: any) => {
                  const birthDay = new Date(emp.tgl_lahir).getDate();
                  const initials = emp.name.substring(0, 2).toUpperCase();
                  return (
                    <div key={emp.id} className="flex items-center gap-2 p-1.5 hover:bg-zinc-50 rounded-xl transition-colors">
                      <div className="w-7 h-7 rounded-full bg-[#e0542c]/10 text-[#e0542c] font-black flex items-center justify-center text-[10px] shrink-0">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-bold text-gray-800 truncate">{emp.name}</div>
                        <div className="text-[9px] text-gray-400 font-semibold truncate">{emp.email || "—"}</div>
                      </div>
                      <span className="text-[9px] font-bold text-[#e0542c] bg-[#e0542c]/5 px-2 py-0.5 rounded-full shrink-0">
                        🎂 {birthDay} {new Date().toLocaleDateString("id-ID", { month: "short" })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
