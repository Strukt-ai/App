import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development';

const ContentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com https://static.cloudflareinsights.com https://*.razorpay.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://*.googleusercontent.com https://*.gstatic.com",
  "connect-src 'self' blob: https://accounts.google.com https://oauth2.googleapis.com https://raw.githack.com https://raw.githubusercontent.com https://cloudflareinsights.com https://checkout.razorpay.com https://lumberjack.razorpay.com https://*.razorpay.com",
  "frame-src 'self' https://accounts.google.com https://*.razorpay.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: ContentSecurityPolicy },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
];

const nextConfig: NextConfig = {
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
          ...securityHeaders,
        ],
      },
    ];
  },
  // Rewrite /api/* and /sidecar/* to the backend in both dev and production.
  // Vercel's rewrite layer forwards requests natively (preserving multipart
  // bodies, streaming, etc.) so the JS catch-all proxy is never hit.
  rewrites: async () => {
    const backendUrl = isDev
      ? 'http://127.0.0.1:8000'
      : (process.env.NEXT_PUBLIC_BACKEND_URL || 'https://struktai.work');
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: `${backendUrl}/api/:path*`,
        },
        {
          source: '/sidecar/:path*',
          destination: `${backendUrl}/sidecar/:path*`,
        },
        {
          source: '/admin',
          destination: `${backendUrl}/admin`,
        },
      ],
    };
  },
};

export default nextConfig;
