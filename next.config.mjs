// Cuando se compila para la app móvil (Capacitor) usamos export estático.
// La web normal (`next build`) no cambia su comportamiento.
const isApp = process.env.BUILD_TARGET === 'app';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(isApp ? { output: 'export' } : {}),
  images: {
    // El export estático no admite la optimización de imágenes de Next.
    unoptimized: isApp,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
};

export default nextConfig;
