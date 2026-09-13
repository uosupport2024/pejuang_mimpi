import { useState, useRef, useEffect } from "react";
import {
  X,
  Camera,
  UploadCloud,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Loader2,
  Sparkles,
  ShieldCheck,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { uploadProfilePhotoAPI } from "../api/profile";
import { THEME_COLORS, buildCssBackground } from "@/shared/constants/colors";
import { useTenantBranding } from "@/shared/hooks/use-tenant-branding";

interface UploadAvatarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAvatarUpdated: (avatarUrl: string, updatedUser: any) => void;
}

export function UploadAvatarDrawer({
  isOpen,
  onClose,
  onAvatarUpdated,
}: UploadAvatarDrawerProps) {
  const { buttonColor } = useTenantBranding();

  const [activeTab, setActiveTab] = useState<"camera" | "file">("camera");
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [reasons, setReasons] = useState<string[]>([]);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera stream safely
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  // Start webcam
  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 720 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError(
        "Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan pada browser Anda."
      );
    }
  };

  // Life cycle for opening/closing camera
  useEffect(() => {
    if (isOpen && activeTab === "camera" && !previewImage) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, previewImage]);

  // Clean state when modal closes
  const handleClose = () => {
    stopCamera();
    setPreviewImage(null);
    setSelectedFile(null);
    setReasons([]);
    setIsUploading(false);
    onClose();
  };

  // Capture frame from webcam to File
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const rawW = video.videoWidth || 640;
    const rawH = video.videoHeight || 640;
    const MAX_DIM = 720;
    let targetW = rawW;
    let targetH = rawH;
    if (Math.max(rawW, rawH) > MAX_DIM) {
      const scale = MAX_DIM / Math.max(rawW, rawH);
      targetW = Math.round(rawW * scale);
      targetH = Math.round(rawH * scale);
    }

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
    setPreviewImage(dataUrl);
    stopCamera();

    // Convert dataURL to File
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `avatar_capture_${Date.now()}.jpg`, {
            type: "image/jpeg",
          });
          setSelectedFile(file);
          setReasons([]);
        }
      },
      "image/jpeg",
      0.88
    );
  };

  // Handle file input selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar (JPEG, PNG, atau WEBP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 10MB.");
      return;
    }

    setSelectedFile(file);
    setReasons([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Reset captured/selected photo
  const handleRetake = () => {
    setPreviewImage(null);
    setSelectedFile(null);
    setReasons([]);
    if (activeTab === "camera") {
      startCamera();
    }
  };

  // Submit file to Laravel Backend -> calls FastAPI Face Recognition
  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error("Pilih atau ambil foto terlebih dahulu.");
      return;
    }

    setIsUploading(true);
    setReasons([]);

    try {
      const res = await uploadProfilePhotoAPI(selectedFile);

      if (!res.success) {
        setReasons(
          res.reasons && res.reasons.length > 0
            ? res.reasons
            : [res.message || "Foto tidak memenuhi standar biometrik wajah."]
        );
        toast.error(res.message || "Foto ditolak oleh AI Face Recognition.");
        return;
      }

      toast.success(res.message || "Foto profil berhasil diperbarui!");
      if (res.data?.avatar_url || res.data?.foto_karyawan) {
        onAvatarUpdated(
          res.data.avatar_url,
          res.data.user || res.data
        );
      }
      handleClose();
    } catch (err: any) {
      toast.error("Terjadi kegagalan koneksi sistem.");
      setReasons(["Gagal menghubungi server verifikasi biometrik."]);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-black/60 z-50 transition-opacity backdrop-blur-xs"
      />

      {/* Slide-up bottom drawer */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white rounded-t-[32px] shadow-2xl z-50 flex flex-col min-h-[70vh] max-h-[90vh] overflow-hidden animate-slide-up text-left">
        {/* Top Drag bar */}
        <div className="w-12 h-1 bg-zinc-200 rounded-full mx-auto my-3 shrink-0" />

        {/* Modal Header */}
        <div className="px-5 pb-3 flex justify-between items-center border-b border-zinc-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 leading-none">
                Ubah Foto Profil
              </h2>
              <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
                Validasi Otomatis AI Face Recognition
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 active:scale-95 flex items-center justify-center text-zinc-500 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto scrollbar-none p-5 space-y-4">
          {/* Tab selector (Only visible if not previewing) */}
          {!previewImage && (
            <div className="flex p-1 bg-zinc-100 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("camera");
                  setReasons([]);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === "camera"
                    ? "bg-white text-zinc-900 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                Ambil Foto
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("file");
                  stopCamera();
                  setReasons([]);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === "file"
                    ? "bg-white text-zinc-900 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                Unggah File
              </button>
            </div>
          )}

          {/* Area 1: Camera View */}
          {activeTab === "camera" && !previewImage && (
            <div className="space-y-3 text-center">
              <div className="relative w-full aspect-square max-w-[320px] mx-auto bg-zinc-900 rounded-3xl overflow-hidden shadow-inner flex items-center justify-center border-2 border-zinc-200">
                {cameraError ? (
                  <div className="p-4 text-center space-y-2">
                    <EyeOff className="w-8 h-8 text-red-400 mx-auto" />
                    <p className="text-xs text-red-200 font-medium leading-relaxed">
                      {cameraError}
                    </p>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-3 py-1.5 bg-white/20 text-white rounded-xl text-xs font-bold hover:bg-white/30"
                    >
                      Coba Lagi
                    </button>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      autoPlay
                      className="w-full h-full object-cover -scale-x-100"
                    />
                    {/* Face Oval Guideline Overlay */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-[68%] h-[80%] rounded-[50%] border-2 border-dashed border-amber-400/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
                    </div>
                  </>
                )}
              </div>

              {!cameraError && (
                <div className="flex justify-center pt-1">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    style={{
                      background: buildCssBackground(
                        buttonColor,
                        THEME_COLORS.hex.primary
                      ),
                    }}
                    className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-bold text-xs shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    Ambil Foto
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Area 2: File Upload View */}
          {activeTab === "file" && !previewImage && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-4/3 max-w-[320px] mx-auto border-2 border-dashed border-zinc-200 hover:border-amber-400 hover:bg-amber-500/5 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-800">
                    Klik untuk memilih foto
                  </p>
                  <p className="text-[10px] text-zinc-400 mt-1">
                    Format: JPEG, PNG, atau WEBP (Maksimal 10MB)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Area 3: Photo Preview */}
          {previewImage && (
            <div className="space-y-4">
              <div className="relative w-full aspect-square max-w-[260px] mx-auto rounded-3xl overflow-hidden border-2 border-zinc-200 shadow-md">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Action buttons (Retake / Submit) */}
              <div className="flex gap-2 justify-center">
                <button
                  type="button"
                  onClick={handleRetake}
                  disabled={isUploading}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-zinc-200 text-zinc-700 font-bold text-xs hover:bg-zinc-50 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Foto Ulang
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isUploading}
                  style={{
                    background: buildCssBackground(
                      buttonColor,
                      THEME_COLORS.hex.primary
                    ),
                  }}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-2xl text-white font-bold text-xs shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Memvalidasi AI...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Gunakan Foto Ini
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Rejection Alert Box (if reasons exist) */}
          {reasons.length > 0 && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-left space-y-2 animate-fade-in">
              <div className="flex items-center gap-2 text-red-700 font-bold text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Foto Profil Tidak Memenuhi Standar:</span>
              </div>
              <ul className="space-y-1 pl-6 list-disc text-[11px] text-red-600 font-medium">
                {reasons.map((reason, idx) => (
                  <li key={idx} className="leading-snug">
                    {reason}
                  </li>
                ))}
              </ul>
              <div className="pt-2 border-t border-red-100 flex items-center justify-between">
                <p className="text-[10px] text-red-500 font-semibold">
                  Silakan foto ulang sesuai petunjuk di atas.
                </p>
                <button
                  type="button"
                  onClick={handleRetake}
                  className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-[10px] font-bold hover:bg-red-700 active:scale-95"
                >
                  Foto Ulang Sekarang
                </button>
              </div>
            </div>
          )}

          {/* Guidance Tips */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-100 text-left space-y-1.5">
            <div className="flex items-center gap-1.5 text-zinc-700 font-bold text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Syarat Foto Biometrik:</span>
            </div>
            <p className="text-[10px] text-zinc-500 leading-relaxed">
              • Wajah tampak depan jelas & menghadap kamera lurus.
              <br />
              • Pencahayaan cukup terang (tidak gelap / silau).
              <br />
              • <strong>Dilarang</strong> menggunakan masker atau kacamata hitam.
              <br />• Pastikan hanya ada <strong>satu wajah</strong> di dalam
              bingkai foto.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
