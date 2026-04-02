import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development';

const otelOrigins = [
  process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
  process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_LOGS_ENDPOINT,
].map((value) => {
  if (!value) return null
  try {
    return new URL(value).origin
  } catch {
    return null
  }
}).filter(Boolean) as string[]

const connectSrcValues = [
  "'self'",
  'blob:',
  'https://accounts.google.com',
  'https://oauth2.googleapis.com',
  'https://raw.githack.com',
  'https://raw.githubusercontent.com',
  'https://cloudflareinsights.com',
  'https://checkout.razorpay.com',
  'https://lumberjack.razorpay.com',
  'https://*.razorpay.com',
  ...otelOrigins,
]

const ContentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com https://static.cloudflareinsights.com https://*.razorpay.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://*.googleusercontent.com https://*.gstatic.com",
  `connect-src ${connectSrcValues.join(' ')}`,
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
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || (isDev ? 'http://127.0.0.1:8000' : 'https://struktai.work');
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
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
    ],
  },
};

export default nextConfig;
