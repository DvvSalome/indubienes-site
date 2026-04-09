/** @type {import('next').NextConfig} */
// Indubienes site configuration
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.wasi.co',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'images.wasi.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'image.wasi.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
