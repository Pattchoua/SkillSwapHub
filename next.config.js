/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
    /*mdxRS: true,*/
    serverComponentsExternalPackages: ["mongoose"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
      },
      {
        protocol: "http",
        hostname: "*",
      },
    ],
  },
};

module.exports = nextConfig;
