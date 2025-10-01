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
  // Use default .next directory
  // distDir: '.next',
}

export default nextConfig
