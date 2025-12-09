import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'standalone',
  serverExternalPackages: ['zustand', '@noble/curves', '@noble/hashes', '@scure/bip39'],
  // Force SSR for all pages - disable static generation
  trailingSlash: true,
  generateEtags: false,
  // Disable static optimization completely
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  // Force all pages to be dynamic
  skipMiddlewareUrlNormalize: true,
  async rewrites() {
    // Get API URL from environment, with fallback
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.INTERNAL_API_URL || 'http://app.neochiba.net:3001';

    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`,
      },
    ]
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': path.resolve(__dirname, 'lib/shims/async-storage.ts'),
      'pino-pretty': path.resolve(__dirname, 'lib/shims/pino-pretty.ts'),
    }
    return config
  }
}
//Dummy
export default nextConfig
