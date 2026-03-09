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
      ],
    };
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
