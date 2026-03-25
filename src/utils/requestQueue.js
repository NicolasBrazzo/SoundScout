// Concurrency limiter per le richieste Spotify API.
// Limita il numero di richieste simultanee per evitare il rate limiting.

const MAX_CONCURRENT = 3;
let running = 0;
const queue = [];

function runNext() {
  if (queue.length === 0 || running >= MAX_CONCURRENT) return;
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
