import { useState, useEffect, useRef } from "react";

export interface LiveQualityStatus {
  passed: boolean;
  message: string;
  type: "ready" | "dark" | "too_bright" | "blurry" | "multiple_faces";
}

/**
 * Lightweight real-time camera quality check (Gojek/Grab/BCA style):
 * - Checks physical conditions: brightness (dark/glare) and sharpness (blur/shaky).
 * - Leaves actual biometric face verification & anti-spoofing to server-side AI (InsightFace).
 */
export function useLiveFaceCheck(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  isActive: boolean
) {
  const [quality, setQuality] = useState<LiveQualityStatus>({
    passed: true,
    message: "Kamera Siap • Posisikan Wajah",
    type: "ready",
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const detectorRef = useRef<any>(null);

  // Initialize native FaceDetector if supported (used only for multi-person warning)
  useEffect(() => {
    if (typeof window !== "undefined" && "FaceDetector" in window) {
      try {
        // @ts-ignore
        detectorRef.current = new window.FaceDetector({
          fastMode: true,
          maxDetectedFaces: 5,
        });
      } catch {
        detectorRef.current = null;
      }
    }
  }, []);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
      canvasRef.current.width = 160;
      canvasRef.current.height = 120;
    }

    let isSubscribed = true;
    let timerId: any = null;

    const performCheck = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas || video.readyState < 2 || video.videoWidth === 0) {
        if (isSubscribed) {
          timerId = setTimeout(performCheck, 300);
        }
        return;
      }

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        if (isSubscribed) {
          timerId = setTimeout(performCheck, 300);
        }
        return;
      }

      const vw = video.videoWidth;
      const vh = video.videoHeight;
      const cw = canvas.width;
      const ch = canvas.height;

      // Draw current video frame to low-res offscreen canvas
      ctx.drawImage(video, 0, 0, vw, vh, 0, 0, cw, ch);

      // Check if native API explicitly detects more than 1 face
      let faceCount = -1;
      if (detectorRef.current) {
        try {
          const faces = await detectorRef.current.detect(canvas);
          faceCount = faces.length;
        } catch {
          faceCount = -1;
        }
      }

      // Sample center region
      const rx = Math.floor(cw * 0.25);
      const ry = Math.floor(ch * 0.2);
      const rw = Math.floor(cw * 0.5);
      const rh = Math.floor(ch * 0.6);

      const frameData = ctx.getImageData(rx, ry, rw, rh);
      const pixels = frameData.data;

      let totalBrightness = 0;
      let sumGrad = 0;
      let gradCount = 0;

      for (let y = 1; y < rh - 1; y += 2) {
        for (let x = 1; x < rw - 1; x += 2) {
          const idx = (y * rw + x) * 4;
          const r = pixels[idx];
          const g = pixels[idx + 1];
          const b = pixels[idx + 2];

          // Luminance calculation
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          totalBrightness += lum;

          // Gradient difference for blur detection
          const idxRight = idx + 8;
          const idxDown = idx + rw * 8;
          if (idxRight < pixels.length && idxDown < pixels.length) {
            const lumRight = 0.299 * pixels[idxRight] + 0.587 * pixels[idxRight + 1] + 0.114 * pixels[idxRight + 2];
            const lumDown = 0.299 * pixels[idxDown] + 0.587 * pixels[idxDown + 1] + 0.114 * pixels[idxDown + 2];
            sumGrad += Math.abs(lum - lumRight) + Math.abs(lum - lumDown);
            gradCount++;
          }
        }
      }

      const sampledCount = gradCount || 1;
      const avgBrightness = totalBrightness / sampledCount;
      const sharpness = sumGrad / sampledCount;

      let newStatus: LiveQualityStatus;

      // 1. Dark lighting check
      if (avgBrightness < 45) {
        newStatus = {
          passed: false,
          message: "Pencahayaan Terlalu Gelap",
          type: "dark",
        };
      // 2. Glare check
      } else if (avgBrightness > 235) {
        newStatus = {
          passed: false,
          message: "Pencahayaan Terlalu Silau",
          type: "too_bright",
        };
      // 3. Multi-face check (if detected by native sensor)
      } else if (faceCount > 1) {
        newStatus = {
          passed: false,
          message: `Terdeteksi ${faceCount} Orang! Hanya Boleh 1 Orang`,
          type: "multiple_faces",
        };
      // 4. Blur / Shaky camera check
      } else if (sharpness < 6.5) {
        newStatus = {
          passed: false,
          message: "Kamera Buram / Kurang Stabil",
          type: "blurry",
        };
      // 5. Conditions ready
      } else {
        newStatus = {
          passed: true,
          message: "Kamera Siap • Posisikan Wajah",
          type: "ready",
        };
      }

      if (isSubscribed) {
        setQuality(newStatus);
        timerId = setTimeout(performCheck, 300);
      }
    };

    timerId = setTimeout(performCheck, 200);

    return () => {
      isSubscribed = false;
      if (timerId) clearTimeout(timerId);
    };
  }, [isActive, videoRef]);

  return quality;
}
