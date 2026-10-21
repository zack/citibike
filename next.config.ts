import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  agentRules: false,
  allowedDevOrigins: ['192.168.1.*'],
  reactCompiler: true,
  experimental: {
    authInterrupts: true,
  },
};

module.exports = nextConfig;
