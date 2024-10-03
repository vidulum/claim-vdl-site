/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  distDir: 'build',
  output: 'export',

  webpack: (config, { isServer }) => {
    // Enable WebAssembly (WASM) support
    config.experiments = {
      asyncWebAssembly: true, // Enable async WebAssembly
    };

    // Optional: Add rule to handle .wasm files
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    });

    return config;
  },
};

module.exports = nextConfig;
