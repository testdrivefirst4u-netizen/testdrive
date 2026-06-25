/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ik.imagekit.io" },
      { protocol: "https", hostname: "imagekit.io" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.cloudinary.com" },
    ],
  },
};

export default nextConfig;
