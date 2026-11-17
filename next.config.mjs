/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  experimental: { globalNotFound: true },
  async redirects() {
    return [
      { source: "/topics/top-10", destination: "/topics/popular-use-cases", permanent: true },
      { source: "/:locale(en|zh-Hans|zh-Hant|ja|hi|es|pt-BR)/topics/top-10", destination: "/:locale/topics/popular-use-cases", permanent: true },
      { source: "/zh-CN/topics/top-10", destination: "/zh-Hans/topics/popular-use-cases", permanent: true },
      { source: "/zh-CN/:path*", destination: "/zh-Hans/:path*", permanent: true },
    ]
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
