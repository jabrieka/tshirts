/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
  experimental: { serverComponentsExternalPackages: ["sharp", "node-vibrant"] },
};

module.exports = nextConfig;
