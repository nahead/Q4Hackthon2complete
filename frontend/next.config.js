/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  },
  async rewrites() {
    return [
      // Forward API calls to the backend, but EXCLUDE the routes we want to handle in Next.js
      // This will forward everything except /api/auth/, /api/tasks/, and /api/chat/
      {
        source: '/api/((?!auth|tasks|chat|health).*)',
        destination: 'http://localhost:8080/api/:match*',
      },
    ]
  },
};

module.exports = nextConfig;