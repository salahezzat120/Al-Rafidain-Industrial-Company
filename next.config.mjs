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
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://uhdxceccjihhskfzijlb.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoZHhjZWNjamloaHNrZnppamxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNDQ3NDEsImV4cCI6MjA3MTcyMDc0MX0.0IedEaesL7hr9BdRgKENvBNQ9XzTIJ0isfksRU_3nvc'
  },
}

export default nextConfig
