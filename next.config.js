/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development practices
  reactStrictMode: true,

  // Optimize images
  images: {
    domains: ['localhost'],
    // Add other domains if needed for production
  },

  // Production optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Enable gzip compression
  compress: true,

  // Configure headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ],
      },
    ]
  },

  // Redirect configuration
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: true,
      },
    ]
  },

  // Environment variables that should be available to the client
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },

  // Configure webpack if needed
  webpack: (config, { dev, isServer }) => {
    // Add custom webpack configuration here if needed
    return config
  },

  // Configure powered by header
  poweredByHeader: false,

  // Generate static pages at build time for better performance
  // Add paths here if using getStaticProps
  generateBuildId: async () => {
    // You can add custom build ID generation here
    return 'build-' + Date.now()
  },
} 