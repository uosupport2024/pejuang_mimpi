import { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
    };
    checkStandalone();

    // Check iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Check localStorage dismiss state
    const wasDismissed = localStorage.getItem("pwa_install_dismissed");
    if (wasDismissed) {
      setDismissed(true);
    }

    // Capture beforeinstallprompt for Chrome/Edge/Android
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("pwa_install_dismissed", "true");
  };

  // If already installed, dismissed, or no prompt available (unless iOS where prompt event never fires)
  if (isStandalone || dismissed || (!deferredPrompt && !isIOS)) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-96 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/90 p-3.5 flex items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/icons/pwa-192x192.png"
              alt="Pejuang Mimpi"
              className="w-11 h-11 rounded-xl shadow-xs shrink-0 object-cover bg-white p-1 border border-gray-100"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-extrabold text-gray-900 truncate leading-tight">
                Install Pejuang Mimpi
              </span>
              <span className="text-[11px] text-gray-500 font-medium line-clamp-1 mt-0.5">
                Akses lebih cepat langsung dari desktop & layar utama
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-3 py-1.5 bg-[#203a72] hover:bg-[#162a52] text-white text-xs font-bold rounded-xl transition-all active:scale-95 shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#203a72] flex items-center justify-center mx-auto">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Install di iPhone / iPad</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Untuk menginstal aplikasi di perangkat iOS:
              </p>
            </div>
            <div className="bg-zinc-50 rounded-2xl p-3.5 text-xs text-gray-700 text-left space-y-2 border border-zinc-100">
              <p>1. Tekan tombol <strong>Share</strong> (ikon kotak dengan panah atas di Safari bawah).</p>
              <p>2. Gulir ke bawah lalu pilih <strong>"Add to Home Screen"</strong> (Tambah ke Layar Utama).</p>
              <p>3. Tekan <strong>Add</strong> di sudut kanan atas.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 bg-[#203a72] text-white text-xs font-bold rounded-xl active:scale-95 cursor-pointer"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
}
