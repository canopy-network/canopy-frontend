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
  // Transpile packages that have nested dependencies
  transpilePackages: [
    'zustand',
    '@noble/curves',
    '@noble/hashes',
    '@scure/bip39',
    'viem',
    'wagmi',
    '@wagmi/core',
    '@rainbow-me/rainbowkit',
    '@reown/appkit',
    '@reown/appkit-controllers',
    '@walletconnect/utils',
    'valtio',
  ],
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
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': path.join(__dirname, 'lib', 'shims', 'async-storage.ts'),
      'pino-pretty': path.join(__dirname, 'lib', 'shims', 'pino-pretty.ts'),
    }

    // Polyfills for Node.js modules in browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        path: false,
        os: false,
      }
    }

    // Ensure proper resolution for ESM packages
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
      '.cjs': ['.cts', '.cjs'],
    }

    return config
  },
  experimental: {
    turbo: {
      resolveAlias: {
        '@react-native-async-storage/async-storage': './lib/shims/async-storage.ts',
        'pino-pretty': './lib/shims/pino-pretty.ts',
      },
    },
    // Enable optimized package imports for better tree-shaking
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      'recharts',
    ],
  },
}
//Dummy
export default nextConfig
