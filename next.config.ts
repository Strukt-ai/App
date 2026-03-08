import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'unsafe-none',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
        ],
      },
    ];
  },
  // Only rewrite to localhost in development.
  // In production (Vercel), the Next.js API catch-all route
  // proxies requests via NEXT_PUBLIC_BACKEND_URL (Cloudflare Tunnel).
  rewrites: isDev
    ? async () => ({
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: 'http://127.0.0.1:8000/:path*',
        },
        {
          source: '/sidecar/:path*',
          destination: 'http://127.0.0.1:8000/sidecar/:path*',
        },
      ],
    })
    : undefined,
};

export default nextConfig;
