import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  transpilePackages: ['@nourish/core', '@nourish/database', '@nourish/ui'],
  poweredByHeader: false,
};
export default nextConfig;
