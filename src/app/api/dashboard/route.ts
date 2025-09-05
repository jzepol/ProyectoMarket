import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Forzar que esta ruta sea dinámica y no use caché estática
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    // Obtener estadísticas básicas usando Prisma
    const [
      totalProducts,
      totalCategories,
      totalSuppliers,
      todaySales,
      recentSales
    ] = await Promise.all([
      // Total de productos
      prisma.product.count(),
      
      // Total de categorías
      prisma.category.count(),
      
      // Total de proveedores
      prisma.supplier.count(),
      
      // Ventas de hoy
      prisma.sale.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      
      // Ventas recientes (últimas 5)
      prisma.sale.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          items: true
        }
      })
    ])

    // Calcular ingresos de hoy
    const todayRevenue = await prisma.sale.aggregate({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      },
      _sum: {
        total: true
      }
    })

    // Obtener productos ordenados por cantidad de stock ascendente
    // Nota: No filtramos por stock > 0 para incluir también los de stock 0
    const rawProductsByStock = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        stockQty: true,
        stockMin: true
      },
      orderBy: {
        stockQty: 'asc'
      }
    })

    // Filtrar solo los que realmente tienen stock bajo (incluye stock 0)
    const actualLowStockProducts = rawProductsByStock.filter(
      (product: any) => product.stockQty <= product.stockMin
    )

    const lowStockProducts = actualLowStockProducts.length

    // Calcular productos más vendidos (simulado por ahora)
    // En un sistema real, esto requeriría una consulta más compleja con GROUP BY
    const topProducts = await prisma.product.findMany({
      take: 5,
      orderBy: {
        name: 'asc'
      },
      select: {
        name: true
      }
    })

    // Simular datos de ventas para productos (en un sistema real esto vendría de la base de datos)
    const topProductsWithStats = topProducts.map((product: any, index: number) => ({
      name: product.name,
      sales: Math.floor(Math.random() * 50) + 10,
      revenue: Math.floor(Math.random() * 5000) + 1000
    }))

    const response = NextResponse.json({
      totalProducts,
      lowStockProducts,
      totalCategories,
      totalSuppliers,
      totalSales: todaySales,
      totalRevenue: todayRevenue._sum.total || 0,
      recentSales: recentSales.map((sale: any) => ({
        id: sale.id,
        total: sale.total,
        createdAt: sale.createdAt,
        items: sale.items.length
      })),
      // Limitar lista para UI del dashboard
      lowStockProductsList: actualLowStockProducts.slice(0, 10),
      topProducts: topProductsWithStats
    })

    // Agregar headers para evitar caché
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Last-Modified', new Date().toUTCString())

    return response
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Error al obtener estadísticas del dashboard' },
      { status: 500 }
    )
  }
}
