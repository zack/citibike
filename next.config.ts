import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    authInterrupts: true,
    dynamicIO: true,
    reactCompiler: true,
  },
};

module.exports = nextConfig;
