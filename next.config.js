/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  trailingSlash: false,
  swcMinify: true,
  basePath: "",
  assetPrefix: "",
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'img.autotrader.co.za',
      },
      {
        protocol: 'https',
        hostname: 'agizzitpublic.blob.core.windows.net'
      }
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  }, 
};

module.exports = nextConfig;