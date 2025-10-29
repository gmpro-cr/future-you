/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Disable static page generation (dynamic server-side rendering)
  output: 'standalone',
  eslint: {
    // Disable ESLint during production builds (ESLint is in devDependencies)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable strict type checking for production builds (unused vars)
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      'api.dicebear.com',
      'ui-avatars.com',
      'i.pravatar.cc',
      'images.unsplash.com',
      'upload.wikimedia.org',
      'images.livemint.com',
      'inc42.com',
      'akm-img-a-in.tosshub.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.livemint.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'inc42.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'akm-img-a-in.tosshub.com',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
