import path from "node:path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const isDev = process.env.IS_DEV === "true";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  reactStrictMode: false,
  outputFileTracingRoot: path.join(__dirname, ".."),
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    dangerouslyAllowLocalIP: isDev,
    remotePatterns: [
      {
        protocol: isDev ? "http" : "https",
        hostname: isDev
          ? "localhost"
          : (process.env.BASE_URL?.replace(/^https?:\/\//, "") ?? ""),
        pathname: "/api/telegram/profile/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
