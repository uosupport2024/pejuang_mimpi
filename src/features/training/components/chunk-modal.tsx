import { useState, useEffect } from "react";
import {
  Video,
  Volume2,
  Image as ImageIcon,
  HelpCircle,
  Plus,
  Trash2,
  Loader2,
  Save,
  X,
  Check,
  Play,
  FileText,
  Clock,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { FormField } from "@/shared/components/ui/form-field";
import { THEME_COLORS } from "@/shared/constants/colors";
import type { ChunkType, LessonChunk, CreateChunkPayload } from "../api/course";

interface ChunkModalProps {
  isOpen: boolean;
  mode: "add" | "edit";
  initialData?: LessonChunk;
  onSubmit: (payload: CreateChunkPayload) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}

const YOUTUBE_API_KEY = "AIzaSyArZNOWJ7FkSofftAPEic7co2_D-UMs76s";

function parseISO8601Duration(durationStr: string): number {
  const match = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);
  return hours * 3600 + minutes * 60 + seconds;
}

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

let ytScriptLoadingPromise: Promise<void> | null = null;
function loadYouTubeIframeApi(): Promise<void> {
  if ((window as any).YT && (window as any).YT.Player) {
    return Promise.resolve();
  }
  if (ytScriptLoadingPromise) {
    return ytScriptLoadingPromise;
  }
  ytScriptLoadingPromise = new Promise((resolve) => {
    const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (!existingScript) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
    const checkInterval = setInterval(() => {
      if ((window as any).YT && (window as any).YT.Player) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 100);
  });
  return ytScriptLoadingPromise;
}

async function detectMediaDuration(
  url: string,
  onMetadata?: (data: { duration?: number; title?: string }) => void
): Promise<number | null> {
  const trimmed = url.trim();
  if (!trimmed) return null;

  // 1. YouTube Data API v3
  const ytId = extractYouTubeId(trimmed);
  if (ytId) {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${ytId}&key=${YOUTUBE_API_KEY}`
      );
      if (response.ok) {
        const data = await response.json();
        const item = data?.items?.[0];
        const title = item?.snippet?.title;
        const isoDuration = item?.contentDetails?.duration;
        let parsedSec = 0;
        if (isoDuration) {
          parsedSec = parseISO8601Duration(isoDuration);
        }
        if (onMetadata) {
          onMetadata({ duration: parsedSec, title });
        }
        if (parsedSec > 0) return parsedSec;
      }
    } catch (err) {
      console.warn("YouTube API error:", err);
    }

    // Fallback: YouTube Iframe API player
    try {
      await loadYouTubeIframeApi();
      return await new Promise<number | null>((resolve) => {
        const container = document.createElement("div");
        container.id = `yt-player-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        container.style.position = "absolute";
        container.style.width = "0";
        container.style.height = "0";
        container.style.visibility = "hidden";
        document.body.appendChild(container);

        let player: any = null;
        let cleanedUp = false;

        const cleanup = () => {
          if (cleanedUp) return;
          cleanedUp = true;
          try {
            if (player && typeof player.destroy === "function") {
              player.destroy();
            }
          } catch (e) {
            // Ignore
          }
          if (container.parentNode) {
            container.parentNode.removeChild(container);
          }
        };

        const timer = setTimeout(() => {
          cleanup();
          resolve(null);
        }, 5000);

        player = new (window as any).YT.Player(container.id, {
          height: "0",
          width: "0",
          videoId: ytId,
          playerVars: {
            autoplay: 0,
            controls: 0,
          },
          events: {
            onReady: (event: any) => {
              try {
                const dur = Math.round(event.target.getDuration());
                clearTimeout(timer);
                cleanup();
                resolve(dur > 0 ? dur : null);
              } catch (e) {
                clearTimeout(timer);
                cleanup();
                resolve(null);
              }
            },
            onError: () => {
              clearTimeout(timer);
              cleanup();
              resolve(null);
            },
          },
        });
      });
    } catch (err) {
      console.warn("YouTube Iframe API error:", err);
    }
  }

  // 2. Direct Video / Audio file fallback using HTML5 element
  return new Promise((resolve) => {
    const media = document.createElement("video");
    media.preload = "metadata";
    media.src = trimmed;

    const timer = setTimeout(() => {
      media.src = "";
      resolve(null);
    }, 4000);

    media.onloadedmetadata = () => {
      clearTimeout(timer);
      const sec = Math.round(media.duration);
      media.src = "";
      resolve(sec && !isNaN(sec) && isFinite(sec) ? sec : null);
    };

    media.onerror = () => {
      clearTimeout(timer);
      media.src = "";
      resolve(null);
    };
  });
}

export function ChunkModal({
  isOpen,
  mode,
  initialData,
  onSubmit,
  onClose,
  loading = false,
}: ChunkModalProps) {
  const [chunkType, setChunkType] = useState<ChunkType>("video");

  // Video & Audio fields
  const [videoUrl, setVideoUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [durationSecond, setDurationSecond] = useState<number>(0);
  const [transcript, setTranscript] = useState("");
  const [autoPlay, setAutoPlay] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");

  // Image step fields
  const [imageUrl, setImageUrl] = useState("");
  const [captions, setCaptions] = useState("");

  // Quiz fields
  const [question, setQuestion] = useState("");
  const [quizOptions, setQuizOptions] = useState<{ options: string; is_true: boolean }[]>([
    { options: "", is_true: true },
    { options: "", is_true: false },
  ]);

  // Auto Duration Detection state
  const [detectingDuration, setDetectingDuration] = useState(false);

  useEffect(() => {
    if (initialData) {
      setChunkType(initialData.chunk_type || "video");
      const d = initialData.detail || {};
      setVideoUrl(d.video_url || "");
      setAudioUrl(d.audio_url || "");
      setImageUrl(d.image_url || "");
      setDurationSecond(d.duration_second || 0);
      setTranscript(d.transcript || "");
      setAutoPlay(d.auto_play || false);
      setCaptions(d.captions || "");
      setQuestion(d.question || "");
      if (Array.isArray(d.options) && d.options.length > 0) {
        setQuizOptions(
          d.options.map((opt) => ({
            options: opt.options || "",
            is_true: opt.is_true ?? false,
          }))
        );
      } else {
        setQuizOptions([
          { options: "", is_true: true },
          { options: "", is_true: false },
        ]);
      }
    } else {
      setChunkType("video");
      setVideoUrl("");
      setAudioUrl("");
      setImageUrl("");
      setDurationSecond(0);
      setTranscript("");
      setAutoPlay(false);
      setCaptions("");
      setQuestion("");
      setVideoTitle("");
      setQuizOptions([
        { options: "", is_true: true },
        { options: "", is_true: false },
      ]);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleVideoUrlChange = async (url: string) => {
    setVideoUrl(url);
    const trimmed = url.trim();
    const ytId = extractYouTubeId(trimmed);
    if (ytId || trimmed.match(/\.(mp4|webm|ogg)$/i)) {
      setDetectingDuration(true);
      const duration = await detectMediaDuration(trimmed, (meta) => {
        if (meta.title) setVideoTitle(meta.title);
      });
      setDetectingDuration(false);
      if (duration && duration > 0) {
        setDurationSecond(duration);
        const mins = Math.floor(duration / 60);
        const secs = duration % 60;
        toast.success(
          `Durasi terdeteksi otomatis: ${mins > 0 ? `${mins} m ` : ""}${secs} d (${duration} detik)`
        );
      }
    }
  };

  const handleAudioUrlChange = async (url: string) => {
    setAudioUrl(url);
    const trimmed = url.trim();
    if (trimmed.match(/\.(mp3|wav|ogg|m4a|aac)$/i) || trimmed.includes("audio")) {
      setDetectingDuration(true);
      const duration = await detectMediaDuration(trimmed);
      setDetectingDuration(false);
      if (duration && duration > 0) {
        setDurationSecond(duration);
        const mins = Math.floor(duration / 60);
        const secs = duration % 60;
        toast.success(
          `Durasi audio terdeteksi otomatis: ${mins > 0 ? `${mins} m ` : ""}${secs} d (${duration} detik)`
        );
      }
    }
  };

  const handleAddQuizOption = () => {
    setQuizOptions([...quizOptions, { options: "", is_true: false }]);
  };

  const handleRemoveQuizOption = (index: number) => {
    if (quizOptions.length <= 2) return;
    setQuizOptions(quizOptions.filter((_, idx) => idx !== index));
  };

  const handleSetCorrectOption = (targetIndex: number) => {
    setQuizOptions(
      quizOptions.map((opt, idx) => ({
        ...opt,
        is_true: idx === targetIndex,
      }))
    );
  };

  const handleQuizOptionTextChange = (index: number, text: string) => {
    setQuizOptions(
      quizOptions.map((opt, idx) => (idx === index ? { ...opt, options: text } : opt))
    );
  };

function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (e) {
    return false;
  }
}

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: CreateChunkPayload = {
      chunk_type: chunkType,
    };

    if (chunkType === "video") {
      const trimmed = videoUrl.trim();
      if (!trimmed) {
        toast.error("URL Video harus diisi");
        return;
      }
      if (!isValidUrl(trimmed)) {
        toast.error("Format URL Video tidak valid. Pastikan diawali dengan https:// atau http://");
        return;
      }
      const isYt = extractYouTubeId(trimmed);
      const isVideoFile = trimmed.match(/\.(mp4|webm|ogg|mov)$/i);
      if (!isYt && !isVideoFile) {
        toast.error(
          "URL Video harus berupa link YouTube yang valid (contoh: https://youtu.be/... atau https://youtube.com/watch?v=...) atau link file video (.mp4)"
        );
        return;
      }
      payload.video_url = trimmed;
      payload.duration_second = Number(durationSecond) || undefined;
      payload.transcript = transcript.trim() || undefined;
      payload.auto_play = autoPlay;
    } else if (chunkType === "audio") {
      const trimmed = audioUrl.trim();
      if (!trimmed) {
        toast.error("URL Rekaman Audio harus diisi");
        return;
      }
      if (!isValidUrl(trimmed)) {
        toast.error("Format URL Audio tidak valid. Pastikan diawali dengan https:// atau http://");
        return;
      }
      payload.audio_url = trimmed;
      payload.duration_second = Number(durationSecond) || undefined;
      payload.transcript = transcript.trim() || undefined;
      payload.auto_play = autoPlay;
    } else if (chunkType === "image_step") {
      const trimmed = imageUrl.trim();
      if (!trimmed) {
        toast.error("URL Gambar Panduan harus diisi");
        return;
      }
      if (!isValidUrl(trimmed)) {
        toast.error("Format URL Gambar tidak valid. Pastikan diawali dengan https:// atau http://");
        return;
      }
      payload.image_url = trimmed;
      payload.captions = captions.trim() || undefined;
    } else if (chunkType === "quiz") {
      if (!question.trim()) {
        toast.error("Pertanyaan kuis harus diisi");
        return;
      }
      const filledOptions = quizOptions.filter((o) => o.options.trim());
      if (filledOptions.length < 2) {
        toast.error("Kuis harus memiliki minimal 2 pilihan jawaban");
        return;
      }
      const hasTrue = filledOptions.some((o) => o.is_true);
      if (!hasTrue) {
        toast.error(
          "Silakan pilih minimal 1 jawaban yang benar dengan mengklik tombol lingkaran hijau"
        );
        return;
      }
      payload.question = question.trim();
      payload.options = filledOptions.map((o) => ({
        options: o.options.trim(),
        is_true: o.is_true,
      }));
    }

    await onSubmit(payload);
  };

  const currentYtId = extractYouTubeId(videoUrl);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-4xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150 relative max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              {mode === "edit" ? "Edit Konten Chunk" : "Tambah Konten Chunk Baru"}
            </h3>
            <p className="text-[11px] text-gray-500">
              Pilih tipe konten materi dan lihat pratinjau langsung di sebelah kanan
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Chunk Type Selector Tabs */}
        {mode === "add" && (
          <div className="grid grid-cols-4 gap-2 bg-gray-100/80 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setChunkType("video")}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                chunkType === "video"
                  ? "bg-white text-[#e0542c] shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Video size={14} />
              <span>Video</span>
            </button>
            <button
              type="button"
              onClick={() => setChunkType("audio")}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                chunkType === "audio"
                  ? "bg-white text-[#e0542c] shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Volume2 size={14} />
              <span>Audio</span>
            </button>
            <button
              type="button"
              onClick={() => setChunkType("image_step")}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                chunkType === "image_step"
                  ? "bg-white text-[#e0542c] shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <ImageIcon size={14} />
              <span>Gambar</span>
            </button>
            <button
              type="button"
              onClick={() => setChunkType("quiz")}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                chunkType === "quiz"
                  ? "bg-white text-[#e0542c] shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <HelpCircle size={14} />
              <span>Kuis</span>
            </button>
          </div>
        )}

        {/* 2-Column Main Content: Left Form, Right Live Preview */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-6 pt-1">
          {/* Left Column: Form Inputs (Col 3) */}
          <div className="lg:col-span-3 space-y-3.5">
            {/* VIDEO FIELDS */}
            {chunkType === "video" && (
              <>
                <FormField
                  label="URL Video"
                  type="text"
                  required
                  value={videoUrl}
                  onChange={(e) => handleVideoUrlChange(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... atau https://youtu.be/..."
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-gray-700">
                        Durasi Video (Detik)
                      </label>
                      {detectingDuration && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#e0542c] animate-pulse">
                          <Loader2 size={10} className="animate-spin" /> Auto-detecting...
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      value={durationSecond}
                      onChange={(e) => setDurationSecond(Number(e.target.value))}
                      placeholder="300"
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#e0542c]/20 focus:border-[#e0542c] transition-all"
                    />
                    {durationSecond > 0 && (
                      <span className="text-[10px] text-emerald-600 font-bold mt-1 block">
                        ≈ {Math.floor(durationSecond / 60)} menit {durationSecond % 60} detik
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col justify-center">
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Putar Otomatis (Autoplay)
                    </label>
                    <button
                      type="button"
                      onClick={() => setAutoPlay(!autoPlay)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        autoPlay ? "bg-[#e0542c]" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          autoPlay ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Transkrip Video (Opsional)
                  </label>
                  <textarea
                    rows={3}
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Tuliskan isi percakapan atau transkrip materi..."
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#e0542c]/20 focus:border-[#e0542c] transition-all resize-none"
                  />
                </div>
              </>
            )}

            {/* AUDIO FIELDS */}
            {chunkType === "audio" && (
              <>
                <FormField
                  label="URL Rekaman Audio"
                  type="text"
                  required
                  value={audioUrl}
                  onChange={(e) => handleAudioUrlChange(e.target.value)}
                  placeholder="https://example.com/audio/podcast.mp3"
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-gray-700">
                        Durasi Audio (Detik)
                      </label>
                      {detectingDuration && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#e0542c] animate-pulse">
                          <Loader2 size={10} className="animate-spin" /> Auto-detecting...
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      value={durationSecond}
                      onChange={(e) => setDurationSecond(Number(e.target.value))}
                      placeholder="120"
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#e0542c]/20 focus:border-[#e0542c] transition-all"
                    />
                    {durationSecond > 0 && (
                      <span className="text-[10px] text-purple-600 font-bold mt-1 block">
                        ≈ {Math.floor(durationSecond / 60)} menit {durationSecond % 60} detik
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col justify-center">
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Putar Otomatis (Autoplay)
                    </label>
                    <button
                      type="button"
                      onClick={() => setAutoPlay(!autoPlay)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        autoPlay ? "bg-[#e0542c]" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          autoPlay ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Transkrip Audio (Opsional)
                  </label>
                  <textarea
                    rows={3}
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Tuliskan transkrip percakapan audio..."
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#e0542c]/20 focus:border-[#e0542c] transition-all resize-none"
                  />
                </div>
              </>
            )}

            {/* IMAGE STEP FIELDS */}
            {chunkType === "image_step" && (
              <>
                <FormField
                  label="URL Gambar Panduan"
                  type="text"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                />

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Teks Penjelasan / Caption
                  </label>
                  <textarea
                    rows={3}
                    value={captions}
                    onChange={(e) => setCaptions(e.target.value)}
                    placeholder="Contoh: Langkah 1: Masuk melalui gerbang utama dan lakukan presensi..."
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#e0542c]/20 focus:border-[#e0542c] transition-all resize-none"
                  />
                </div>
              </>
            )}

            {/* QUIZ FIELDS */}
            {chunkType === "quiz" && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Pertanyaan Kuis <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Contoh: Berapa jam batas toleransi presensi masuk kantor?"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#e0542c]/20 focus:border-[#e0542c] transition-all resize-none"
                  />
                </div>

                {/* Quiz Options List */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-gray-700">
                      Pilihan Jawaban (Tandai yang Benar)
                    </label>
                    <button
                      type="button"
                      onClick={handleAddQuizOption}
                      className="text-[11px] font-bold text-[#e0542c] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={12} />
                      <span>Opsi Baru</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {quizOptions.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSetCorrectOption(idx)}
                          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-all cursor-pointer ${
                            opt.is_true
                              ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                              : "bg-white border-gray-300 text-transparent hover:border-gray-400"
                          }`}
                          title={opt.is_true ? "Jawaban Benar" : "Tandai sebagai jawaban benar"}
                        >
                          <Check size={12} strokeWidth={3} />
                        </button>

                        <input
                          type="text"
                          required
                          value={opt.options}
                          onChange={(e) => handleQuizOptionTextChange(idx, e.target.value)}
                          placeholder={`Pilihan ${String.fromCharCode(65 + idx)}`}
                          className="flex-1 px-3 py-1.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#e0542c]/20 focus:border-[#e0542c] transition-all"
                        />

                        {quizOptions.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuizOption(idx)}
                            className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus pilihan"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Column: Live Interactive Preview Card (Col 2) */}
          <div className="lg:col-span-2 bg-gray-50/80 rounded-2xl p-4 border border-gray-200/80 flex flex-col justify-between space-y-3 shrink-0">
            <div>
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-200/80">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block flex items-center gap-1">
                  <Sparkles size={12} className="text-[#e0542c]" /> Pratinjau Tampilan Konten
                </span>
                <span className="text-[10px] font-bold text-[#e0542c] uppercase bg-[#e0542c]/10 px-2 py-0.5 rounded-md">
                  {chunkType}
                </span>
              </div>

              {/* VIDEO PREVIEW CARD */}
              {chunkType === "video" && (
                <div className="space-y-3">
                  <div className="relative w-full aspect-video rounded-xl bg-gradient-to-tr from-slate-900 to-slate-800 border border-gray-200 overflow-hidden shadow-xs flex items-center justify-center">
                    {currentYtId ? (
                      <img
                        src={`https://img.youtube.com/vi/${currentYtId}/hqdefault.jpg`}
                        alt="YouTube Thumbnail"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : videoUrl.trim() ? (
                      <video src={videoUrl} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <Video size={36} className="text-white/20 mx-auto mb-1" />
                        <span className="text-[10px] text-white/40 block">Pratinjau Video</span>
                      </div>
                    )}

                    {/* Play Badge */}
                    {(currentYtId || videoUrl.trim()) && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-[#e0542c] text-white flex items-center justify-center shadow-lg shadow-black/40">
                          <Play size={18} className="fill-white ml-0.5" />
                        </div>
                      </div>
                    )}

                    {/* Duration Badge on thumbnail */}
                    {durationSecond > 0 && (
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1">
                        <Clock size={10} />
                        <span>
                          {Math.floor(durationSecond / 60)}:{String(durationSecond % 60).padStart(2, "0")}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-gray-900 line-clamp-2">
                      {videoTitle || (currentYtId ? `YouTube Video ID: ${currentYtId}` : "Judul Video")}
                    </h5>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] font-bold text-gray-600 bg-white px-2 py-0.5 rounded-md border border-gray-200">
                        Autoplay: {autoPlay ? "Aktif" : "Non-aktif"}
                      </span>
                    </div>
                  </div>

                  {transcript.trim() && (
                    <div className="bg-white rounded-xl p-2.5 border border-gray-200 text-[11px] text-gray-600 space-y-0.5">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block flex items-center gap-1">
                        <FileText size={10} /> Transkrip
                      </span>
                      <p className="italic line-clamp-3">"{transcript.trim()}"</p>
                    </div>
                  )}
                </div>
              )}

              {/* AUDIO PREVIEW CARD */}
              {chunkType === "audio" && (
                <div className="space-y-3">
                  <div className="w-full rounded-xl bg-purple-900 p-4 text-white border border-purple-800 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-full bg-purple-700 flex items-center justify-center">
                        <Volume2 size={18} className="text-purple-200" />
                      </div>
                      <span className="text-[10px] font-bold bg-purple-800 text-purple-200 px-2 py-0.5 rounded-md">
                        {durationSecond > 0 ? `${durationSecond} Detik` : "Audio"}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-bold text-purple-100 truncate">
                        {audioUrl.trim() || "URL Rekaman Audio"}
                      </p>
                      <div className="w-full bg-purple-950/80 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#e0542c] h-full w-1/3 rounded-full" />
                      </div>
                    </div>
                  </div>

                  {transcript.trim() && (
                    <div className="bg-white rounded-xl p-2.5 border border-gray-200 text-[11px] text-gray-600 space-y-0.5">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
                        Transkrip Audio
                      </span>
                      <p className="italic line-clamp-3">"{transcript.trim()}"</p>
                    </div>
                  )}
                </div>
              )}

              {/* IMAGE STEP PREVIEW CARD */}
              {chunkType === "image_step" && (
                <div className="space-y-3">
                  <div className="relative w-full aspect-video rounded-xl bg-gray-200 border border-gray-200 overflow-hidden flex items-center justify-center">
                    {imageUrl.trim() ? (
                      <img
                        src={imageUrl}
                        alt="Step Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="text-center p-4">
                        <ImageIcon size={36} className="text-gray-400 mx-auto mb-1" />
                        <span className="text-[10px] text-gray-500 block">Pratinjau Gambar</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-xl p-3 border border-gray-200 text-xs space-y-1">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
                      Teks Penjelasan / Caption
                    </span>
                    <p className="text-gray-800 font-semibold leading-relaxed">
                      {captions.trim() || "Penjelasan langkah gambar akan muncul di sini..."}
                    </p>
                  </div>
                </div>
              )}

              {/* QUIZ PREVIEW CARD */}
              {chunkType === "quiz" && (
                <div className="bg-white rounded-xl p-3.5 border border-gray-200 space-y-3 shadow-xs">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wider block">
                      Pertanyaan Kuis
                    </span>
                    <h5 className="text-xs font-bold text-gray-900 leading-snug">
                      {question.trim() || "Pertanyaan kuis akan tampil di sini..."}
                    </h5>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {quizOptions.map((opt, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-2 rounded-lg text-xs font-medium border transition-all ${
                          opt.is_true
                            ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold"
                            : "bg-gray-50 border-gray-200 text-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center ${
                              opt.is_true ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{opt.options.trim() || `Pilihan ${String.fromCharCode(65 + idx)}`}</span>
                        </div>
                        {opt.is_true && (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                            <Check size={10} /> Benar
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Form Submit Actions inside 2-col modal */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-200/80">
              <button
                type="button"
                onClick={onClose}
                disabled={loading || detectingDuration}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer bg-white"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading || detectingDuration}
                style={{ backgroundColor: THEME_COLORS.hex.primary }}
                className="px-5 py-2 rounded-xl text-white text-xs font-bold shadow-md shadow-[#e0542c]/20 hover:opacity-90 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                <span>Simpan Konten</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
