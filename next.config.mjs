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
  experimental: {
    serverComponentsExternalPackages: ['zustand'],
  },
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
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL + '/:path*',
      },
    ]
  }
}
//Dummy
export default nextConfig