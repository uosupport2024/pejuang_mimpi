import { useState } from "react";
import {
  CheckCircle2, Clock, AlertCircle, Star, LogIn, CalendarCheck,
  UserCheck, Bell, BookOpen, Award, Zap,
} from "lucide-react";
import patternBg from "@/assets/bg/pattern-background.png";
import logoWhite from "@/assets/logo/logo-white.png";
import { THEME_COLORS } from "@/shared/constants/colors";
import { toast } from "sonner";
import type { AyamkuPageProps } from "../types/ayamku.type";

type MisiStatus = "selesai" | "berlangsung" | "terlambat";
type MisiKategori = "login" | "absen" | "profil" | "pembelajaran" | "notifikasi" | "pencapaian";

interface Misi {
  id: string;
  judul: string;
  deskripsi: string;
  progres: string;           // e.g. "5/7 hari"
  status: MisiStatus;
  kategori: MisiKategori;
  poin: number;
}

const MISI_DATA: Misi[] = [
  {
    id: "M-01",
    judul: "Login 7 Hari Berturut-turut",
    deskripsi: "Buka aplikasi dan login setiap hari selama 7 hari penuh tanpa terputus",
    progres: "5/7 Hari",
    status: "berlangsung",
    kategori: "login",
    poin: 50,
  },
  {
    id: "M-02",
    judul: "Absen Tepat Waktu 7 Hari",
    deskripsi: "Lakukan presensi masuk sebelum jam 08.00 selama 7 hari berturut-turut",
    progres: "7/7 Hari",
    status: "selesai",
    kategori: "absen",
    poin: 100,
  },
  {
    id: "M-03",
    judul: "Lengkapi Profil Kamu",
    deskripsi: "Isi semua data diri: foto, nomor rekening, status nikah, dan kontak darurat",
    progres: "3/5 Lengkap",
    status: "berlangsung",
    kategori: "profil",
    poin: 75,
  },
  {
    id: "M-04",
    judul: "Absen 30 Hari Tanpa Alfa",
    deskripsi: "Tidak ada hari absen tanpa keterangan selama satu bulan penuh",
    progres: "12/30 Hari",
    status: "terlambat",
    kategori: "absen",
    poin: 200,
  },
  {
    id: "M-05",
    judul: "Selesaikan 3 Materi Tunas",
    deskripsi: "Tonton dan selesaikan minimal 3 video atau modul pembelajaran di menu Tunas",
    progres: "1/3 Materi",
    status: "berlangsung",
    kategori: "pembelajaran",
    poin: 60,
  },
  {
    id: "M-06",
    judul: "Aktifkan Notifikasi",
    deskripsi: "Izinkan aplikasi mengirim notifikasi agar tidak ketinggalan pengumuman penting",
    progres: "Belum Aktif",
    status: "terlambat",
    kategori: "notifikasi",
    poin: 20,
  },
  {
    id: "M-07",
    judul: "Login 30 Hari Berturut-turut",
    deskripsi: "Buka aplikasi dan login setiap hari selama satu bulan penuh tanpa terputus",
    progres: "5/30 Hari",
    status: "berlangsung",
    kategori: "login",
    poin: 150,
  },
  {
    id: "M-08",
    judul: "Raih Bintang Kehadiran",
    deskripsi: "Dapatkan status 'Early' pada presensi masuk sebanyak 10 kali dalam sebulan",
    progres: "10/10 Kali",
    status: "selesai",
    kategori: "pencapaian",
    poin: 120,
  },
  {
    id: "M-09",
    judul: "Foto Profil Diunggah",
    deskripsi: "Unggah foto profil kamu agar rekan kerja dan atasan dapat mengenali kamu",
    progres: "Selesai",
    status: "selesai",
    kategori: "profil",
    poin: 25,
  },
  {
    id: "M-10",
    judul: "Selesaikan Semua Materi Wajib",
    deskripsi: "Tonton seluruh video pelatihan wajib yang tersedia di menu Tunas",
    progres: "0/6 Materi",
    status: "terlambat",
    kategori: "pembelajaran",
    poin: 250,
  },
];

const STATUS_CONFIG: Record<MisiStatus, { label: string; bgCard: string; shadowCard: string }> = {
  selesai: {
    label: "Selesai",
    bgCard: `bg-gradient-to-br ${THEME_COLORS.celengan.rumah.gradient}`,
    shadowCard: "shadow-lg shadow-[#7FA46D]/15",
  },
  berlangsung: {
    label: "Berlangsung",
    bgCard: `bg-gradient-to-br ${THEME_COLORS.celengan.liburanBali.gradient}`,
    shadowCard: "shadow-lg shadow-[#5C8A90]/15",
  },
  terlambat: {
    label: "Belum Mulai",
    bgCard: `bg-gradient-to-br ${THEME_COLORS.celengan.motor.gradient}`,
    shadowCard: "shadow-lg shadow-[#F25C2A]/15",
  },
};

const KATEGORI_ICON: Record<MisiKategori, React.ReactNode> = {
  login: <LogIn className="w-4 h-4 text-white" />,
  absen: <CalendarCheck className="w-4 h-4 text-white" />,
  profil: <UserCheck className="w-4 h-4 text-white" />,
  pembelajaran: <BookOpen className="w-4 h-4 text-white" />,
  notifikasi: <Bell className="w-4 h-4 text-white" />,
  pencapaian: <Award className="w-4 h-4 text-white" />,
};

const STATUS_ICON: Record<MisiStatus, React.ReactNode> = {
  selesai: <CheckCircle2 className="w-3 h-3 text-white" />,
  berlangsung: <Clock className="w-3 h-3 text-white" />,
  terlambat: <AlertCircle className="w-3 h-3 text-white" />,
};

export function AyamkuPage({ user: _user }: AyamkuPageProps) {
  const [filter, setFilter] = useState<"semua" | MisiStatus>("semua");

  const filtered = filter === "semua" ? MISI_DATA : MISI_DATA.filter((m) => m.status === filter);
  const totalPoin = MISI_DATA.filter((m) => m.status === "selesai").reduce((a, m) => a + m.poin, 0);
  const totalMisi = MISI_DATA.length;
  const selesaiMisi = MISI_DATA.filter((m) => m.status === "selesai").length;

  const FILTERS: { key: "semua" | MisiStatus; label: string }[] = [
    { key: "semua", label: "Semua" },
    { key: "berlangsung", label: "Berlangsung" },
    { key: "terlambat", label: "Belum Mulai" },
    { key: "selesai", label: "Selesai" },
  ];

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="-mt-6 -mx-5 relative mb-4">
        <div className="w-full bg-[#1e2a4a] text-white rounded-t-none rounded-b-[40px] shadow-lg shadow-[#1e2a4a]/20 border-b border-white/10 flex flex-col p-6 pt-7 pb-6 relative overflow-hidden">
          {/* Background Pattern */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{ backgroundImage: `url(${patternBg})`, backgroundSize: "150px 150px", backgroundRepeat: "repeat" }}
          />

          {/* Top row: Logo & User Info */}
          <div className="flex justify-between items-start z-10 relative mb-4">
            <div className="flex items-center gap-3.5">
              <img src={logoWhite} alt="Logo" className="w-12 h-12 object-contain" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-extrabold tracking-wider uppercase text-white/90 leading-none">
                  Tugas Harian
                </span>
                <span className="text-lg font-black tracking-tight text-white mt-1.5 leading-none">
                  Ayamku
                </span>
              </div>
            </div>
            {/* Poin badge */}
            <div className="flex flex-col items-end gap-1 z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-white text-[9px] font-black tracking-wide uppercase shadow-xs">
                <Star className="w-3 h-3 text-[#fee279]" />
                {totalPoin} Poin
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-[1px] bg-white/15 w-full my-1.5 z-10 relative" />

          {/* Bottom row: Progress summary */}
          <div className="flex justify-between items-center z-10 relative mt-2">
            <span className="text-xs font-semibold text-white/80">
              {selesaiMisi}/{totalMisi} misi selesai hari ini
            </span>
            <div className="flex items-center gap-1.5">
              <div className="w-28 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#fee279] to-[#ffb347] rounded-full transition-all duration-500"
                  style={{ width: `${(selesaiMisi / totalMisi) * 100}%` }}
                />
              </div>
              <span className="text-[9px] font-black text-white/60">{Math.round((selesaiMisi / totalMisi) * 100)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5 px-0.5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${filter === f.key
                ? "bg-[#1e2a4a] text-white shadow-sm"
                : "bg-white text-zinc-500 border border-zinc-200 hover:border-zinc-300"
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Misi Cards — same style as attendance-history */}
      <div className="flex flex-col gap-2.5">
        {filtered.map((misi) => {
          const cfg = STATUS_CONFIG[misi.status];
          return (
            <button
              key={misi.id}
              type="button"
              onClick={() => toast.info(`Membuka detail misi: ${misi.judul}`)}
              className={`flex items-stretch rounded-2xl shadow-md transition-all hover:scale-[1.005] active:scale-[0.99] duration-200 text-white overflow-hidden cursor-pointer w-full text-left ${cfg.bgCard} ${cfg.shadowCard}`}
            >
              {/* Left Column: Category Icon + ID */}
              <div className="w-16 bg-white/15 flex flex-col items-center justify-center gap-1.5 shrink-0 py-4">
                {KATEGORI_ICON[misi.kategori]}
                <span className="text-[8px] font-black text-white/70 uppercase tracking-wide leading-none">{misi.id}</span>
              </div>

              {/* Middle: Title, desc, progres, status */}
              <div className="flex-1 min-w-0 flex flex-col text-left justify-center py-4 pl-4 pr-3">
                <span className="text-sm font-black text-white leading-snug line-clamp-1">{misi.judul}</span>
                <span className="text-[9px] text-white/75 font-semibold mt-1 leading-snug line-clamp-2">{misi.deskripsi}</span>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 text-[8px] font-black text-white/80 bg-white/15 rounded-full px-2 py-0.5">
                    <Zap className="w-2.5 h-2.5" />{misi.progres}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[8px] font-black text-white/80 bg-white/15 rounded-full px-2 py-0.5">
                    {STATUS_ICON[misi.status]}{cfg.label}
                  </span>
                </div>
              </div>

              {/* Right: Poin glass badge */}
              <div className="flex flex-col items-center justify-center pr-4 shrink-0 gap-1.5">
                <div className="flex flex-col items-center justify-center bg-white/20 border border-white/10 rounded-xl px-2.5 py-1.5 min-w-[48px] text-center">
                  <span className="text-[11px] font-black leading-none text-white">+{misi.poin}</span>
                  <span className="text-[7.5px] font-extrabold uppercase mt-1 leading-none text-white/80 tracking-wider">Poin</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom spacer */}
      <div className="h-2" />
    </div>
  );
}
