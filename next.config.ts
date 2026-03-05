import type { NextConfig } from "next";

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
  rewrites: async () => {
    return {
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
    };
  },
};

export default nextConfig;
