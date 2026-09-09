import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Bell,
  CheckCheck,
  Calendar,
  Clock,
  DollarSign,
  Megaphone,
  RefreshCw,
  Zap,
  ChevronRight,
  FileText,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/shared/router/router";
import { useTenantBranding } from "@/shared/hooks/use-tenant-branding";
import { THEME_COLORS } from "@/shared/constants/colors";
import patternBg from "@/assets/bg/pattern-background.png";
import { motion, AnimatePresence } from "motion/react";
import {
  fetchNotificationsAPI,
  markNotificationReadAPI,
  markAllNotificationsReadAPI,
  type NotificationItem,
} from "../api/notification";

export function MobileNotificationPage() {
  const { navigate } = useRouter();
  const { navbarBgStyle, buttonColor } = useTenantBranding();
  const primaryColor = typeof buttonColor === "string" ? buttonColor : THEME_COLORS.hex.primary;

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<"all" | "unread">("all");
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate("MobileProfile");
    }
  };

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchNotificationsAPI(1);
      setNotifications(res.notifications.data);
      setUnreadCount(res.unread_count);
    } catch (err: any) {
      console.warn("Gagal memuat notifikasi:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleCardClick = async (notif: NotificationItem) => {
    // Tandai sudah dibaca di latar belakang jika belum
    if (!notif.read_at) {
      try {
        await markNotificationReadAPI(notif.id);
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notif.id ? { ...item, read_at: new Date().toISOString() } : item
          )
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        // silent fail
      }
    }

    // Langsung buka modal rincian
    setSelectedNotification(notif);
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0 || isMarkingAll) return;
    try {
      setIsMarkingAll(true);
      await markAllNotificationsReadAPI();
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, read_at: item.read_at || new Date().toISOString() }))
      );
      setUnreadCount(0);
      toast.success("Semua notifikasi ditandai sudah dibaca");
    } catch (err: any) {
      toast.error(err.message || "Gagal menandai notifikasi");
    } finally {
      setIsMarkingAll(false);
    }
  };

  const indonesianDays: Record<string, string> = {
    Mon: "Sen",
    Tue: "Sel",
    Wed: "Rab",
    Thu: "Kam",
    Fri: "Jum",
    Sat: "Sab",
    Sun: "Min",
  };

  const formatRelativeTime = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "Baru saja";
      if (diffMins < 60) return `${diffMins} mnt lalu`;
      if (diffHours < 24) return `${diffHours} jam lalu`;
      if (diffDays === 1) return "Kemarin";
      if (diffDays < 7) return `${diffDays} hari lalu`;

      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      });
    } catch {
      return dateStr;
    }
  };

  const getNotificationIcon = (type?: string, title?: string, className = "w-5 h-5 text-white stroke-[2.2]") => {
    const t = (type || "").toLowerCase();
    const titleText = (title || "").toLowerCase();

    if (t.includes("leave") || titleText.includes("izin") || titleText.includes("cuti")) {
      return <Calendar className={className} />;
    }
    if (t.includes("koreksi") || titleText.includes("koreksi")) {
      return <Clock className={className} />;
    }
    if (t.includes("overtime") || titleText.includes("lembur")) {
      return <Zap className={className} />;
    }
    if (t.includes("payroll") || titleText.includes("gaji") || titleText.includes("slip")) {
      return <DollarSign className={className} />;
    }
    if (t.includes("shift") || titleText.includes("shift")) {
      return <Calendar className={className} />;
    }
    if (t.includes("announcement") || titleText.includes("pengumuman") || titleText.includes("info")) {
      return <Megaphone className={className} />;
    }
    return <Bell className={className} />;
  };

  const filteredNotifications = notifications.filter((item) => {
    if (filterTab === "unread") {
      return !item.read_at;
    }
    return true;
  });

  return (
    <div className="space-y-4 pb-20">
      {/* Header Banner — Serasi dengan Riwayat Absen / Lembur */}
      <div
        style={navbarBgStyle || { backgroundColor: THEME_COLORS.hex.primary }}
        className="-mt-6 -mx-5 text-white rounded-t-none rounded-b-[32px] shadow-md relative overflow-hidden mb-4"
      >
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{ backgroundImage: `url(${patternBg})`, backgroundSize: "180px auto", backgroundRepeat: "repeat" }}
        />
        <div className="relative z-10 flex items-center justify-between px-6 pt-10 pb-6">
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={handleBack}
              className="p-2 hover:bg-white/10 active:scale-95 rounded-full transition-all cursor-pointer text-white border border-white/10 bg-white/5 backdrop-blur-xs"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold tracking-widest uppercase text-white/70 leading-none">
                Pemberitahuan
              </span>
              <h1 className="text-base font-bold tracking-tight text-white mt-1.5 leading-none">
                Kotak Masuk
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={isMarkingAll}
                className="px-2.5 py-1.5 hover:bg-white/20 active:scale-95 rounded-xl transition-all cursor-pointer text-white border border-white/20 bg-white/10 flex items-center gap-1.5 text-[10px] font-bold shadow-xs backdrop-blur-xs"
                title="Tandai Semua Dibaca"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Baca Semua</span>
              </button>
            )}

            <button
              type="button"
              onClick={loadNotifications}
              className="p-2 hover:bg-white/20 active:scale-95 rounded-full transition-all cursor-pointer text-white border border-white/20 bg-white/10 backdrop-blur-xs shadow-xs"
              title="Muat Ulang"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setFilterTab("all")}
          style={filterTab === "all" ? { backgroundColor: primaryColor, color: "#fff", borderColor: primaryColor } : undefined}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            filterTab === "all"
              ? "shadow-xs"
              : "bg-white text-zinc-600 border-zinc-200/80 hover:bg-zinc-50"
          }`}
        >
          Semua ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterTab("unread")}
          style={filterTab === "unread" ? { backgroundColor: primaryColor, color: "#fff", borderColor: primaryColor } : undefined}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
            filterTab === "unread"
              ? "shadow-xs"
              : "bg-white text-zinc-600 border-zinc-200/80 hover:bg-zinc-50"
          }`}
        >
          <span>Belum Dibaca</span>
          {unreadCount > 0 && (
            <span
              style={filterTab === "unread" ? { backgroundColor: "#fff", color: primaryColor } : { backgroundColor: primaryColor, color: "#fff" }}
              className="px-1.5 py-0.2 rounded-full text-[9px] font-black"
            >
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-2.5">
        {loading && notifications.length === 0 ? (
          <div className="flex flex-col gap-2.5 py-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-stretch rounded-2xl bg-zinc-100 border border-zinc-200/50 h-[76px] animate-pulse overflow-hidden"
              >
                {/* Left Column Skeleton */}
                <div className="w-16 bg-zinc-200/60 shrink-0" />

                {/* Middle Column Skeleton */}
                <div className="flex-1 py-3.5 pl-4 pr-3 flex flex-col justify-center gap-2">
                  <div className="h-4 bg-zinc-200 rounded-md w-32" />
                  <div className="h-3 bg-zinc-200 rounded-md w-48 mt-0.5" />
                </div>

                {/* Right Column Skeleton */}
                <div className="flex items-center pr-3.5 shrink-0">
                  <div className="h-10 w-14 bg-zinc-200 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-16 text-center px-4 bg-white rounded-2xl border border-zinc-100 shadow-xs space-y-3">
            <div
              style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
              className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto"
            >
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-zinc-800">
                {filterTab === "unread" ? "Tidak Ada Notifikasi Baru" : "Belum Ada Notifikasi"}
              </h3>
              <p className="text-[11px] text-zinc-400 mt-1 max-w-xs mx-auto">
                {filterTab === "unread"
                  ? "Semua notifikasi Anda sudah dibaca."
                  : "Pemberitahuan approval cuti, koreksi absen, shift, dan pengumuman akan tersimpan di sini."}
              </p>
            </div>
          </div>
        ) : (
          filteredNotifications.map((item) => {
            const isUnread = !item.read_at;
            const notifTitle = item.data?.title || "Pemberitahuan Baru";
            const notifMessage = item.data?.message || "";

            // Format tanggal & hari untuk kolom kiri seperti Gambar 2 (Riwayat Presensi)
            const notifDate = item.created_at ? new Date(item.created_at) : new Date();
            const dayNum = !isNaN(notifDate.getTime()) ? notifDate.getDate() : "-";
            const rawDay = !isNaN(notifDate.getTime())
              ? notifDate.toLocaleDateString("en-US", { weekday: "short" })
              : "";
            const displayDayName = indonesianDays[rawDay] || rawDay || "HARI";

            // Jam untuk badge kanan seperti Gambar 2 (--:-- JAM)
            const timeStr = !isNaN(notifDate.getTime())
              ? notifDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace(".", ":")
              : "--:--";

            return (
              <div
                key={item.id}
                onClick={() => handleCardClick(item)}
                style={
                  isUnread
                    ? THEME_COLORS.celengan.motor.gradientStyle
                    : THEME_COLORS.celengan.rumah.gradientStyle
                }
                className={`flex items-stretch rounded-2xl shadow-md transition-all hover:scale-[1.005] active:scale-[0.99] duration-200 text-white overflow-hidden cursor-pointer ${
                  isUnread
                    ? "bg-gradient-motor shadow-orange-950/20"
                    : "bg-gradient-rumah shadow-emerald-950/15"
                }`}
              >
                {/* Left Column: Full-height Translucent Date Badge (Identik dengan Gambar 2) */}
                <div className="w-16 bg-white/15 flex flex-col items-center justify-center shrink-0 py-3.5">
                  <span className="text-xl font-bold leading-none text-white">{dayNum}</span>
                  <span className="text-[9px] font-bold uppercase mt-1.5 leading-none text-white/90 tracking-wider">
                    {displayDayName}
                  </span>
                </div>

                {/* Middle Column: Title & Message */}
                <div className="flex-1 min-w-0 flex flex-col text-left justify-center py-3.5 pl-4 pr-2">
                  <div className="flex items-center gap-1.5">
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-amber-200 animate-pulse shrink-0 shadow-xs" />
                    )}
                    <h3 className="text-sm font-bold text-white leading-tight truncate">
                      {notifTitle}
                    </h3>
                  </div>

                  {/* Message & Relative Time Subtitle */}
                  <div className="flex items-center gap-1.5 mt-1.5 text-white/80 font-semibold text-[10.5px] leading-none">
                    <span className="truncate">{notifMessage || "Ketuk untuk melihat rincian"}</span>
                    <span className="text-white/40 shrink-0">•</span>
                    <span className="shrink-0 text-white/70">{formatRelativeTime(item.created_at)}</span>
                  </div>
                </div>

                {/* Right Column: Time Glass Badge Style (Identik dengan Gambar 2) */}
                <div className="flex items-center pr-3.5 pl-1 shrink-0">
                  <div className="flex flex-col items-center justify-center bg-white/20 border border-white/10 rounded-xl px-2.5 py-1.5 min-w-[54px] shrink-0 text-center">
                    <span className="text-[10.5px] font-bold leading-none text-white whitespace-nowrap">
                      {timeStr}
                    </span>
                    <span
                      className={`text-[7.5px] font-bold uppercase mt-1 leading-none tracking-wider ${
                        isUnread ? "text-amber-200 font-extrabold" : "text-white/80"
                      }`}
                    >
                      {isUnread ? "BARU" : "WIB"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detail Notifikasi Modal / Drawer */}
      <AnimatePresence>
        {selectedNotification && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl text-left flex flex-col max-h-[85vh] overflow-y-auto"
            >
              {/* Modal Drag Handle (mobile) */}
              <div className="w-12 h-1 bg-zinc-200 rounded-full mx-auto mb-4 sm:hidden" />

              {/* Modal Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-zinc-100">
                <div className="flex items-center gap-3">
                  <div
                    style={
                      selectedNotification.read_at
                        ? THEME_COLORS.celengan.rumah.gradientStyle
                        : THEME_COLORS.celengan.motor.gradientStyle
                    }
                    className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs text-white"
                  >
                    {getNotificationIcon(selectedNotification.data?.type, selectedNotification.data?.title)}
                  </div>
                  <div>
                    <span
                      className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        selectedNotification.read_at
                          ? "bg-emerald-500/10 text-emerald-700"
                          : "bg-orange-500/10 text-orange-700"
                      }`}
                    >
                      {selectedNotification.read_at ? "Sudah Dibaca" : "Pemberitahuan Baru"}
                    </span>
                    <h3 className="text-sm font-bold text-zinc-900 mt-1">
                      {selectedNotification.data?.title || "Pemberitahuan"}
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedNotification(null)}
                  className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Timestamp */}
              <div className="py-3 flex items-center gap-2 text-xs font-semibold text-zinc-400">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {new Date(selectedNotification.created_at).toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {/* Message Content */}
              <div className="py-3 text-xs leading-relaxed text-zinc-700 bg-zinc-50/80 rounded-2xl p-4 border border-zinc-100">
                {selectedNotification.data?.message || "Tidak ada rincian pesan."}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col gap-2">
                {selectedNotification.data?.route &&
                  selectedNotification.data.route !== "MobileHome" &&
                  selectedNotification.data.route !== "MobileNotificationHistory" && (
                    <button
                      type="button"
                      onClick={() => {
                        const target = selectedNotification.data?.route;
                        setSelectedNotification(null);
                        if (target) navigate(target as any);
                      }}
                      style={{ backgroundColor: primaryColor }}
                      className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white shadow-md hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Lihat Halaman Terkait</span>
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </button>
                  )}

                <button
                  type="button"
                  onClick={() => setSelectedNotification(null)}
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 active:scale-[0.98] transition-all cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
