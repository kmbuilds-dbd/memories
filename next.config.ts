import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  // Empty turbopack config to acknowledge webpack plugin usage
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ivhpbucigkvxiboyyhky.supabase.co",
      },
    ],
  },
};

export default withPWA(nextConfig);
