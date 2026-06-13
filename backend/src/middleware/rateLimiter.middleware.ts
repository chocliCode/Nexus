import rateLimit from 'express-rate-limit';

/**
 * SECURITY TACTIC: Limit Access — Rate Limiting
 *
 * Protects authentication endpoints against brute-force attacks and
 * credential-stuffing by capping the number of requests per IP address
 * within a time window.
 *
 * Applied to: POST /api/v1/auth/login, POST /api/v1/auth/register
 * Limit: 10 requests per IP per 15-minute window
 *
 * When the limit is exceeded the client receives HTTP 429 Too Many Requests.
 * The `skip` predicate disables the limiter in test environments so Jest
 * test suites are not blocked by the counter.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // max 10 requests per IP per window
  standardHeaders: true,     // sends RateLimit-* headers (RFC 6585)
  legacyHeaders: false,      // disables deprecated X-RateLimit-* headers
  message: {
    error: 'Demasiados intentos de autenticación. Intenta de nuevo en 15 minutos.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  // Skip the limiter when running automated tests so the test suite
  // is not blocked after the first few requests.
  skip: () => process.env.NODE_ENV === 'test',
});

/**
 * General API rate limiter — defense-in-depth against DoS.
 * Applied globally to all /api/v1/* routes.
 * Limit: 200 requests per IP per 15-minute window.
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Demasiadas peticiones. Intenta de nuevo más tarde.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  skip: () => process.env.NODE_ENV === 'test',
});
