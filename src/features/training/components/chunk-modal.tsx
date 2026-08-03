import { useState, useEffect, useRef } from "react";
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
  Sparkles,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link2 as LinkIcon,
  Quote,
  Code,
  Terminal,
  Minus,
  Strikethrough,
  Table as TableIcon,
  Layers
} from "lucide-react";
import { toast } from "sonner";
import { FormField } from "@/shared/components/ui/form-field";
import { THEME_COLORS } from "@/shared/constants/colors";
import type { ChunkType, LessonChunk, CreateChunkPayload } from "../api/course";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import Link from "@tiptap/extension-link";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { createLowlight, all } from "lowlight";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";

const lowlight = createLowlight(all);

interface ChunkModalProps {
  isOpen: boolean;
  mode: "add" | "edit";
  initialData?: LessonChunk;
  onSubmit: (payload: CreateChunkPayload) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
  inline?: boolean;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
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
    const isAudio = trimmed.match(/\.(mp3|wav|ogg|m4a|aac|flac|webm)($|\?)/i) || trimmed.includes("audio");
    const media = document.createElement(isAudio ? "audio" : "video");
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

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1 p-1.5 bg-gray-50 border border-b-0 border-gray-200 rounded-t-md">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-700 cursor-pointer ${editor.isActive("bold") ? "bg-gray-250 font-bold" : ""
          }`}
        title="Tebal"
      >
        <Bold size={13} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-700 cursor-pointer ${editor.isActive("italic") ? "bg-gray-250 italic" : ""
          }`}
        title="Miring"
      >
        <Italic size={13} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-700 cursor-pointer ${editor.isActive("strike") ? "bg-gray-250 line-through" : ""
          }`}
        title="Coret (Strikethrough)"
      >
        <Strikethrough size={13} />
      </button>
      <div className="w-px h-5 bg-gray-200 mx-1 align-middle self-center" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-700 cursor-pointer ${editor.isActive("bulletList") ? "bg-gray-250" : ""
          }`}
        title="Daftar Bulatan"
      >
        <List size={13} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-700 cursor-pointer ${editor.isActive("orderedList") ? "bg-gray-250" : ""
          }`}
        title="Daftar Angka"
      >
        <ListOrdered size={13} />
      </button>
      <div className="w-px h-5 bg-gray-200 mx-1 align-middle self-center" />
      <select
        value={
          editor.isActive("heading", { level: 1 })
            ? "h1"
            : editor.isActive("heading", { level: 2 })
              ? "h2"
              : editor.isActive("heading", { level: 3 })
                ? "h3"
                : editor.isActive("heading", { level: 4 })
                  ? "h4"
                  : "paragraph"
        }
        onChange={(e) => {
          const val = e.target.value;
          if (val === "paragraph") {
            editor.chain().focus().setParagraph().run();
          } else if (val === "h1") {
            editor.chain().focus().toggleHeading({ level: 1 }).run();
          } else if (val === "h2") {
            editor.chain().focus().toggleHeading({ level: 2 }).run();
          } else if (val === "h3") {
            editor.chain().focus().toggleHeading({ level: 3 }).run();
          } else if (val === "h4") {
            editor.chain().focus().toggleHeading({ level: 4 }).run();
          }
        }}
        className="px-2 py-1 text-[10px] font-bold text-gray-700 border border-gray-200 rounded hover:bg-gray-150 transition-colors focus:outline-none cursor-pointer bg-white"
        title="Pilih Format Teks"
      >
        <option value="paragraph">Teks Normal</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
        <option value="h4">Heading 4</option>
      </select>
      <div className="w-px h-5 bg-gray-200 mx-1 align-middle self-center" />
      <button
        type="button"
        onClick={() => {
          const previousUrl = editor.getAttributes("link").href;
          const url = window.prompt("Masukkan URL Link:", previousUrl);
          if (url === null) {
            return;
          }
          if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
          }
          editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
        }}
        className={`p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-700 cursor-pointer ${editor.isActive("link") ? "bg-gray-250 text-blue-600 font-bold" : ""
          }`}
        title="Tambah Link"
      >
        <LinkIcon size={13} />
      </button>
      <button
        type="button"
        onClick={() => {
          const url = window.prompt("Masukkan URL Gambar:");
          if (url) {
            editor.chain().focus().setImage({ src: url }).run();
          }
        }}
        className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-700 cursor-pointer"
        title="Tambah Gambar"
      >
        <ImageIcon size={13} />
      </button>
      <button
        type="button"
        onClick={() => {
          const url = window.prompt("Masukkan URL Video YouTube:");
          if (url) {
            editor.chain().focus().setYoutubeVideo({ src: url }).run();
          }
        }}
        className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-700 cursor-pointer"
        title="Tambah Video YouTube"
      >
        <Play size={13} />
      </button>
      <div className="w-px h-5 bg-gray-200 mx-1 align-middle self-center" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-700 cursor-pointer ${editor.isActive("blockquote") ? "bg-gray-250 font-bold" : ""
          }`}
        title="Kutipan (Quote)"
      >
        <Quote size={13} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-700 cursor-pointer ${editor.isActive("code") ? "bg-gray-250 font-bold" : ""
          }`}
        title="Kode Inline"
      >
        <Code size={13} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-700 cursor-pointer ${editor.isActive("codeBlock") ? "bg-gray-250 font-bold" : ""
          }`}
        title="Blok Kode"
      >
        <Terminal size={13} />
      </button>

      {editor.isActive("codeBlock") && (
        <select
          value={editor.getAttributes("codeBlock").language || "plaintext"}
          onChange={(e) => editor.chain().focus().setCodeBlock({ language: e.target.value }).run()}
          className="px-2 py-0.5 text-[10px] font-bold text-gray-700 border border-gray-200 rounded hover:bg-gray-150 transition-colors focus:outline-none cursor-pointer bg-white"
          title="Pilih Bahasa Kode"
        >
          <option value="plaintext">Plain Text</option>
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
          <option value="php">PHP</option>
          <option value="html">HTML/XML</option>
          <option value="css">CSS</option>
          <option value="sql">SQL</option>
          <option value="bash">Bash</option>
          <option value="json">JSON</option>
        </select>
      )}
      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-700 cursor-pointer"
        title="Garis Pembatas"
      >
        <Minus size={13} />
      </button>
      <div className="w-px h-5 bg-gray-200 mx-1 align-middle self-center" />
      <button
        type="button"
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-700 cursor-pointer"
        title="Buat Tabel (3x3)"
      >
        <TableIcon size={13} />
      </button>

      {editor.isActive("table") && (
        <>
          <div className="w-px h-5 bg-gray-200 mx-1 align-middle self-center" />
          <button
            type="button"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            className="p-1 px-1.5 rounded hover:bg-gray-200 transition-colors text-[10px] font-bold text-gray-700 cursor-pointer"
            title="Tambah Kolom"
          >
            +Kolom
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteColumn().run()}
            className="p-1 px-1.5 rounded hover:bg-rose-100 hover:text-rose-600 transition-colors text-[10px] font-bold text-gray-500 cursor-pointer"
            title="Hapus Kolom"
          >
            -Kolom
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().addRowAfter().run()}
            className="p-1 px-1.5 rounded hover:bg-gray-200 transition-colors text-[10px] font-bold text-gray-700 cursor-pointer"
            title="Tambah Baris"
          >
            +Baris
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteRow().run()}
            className="p-1 px-1.5 rounded hover:bg-rose-100 hover:text-rose-600 transition-colors text-[10px] font-bold text-gray-500 cursor-pointer"
            title="Hapus Baris"
          >
            -Baris
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteTable().run()}
            className="p-1 px-1.5 rounded hover:bg-rose-100 hover:text-rose-700 transition-colors text-[10px] font-bold text-rose-600 cursor-pointer"
            title="Hapus Seluruh Tabel"
          >
            Hapus Tabel
          </button>
        </>
      )}
    </div>
  );
};

export function ChunkModal({
  isOpen,
  mode,
  initialData,
  onSubmit,
  onClose,
  loading = false,
  inline = false,
  isSidebarCollapsed = false,
  onToggleSidebar,
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

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Image,
      Youtube.configure({
        width: 480,
        height: 270,
      }),
      Link.configure({
        openOnClick: false,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: captions,
    onUpdate: ({ editor }) => {
      setCaptions(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && captions !== editor.getHTML()) {
      editor.commands.setContent(captions);
    }
  }, [captions, editor]);

  // Text fields
  const [textTitle, setTextTitle] = useState("");
  const [textContent, setTextContent] = useState("");

  const textEditor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Image,
      Youtube.configure({
        width: 480,
        height: 270,
      }),
      Link.configure({
        openOnClick: false,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: textContent,
    onUpdate: ({ editor }) => {
      setTextContent(editor.getHTML());
    },
  });

  useEffect(() => {
    if (textEditor && textContent !== textEditor.getHTML()) {
      textEditor.commands.setContent(textContent);
    }
  }, [textContent, textEditor]);

  // Quiz fields
  const [question, setQuestion] = useState("");
  const [quizOptions, setQuizOptions] = useState<{ options: string; is_true: boolean }[]>([
    { options: "", is_true: true },
    { options: "", is_true: false },
  ]);

  const quizEditor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Image,
      Youtube.configure({
        width: 480,
        height: 270,
      }),
      Link.configure({
        openOnClick: false,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: question,
    onUpdate: ({ editor }) => {
      setQuestion(editor.getHTML());
    },
  });

  useEffect(() => {
    if (quizEditor && question !== quizEditor.getHTML()) {
      quizEditor.commands.setContent(question);
    }
  }, [question, quizEditor]);

  // Auto Duration Detection state
  const [detectingDuration, setDetectingDuration] = useState(false);

  const audioTimeoutRef = useRef<any>(null);
  const videoTimeoutRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (audioTimeoutRef.current) clearTimeout(audioTimeoutRef.current);
      if (videoTimeoutRef.current) clearTimeout(videoTimeoutRef.current);
    };
  }, []);

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
      setTextTitle(d.title || "");
      setTextContent(d.description || "");
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
      setTextTitle("");
      setTextContent("");
      setQuizOptions([
        { options: "", is_true: true },
        { options: "", is_true: false },
      ]);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleVideoUrlChange = (url: string) => {
    setVideoUrl(url);
    const trimmed = url.trim();
    if (videoTimeoutRef.current) {
      clearTimeout(videoTimeoutRef.current);
    }
    if (trimmed.startsWith("http")) {
      videoTimeoutRef.current = setTimeout(async () => {
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
            `Durasi video terdeteksi otomatis: ${mins > 0 ? `${mins} m ` : ""}${secs} d (${duration} detik)`
          );
        }
      }, 600);
    }
  };

  const handleAudioUrlChange = (url: string) => {
    setAudioUrl(url);
    const trimmed = url.trim();
    if (audioTimeoutRef.current) {
      clearTimeout(audioTimeoutRef.current);
    }
    if (trimmed.startsWith("http")) {
      audioTimeoutRef.current = setTimeout(async () => {
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
      }, 600);
    }
  };

  const handleAddQuizOption = () => {
    setQuizOptions([...quizOptions, { options: "", is_true: false }]);
    setTimeout(() => {
      const nextInput = document.getElementById(`quiz-option-${quizOptions.length}`);
      if (nextInput) {
        nextInput.focus();
      }
    }, 50);
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
      const isAudioFile = trimmed.match(/\.(mp3|wav|ogg|m4a|aac|flac|webm)($|\?)/i) || trimmed.toLowerCase().includes("audio");
      if (!isAudioFile) {
        toast.error("URL Audio harus berupa link file audio yang valid (contoh: .mp3, .wav, .ogg, .m4a)");
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
      const isImageFile = trimmed.match(/\.(jpeg|jpg|gif|png|webp|svg)($|\?)/i) || trimmed.toLowerCase().includes("image") || trimmed.includes("placeholder");
      if (!isImageFile) {
        toast.error("URL Gambar harus berupa link file gambar yang valid (contoh: .jpg, .png, .webp)");
        return;
      }
      payload.image_url = trimmed;
      payload.captions = captions.trim() || undefined;
    } else if (chunkType === "quiz") {
      if (!question.trim() || question.trim() === "<p></p>") {
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
    } else if (chunkType === "text") {
      if (!textContent.trim() || textContent.trim() === "<p></p>") {
        toast.error("Konten teks harus diisi");
        return;
      }
      payload.title = textTitle.trim() || undefined;
      payload.description = textContent.trim();
    }

    await onSubmit(payload);
  };

  const currentYtId = extractYouTubeId(videoUrl);

  const innerContent = (
    <>
      <style>{`
        .ProseMirror {
          outline: none;
          min-height: 100px;
        }
        .ProseMirror ul {
          list-style-type: disc !important;
          padding-left: 1.25rem !important;
          margin-top: 0.5rem !important;
          margin-bottom: 0.5rem !important;
        }
        .ProseMirror ol {
          list-style-type: decimal !important;
          padding-left: 1.25rem !important;
          margin-top: 0.5rem !important;
          margin-bottom: 0.5rem !important;
        }
        .ProseMirror p {
          margin-top: 0.25rem;
          margin-bottom: 0.25rem;
        }
        .ProseMirror h1 { font-size: 1.4rem; font-weight: 700 !important; margin-top: 0.75rem; margin-bottom: 0.5rem; color: #08060d; }
        .ProseMirror h2 { font-size: 1.25rem; font-weight: 700 !important; margin-top: 0.75rem; margin-bottom: 0.5rem; color: #1f2937; }
        .ProseMirror h3 { font-size: 1.1rem; font-weight: 600 !important; margin-top: 0.5rem; margin-bottom: 0.5rem; color: #374151; }
        .ProseMirror h4 { font-size: 1rem; font-weight: 600 !important; margin-top: 0.5rem; margin-bottom: 0.5rem; color: #4b5563; }
        .ProseMirror strong {
          font-weight: 600 !important;
        }
        
        .rich-text-preview ul, .rich-text-content ul {
          list-style-type: disc !important;
          padding-left: 1.25rem !important;
          margin-top: 0.5rem !important;
          margin-bottom: 0.5rem !important;
        }
        .rich-text-preview ol, .rich-text-content ol {
          list-style-type: decimal !important;
          padding-left: 1.25rem !important;
          margin-top: 0.5rem !important;
          margin-bottom: 0.5rem !important;
        }
        .rich-text-preview h1, .rich-text-content h1 { font-size: 1.4rem; font-weight: 700 !important; margin-top: 0.75rem; margin-bottom: 0.5rem; color: #08060d; }
        .rich-text-preview h2, .rich-text-content h2 { font-size: 1.25rem; font-weight: 700 !important; margin-top: 0.75rem; margin-bottom: 0.5rem; color: #1f2937; }
        .rich-text-preview h3, .rich-text-content h3 { font-size: 1.1rem; font-weight: 600 !important; margin-top: 0.5rem; margin-bottom: 0.5rem; color: #374151; }
        .rich-text-preview h4, .rich-text-content h4 { font-size: 1rem; font-weight: 600 !important; margin-top: 0.5rem; margin-bottom: 0.5rem; color: #4b5563; }
        .rich-text-preview strong, .rich-text-content strong {
          font-weight: 600 !important;
        }
        blockquote, .ProseMirror blockquote {
          background-color: #fff1ed;
          border-left: none;
          padding: 10px 14px;
          border-radius: 8px;
          color: #c23f1b;
          font-style: italic;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }
        pre, .ProseMirror pre {
          background-color: #f4f4f5;
          border: 1px solid #e4e4e7;
          padding: 10px;
          border-radius: 8px;
          font-family: monospace;
          font-size: 0.85em;
          color: #18181b;
          overflow-x: auto;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }
        code, .ProseMirror code {
          background-color: #f4f4f5;
          padding: 2px 4px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.85em;
          color: #c23f1b;
        }
        pre code, .ProseMirror pre code {
          background-color: transparent;
          padding: 0;
          border-radius: 0;
          color: inherit;
          font-size: inherit;
        }
        hr, .ProseMirror hr {
          border: none;
          border-top: 1px solid #e4e4e7;
          margin: 1rem 0;
        }
        table, .ProseMirror table {
          border-collapse: collapse;
          table-layout: fixed;
          width: 100%;
          margin: 0;
          overflow: hidden;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }
        table td, table th, .ProseMirror td, .ProseMirror th {
          min-width: 1em;
          border: 1px solid #e4e4e7;
          padding: 6px 10px;
          vertical-align: top;
          box-sizing: border-box;
          position: relative;
          font-size: 0.85em;
        }
        table th, .ProseMirror th {
          font-weight: bold;
          text-align: left;
          background-color: #f4f4f5;
        }
        table p, .ProseMirror table p {
          margin: 0;
        }
      `}</style>
      <div className="w-full h-full p-4 relative flex flex-col gap-3.5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            {inline && isSidebarCollapsed && onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer flex items-center justify-center mr-1"
                title="Tampilkan Daftar Konten"
              >
                <Layers size={15} />
              </button>
            )}
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                {mode === "edit" ? "Edit Bagian Konten" : "Tambah Bagian Konten Baru"}
              </h3>
            <p className="text-[11px] text-gray-500">
              Pilih tipe konten materi dan lihat pratinjau langsung di sebelah kanan
            </p>
          </div>
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
          <div className="grid grid-cols-5 gap-2 bg-gray-100/80 p-1 rounded-md shrink-0">
            <button
              type="button"
              onClick={() => setChunkType("video")}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${chunkType === "video"
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
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${chunkType === "audio"
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
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${chunkType === "image_step"
                ? "bg-white text-[#e0542c] shadow-xs"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              <ImageIcon size={14} />
              <span>Gambar</span>
            </button>
            <button
              type="button"
              onClick={() => setChunkType("text")}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${chunkType === "text"
                ? "bg-white text-[#e0542c] shadow-xs"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              <FileText size={14} />
              <span>Teks</span>
            </button>
            <button
              type="button"
              onClick={() => setChunkType("quiz")}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${chunkType === "quiz"
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
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-4 pt-0 flex-1 min-h-0 overflow-y-auto pb-4">
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
                      className="w-full px-4 py-2 rounded-md border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#e0542c]/20 focus:border-[#e0542c] transition-all"
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
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${autoPlay ? "bg-[#e0542c]" : "bg-gray-200"
                        }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${autoPlay ? "translate-x-5" : "translate-x-0"
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
                    className="w-full px-3.5 py-2 rounded-md border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#e0542c]/20 focus:border-[#e0542c] transition-all resize-none"
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
                      className="w-full px-4 py-2 rounded-md border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#e0542c]/20 focus:border-[#e0542c] transition-all"
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
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${autoPlay ? "bg-[#e0542c]" : "bg-gray-200"
                        }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${autoPlay ? "translate-x-5" : "translate-x-0"
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
                    className="w-full px-3.5 py-2 rounded-md border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#e0542c]/20 focus:border-[#e0542c] transition-all resize-none"
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
                  <div className="border border-gray-200 rounded-md focus-within:ring-2 focus-within:ring-[#e0542c]/20 focus-within:border-[#e0542c] overflow-hidden transition-all">
                    <MenuBar editor={editor} />
                    <EditorContent
                      editor={editor}
                      className="prose prose-xs max-w-none p-3 text-xs min-h-[100px] outline-none text-gray-900 bg-white"
                    />
                  </div>
                </div>
              </>
            )}

            {/* TEXT FIELDS */}
            {chunkType === "text" && (
              <>
                <FormField
                  label="Judul Teks (Opsional)"
                  type="text"
                  value={textTitle}
                  onChange={(e) => setTextTitle(e.target.value)}
                  placeholder="Contoh: Pengenalan Kebijakan Perusahaan"
                />

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Konten Teks / Artikel <span className="text-rose-500">*</span>
                  </label>
                  <div className="border border-gray-200 rounded-md focus-within:ring-2 focus-within:ring-[#e0542c]/20 focus-within:border-[#e0542c] overflow-hidden transition-all">
                    <MenuBar editor={textEditor} />
                    <EditorContent
                      editor={textEditor}
                      className="prose prose-xs max-w-none p-3 text-xs min-h-[150px] outline-none text-gray-900 bg-white"
                    />
                  </div>
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
                  <div className="border border-gray-200 rounded-md focus-within:ring-2 focus-within:ring-[#e0542c]/20 focus-within:border-[#e0542c] overflow-hidden transition-all">
                    <MenuBar editor={quizEditor} />
                    <EditorContent
                      editor={quizEditor}
                      className="prose prose-xs max-w-none p-3 text-xs min-h-[100px] outline-none text-gray-900 bg-white"
                    />
                  </div>
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
                          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-all cursor-pointer ${opt.is_true
                            ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                            : "bg-white border-gray-300 text-transparent hover:border-gray-400"
                            }`}
                          title={opt.is_true ? "Jawaban Benar" : "Tandai sebagai jawaban benar"}
                        >
                          <Check size={12} strokeWidth={3} />
                        </button>

                        <input
                          id={`quiz-option-${idx}`}
                          type="text"
                          required
                          value={opt.options}
                          onChange={(e) => handleQuizOptionTextChange(idx, e.target.value)}
                          placeholder={`Pilihan ${String.fromCharCode(65 + idx)}`}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (idx === quizOptions.length - 1) {
                                handleAddQuizOption();
                              } else {
                                const nextInput = document.getElementById(`quiz-option-${idx + 1}`);
                                if (nextInput) {
                                  nextInput.focus();
                                }
                              }
                            }
                          }}
                          className="flex-1 px-3 py-1.5 rounded-md border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#e0542c]/20 focus:border-[#e0542c] transition-all"
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
                  <div className="relative w-full aspect-video rounded-md bg-gradient-to-tr from-slate-900 to-slate-800 border border-gray-200 overflow-hidden shadow-xs flex items-center justify-center">
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
                    <div className="bg-white rounded-md p-2.5 border border-gray-200 text-[11px] text-gray-600 space-y-0.5">
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
                  <div className="w-full rounded-md bg-purple-900 p-4 text-white border border-purple-800 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-full bg-purple-700 flex items-center justify-center">
                        <Volume2 size={18} className="text-purple-200" />
                      </div>
                      <span className="text-[10px] font-bold bg-purple-800 text-purple-200 px-2 py-0.5 rounded-md">
                        {durationSecond > 0 ? `${durationSecond} Detik` : "Audio"}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {audioUrl.trim() ? (
                        <div className="pt-1">
                          <audio
                            src={audioUrl}
                            controls
                            className="w-full h-8 rounded-md bg-purple-950/50 border border-purple-800 focus:outline-none"
                          />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-purple-100">
                            URL Rekaman Audio Kosong
                          </p>
                          <div className="w-full bg-purple-950/80 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#e0542c] h-full w-1/3 rounded-full" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {transcript.trim() && (
                    <div className="bg-white rounded-md p-2.5 border border-gray-200 text-[11px] text-gray-600 space-y-0.5">
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
                  <div className="relative w-full aspect-video rounded-md bg-gray-200 border border-gray-200 overflow-hidden flex items-center justify-center">
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

                  <div className="bg-white rounded-md p-3 border border-gray-200 text-xs space-y-1">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
                      Teks Penjelasan / Caption
                    </span>
                    <div
                      className="text-gray-800 font-semibold leading-relaxed rich-text-preview"
                      dangerouslySetInnerHTML={{ __html: captions.trim() || "Penjelasan langkah gambar akan muncul di sini..." }}
                    />
                  </div>
                </div>
              )}

              {/* TEXT PREVIEW CARD */}
              {chunkType === "text" && (
                <div className="bg-white rounded-md p-4 border border-gray-200 space-y-3 shadow-xs">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-[#e0542c] uppercase tracking-wider block">
                      Pratinjau Teks
                    </span>
                    <h5 className="text-xs font-bold text-gray-900 leading-snug">
                      {textTitle.trim() || "Judul Teks"}
                    </h5>
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <div
                      className="text-xs text-gray-800 leading-relaxed rich-text-preview"
                      dangerouslySetInnerHTML={{
                        __html: textContent.trim() || "Tulis konten teks di editor untuk melihat pratinjau..."
                      }}
                    />
                  </div>
                </div>
              )}

              {/* QUIZ PREVIEW CARD */}
              {chunkType === "quiz" && (
                <div className="bg-white rounded-md p-3.5 border border-gray-200 space-y-3 shadow-xs">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wider block">
                      Pertanyaan Kuis
                    </span>
                    <div
                      className="text-xs font-bold text-gray-900 leading-snug rich-text-preview"
                      dangerouslySetInnerHTML={{
                        __html: question.trim() || "Pertanyaan kuis akan tampil di sini..."
                      }}
                    />
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {quizOptions.map((opt, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-2 rounded-lg text-xs font-medium border transition-all ${opt.is_true
                          ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold"
                          : "bg-gray-50 border-gray-200 text-gray-700"
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center ${opt.is_true ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-600"
                              }`}
                          >
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span
                            dangerouslySetInnerHTML={{
                              __html: opt.options.trim() || `Pilihan ${String.fromCharCode(65 + idx)}`
                            }}
                          />
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
                className="px-4 py-2 rounded-md border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer bg-white"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading || detectingDuration}
                style={{ backgroundColor: THEME_COLORS.hex.primary }}
                className="px-5 py-2 rounded-md text-white text-xs font-bold shadow-md shadow-[#e0542c]/20 hover:opacity-90 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                <span>Simpan Konten</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );

  if (inline) {
    return innerContent;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/25 backdrop-blur-xs flex items-center justify-end">
      <div className="bg-white w-full max-w-4xl h-full shadow-2xl overflow-hidden rounded-l-2xl animate-in slide-in-from-right duration-250">
        {innerContent}
      </div>
    </div>
  );
}
