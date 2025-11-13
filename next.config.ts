import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    authInterrupts: true,
  },
};

module.exports = nextConfig;
