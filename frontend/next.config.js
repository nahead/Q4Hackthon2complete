/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  },
  // Removed rewrites - using API proxy routes instead for proper environment variable support
};

module.exports = nextConfig;