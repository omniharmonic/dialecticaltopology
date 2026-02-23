/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'

const nextConfig = {
  output: 'export',
  // GitHub Pages deployment - repo name becomes the base path
  basePath: isProd ? '/dialecticaltopology' : '',
  assetPrefix: isProd ? '/dialecticaltopology/' : '',
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
