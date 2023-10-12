/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
    /*mdxRS: true,*/
    serverComponentsExternalPackages: ["mongoose"],
  },
};

module.exports = nextConfig;
