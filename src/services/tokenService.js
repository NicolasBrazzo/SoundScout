// Gestisce il token Spotify lato frontend.
// Chiama /api/token (Vercel serverless) e cachea il risultato in memoria.
// Il token viene rinnovato automaticamente 60 secondi prima della scadenza.

let cached = null; // { token: string, expiresAt: number }

export async function getToken() {
  if (cached && Date.now() < cached.expiresAt - 60_000) {
    return cached.token;
  }

  const res = await fetch('/api/token');
  if (!res.ok) throw new Error(`Impossibile ottenere il token Spotify (${res.status})`);

  const { access_token, expires_in } = await res.json();
  cached = { token: access_token, expiresAt: Date.now() + expires_in * 1000 };
  return cached.token;
}
