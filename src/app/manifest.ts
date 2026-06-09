import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Coroa Cosmica Admin',
    short_name: 'Coroa Admin',
    description: 'Admin Dashboard for Coroa Cosmica',
    start_url: '/en/admin',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3d4d3e',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
