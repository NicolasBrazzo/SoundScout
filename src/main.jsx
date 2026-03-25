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
        // Rate limit: 1 solo retry (la coda è già in pausa)
        if (error?.status === 429) return failureCount < 1
        // Errori generici: 1 tentativo
        return failureCount < 1
      },
      retryDelay: (_attemptIndex, error) => {
        // Su 429 aspetta il Retry-After + margine (la coda è in pausa)
        if (error?.retryAfter) return (error.retryAfter + 1) * 1000
        return 2000
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
