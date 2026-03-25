// Servizio per recuperare le ultime uscite musicali da MusicBrainz.
// API docs: https://musicbrainz.org/doc/MusicBrainz_API/Search
// Nessuna autenticazione richiesta, solo User-Agent obbligatorio.

const BASE_URL = 'https://musicbrainz.org/ws/2';
const USER_AGENT = 'SoundScout/1.0 (https://github.com/NicolasBrazzo/SoundScout)';

async function fetchMusicBrainz(endpoint) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`MusicBrainz API error: ${res.status}`);
  return res.json();
}

/**
 * Cerca le release uscite in Italia nell'ultima settimana.
 * @param {number} limit - Numero massimo di risultati
 */
export async function getLatestItalianReleases(limit = 25) {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);

  const from = formatDate(weekAgo);
  const to = formatDate(today);

  // Lucene query: release country IT, date range ultima settimana
  const query = encodeURIComponent(`country:IT AND date:[${from} TO ${to}]`);
  const data = await fetchMusicBrainz(
    `/release?query=${query}&fmt=json&limit=${limit}`,
  );
  return data.releases || [];
}

function formatDate(d) {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}
