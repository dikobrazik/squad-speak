import type { NextConfig } from "next";
import path from "path";

const isDev = process.env.IS_DEV === "true";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  outputFileTracingRoot: path.join(__dirname, ".."),
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    dangerouslyAllowLocalIP: isDev,
    remotePatterns: [
      isDev
        ? {
            protocol: "http",
            hostname: "localhost",
            pathname: "/api/telegram/profile/**",
          }
        : {
            protocol: "https",
            hostname: `${process.env.BASE_URL}`,
            pathname: "/api/telegram/profile/**",
          },
    ],
  },
};

export default nextConfig;
