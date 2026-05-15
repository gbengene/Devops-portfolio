/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/**',
      },
    ],
  },
  // Ensure webhook routes receive raw body for HMAC verification
  experimental: {
    serverComponentsExternalPackages: ['twilio'],
  },
}

export default nextConfig
