/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/admin/providers',
        destination: '/admin/gateway-routing',
        permanent: true,
      },
      {
        source: '/admin/services',
        destination: '/admin/gateway-routing',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
