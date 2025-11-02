/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    ZHIPU_API_KEY: '75b627b72dd94af6ae7304f72c810263.ErWsFP01mMFjIMr0',
    ZHIPU_API_URL: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  },
  images: {
    domains: ['open.bigmodel.cn'],
  },
  experimental: {
    forceSwcTransforms: true,
  },
};

module.exports = nextConfig;