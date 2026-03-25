// Concurrency limiter con pausa globale su rate limit.
// Quando una richiesta riceve 429, l'intera coda si ferma per Retry-After secondi.

const MAX_CONCURRENT = 1; // Serializza le richieste per evitare burst di 429
const MIN_DELAY_MS = 1500; // ~20 richieste in 30s per stare nel rate limit dev mode
let running = 0;
const queue = [];
let pausedUntil = 0;

function runNext() {
  if (queue.length === 0 || running >= MAX_CONCURRENT) return;

  // Se la coda è in pausa per rate limit, aspetta e riprova
  const now = Date.now();
  if (now < pausedUntil) {
    setTimeout(runNext, pausedUntil - now);
    return;
  }

  running++;
  const { fn, resolve, reject } = queue.shift();
  fn().then(resolve, reject).finally(() => {
    running--;
    // Piccolo delay tra una richiesta e l'altra per non saturare il rate limit
    setTimeout(runNext, MIN_DELAY_MS);
  });
}

export function enqueue(fn) {
  return new Promise((resolve, reject) => {
    queue.push({ fn, resolve, reject });
    runNext();
  });
}

// Ferma tutta la coda per `seconds` secondi
export function pauseQueue(seconds) {
  pausedUntil = Date.now() + seconds * 1000;
}
