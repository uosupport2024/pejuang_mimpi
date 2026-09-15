import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { VitePWA } from "vite-plugin-pwa"
import path from "path"

export default defineConfig({
  assetsInclude: ["**/*.riv"],
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.png",
        "favicon.svg",
        "apple-touch-icon.png",
        "logo-pot.png",
        "icons/*.png",
      ],
      manifest: {
        name: "Pejuang Mimpi",
        short_name: "PejuangMimpi",
        description: "Portal Layanan Mandiri dan Manajemen Kinerja Karyawan",
        theme_color: "#203a72",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        id: "/",
        icons: [
          {
            src: "/icons/pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "/icons/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icons/maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/icons/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,riv,woff2}"],
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    allowedHosts: ["demo.pejuangmimpi.com", ".pejuangmimpi.com"],
  },
  preview: {
    host: true,
    allowedHosts: ["demo.pejuangmimpi.com", ".pejuangmimpi.com"],
  },
})