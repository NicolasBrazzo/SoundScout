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
        // Non riprovare su 401/403 (auth) né su 429 (gestito internamente da fetchSpotify)
        if (error?.status === 401 || error?.status === 403 || error?.status === 429) return false
        // Errori generici: 1 tentativo
        return failureCount < 1
      },
      retryDelay: () => 2000,
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
