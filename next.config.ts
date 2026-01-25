import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    authInterrupts: true,
  },
  outputFileTracingIncludes: {
  '/api/*': ['./node_modules/.prisma/client/*.wasm']
  },
};

module.exports = nextConfig;
