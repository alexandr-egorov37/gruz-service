/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed output: 'export' to support /api routes on Vercel
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig