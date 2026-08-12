import React, { useState, useRef } from "react";
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Download,
  Loader2,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { THEME_COLORS } from "@/shared/constants/colors";
import { toast } from "sonner";
import {
  uploadEmployeeImport,
  fetchEmployeeImportBatchReview,
  downloadEmployeeImportBatchReview,
  type EmployeeImportUploadResponse,
} from "../api/employee-import";

interface EmployeeImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: number | string;
  onSuccess?: () => void;
}

export function EmployeeImportModal({
  isOpen,
  onClose,
  tenantId,
  onSuccess,
}: EmployeeImportModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Result state
  const [uploadResult, setUploadResult] = useState<{
    batchId: string | number;
    message?: string;
    reviewData?: any;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const validateAndSetFile = (file: File) => {
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (
      !validTypes.includes(file.type) &&
      !["xlsx", "xls", "csv"].includes(extension || "")
    ) {
      toast.error("Format file tidak didukung. Harap pilih file Excel (.xlsx, .xls) atau CSV.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Ukuran file terlalu besar (maksimal 10MB).");
      return;
    }

    setSelectedFile(file);
    setUploadResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setUploadResult(null);

      const response: EmployeeImportUploadResponse = await uploadEmployeeImport(
        selectedFile,
        tenantId
      );

      const responseData = response.data || response;
      const batchId =
        responseData?.id ||
        response.batch_id ||
        responseData?.batch_id ||
        `BATCH-${Date.now()}`;

      let reviewData = responseData;

      // If batchId is valid, attempt to fetch fresh JSON review from GET /v1/employees/import/{batch_id}
      if (batchId && batchId !== `BATCH-${Date.now()}`) {
        try {
          const fetchedReview = await fetchEmployeeImportBatchReview(batchId);
          if (fetchedReview) {
            reviewData = fetchedReview;
          }
        } catch (e) {
          console.warn("Could not fetch detailed JSON review from backend batch_id:", e);
        }
      }

      setUploadResult({
        batchId,
        message: response.message || "Import data pegawai berhasil diproses.",
        reviewData,
      });

      const errorsArr = Array.isArray(reviewData?.errors)
        ? reviewData.errors
        : Array.isArray(reviewData?.issues)
        ? reviewData.issues
        : [];

      const uniqueRows = new Set(
        errorsArr
          .map((e: any) => e.row_number ?? e.row)
          .filter((r: any) => r !== undefined && r !== null && r !== "")
      );

      const uniqueFailedRowCount = uniqueRows.size > 0
        ? uniqueRows.size
        : (reviewData?.error_count ?? errorsArr.length ?? 0);

      if (uniqueFailedRowCount > 0) {
        toast.warning("File import diproses dengan catatan error.");
      } else {
        toast.success("File import berhasil diproses!");
      }

      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Gagal mengunggah file import pegawai.");
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadReviewExcel = async () => {
    if (!uploadResult?.batchId) return;
    try {
      await downloadEmployeeImportBatchReview(uploadResult.batchId);
      toast.success("File hasil import (beserta anotasi & akun sheet 3) berhasil diunduh.");
    } catch (err: any) {
      toast.error(err.message || "Gagal mengunduh file hasil import.");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Smooth Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={uploading ? undefined : onClose}
      />

      {/* Modal Container — Widescreen Layout with Standard border-radius (rounded-xl) */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xl max-w-3xl w-full max-h-[90vh] p-6 flex flex-col justify-between z-[101] animate-in zoom-in-95 duration-200 relative overflow-hidden my-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{
                backgroundColor: `${THEME_COLORS.hex.airKehidupan}15`,
                color: THEME_COLORS.hex.airKehidupan,
              }}
            >
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900 leading-tight">
                Import Data Pegawai
              </h3>
              <p className="text-xs font-medium text-gray-500 mt-0.5">
                Unggah file Excel sesuai template untuk mendaftarkan pegawai secara masal
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={uploading}
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer disabled:opacity-40 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden native input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Scrollable Modal Body Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-left pr-0.5">

          {/* Step 1: File Dropzone (if not uploaded yet) */}
          {!uploadResult && (
            <div className="space-y-4">
              {!selectedFile ? (
                <div
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center space-y-3 ${
                    isDragging
                      ? "border-[#5C8A90] bg-[#5C8A90]/10 scale-[1.01]"
                      : "border-gray-300 hover:border-[#5C8A90] bg-zinc-50/80 hover:bg-[#5C8A90]/5"
                  }`}
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center transition-transform duration-200"
                    style={{
                      backgroundColor: isDragging
                        ? `${THEME_COLORS.hex.airKehidupan}25`
                        : `${THEME_COLORS.hex.airKehidupan}15`,
                      color: THEME_COLORS.hex.airKehidupan,
                    }}
                  >
                    <UploadCloud className="w-6 h-6" />
                  </div>

                  <div className="space-y-1 max-w-md">
                    <p className="text-xs font-bold text-gray-800">
                      Tarik & lepas file Excel Anda di sini, atau{" "}
                      <span
                        className="font-extrabold underline cursor-pointer"
                        style={{ color: THEME_COLORS.hex.airKehidupan }}
                      >
                        Pilih File Dari Komputer
                      </span>
                    </p>
                    <p className="text-[11px] text-gray-500 font-medium">
                      Format file didukung: .xlsx, .xls, .csv (Maksimal 10MB)
                    </p>
                  </div>
                </div>
              ) : (
                /* File Selected Preview Card */
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-lg p-4 flex items-center justify-between animate-in fade-in duration-200">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-gray-900 truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                        {formatFileSize(selectedFile.size)} • File siap untuk diimport
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={uploading}
                    onClick={handleClearFile}
                    className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                    title="Ganti File"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Upload Result View (JSON Review & Excel Download Sheet 3) */}
          {uploadResult && (() => {
            const review = uploadResult.reviewData || {};
            const batchId = review.id ?? review.batch_id ?? uploadResult.batchId;
            const employeesCreated = review.employees_created ?? review.success_count ?? review.success ?? 0;
            const errorsList: any[] = Array.isArray(review.errors)
              ? review.errors
              : Array.isArray(review.issues)
              ? review.issues
              : [];
            
            // Group errors by row_number to count unique failed rows
            const uniqueFailedRowsSet = new Set(
              errorsList
                .map((e: any) => e.row_number ?? e.row)
                .filter((r: any) => r !== undefined && r !== null && r !== "")
            );

            const failedRowCount = uniqueFailedRowsSet.size > 0
              ? uniqueFailedRowsSet.size
              : (review.error_count ?? review.failed_count ?? errorsList.length ?? 0);

            const totalRows = (review.total_rows ?? review.total) !== undefined
              ? (review.total_rows ?? review.total)
              : (employeesCreated + failedRowCount);
            
            const hasErrors = failedRowCount > 0 || errorsList.length > 0;

            return (
              <div className="space-y-4 animate-in fade-in duration-300">
                {/* Compact Top Status Alert */}
                {hasErrors ? (
                  <div className="bg-rose-50/90 border border-rose-200/90 rounded-lg px-4 py-3 flex items-center justify-between gap-3 text-left">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <h4 className="text-xs font-bold text-rose-900 truncate">
                        Import Ditolak — Ditemukan {failedRowCount} Data Pegawai Gagal ({errorsList.length} Issue)
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px] font-mono shrink-0">
                      Batch #{batchId}
                    </span>
                  </div>
                ) : (
                  <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-lg px-4 py-3 flex items-center justify-between gap-3 text-left">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <h4 className="text-xs font-bold text-emerald-900 truncate">
                        Import Pegawai Berhasil — {employeesCreated} pegawai ditambahkan
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] font-mono shrink-0">
                      Batch #{batchId}
                    </span>
                  </div>
                )}

                {/* 2-Column Split: Summary on Left, Errors on Right */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  
                  {/* Left Column (5 Cols): Summary Metrics & Download Button */}
                  <div className="md:col-span-5 space-y-3 flex flex-col justify-between">
                    {/* Ringkasan Metrics */}
                    <div className="bg-zinc-50/80 border border-zinc-200/80 rounded-lg p-3 space-y-2 text-left">
                      <h5 className="text-[10.5px] font-extrabold text-gray-600 uppercase tracking-wider">
                        Ringkasan Hasil Import
                      </h5>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 bg-white border border-gray-200/80 rounded-md space-y-0.5">
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Total</p>
                          <p className="text-base font-extrabold text-gray-800">
                            {totalRows}
                          </p>
                        </div>
                        <div className="p-2 bg-white border border-emerald-200/80 rounded-md space-y-0.5">
                          <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider">Berhasil</p>
                          <p className="text-base font-extrabold text-emerald-700">
                            {employeesCreated}
                          </p>
                        </div>
                        <div className="p-2 bg-white border border-rose-200/80 rounded-md space-y-0.5">
                          <p className="text-[9px] text-rose-500 font-bold uppercase tracking-wider">Gagal</p>
                          <p className="text-base font-extrabold text-rose-600">
                            {failedRowCount}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Download Review Excel Card */}
                    <div className="bg-zinc-50/80 border border-zinc-200/80 rounded-lg p-3.5 space-y-2.5 text-left flex-1 flex flex-col justify-between">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-gray-800">
                          Unduh Hasil Import & Akun
                        </p>
                        <p className="text-[10.5px] text-gray-500 font-medium leading-normal">
                          File anotasi error & password ter-generate (Sheet 3).
                        </p>
                      </div>

                      <Button
                        type="button"
                        onClick={handleDownloadReviewExcel}
                        style={{
                          backgroundColor: THEME_COLORS.hex.sawahPertumbuhan,
                          color: "#ffffff",
                        }}
                        className="w-full h-9 px-3 text-xs font-bold rounded-md text-white shadow-xs hover:opacity-90 transition-all shrink-0 flex items-center justify-center gap-1.5 border-0 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-white" />
                        <span>Unduh Excel Review</span>
                      </Button>
                    </div>
                  </div>

                  {/* Right Column (7 Cols): Error List */}
                  <div className="md:col-span-7">
                    {errorsList.length > 0 ? (
                      <div className="bg-rose-50/30 border border-rose-200/70 rounded-lg p-3 space-y-2 text-left h-full flex flex-col">
                        <div className="flex items-center justify-between border-b border-rose-200/60 pb-1.5 shrink-0">
                          <p className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                            Daftar Pesan Error ({errorsList.length})
                          </p>
                        </div>

                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1 flex-1">
                          {errorsList.map((errItem: any, idx: number) => {
                            const rowNum = errItem.row_number ?? errItem.row ?? "-";
                            const colName = errItem.column_name ?? errItem.column ?? errItem.field ?? "";
                            const msg = errItem.message ?? errItem.error ?? JSON.stringify(errItem);
                            return (
                              <div
                                key={idx}
                                className="bg-white border border-rose-200/70 rounded-md p-2.5 text-xs space-y-1 shadow-2xs hover:border-rose-300 transition-all"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-extrabold text-[9.5px] border border-rose-200/60">
                                    Baris {rowNum}
                                  </span>
                                  {colName && (
                                    <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700 font-mono text-[9.5px] font-semibold border border-zinc-200/60">
                                      {colName}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11.5px] font-medium text-rose-700 leading-snug pt-0.5">
                                  {msg}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-emerald-50/40 border border-emerald-200/70 rounded-lg p-6 text-center h-full flex flex-col items-center justify-center space-y-2">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                        <p className="text-xs font-bold text-emerald-900">
                          Tidak Ditemukan Error
                        </p>
                        <p className="text-[11px] text-emerald-700 font-medium">
                          Seluruh baris data pada file Excel berhasil divalidasi dan diimport.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 shrink-0">
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={onClose}
            className="h-9 px-4 text-xs font-bold rounded-md text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 cursor-pointer"
          >
            {uploadResult ? "Tutup" : "Batal"}
          </Button>

          {!uploadResult && (
            <Button
              type="button"
              disabled={!selectedFile || uploading}
              onClick={handleUploadSubmit}
              style={{
                backgroundColor: selectedFile ? THEME_COLORS.hex.primary : undefined,
                color: "#ffffff",
              }}
              className={`h-9 px-5 text-xs font-bold rounded-md text-white transition-all shadow-xs flex items-center justify-center gap-2 border-0 ${
                !selectedFile || uploading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "hover:opacity-90 cursor-pointer"
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Mengunggah...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4 text-white" />
                  <span>Proses Import</span>
                </>
              )}
            </Button>
          )}

          {uploadResult && (
            <Button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setUploadResult(null);
              }}
              className="h-9 px-4 text-xs font-bold rounded-md bg-zinc-100 hover:bg-zinc-200 text-gray-700 border-0 cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
              <span>Import File Lain</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
