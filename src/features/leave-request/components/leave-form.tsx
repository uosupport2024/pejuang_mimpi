import React from "react";
import { Input } from "@/shared/components/ui/input";
import { RefreshCw, Calendar as CalendarIcon } from "lucide-react";

interface LeaveFormProps {
  hook: any;
}

export function LeaveForm({ hook }: LeaveFormProps) {
  const {
    namaPegawai,
    jenisCuti,
    setJenisCuti,
    tanggalMulai,
    setTanggalMulai,
    tanggalAkhir,
    setTanggalAkhir,
    alasanCuti,
    setAlasanCuti,
    fileName,
    handleFileChange,
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
          className="h-12 rounded-xl text-xs text-zinc-400 bg-zinc-100/70 border-zinc-200/80 font-bold cursor-not-allowed select-none opacity-85"
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
          className="h-12 rounded-xl text-xs text-zinc-400 bg-zinc-100/70 border-zinc-200/80 font-bold cursor-not-allowed select-none opacity-85"
        />
      </div>

      {/* Tanggal Mulai */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-medium uppercase text-zinc-500 tracking-wider opacity-100">
          Tanggal Mulai
        </label>
        <Input
          type="date"
          value={tanggalMulai}
          onChange={(e) => setTanggalMulai(e.target.value)}
          className="h-12 rounded-xl text-xs text-zinc-800 border-zinc-200 bg-white font-semibold focus-visible:ring-[#e0542c]/50"
        />
      </div>

      {/* Tanggal Akhir */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-medium uppercase text-zinc-500 tracking-wider opacity-100">
          Tanggal Akhir
        </label>
        <Input
          type="date"
          value={tanggalAkhir}
          onChange={(e) => setTanggalAkhir(e.target.value)}
          className="h-12 rounded-xl text-xs text-zinc-800 border-zinc-200 bg-white font-semibold focus-visible:ring-[#e0542c]/50"
        />
      </div>

      {/* Custom File Upload Input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-medium uppercase text-zinc-500 tracking-wider opacity-100">
          Unggah Dokumen (Opsional)
        </label>
        <div className="flex items-center border border-zinc-200 rounded-xl overflow-hidden h-12 text-xs bg-white">
          <label className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-4 py-3.5 font-bold cursor-pointer border-r border-zinc-200 shrink-0 select-none active:scale-95 transition-all">
            Choose File
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          <span className="px-3 text-zinc-500 font-medium truncate flex-1">
            {fileName || "No file chosen"}
          </span>
        </div>
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
