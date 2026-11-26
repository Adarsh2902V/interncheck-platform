/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'ui-avatars.com', 'avatar.vercel.sh'],
  },
};

module.exports = nextConfig;
