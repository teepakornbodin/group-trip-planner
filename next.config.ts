/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ข้าม ESLint errors ตอน build (ยัง lint ได้ตอน dev)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ข้าม TypeScript errors ตอน build ชั่วคราว
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
