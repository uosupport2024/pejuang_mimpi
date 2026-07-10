import { useState, useEffect, useRef } from "react";
import { fetchCutiHistoryAPI, postCutiRequestAPI } from "../api/leave";
import { toast } from "sonner";

export function useLeave(user: any, initialSelectedType?: string | null) {
  const mapTypeToName = (type?: string | null) => {
    switch (type) {
      case "cuti": return "Cuti Tahunan";
      case "lainnya": return "Izin Lainnya";
      case "telat": return "Izin Telat";
      case "pulang_cepat": return "Izin Pulang Cepat";
      default: return "Cuti Tahunan";
    }
  };

  const [namaPegawai, setNamaPegawai] = useState(user?.name || "Ade Muchtar");
  const [jenisCuti, setJenisCuti] = useState(mapTypeToName(initialSelectedType));
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalAkhir, setTanggalAkhir] = useState("");
  const [alasanCuti, setAlasanCuti] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);

  const fetchHistory = async (page = 1, currentRange = dateRange) => {
    setIsLoadingHistory(true);
    try {
      const [start, end] = currentRange;
      const startStr = start ? start.toLocaleDateString("en-CA") : "";
      const endStr = end ? end.toLocaleDateString("en-CA") : "";
      const data = await fetchCutiHistoryAPI(startStr, endStr, page);
      setHistoryList(data.data || []);
      setTotalPages(data.last_page || 1);
      setCurrentPage(data.current_page || 1);
    } catch (err: any) {
      console.error(err);
      toast.error("Gagal mengambil riwayat cuti");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleRangeChange = (range: [Date | null, Date | null]) => {
    setDateRange(range);
    const [s, e] = range;
    if (s && e) {
      fetchHistory(1, range);
    }
  };

  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchHistory();
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const submitLeaveRequest = async (onSuccess?: () => void) => {
    if (!tanggalMulai || !tanggalAkhir) {
      toast.error("Tanggal mulai dan tanggal akhir wajib diisi.");
      return;
    }
    if (!alasanCuti) {
      toast.error("Alasan cuti wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("user_id", user.id.toString());
      formData.append("nama_cuti", jenisCuti);
      formData.append("alasan_cuti", alasanCuti);
      formData.append("tanggal_mulai", tanggalMulai);
      formData.append("tanggal_akhir", tanggalAkhir);
      if (file) {
        formData.append("foto_cuti", file);
      }

      await postCutiRequestAPI(formData);
      toast.success("Permintaan cuti berhasil diajukan!");
      
      // Reset form
      setTanggalMulai("");
      setTanggalAkhir("");
      setAlasanCuti("");
      setFile(null);
      setFileName("");
      
      // Reload history
      fetchHistory(1);
      
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Gagal mengajukan permintaan cuti");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    namaPegawai,
    setNamaPegawai,
    jenisCuti,
    setJenisCuti,
    tanggalMulai,
    setTanggalMulai,
    tanggalAkhir,
    setTanggalAkhir,
    alasanCuti,
    setAlasanCuti,
    file,
    fileName,
    handleFileChange,
    isSubmitting,
    submitLeaveRequest,
    
    // History & Filters
    historyList,
    isLoadingHistory,
    fetchHistory,
    currentPage,
    totalPages,
    dateRange,
    handleRangeChange,
  };
}
