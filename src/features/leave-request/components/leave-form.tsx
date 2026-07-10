import { Input } from "@/shared/components/ui/input";
import { SingleDatePicker } from "@/shared/components/ui/single-date-picker";
import { RefreshCw, Upload, FileText, X } from "lucide-react";

interface LeaveFormProps {
  hook: any;
}

export function LeaveForm({ hook }: LeaveFormProps) {
  const {
    namaPegawai,
    jenisCuti,
    tanggalMulai,
    setTanggalMulai,
    tanggalAkhir,
    setTanggalAkhir,
    alasanCuti,
    setAlasanCuti,
    fileName,
    handleFileChange,
    clearFile,
    isSubmitting,
    submitLeaveRequest,
  } = hook;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitLeaveRequest();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 shadow-lg shadow-zinc-100 border border-zinc-100/80 flex flex-col gap-4 text-left">
      {/* Employee Name (Disabled Text Input) */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-medium uppercase text-zinc-500 tracking-wider opacity-100">
          Nama Pegawai
        </label>
        <Input
          disabled
          value={namaPegawai}
          className="h-12 rounded-xl text-xs text-zinc-700 bg-zinc-100/70 border-zinc-200/80 font-bold cursor-not-allowed select-none opacity-85"
        />
      </div>

      {/* Jenis Cuti / Izin (Disabled Text Input) */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-medium uppercase text-zinc-500 tracking-wider opacity-100">
          Jenis Cuti / Izin
        </label>
        <Input
          disabled
          value={jenisCuti}
          className="h-12 rounded-xl text-xs text-zinc-700 bg-zinc-100/70 border-zinc-200/80 font-bold cursor-not-allowed select-none opacity-85"
        />
      </div>

      {/* Tanggal Mulai */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-medium uppercase text-zinc-500 tracking-wider opacity-100">
          Tanggal Mulai
        </label>
        <SingleDatePicker
          value={tanggalMulai}
          onChange={setTanggalMulai}
          placeholder="Pilih Tanggal Mulai"
        />
      </div>

      {/* Tanggal Akhir */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-medium uppercase text-zinc-500 tracking-wider opacity-100">
          Tanggal Akhir
        </label>
        <SingleDatePicker
          value={tanggalAkhir}
          onChange={setTanggalAkhir}
          placeholder="Pilih Tanggal Akhir"
          minDate={tanggalMulai ?? undefined}
        />
      </div>

      {/* Custom File Upload Input (Modern Card Style) */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-medium uppercase text-zinc-500 tracking-wider opacity-100">
          Unggah Dokumen (Opsional)
        </label>
        
        <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-4.5 text-center cursor-pointer transition-all ${
          fileName 
            ? "border-[#e0542c]/30 bg-[#e0542c]/2" 
            : "border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50 hover:border-zinc-300"
        }`}>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          
          {fileName ? (
            <div className="flex items-center gap-3 w-full justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#e0542c]/10 text-[#e0542c] flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex flex-col text-left min-w-0">
                  <span className="text-xs font-bold text-zinc-800 truncate">{fileName}</span>
                  <span className="text-[9.5px] text-zinc-400 font-semibold mt-0.5">File berhasil dipilih</span>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  clearFile();
                }}
                className="p-1.5 hover:bg-zinc-100 active:scale-95 rounded-full transition-all text-zinc-400 hover:text-zinc-600 border border-zinc-200/50 flex items-center justify-center cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center py-1">
              <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mb-2">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-zinc-700">Pilih dokumen atau foto</span>
              <span className="text-[9.5px] text-zinc-400 font-semibold mt-1">PNG, JPG, atau PDF (Maks. 10MB)</span>
            </div>
          )}
        </label>
      </div>

      {/* Alasan Cuti */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-medium uppercase text-zinc-500 tracking-wider opacity-100">
          Alasan Cuti
        </label>
        <textarea
          value={alasanCuti}
          onChange={(e) => setAlasanCuti(e.target.value)}
          placeholder="Tulis alasan permohonan cuti/izin..."
          className="flex min-h-[90px] w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-xs text-zinc-800 font-medium placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#e0542c]/50"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border-0 flex items-center justify-center gap-2 mt-2 ${
          isSubmitting
            ? "bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none"
            : "bg-[#e0542c] hover:bg-[#c23f1b] text-white shadow-md shadow-[#e0542c]/15 active:scale-[0.98] cursor-pointer"
        }`}
      >
        {isSubmitting ? (
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <span>Submit</span>
        )}
      </button>
    </form>
  );
}
