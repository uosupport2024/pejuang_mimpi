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
import { fetchProfileAPI } from "@/features/tunas/api/absensi";

export function DashboardPage() {
  const { navigate } = useRouter();

  const [userName, setUserName] = useState<string>("Super Admin");

  useEffect(() => {
    fetchProfileAPI()
      .then((profile) => {
        if (profile?.nama_pegawai) {
          setUserName(profile.nama_pegawai);
        } else if (profile?.name) {
          setUserName(profile.name);
        }
      })
      .catch(() => {});
  }, []);

  const getUserGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) return "Selamat Pagi";
    if (hour >= 11 && hour < 15) return "Selamat Siang";
    if (hour >= 15 && hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };
  const greeting = getUserGreeting();

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
      value: `${stats.masuk} Orang`,
      icon: CheckCircle,
      cardBg: "bg-[#7FA46D]",
      subtext: "Pegawai hadir hari ini",
    },
    {
      title: "Alfa",
      value: `${stats.alfa} Orang`,
      icon: XCircle,
      cardBg: "bg-[#e0542c]",
      subtext: "Absen tanpa keterangan",
    },
    {
      title: "Sakit",
      value: `${stats.sakit} Orang`,
      icon: Activity,
      cardBg: "bg-[#F2B233]",
      subtext: "Pegawai dengan surat sakit",
    },
    {
      title: "Izin",
      value: `${stats.izin} Orang`,
      icon: FileText,
      cardBg: "bg-[#5C8A90]",
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
        columnWidth: "45%"
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
        columnWidth: "45%"
      }
    },
    colors: ["#7FA46D", "#e0542c"],
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
      labels: {
        style: {
          colors: "#9ca3af",
          fontSize: "10px",
          fontWeight: 600,
          fontFamily: "Poppins"
        },
        formatter: (val: number) => `${Math.round(val)}%`
      }
    },
    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } }
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontSize: "11px",
      fontFamily: "Poppins",
      fontWeight: 600,
      labels: { colors: "#6b7280" }
    },
    tooltip: {
      theme: "light",
      style: { fontSize: "10px", fontFamily: "Poppins" }
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
      {/* Top Header Section: Dynamic Greeting on Left + Filter Controls on Right */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side Greeting */}
        <div className="space-y-0.5 text-left">
          <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <span>{greeting},</span>
            <span className="text-[#e0542c]">{userName}</span>
          </h1>
          <p className="text-xs font-bold text-gray-500">
            Semangat memperjuangkan impian! Pantau ringkasan kehadiran & performa tim hari ini.
          </p>
        </div>

        {/* Right Side Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Location Dropdown */}
          <div className="relative">
            <select
              value={selectedLokasiId || ""}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedLokasiId(val ? Number(val) : undefined);
              }}
              className="appearance-none flex items-center gap-2 px-3.5 py-2 pr-9 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 shadow-xs hover:bg-gray-50 transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#e0542c]"
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
          <div className="relative flex items-center bg-white border border-gray-200 rounded-xl px-3.5 py-2 shadow-xs hover:bg-gray-50 transition-colors">
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
            <div
              key={i}
              className={`p-4 ${card.cardBg} rounded-2xl shadow-xs flex items-center justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-default text-white`}
            >
              <div className="space-y-1 text-left">
                <span className="text-[10px] font-extrabold text-white/80 uppercase tracking-wider block">
                  {card.title}
                </span>
                <span className="text-2xl font-black text-white tracking-tight leading-none block">
                  {loading ? "..." : card.value}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/20 text-white backdrop-blur-xs flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Middle Charts Grid (Symmetrical 50% / 50% split) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Attendance Analytics (1/2 width) */}
        <div className="lg:col-span-6 p-6 bg-white border border-gray-200 rounded-2xl flex flex-col justify-between shadow-xs relative">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm font-bold text-gray-900">Statistik Kehadiran Mingguan</span>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[10px] font-bold text-gray-500 cursor-pointer">
              Minggu Ini
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Interactive Apex Bar Chart */}
          <div className="relative w-full h-[180px]">
            {loading ? (
              <div className="h-[180px] w-full flex items-center justify-center text-xs text-gray-400">
                Memuat grafik...
              </div>
            ) : (
              <Chart
                options={chart1Options}
                series={chart1Series}
                type="bar"
                height={180}
                width="100%"
              />
            )}
          </div>
        </div>

        {/* Chart 2: Presence vs Alfa comparison (1/2 width) */}
        <div className="lg:col-span-6 p-6 bg-white border border-gray-200 rounded-2xl flex flex-col justify-between shadow-xs">
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
          <div className="relative w-full h-[180px]">
            {loading ? (
              <div className="h-[180px] w-full flex items-center justify-center text-xs text-gray-400">
                Memuat grafik...
              </div>
            ) : (
              <Chart
                options={chart2Options}
                series={chart2Series}
                type="bar"
                height={180}
                width="100%"
              />
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid for Approvals & Birthday Calendar (Symmetrical 50% / 50% split) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pending Approval Izin Card (1/2 width - lg:col-span-6) */}
        <div className="lg:col-span-6 p-6 bg-white border border-gray-200 rounded-2xl shadow-xs space-y-4 text-left">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Pending Approval Izin</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">
              Daftar 10 pengajuan izin dan cuti karyawan tertua yang memerlukan persetujuan
            </p>
          </div>

          {/* Table data */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400">
                  <th className="py-3 px-3 w-10">
                    <input
                      type="checkbox"
                      checked={pendingLeaves.length > 0 && selectedIds.length === pendingLeaves.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4.5 h-4.5 rounded border border-[#e0542c] bg-white checked:bg-[#e0542c] checked:border-[#e0542c] cursor-pointer appearance-none flex items-center justify-center after:content-['✓'] after:text-[10px] after:font-extrabold after:text-white after:hidden checked:after:block transition-all focus:outline-none focus:ring-1 focus:ring-[#e0542c]/30"
                    />
                  </th>
                  <th className="py-3 px-3">Pegawai</th>
                  <th className="py-3 px-3">Pengajuan</th>
                  <th className="py-3 px-3">Alasan</th>
                  <th className="py-3 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400">
                      Memuat data pengajuan...
                    </td>
                  </tr>
                ) : pendingLeaves.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400">
                      Tidak ada pengajuan izin pending.
                    </td>
                  </tr>
                ) : (
                  pendingLeaves.map((item: any) => (
                    <tr key={item.id} className="text-gray-885 hover:bg-zinc-50/50 transition-colors">
                      <td className="py-4 px-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={(e) => handleSelectRow(item.id, e.target.checked)}
                          className="w-4.5 h-4.5 rounded border border-[#e0542c] bg-white checked:bg-[#e0542c] checked:border-[#e0542c] cursor-pointer appearance-none flex items-center justify-center after:content-['✓'] after:text-[10px] after:font-extrabold after:text-white after:hidden checked:after:block transition-all focus:outline-none focus:ring-1 focus:ring-[#e0542c]/30"
                        />
                      </td>
                      <td className="py-4 px-3">
                        <div className="font-bold text-gray-900 leading-tight">{item.User?.name || "Pegawai"}</div>
                        <div className="text-[10px] text-gray-400 font-semibold mt-0.5">{item.User?.email || "—"}</div>
                      </td>
                      <td className="py-4 px-3">
                        <span className="px-2 py-0.5 bg-zinc-50 border border-zinc-200 text-zinc-700 rounded-md text-[9px] font-bold block w-max">
                          {item.nama_cuti || "Izin"}
                        </span>
                        <span className="text-[10px] text-gray-400 font-semibold block mt-1">
                          {item.tanggal
                            ? new Date(item.tanggal).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-gray-500 font-medium max-w-[120px] truncate">
                        {item.alasan_cuti || "—"}
                      </td>
                      <td className="py-4 px-3 text-center">
                        <button
                          onClick={() => navigate("Leave")}
                          className="px-3 py-1 bg-[#e0542c] hover:bg-[#c84420] text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer border-0 shadow-sm hover:shadow"
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

        {/* Ulang Tahun Bulan Ini Mini Calendar Card (1/2 width - lg:col-span-6) */}
        <div className="lg:col-span-6 p-6 bg-white border border-gray-200 rounded-2xl shadow-xs space-y-4 text-left">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Ulang Tahun Bulan Ini</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">{currentMonthName}</p>
              </div>
            </div>

            {/* Split layout: Calendar Grid (Left) & Birthday List (Right) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Calendar Grid (Left - 5 cols) */}
              <div className="md:col-span-5 bg-zinc-50/50 p-3 rounded-2xl border border-zinc-100">
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
                      return <div key={`empty-${idx}`} className="h-7 w-7" />;
                    }

                    const dayBirthdays = getBirthdaysForDay(day);
                    const hasBirthday = dayBirthdays.length > 0;
                    const isToday = day === new Date().getDate();

                    return (
                      <div
                        key={`day-${day}`}
                        className={`h-7 w-7 rounded-full flex items-center justify-center mx-auto relative group ${
                          hasBirthday
                            ? "text-[#e0542c] font-black cursor-pointer hover:bg-orange-50"
                            : isToday
                            ? "bg-zinc-100 text-gray-900 border border-zinc-200"
                            : "text-gray-600 hover:bg-zinc-50"
                        }`}
                        title={
                          hasBirthday
                            ? `Ulang Tahun: ${dayBirthdays.map((e: any) => e.name).join(", ")}`
                            : undefined
                        }
                      >
                        <span>{day}</span>
                        {/* Custom Tooltip on Hover */}
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

              {/* Birthday list (Right - 7 cols) */}
              <div className="md:col-span-7 space-y-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Daftar Karyawan</span>
                <div className="space-y-1.5 max-h-[175px] overflow-y-auto pr-1">
                  {loading ? (
                    <div className="text-center text-[10px] text-gray-400 py-4">Memuat data...</div>
                  ) : birthdayList.length === 0 ? (
                    <div className="text-center text-[10px] text-gray-400 py-4">Tidak ada yang berulang tahun bulan ini.</div>
                  ) : (
                    birthdayList.map((emp: any) => {
                      const birthDay = new Date(emp.tgl_lahir).getDate();
                      const initials = emp.name.substring(0, 2).toUpperCase();
                      return (
                        <div key={emp.id} className="flex items-center gap-2.5 p-1.5 hover:bg-zinc-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                          <div className="w-7 h-7 rounded-full bg-[#e0542c]/10 text-[#e0542c] font-black flex items-center justify-center text-[10px] shrink-0">
                            {initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-bold text-gray-800 truncate">{emp.name}</div>
                          </div>
                          <span className="text-[9px] font-bold text-[#e0542c] bg-[#e0542c]/5 px-2 py-0.5 rounded-full shrink-0">
                            {birthDay} {new Date().toLocaleDateString("id-ID", { month: "short" })}
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
      </div>
    </div>
  );
}
