import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Pelada IET',
    short_name: 'Pelada IET',
    description: 'Sorteio de times da pelada semanal',
    start_url: '/',
    display: 'standalone',
    background_color: '#0b1e0e',
    theme_color: '#1B5E20',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
    ],
  };
}
