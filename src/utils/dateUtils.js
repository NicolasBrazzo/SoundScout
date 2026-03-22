// Utility per la gestione delle date delle release musicali.
// Funzioni principali:
//   - getLastFriday: calcola il venerdì più recente (o oggi se è venerdì)
//   - parseReleaseDate: normalizza i formati data di Spotify (YYYY, YYYY-MM, YYYY-MM-DD)
//   - isAfterLastFriday: determina se una release rientra nella finestra temporale corrente

export function getLastFriday(today = new Date()) {
  const date = new Date(today);
  date.setHours(0, 0, 0, 0);

  const dayOfWeek = date.getDay(); // 0=Dom, 1=Lun, ..., 5=Ven, 6=Sab
  const daysToSubtract = dayOfWeek === 5 ? 0 : (dayOfWeek + 2) % 7;

  date.setDate(date.getDate() - daysToSubtract);
  return date;
}

/**
 * Converte il formato data di Spotify in un oggetto Date.
 * Spotify può restituire: "2024", "2024-03", "2024-03-21"
 * Per formati incompleti si usa il primo giorno del periodo.
 */
export function parseReleaseDate(dateStr) {
  if (!dateStr) return null;

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(dateStr);
  }

  // YYYY-MM → primo giorno del mese
  if (/^\d{4}-\d{2}$/.test(dateStr)) {
    return new Date(`${dateStr}-01`);
  }

  // YYYY → primo giorno dell'anno
  if (/^\d{4}$/.test(dateStr)) {
    return new Date(`${dateStr}-01-01`);
  }

  return null;
}

/**
 * Restituisce true se la release è uscita dal venerdì più recente in poi.
 * Release con data imprecisa (solo anno o anno-mese) vengono incluse
 * se il loro periodo potrebbe contenere il venerdì (logica permissiva).
 */
export function isAfterLastFriday(release) {
  const { release_date, release_date_precision } = release;
  const lastFriday = getLastFriday();
  const parsed = parseReleaseDate(release_date);

  if (!parsed) return false;

  // Data precisa: confronto diretto
  if (release_date_precision === 'day') {
    return parsed >= lastFriday;
  }

  // Precisione mensile: include se il mese contiene o è successivo al venerdì
  if (release_date_precision === 'month') {
    const endOfMonth = new Date(parsed.getFullYear(), parsed.getMonth() + 1, 0);
    return endOfMonth >= lastFriday;
  }

  // Precisione annuale: include se l'anno contiene o è successivo al venerdì
  if (release_date_precision === 'year') {
    const endOfYear = new Date(parsed.getFullYear(), 11, 31);
    return endOfYear >= lastFriday;
  }

  return false;
}
