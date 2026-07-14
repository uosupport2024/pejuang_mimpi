import { useState, useEffect } from "react";
import { Printer, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { fetchPayrollHistory, deletePayrollHistory, type PayrollHistoryItem } from "../api/payroll";
import { API_BASE_URL } from "@/shared/utils/api";
import { getCookie } from "@/shared/utils/cookies";
import { ReusableTable, type ColumnDef } from "@/shared/components/ui/reusable-table";
import { ConfirmationModal } from "@/shared/components/ui/confirmation-modal";
import { Magnifier } from "@solar-icons/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

export function PayrollHistoryPage() {
  const [historyItems, setHistoryItems] = useState<PayrollHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filters
  const [filters, setFilters] = useState({
    q: "",
    bulan: "",
    tahun: "",
  });

  // Delete modal state
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    id: number | null;
    noGaji: string;
    employeeName: string;
  }>({
    isOpen: false,
    id: null,
    noGaji: "",
    employeeName: "",
  });

  // Check admin role on mount
  useEffect(() => {
    const userProfileStr = getCookie("user_profile");
    if (userProfileStr) {
      try {
        const user = JSON.parse(userProfileStr);
        setIsAdmin(user.is_admin === "admin" || user.role === "Administrator");
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Fetch history data
  const loadHistoryData = async (page = 1, customFilters = filters) => {
    try {
      setLoading(true);
      const res = await fetchPayrollHistory({
        page,
        bulan: customFilters.bulan,
        tahun: customFilters.tahun,
      });

      // Local filter for search text (q) if not already filtered
      let filteredData = res.data;
      if (customFilters.q.trim()) {
        const searchLower = customFilters.q.toLowerCase();
        filteredData = res.data.filter((item) =>
          item.name.toLowerCase().includes(searchLower) ||
          item.no_gaji.toLowerCase().includes(searchLower)
        );
      }

      setHistoryItems(filteredData);
      setCurrentPage(res.current_page);
      setTotalPages(res.last_page);
      setTotalItems(res.total);
    } catch (err: any) {
      toast.error(err.message || "Gagal memuat riwayat payroll");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistoryData(currentPage);
  }, []);

  const handleSearchChange = (query: string) => {
    const nextFilters = { ...filters, q: query };
    setFilters(nextFilters);
    loadHistoryData(1, nextFilters);
  };

  const handleMonthChange = (month: string) => {
    const nextFilters = { ...filters, bulan: month === "all" ? "" : month };
    setFilters(nextFilters);
    loadHistoryData(1, nextFilters);
  };

  const handleYearChange = (year: string) => {
    const nextFilters = { ...filters, tahun: year === "all" ? "" : year };
    setFilters(nextFilters);
    loadHistoryData(1, nextFilters);
  };

  const handleDeleteClick = (id: number, noGaji: string, employeeName: string) => {
    setConfirmDelete({
      isOpen: true,
      id,
      noGaji,
      employeeName,
    });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete.id) return;
    try {
      setSubmitting(true);
      await deletePayrollHistory(confirmDelete.id);
      toast.success(`Data payroll "${confirmDelete.noGaji}" milik "${confirmDelete.employeeName}" berhasil dihapus`);
      setConfirmDelete({ isOpen: false, id: null, noGaji: "", employeeName: "" });
      loadHistoryData(1);
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus data payroll");
    } finally {
      setSubmitting(false);
    }
  };

  const getBulanNama = (b: number) => {
    const bulans = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    return bulans[b - 1] || "-";
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Columns definition using Project Style
  const columns: ColumnDef<PayrollHistoryItem>[] = [
    {
      header: <span className="text-center block w-full text-xs font-semibold text-gray-500 tracking-wider">No.</span>,
      cell: (_row: PayrollHistoryItem, index: number) => (
        <span className="text-center block text-xs text-gray-655">{(currentPage - 1) * 10 + index + 1}.</span>
      ),
      className: "w-12 text-center",
    },
    {
      header: <span className="text-left block text-xs font-semibold text-gray-500 tracking-wider">Nomor Gaji</span>,
      cell: (row: PayrollHistoryItem) => (
        <span className="text-xs font-semibold text-gray-800 whitespace-nowrap">{row.no_gaji}</span>
      ),
    },
    {
      header: <span className="text-left block text-xs font-semibold text-gray-500 tracking-wider">Nama Pegawai</span>,
      cell: (row: PayrollHistoryItem) => (
        <span className="text-xs font-semibold text-gray-800 whitespace-nowrap">{row.name}</span>
      ),
    },
    {
      header: <span className="text-left block text-xs font-semibold text-gray-500 tracking-wider">Divisi</span>,
      cell: (row: PayrollHistoryItem) => (
        <span className="text-xs text-gray-655 whitespace-nowrap">{row.jabatan_nama}</span>
      ),
    },
    {
      header: <span className="text-left block text-xs font-semibold text-gray-500 tracking-wider">Periode</span>,
      cell: (row: PayrollHistoryItem) => (
        <span className="text-xs text-gray-655 whitespace-nowrap">
          {getBulanNama(row.bulan)} {row.tahun}
        </span>
      ),
    },
    {
      header: <span className="text-left block text-xs font-semibold text-gray-500 tracking-wider">Grand Total</span>,
      cell: (row: PayrollHistoryItem) => (
        <span className="text-xs font-bold text-gray-800 whitespace-nowrap">{formatRupiah(row.grand_total)}</span>
      ),
    },
    {
      header: <span className="text-center block text-xs font-semibold text-gray-500 tracking-wider">Actions</span>,
      cell: (row: PayrollHistoryItem) => (
        <div className="flex items-center justify-center gap-2">
          <a
            href={`${API_BASE_URL.replace("/api", "")}/payroll/${row.id}/download`}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-md transition-colors cursor-pointer"
            title="Print Slip Gaji"
          >
            <Printer size={14} />
          </a>
          {isAdmin && (
            <button
              type="button"
              onClick={() => handleDeleteClick(row.id, row.no_gaji, row.name)}
              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer border-none bg-transparent"
              title="Hapus Slip Gaji"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      ),
    },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => String(currentYear - i));
  const months = [
    { value: "1", label: "Januari" },
    { value: "2", label: "Februari" },
    { value: "3", label: "Maret" },
    { value: "4", label: "April" },
    { value: "5", label: "Mei" },
    { value: "6", label: "Juni" },
    { value: "7", label: "Juli" },
    { value: "8", label: "Agustus" },
    { value: "9", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Unified Table Card containing Search, Month, and Year */}
      <div className="bg-white border border-gray-200/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Header Filter Row */}
        <div className="p-5 border-b border-gray-100 bg-zinc-50/20">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-4xl">
            {/* 1. Search Karyawan */}
            <div className="relative w-full sm:max-w-[220px]">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                <Magnifier size={18} weight="Linear" />
              </span>
              <input
                type="text"
                value={filters.q}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Cari pegawai..."
                className="w-full h-9 box-border pl-10 pr-4 text-xs bg-zinc-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#e0542c] focus:border-[#e0542c] transition-all placeholder-gray-400 text-gray-700 font-medium"
              />
            </div>

            {/* 2. Bulan Dropdown */}
            <div className="w-full sm:w-48">
              <Select
                value={filters.bulan || "all"}
                onValueChange={(val) => handleMonthChange(val || "all")}
              >
                <SelectTrigger className="w-full h-9 box-border px-3 text-xs bg-zinc-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#e0542c] focus:border-[#e0542c] text-gray-700 font-medium flex items-center justify-between cursor-pointer shadow-none">
                  <SelectValue>
                    {filters.bulan
                      ? months.find((m) => m.value === filters.bulan)?.label || "Semua Bulan"
                      : "Semua Bulan"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-md p-1 min-w-[150px]">
                  <SelectItem value="all" className="text-xs text-gray-700 hover:bg-zinc-50 py-1.5 px-3 rounded-md cursor-pointer flex items-center gap-2">
                    Semua Bulan
                  </SelectItem>
                  {months.map((m) => (
                    <SelectItem
                      key={m.value}
                      value={m.value}
                      className="text-xs text-gray-700 hover:bg-zinc-50 py-1.5 px-3 rounded-md cursor-pointer flex items-center gap-2"
                    >
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 3. Tahun Dropdown */}
            <div className="w-full sm:w-40">
              <Select
                value={filters.tahun || "all"}
                onValueChange={(val) => handleYearChange(val || "all")}
              >
                <SelectTrigger className="w-full h-9 box-border px-3 text-xs bg-zinc-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#e0542c] focus:border-[#e0542c] text-gray-700 font-medium flex items-center justify-between cursor-pointer shadow-none">
                  <SelectValue>
                    {filters.tahun === "all" || !filters.tahun ? "Semua Tahun" : filters.tahun}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-md p-1 min-w-[120px]">
                  <SelectItem value="all" className="text-xs text-gray-700 hover:bg-zinc-50 py-1.5 px-3 rounded-md cursor-pointer flex items-center gap-2">
                    Semua Tahun
                  </SelectItem>
                  {years.map((y) => (
                    <SelectItem
                      key={y}
                      value={y}
                      className="text-xs text-gray-700 hover:bg-zinc-50 py-1.5 px-3 rounded-md cursor-pointer flex items-center gap-2"
                    >
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Embedded Reusable Table */}
        <ReusableTable
          columns={columns}
          data={historyItems}
          loading={loading}
          showSearch={false}
          showPagination={true}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={(page) => loadHistoryData(page)}
          className="border-none shadow-none p-0 bg-transparent rounded-none"
          rowClassName="hover:bg-zinc-50/30"
          emptyMessage="Tidak ada data riwayat payroll."
        />
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: null, noGaji: "", employeeName: "" })}
        onConfirm={handleConfirmDelete}
        title="Hapus Slip Gaji"
        message={`Apakah Anda yakin ingin menghapus data slip gaji "${confirmDelete.noGaji}" milik "${confirmDelete.employeeName}"? Tindakan ini tidak dapat dibatalkan.`}
        variant="danger"
        loading={submitting}
      />
    </div>
  );
}
