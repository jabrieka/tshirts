/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
  experimental: { serverComponentsExternalPackages: ["sharp", "node-vibrant", "@resvg/resvg-js"] },
  // Bundle the flyer/social/email fonts into the serverless functions that read
  // them at runtime (dynamic fs paths aren't auto-traced by Next).
  outputFileTracingIncludes: {
    "/api/flyer/[id]": ["./src/assets/fonts/**"],
    "/api/social/[id]": ["./src/assets/fonts/**"],
    "/api/email-graphic/[id]": ["./src/assets/fonts/**"],
  },
};

module.exports = nextConfig;
