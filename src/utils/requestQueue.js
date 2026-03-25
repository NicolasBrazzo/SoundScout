// Concurrency limiter con pausa globale su rate limit.
// Quando una richiesta riceve 429, l'intera coda si ferma per Retry-After secondi.

const MAX_CONCURRENT = 2;
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
    runNext();
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
