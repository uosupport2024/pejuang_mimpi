import { useState, useEffect } from "react";
import {
  ChevronDown,
  CheckCircle,
  XCircle,
  Activity,
  FileText,
  ArrowRight
} from "lucide-react";
import Chart from "react-apexcharts";
import { fetchAdminDashboardAPI } from "@/features/dashboard/api/dashboard";
import { useRouter } from "@/shared/router/router";
import { fetchProfileAPI } from "@/features/tunas/api/absensi";
import { ReusableTable } from "@/shared/components/ui/reusable-table";
import { THEME_COLORS } from "@/shared/constants/colors";

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

  // Calculate dynamic ratios and context metrics
  const totalPegawaiTotal = (stats.masuk || 0) + (stats.alfa || 0) + (stats.sakit || 0) + (stats.izin || 0);
  const attendanceRate = totalPegawaiTotal > 0 ? Math.round((stats.masuk / totalPegawaiTotal) * 100) : 0;
  const alfaRate = totalPegawaiTotal > 0 ? Math.round((stats.alfa / totalPegawaiTotal) * 100) : 0;

  // Determine max value dynamically for scaling bar charts
  const maxVal = Math.max(
    totalPegawaiTotal || 5,
    ...charts.map((c: any) => Number(c.masuk || 0))
  );

  const statCards = [
    {
      title: "Masuk",
      value: `${stats.masuk} Orang`,
      icon: CheckCircle,
      cardBgColor: THEME_COLORS.hex.sawahPertumbuhan,
      badgeText: `${attendanceRate}% Kehadiran`,
      badgeBg: "bg-white/20 text-white",
    },
    {
      title: "Alfa",
      value: `${stats.alfa} Orang`,
      icon: XCircle,
      cardBgColor: THEME_COLORS.hex.primary,
      badgeText: `${alfaRate}% Tanpa Ket.`,
      badgeBg: "bg-white/20 text-white",
    },
    {
      title: "Sakit",
      value: `${stats.sakit} Orang`,
      icon: Activity,
      cardBgColor: THEME_COLORS.hex.padiKemakmuran,
      badgeText: "Izin Sakit",
      badgeBg: "bg-white/20 text-white",
    },
    {
      title: "Izin",
      value: `${stats.izin} Orang`,
      icon: FileText,
      cardBgColor: THEME_COLORS.hex.airKehidupan,
      badgeText: "Izin Cuti",
      badgeBg: "bg-white/20 text-white",
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

  // Apex Charts Options
  const chart1Options: ApexCharts.ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      fontFamily: "Poppins",
      animations: {
        enabled: true,
        speed: 1000
      }
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: "45%"
      }
    },
    fill: {
      type: "solid"
    },
    colors: [THEME_COLORS.hex.sawahPertumbuhan],
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
      tickAmount: Math.min(maxVal, 5),
      labels: {
        style: {
          colors: "#9ca3af",
          fontSize: "10px",
          fontWeight: 600,
          fontFamily: "Poppins"
        },
        formatter: (val: number) => `${Math.round(val)}`
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
        formatter: (val: number) => `${val} Orang`
      }
    }
  };

  const chart1Series = [
    {
      name: "Pegawai Masuk",
      data: charts.map((c: any) => Number(c.masuk || 0))
    }
  ];

  // Apex Area Chart Options (Presence & Alfa percentage trend)
  const chart2Options: ApexCharts.ApexOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      fontFamily: "Poppins",
      animations: {
        enabled: true,
        speed: 1000
      }
    },
    stroke: {
      curve: "smooth",
      width: 2.5
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.1,
        opacityFrom: 0.25,
        opacityTo: 0.02,
        stops: [0, 95, 100]
      }
    },
    colors: [THEME_COLORS.hex.sawahPertumbuhan, THEME_COLORS.hex.primary],
    markers: {
      size: 5,
      colors: ["#ffffff"],
      strokeColors: [THEME_COLORS.hex.sawahPertumbuhan, THEME_COLORS.hex.primary],
      strokeWidth: 3,
      hover: {
        size: 7
      }
    },
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
      max: 100,
      tickAmount: 4,
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
      show: false
    },
    tooltip: {
      theme: "light",
      style: { fontSize: "10px", fontFamily: "Poppins" },
      y: {
        formatter: (val: number) => `${Math.round(val)}%`
      }
    }
  };

  const chart2Series = [
    {
      name: "Masuk",
      data: charts.map((c: any) => {
        const dayTotal = (Number(c.masuk) || 0) + (Number(c.alfa) || 0) + (Number(c.sakit) || 0) + (Number(c.izin) || 0) || totalPegawaiTotal || 5;
        return Math.round(((Number(c.masuk) || 0) / dayTotal) * 100);
      })
    },
    {
      name: "Alfa",
      data: charts.map((c: any) => {
        const dayTotal = (Number(c.masuk) || 0) + (Number(c.alfa) || 0) + (Number(c.sakit) || 0) + (Number(c.izin) || 0) || totalPegawaiTotal || 5;
        return Math.round(((Number(c.alfa) || 0) / dayTotal) * 100);
      })
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Section: Dynamic Greeting on Left + Filter Controls on Right */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side Greeting */}
        <div className="space-y-1 text-left">
          <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <span>{greeting},</span>
            <span style={{ color: THEME_COLORS.hex.primary }}>{userName}</span>
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
              className="appearance-none flex items-center gap-2 px-3.5 py-2 pr-9 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 shadow-xs hover:bg-gray-50 transition-all cursor-pointer focus:outline-none focus:ring-1"
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
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="appearance-none flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 shadow-xs hover:bg-gray-50 transition-all cursor-pointer focus:outline-none focus:ring-1"
            />
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              style={{ backgroundColor: card.cardBgColor }}
              className="px-5 py-4 rounded-2xl shadow-xs flex items-center justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-250 cursor-default text-white relative overflow-hidden"
            >
              <div className="flex flex-col text-left min-w-0 z-10">
                <span className="text-[10px] font-extrabold text-white/85 uppercase tracking-wider block leading-none mb-1.5">
                  {card.title}
                </span>
                <span className="text-xl font-black text-white tracking-tight leading-none block">
                  {loading ? "..." : card.value}
                </span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block mt-2.5 w-max ${card.badgeBg}`}>
                  {card.badgeText}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/20 text-white backdrop-blur-xs flex items-center justify-center shrink-0 ml-3 z-10">
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Asymmetric Layout: Left (8 cols) + Right (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Column (8 cols): Charts & Pending Approvals */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          {/* Charts Grid Split (50% / 50% within left 8 cols) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Chart 1: Attendance Analytics */}
            <div className="p-4.5 sm:p-5 bg-white border border-gray-200 rounded-2xl shadow-xs text-left flex flex-col justify-between h-[275px]">
              <div className="mb-2">
                <h3 className="text-xs font-black text-gray-900">Statistik Kehadiran Mingguan</h3>
                <p className="text-[9.5px] font-bold text-gray-400 mt-0.5">Total pegawai hadir per hari minggu ini</p>
              </div>

              {/* Apex Bar Chart */}
              <div className="relative w-full h-[195px] -mb-2">
                {loading ? (
                  <div className="h-[195px] w-full flex items-center justify-center text-xs text-gray-400 font-semibold">
                    Memuat grafik...
                  </div>
                ) : (
                  <Chart
                    key={`chart1-${charts.length}-${selectedDate}-${selectedLokasiId || "all"}`}
                    options={chart1Options}
                    series={chart1Series}
                    type="bar"
                    height={195}
                    width="100%"
                  />
                )}
              </div>
            </div>

            {/* Chart 2: Presence vs Alfa comparison */}
            <div className="p-4.5 sm:p-5 bg-white border border-gray-200 rounded-2xl shadow-xs text-left flex flex-col justify-between h-[275px]">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xs font-black text-gray-900">Kehadiran & Alfa</h3>
                  <p className="text-[9.5px] font-bold text-gray-400 mt-0.5">Rasio harian pegawai masuk vs mangkir</p>
                </div>
                <div className="flex gap-3 text-[9.5px] font-bold shrink-0 ml-2 pt-0.5">
                  <span className="flex items-center gap-1 text-gray-700">
                    <span style={{ backgroundColor: THEME_COLORS.hex.sawahPertumbuhan }} className="w-2 h-2 rounded-full"></span> Masuk
                  </span>
                  <span className="flex items-center gap-1 text-gray-700">
                    <span style={{ backgroundColor: THEME_COLORS.hex.primary }} className="w-2 h-2 rounded-full"></span> Alfa
                  </span>
                </div>
              </div>

              {/* Apex Area Chart with Subtle Gradient */}
              <div className="relative w-full h-[195px] -mb-2">
                {loading ? (
                  <div className="h-[195px] w-full flex items-center justify-center text-xs text-gray-400 font-semibold">
                    Memuat grafik...
                  </div>
                ) : (
                  <Chart
                    key={`chart2-${charts.length}-${selectedDate}-${selectedLokasiId || "all"}`}
                    options={chart2Options}
                    series={chart2Series}
                    type="area"
                    height={195}
                    width="100%"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Pending Approval Izin Table Card */}
          <div className="p-4.5 sm:p-5 bg-white border border-gray-200 rounded-2xl shadow-xs text-left">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-black text-gray-900">Pending Approval Izin & Cuti</h3>
                <p className="text-[9.5px] font-bold text-gray-400 mt-0.5">
                  Daftar pengajuan izin dan cuti karyawan yang memerlukan persetujuan
                </p>
              </div>
              <button
                onClick={() => navigate("Leave")}
                style={{ color: THEME_COLORS.hex.primary }}
                className="inline-flex items-center gap-1 text-xs font-extrabold hover:underline transition-colors cursor-pointer shrink-0 ml-2"
              >
                <span>Kelola Semua</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <ReusableTable
              columns={[
                {
                  header: (
                    <input
                      type="checkbox"
                      checked={pendingLeaves.length > 0 && selectedIds.length === pendingLeaves.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 rounded border border-gray-300 bg-white checked:bg-orange-500 checked:border-orange-500 cursor-pointer appearance-none flex items-center justify-center after:content-['✓'] after:text-[10px] after:font-extrabold after:text-white after:hidden checked:after:block transition-all focus:outline-none"
                    />
                  ),
                  sortable: false,
                  className: "w-10",
                  cell: (item: any) => (
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={(e) => handleSelectRow(item.id, e.target.checked)}
                      className="w-4 h-4 rounded border border-gray-300 bg-white checked:bg-orange-500 checked:border-orange-500 cursor-pointer appearance-none flex items-center justify-center after:content-['✓'] after:text-[10px] after:font-extrabold after:text-white after:hidden checked:after:block transition-all focus:outline-none"
                    />
                  ),
                },
                {
                  header: "Pegawai",
                  cell: (item: any) => (
                    <div>
                      <div className="font-extrabold text-gray-900 leading-tight">{item.User?.name || "Pegawai"}</div>
                      <div className="text-[10px] text-gray-400 font-semibold mt-0.5">{item.User?.email || "—"}</div>
                    </div>
                  ),
                },
                {
                  header: "Pengajuan",
                  cell: (item: any) => {
                    const name = (item.nama_cuti || "Izin").toLowerCase();
                    const badgeBg = name.includes("cuti")
                      ? THEME_COLORS.hex.sawahPertumbuhan
                      : name.includes("sakit")
                      ? THEME_COLORS.hex.primary
                      : name.includes("telat")
                      ? THEME_COLORS.hex.padiKemakmuran
                      : THEME_COLORS.hex.airKehidupan;
                    return (
                      <div>
                        <span
                          style={{ backgroundColor: badgeBg }}
                          className="px-2.5 py-0.5 text-white rounded-full text-[9px] font-extrabold uppercase shadow-2xs block w-max"
                        >
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
                      </div>
                    );
                  },
                },
                {
                  header: "Alasan",
                  cell: (item: any) => (
                    <span className="text-gray-500 font-medium max-w-[140px] truncate block">
                      {item.alasan_cuti || "—"}
                    </span>
                  ),
                },
                {
                  header: "Aksi",
                  sortable: false,
                  className: "text-center",
                  cell: () => (
                    <button
                      onClick={() => navigate("Leave")}
                      style={{ backgroundColor: THEME_COLORS.hex.primary }}
                      className="px-3 py-1 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer border-0 shadow-xs hover:shadow hover:opacity-90"
                    >
                      Proses
                    </button>
                  ),
                },
              ]}
              data={pendingLeaves}
              loading={loading}
              emptyMessage="Tidak ada pengajuan izin pending."
              showSearch={false}
              itemsPerPage={6}
              showPagination={true}
            />
          </div>
        </div>

        {/* Right Column (4 cols): Quick Actions & Birthday Calendar */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-6">
          {/* Quick Actions Shortcuts */}
          <div className="p-4.5 sm:p-5 bg-white border border-gray-200 rounded-2xl shadow-xs text-left">
            <h3 className="text-xs font-black text-gray-900 mb-3">Menu Pintas Cepat</h3>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => navigate("EmployeeAdd")}
                className="p-3 bg-gray-50 hover:bg-orange-50/50 rounded-xl border border-gray-100 hover:border-orange-200 transition-all text-left group cursor-pointer"
              >
                <div
                  style={{ backgroundColor: `${THEME_COLORS.hex.primary}1A`, color: THEME_COLORS.hex.primary }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center mb-2 group-hover:scale-105 transition-transform"
                >
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-gray-800 block">Tambah Karyawan</span>
                <span className="text-[9.5px] text-gray-400 font-semibold block mt-0.5">Input data baru</span>
              </button>

              <button
                onClick={() => navigate("AttendanceToday")}
                className="p-3 bg-gray-50 hover:bg-emerald-50/50 rounded-xl border border-gray-100 hover:border-emerald-200 transition-all text-left group cursor-pointer"
              >
                <div
                  style={{ backgroundColor: `${THEME_COLORS.hex.sawahPertumbuhan}1A`, color: THEME_COLORS.hex.sawahPertumbuhan }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center mb-2 group-hover:scale-105 transition-transform"
                >
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-gray-800 block">Presensi Hari Ini</span>
                <span className="text-[9.5px] text-gray-400 font-semibold block mt-0.5">Live monitoring</span>
              </button>
            </div>
          </div>

          {/* Birthday Calendar Widget */}
          <div className="p-4.5 sm:p-5 bg-white border border-gray-200 rounded-2xl shadow-xs text-left">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black text-gray-900">Ulang Tahun Bulan Ini</h3>
              <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {currentMonthName}
              </span>
            </div>

            {/* Mini Calendar Grid */}
            <div className="bg-gray-50/70 p-3 rounded-2xl border border-gray-100 mb-4">
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {["M", "S", "S", "R", "K", "J", "S"].map((d, i) => (
                  <span key={i} className="text-[9px] font-black text-gray-400 uppercase">
                    {d}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold">
                {getDaysInMonth().map((day, i) => {
                  if (!day) return <div key={`empty-${i}`} className="h-7 w-7" />;

                  const dayBirthdays = getBirthdaysForDay(day);
                  const hasBirthday = dayBirthdays.length > 0;
                  const isToday = day === new Date().getDate();

                  return (
                    <div
                      key={`day-${day}`}
                      style={hasBirthday ? { backgroundColor: THEME_COLORS.hex.primary } : undefined}
                      className={`h-7 w-7 rounded-full flex items-center justify-center mx-auto relative group ${
                        hasBirthday
                          ? "text-white font-black cursor-pointer shadow-xs"
                          : isToday
                          ? "bg-zinc-200 text-gray-900 border border-zinc-300"
                          : "text-gray-600 hover:bg-zinc-100"
                      }`}
                    >
                      <span>{day}</span>
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

            {/* Birthday Employees List */}
            <div className="space-y-2">
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                {loading ? (
                  <div className="text-center text-[10px] text-gray-400 py-4">Memuat data...</div>
                ) : birthdayList.length === 0 ? (
                  <div className="text-center text-[10px] text-gray-400 py-4">Tidak ada yang berulang tahun bulan ini.</div>
                ) : (
                  birthdayList.map((emp: any) => {
                    const birthDay = new Date(emp.tgl_lahir).getDate();
                    const initials = emp.name.substring(0, 2).toUpperCase();
                    return (
                      <div key={emp.id} className="flex items-center gap-2.5 p-2 hover:bg-zinc-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                        <div
                          style={{ backgroundColor: `${THEME_COLORS.hex.primary}1A`, color: THEME_COLORS.hex.primary }}
                          className="w-7 h-7 rounded-full font-black flex items-center justify-center text-[10px] shrink-0"
                        >
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-bold text-gray-800 truncate">{emp.name}</div>
                        </div>
                        <span
                          style={{ backgroundColor: `${THEME_COLORS.hex.primary}1A`, color: THEME_COLORS.hex.primary }}
                          className="text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0"
                        >
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
  );
}
