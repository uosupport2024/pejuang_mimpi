import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initFetchInterceptor } from '@/shared/components/layout/fetch-progress-bar'
import { registerSW } from 'virtual:pwa-register'

initFetchInterceptor()

// Register PWA Service Worker with auto update
registerSW({
  immediate: true,
  onOfflineReady() {
    console.log('[PWA] Aplikasi siap digunakan secara offline.')
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
