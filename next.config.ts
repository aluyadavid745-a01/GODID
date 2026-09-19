import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    domains: ['res.cloudinary.com', 'firebasestorage.googleapis.com'],
  },
}

export default nextConfig
