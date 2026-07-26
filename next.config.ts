import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  typedRoutes: false,
  outputFileTracingRoot: process.cwd(),
  outputFileTracingIncludes: {
    "/api/admin/bootstrap": ["./database/migrations/*.sql"],
  },
};

export default nextConfig;
