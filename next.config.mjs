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
    ],
  },
};

export default nextConfig;
