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
    domains: ['ullghcrmleaaualynomj.supabase.co'],
  },
  reactStrictMode: true,
  serverExternalPackages: ['@supabase/supabase-js'],
  // Remove hardcoded env vars - use environment variables instead
  distDir: '.next-dev',
}

export default nextConfig
