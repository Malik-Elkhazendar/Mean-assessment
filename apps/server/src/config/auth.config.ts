import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => {
  const nodeEnv = process.env.NODE_ENV || 'development';

  // Backward-compatible access token lifetime: prefer JWT_ACCESS_EXPIRES_IN, fallback to JWT_EXPIRES_IN
  const jwtAccessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || process.env.JWT_EXPIRES_IN || '8h';

  // Session/window + refresh rotation (numbers in ms)
  const sessionTtlMs = parseInt(process.env.SESSION_TTL_MS || '28800000', 10); // 8h default
  const refreshTokenTtlMs = parseInt(process.env.REFRESH_TOKEN_TTL_MS || '900000', 10); // 15m default

  const sameSiteRaw = (process.env.COOKIE_SAMESITE || 'Lax').toLowerCase();
  const allowedSameSite = ['lax', 'strict', 'none'] as const;
  const cookieSameSite = allowedSameSite.includes(sameSiteRaw as typeof allowedSameSite[number])
    ? (sameSiteRaw as (typeof allowedSameSite)[number])
    : 'lax';

  const rawDomain = process.env.COOKIE_DOMAIN?.trim();
  const cookieDomain = rawDomain && rawDomain !== 'localhost' ? rawDomain : undefined;

  return {
    // Secrets and lifetimes
    jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key',
    // Legacy name retained for backwards compatibility (represents session window in responses)
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
    // New, explicit access token TTL
    jwtAccessExpiresIn,
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),

    // Refresh/session policy
    sessionTtlMs,
    refreshTokenTtlMs,

    // Cookie settings for HttpOnly refresh cookie
    cookie: {
      domain: cookieDomain,
      secure: process.env.COOKIE_SECURE === 'true' || nodeEnv === 'production',
      sameSite: cookieSameSite,
      // Path is fixed to refresh endpoint for least privilege
      path: '/api/auth/refresh',
    },
  };
});
