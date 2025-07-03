// painel-jardimprive/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ ignora erros do ESLint no deploy
  },
  images: {
    domains: ['images.unsplash.com'], // se você usa imagens externas
  },
};

module.exports = nextConfig;
