import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    domains: ['res.cloudinary.com', 'firebasestorage.googleapis.com'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
