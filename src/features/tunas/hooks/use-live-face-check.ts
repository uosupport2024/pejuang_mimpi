import { useState, useEffect, useRef } from "react";

export interface LiveQualityStatus {
  passed: boolean;
  message: string;
  type: "ready" | "dark" | "too_bright" | "blurry" | "multiple_faces" | "no_face";
}

/**
 * Lightweight real-time face & camera quality checker:
 * 1. Checks brightness (detects dark / dim lighting).
 * 2. Checks sharpness / blurriness (detects unfocused / covered camera).
 * 3. Checks face presence & multi-face count (using native Shape Detection API or skin-tone cluster fallback).
 */
export function useLiveFaceCheck(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  isActive: boolean
) {
  const [quality, setQuality] = useState<LiveQualityStatus>({
    passed: false,
    message: "Menyiapkan sensor kamera...",
    type: "no_face",
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const detectorRef = useRef<any>(null);

  // Initialize native FaceDetector if supported
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

      // 1. Check face detection with native API if available
      let faceCount = -1; // -1 means unknown/fallback
      if (detectorRef.current) {
        try {
          const faces = await detectorRef.current.detect(canvas);
          faceCount = faces.length;
        } catch {
          faceCount = -1;
        }
      }

      // 2. Sample the center face oval region (middle 50% of the canvas)
      const rx = Math.floor(cw * 0.25);
      const ry = Math.floor(ch * 0.2);
      const rw = Math.floor(cw * 0.5);
      const rh = Math.floor(ch * 0.6);

      const frameData = ctx.getImageData(rx, ry, rw, rh);
      const pixels = frameData.data;

      let totalBrightness = 0;
      let skinPixels = 0;

      // Sharpness gradient accumulator
      let sumGrad = 0;
      let gradCount = 0;

      for (let y = 1; y < rh - 1; y += 2) {
        for (let x = 1; x < rw - 1; x += 2) {
          const idx = (y * rw + x) * 4;
          const r = pixels[idx];
          const g = pixels[idx + 1];
          const b = pixels[idx + 2];

          // Luminance formula
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          totalBrightness += lum;

          // Simple skin tone heuristic in RGB: R > G > B, (R - G) > 15
          if (r > 60 && g > 40 && b > 20 && r > g && r > b && (r - g) > 12) {
            skinPixels++;
          }

          // Compute horizontal and vertical difference for blur detection
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
      const skinRatio = skinPixels / sampledCount;

      let newStatus: LiveQualityStatus;

      // Evaluation hierarchy
      if (avgBrightness < 45) {
        newStatus = {
          passed: false,
          message: "Pencahayaan Terlalu Gelap",
          type: "dark",
        };
      } else if (avgBrightness > 235) {
        newStatus = {
          passed: false,
          message: "Pencahayaan Terlalu Silau",
          type: "too_bright",
        };
      } else if (faceCount > 1) {
        newStatus = {
          passed: false,
          message: `Terdeteksi ${faceCount} Orang! Hanya Boleh 1 Orang`,
          type: "multiple_faces",
        };
      } else if (sharpness < 7.5) {
        newStatus = {
          passed: false,
          message: "Kamera Buram / Kurang Stabil",
          type: "blurry",
        };
      } else if (faceCount === 0) {
        newStatus = {
          passed: false,
          message: "Posisikan Wajah di Area Oval",
          type: "no_face",
        };
      } else if (faceCount === -1 && skinRatio < 0.12) {
        // Fallback when native face detector isn't available
        newStatus = {
          passed: false,
          message: "Posisikan Wajah di Area Oval",
          type: "no_face",
        };
      } else {
        newStatus = {
          passed: true,
          message: "Wajah Terdeteksi & Siap",
          type: "ready",
        };
      }

      if (isSubscribed) {
        setQuality(newStatus);
        timerId = setTimeout(performCheck, 280);
      }
    };

    timerId = setTimeout(performCheck, 350);

    return () => {
      isSubscribed = false;
      if (timerId) clearTimeout(timerId);
    };
  }, [isActive, videoRef]);

  return quality;
}
