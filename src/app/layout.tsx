import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import { DataProvider } from '@/contexts/DataContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Proyecto Market - Sistema de Gestión',
  description: 'Sistema de gestión de inventario y punto de venta',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <DataProvider>
          <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 overflow-auto lg:ml-64 p-6">
              <div className="animate-fadeIn">
                {children}
              </div>
            </main>
          </div>
        </DataProvider>
      </body>
    </html>
  )
}

