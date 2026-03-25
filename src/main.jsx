import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 60 * 1000, // 30 min – gli album cambiano raramente
      retry: (failureCount, error) => {
        // Non riprovare su errori di autenticazione
        if (error?.status === 401 || error?.status === 403) return false
        // Rate limit: riprova fino a 3 volte
        if (error?.status === 429) return failureCount < 3
        // Errori generici: 2 tentativi
        return failureCount < 2
      },
      retryDelay: (attemptIndex, error) => {
        // Rispetta Retry-After di Spotify se presente
        if (error?.retryAfter) return error.retryAfter * 1000
        // Altrimenti backoff esponenziale: 1s, 2s, 4s… max 15s
        return Math.min(1000 * 2 ** attemptIndex, 15000)
      },
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
