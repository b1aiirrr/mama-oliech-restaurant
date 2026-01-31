const nextConfig = {
  /* config options here */
  eslint: {
    // Disable quote escaping rule during builds
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig
