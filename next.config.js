/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: false,
  },
  webpack: (config) => {
    config.externals = config.externals || {};
    config.externals['react'] = 'react';
    config.externals['react-dom'] = 'react-dom';
    return config;
  },
};

module.exports = nextConfig;
