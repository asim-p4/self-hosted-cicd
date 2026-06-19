const requestTracker = new Map();
const userTimeouts = new Map(); // Store timeoutId per user

const WINDOW_MS = 5 * 1000;
const MAX_REQUESTS = 1;
const CLEANUP_INTERVAL = 10 * 1000;

function scheduleCleanup(key) {
  if (userTimeouts.has(key)) {
    clearTimeout(userTimeouts.get(key));
  }

  const timeoutId = setTimeout(() => {
    console.log(`🧹 Cleaning up ${key}`);
    requestTracker.delete(key);
    userTimeouts.delete(key);
  }, CLEANUP_INTERVAL);

  userTimeouts.set(key, timeoutId);
}

export const rateLimit = (req, res, next) => {
  const repoName = req.body.name;
  if (!repoName) return next();

  const key = `${req.ip}:${repoName}`;
  const now = Date.now();

  // Get and clean timestamps
  let timestamps = (requestTracker.get(key) || []).filter(
    (ts) => now - ts < WINDOW_MS,
  );

  if (timestamps.length >= MAX_REQUESTS) {
    const waitSeconds = Math.ceil((timestamps[0] + WINDOW_MS - now) / 1000);
    return res.status(429).json({ error: `Wait ${waitSeconds}s` });
  }

  timestamps.push(now);
  requestTracker.set(key, timestamps);
  scheduleCleanup(key);

  next();
};
