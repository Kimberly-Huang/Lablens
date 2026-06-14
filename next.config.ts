import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    FEATHERLESS_API_KEY: process.env.FEATHERLESS_API_KEY ?? "",
  },
};

export default nextConfig;
