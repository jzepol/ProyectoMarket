/** @type {import('next').NextConfig} */
const nextConfig = {
  // Deshabilitar caché en producción
  generateEtags: false,
  // Configurar headers para evitar caché
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate'
          },
          {
            key: 'Pragma',
            value: 'no-cache'
          },
          {
            key: 'Expires',
            value: '0'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig

