import { useState, useEffect, useRef } from "react";
import { fetchCutiHistoryAPI, postCutiRequestAPI, deleteCutiAPI, updateCutiAPI } from "../api/leave";
import { toast } from "sonner";
import { useRouter } from "@/shared/router/router";

export function useLeave(user: any, initialSelectedType?: string | null) {
  const { navigate } = useRouter();
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
  const [tanggalMulai, setTanggalMulai] = useState<Date | null>(null);
  const [tanggalAkhir, setTanggalAkhir] = useState<Date | null>(null);
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

  // Edit mode states
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const startEdit = (item: any) => {
    setIsEditMode(true);
    setEditingId(item.id);
    setJenisCuti(item.nama_cuti);
    setTanggalMulai(new Date(item.tanggal));
    setTanggalAkhir(new Date(item.tanggal));
    setAlasanCuti(item.alasan_cuti || "");
    setFile(null);
    setFileName(item.foto_cuti ? "File sebelumnya disimpan" : "");
    
    // Scroll to form smoothly
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setIsEditMode(false);
    setEditingId(null);
    setJenisCuti(mapTypeToName(initialSelectedType));
    setTanggalMulai(null);
    setTanggalAkhir(null);
    setAlasanCuti("");
    setFile(null);
    setFileName("");
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const deleteLeaveRequest = (id: number) => {
    setDeletingId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteLeave = async () => {
    if (!deletingId) return;
    try {
      await deleteCutiAPI(deletingId);
      toast.success("Pengajuan cuti berhasil dibatalkan.");
      fetchHistory(currentPage);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Gagal membatalkan pengajuan cuti.");
    } finally {
      setShowDeleteConfirm(false);
      setDeletingId(null);
    }
  };

  const cancelDeleteLeave = () => {
    setShowDeleteConfirm(false);
    setDeletingId(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      const allowedTypes = ["image/jpeg", "image/jpg", "image/webp"];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error("Format file tidak didukung. Hanya menerima JPG, JPEG, atau WEBP.");
        e.target.value = "";
        return;
      }
      const maxSizeBytes = 2 * 1024 * 1024; // 2MB
      if (selectedFile.size > maxSizeBytes) {
        toast.error("Ukuran file maksimal adalah 2MB.");
        e.target.value = "";
        return;
      }
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const submitLeaveRequest = async (onSuccess?: () => void) => {
    if (!tanggalMulai) {
      toast.error("Tanggal wajib diisi.");
      return;
    }
    if (!alasanCuti) {
      toast.error("Alasan cuti wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("nama_cuti", jenisCuti);
      formData.append("alasan_cuti", alasanCuti);

      if (isEditMode && editingId) {
        const dateStr = tanggalMulai ? tanggalMulai.toLocaleDateString("en-CA") : "";
        formData.append("tanggal", dateStr);
        if (file) {
          formData.append("foto_cuti", file);
        }
        await updateCutiAPI(editingId, formData);
        toast.success("Permintaan cuti berhasil diperbarui!");
      } else {
        if (!tanggalAkhir) {
          toast.error("Tanggal akhir wajib diisi.");
          setIsSubmitting(false);
          return;
        }
        const startStr = tanggalMulai ? tanggalMulai.toLocaleDateString("en-CA") : "";
        const endStr = tanggalAkhir ? tanggalAkhir.toLocaleDateString("en-CA") : "";
        formData.append("tanggal_mulai", startStr);
        formData.append("tanggal_akhir", endStr);
        if (file) {
          formData.append("foto_cuti", file);
        }
        await postCutiRequestAPI(formData);
        toast.success("Permintaan cuti berhasil diajukan!");
      }

      // Reset form
      cancelEdit();
      
      // Reload history
      fetchHistory(1);

      // Redirect to history page
      navigate("MobileLeaveHistory");
      
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Gagal mengirimkan permintaan cuti");
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setFileName("");
  };

  const changeTanggalMulai = (date: Date | null) => {
    setTanggalMulai(date);
    if (date && tanggalAkhir && date > tanggalAkhir) {
      setTanggalAkhir(null);
    }
  };

  return {
    namaPegawai,
    setNamaPegawai,
    jenisCuti,
    setJenisCuti,
    tanggalMulai,
    setTanggalMulai: changeTanggalMulai,
    tanggalAkhir,
    setTanggalAkhir,
    alasanCuti,
    setAlasanCuti,
    file,
    fileName,
    handleFileChange,
    clearFile,
    isSubmitting,
    submitLeaveRequest,
    
    // Edit mode
    isEditMode,
    editingId,
    startEdit,
    cancelEdit,
    deleteLeaveRequest,
    showDeleteConfirm,
    confirmDeleteLeave,
    cancelDeleteLeave,
    
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
