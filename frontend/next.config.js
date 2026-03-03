/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Custom domain (dialecticaltopology.xyz) serves at root — no basePath needed
  images: {
    unoptimized: true,
  },
  // Disable SSR for Three.js components
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    return config;
  },
}

module.exports = nextConfig
