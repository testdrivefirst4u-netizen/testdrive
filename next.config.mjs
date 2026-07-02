/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@prisma/client", "bcryptjs"],

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ik.imagekit.io" },
      { protocol: "https", hostname: "imagekit.io" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.cloudinary.com" },
      { protocol: "https", hostname: "saasbot.evradar.in" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "www.googletagmanager.com" },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-origin",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",

              // Scripts
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://saasbot.evradar.in https://js.pusher.com",

              // Styles
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",

              // Fonts
              "font-src 'self' https://fonts.gstatic.com data:",

              // Images
              "img-src 'self' data: blob: https://saasbot.evradar.in https://ik.imagekit.io https://imagekit.io https://images.unsplash.com https://*.cloudinary.com https://lh3.googleusercontent.com https://www.googletagmanager.com https://www.google-analytics.com",

              // API / Fetch Connections
              "connect-src 'self' https://saasbot.evradar.in https://api.imagekit.io https://www.google-analytics.com https://www.google.com https://region1.google-analytics.com wss://*.pusher.com https://*.pusher.com https://nominatim.openstreetmap.org",

              // Frames
              "frame-src 'self' https://saasbot.evradar.in",

              // Prevent embedding
              "frame-ancestors 'self'",

              // Media
              "media-src 'self' blob: data:",

              // Objects
              "object-src 'none'",

              // Base URI
              "base-uri 'self'",

              // Forms
              "form-action 'self'",

              // Auto-upgrade http sub-resources
              "upgrade-insecure-requests",

              // Violation reporting
              "report-uri /api/csp-report",
            ].join("; "),
          },
        ],
      },

      {
        source: "/api/admin/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store",
          },
        ],
      },

      {
        source: "/api/dealer/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store",
          },
        ],
      },
    ];
  },
};

export default nextConfig;