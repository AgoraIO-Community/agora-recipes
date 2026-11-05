/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  experimental: { globalNotFound: true },
  async redirects() {
    return [{ source: "/zh-CN/:path*", destination: "/zh-Hans/:path*", permanent: true }]
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
