import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { installApiInterceptor } from './lib/apiFallback'

// Aktifkan fallback API client-side jika berjalan di static hosting (GitHub Pages)
installApiInterceptor();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
