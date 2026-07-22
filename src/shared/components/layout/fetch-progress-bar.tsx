import { useState, useEffect } from "react";

let activeFetchCount = 0;
const listeners = new Set<(loading: boolean, progress: number) => void>();
let progressInterval: any = null;
let currentProgress = 0;

function notifyListeners(loading: boolean, progress: number) {
  listeners.forEach((fn) => fn(loading, progress));
}

export function initFetchInterceptor() {
  if (typeof window !== "undefined" && !(window as any).__fetchProgressBarIntercepted) {
    (window as any).__fetchProgressBarIntercepted = true;
    const originalFetch = window.fetch;

    window.fetch = async function (...args) {
      activeFetchCount++;
      if (activeFetchCount === 1) {
        currentProgress = 25;
        notifyListeners(true, currentProgress);

        if (progressInterval) clearInterval(progressInterval);
        progressInterval = setInterval(() => {
          if (currentProgress < 90) {
            currentProgress += Math.max(1, Math.floor((92 - currentProgress) * 0.15));
            notifyListeners(true, currentProgress);
          }
        }, 100);
      }

      try {
        const response = await originalFetch.apply(this, args);
        return response;
      } catch (error) {
        throw error;
      } finally {
        activeFetchCount--;
        if (activeFetchCount <= 0) {
          activeFetchCount = 0;
          if (progressInterval) clearInterval(progressInterval);
          currentProgress = 100;
          notifyListeners(true, 100);

          setTimeout(() => {
            if (activeFetchCount === 0) {
              notifyListeners(false, 0);
            }
          }, 350);
        }
      }
    };
  }
}

// Auto-run interceptor setup on module import
initFetchInterceptor();

export function FetchProgressBar() {
  const [loading, setLoading] = useState(() => activeFetchCount > 0);
  const [progress, setProgress] = useState(() => (activeFetchCount > 0 ? currentProgress || 30 : 0));

  useEffect(() => {
    // Sync state if fetches are active upon component mounting
    if (activeFetchCount > 0) {
      setLoading(true);
      setProgress(currentProgress || 30);
    }

    const handler = (isLoading: boolean, percent: number) => {
      setLoading(isLoading);
      setProgress(percent);
    };

    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  if (!loading && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[99999] h-[4px] w-full bg-transparent overflow-hidden pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-[#e0542c] via-[#F2B233] to-[#7FA46D] shadow-[0_0_12px_rgba(224,84,44,0.95)] transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transition:
            progress === 100
              ? "width 150ms ease-out, opacity 250ms ease-in 150ms"
              : "width 200ms ease-out",
        }}
      />
    </div>
  );
}
