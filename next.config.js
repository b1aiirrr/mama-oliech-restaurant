/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // We already disabled rules in .eslintrc.json, but this is a double safety
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Keep this false to ensure type safety, our types should be correct now
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig
