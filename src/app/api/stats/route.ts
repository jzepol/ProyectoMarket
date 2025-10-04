import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const dateRange = searchParams.get('dateRange') || 'today'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Calcular fechas según el rango seleccionado
    const getDateRange = () => {
      const now = new Date()
      const startOfDay = new Date(now)
      startOfDay.setHours(0, 0, 0, 0)
      
      switch (dateRange) {
        case 'week':
          const startOfWeek = new Date(now)
          startOfWeek.setDate(now.getDate() - now.getDay())
          startOfWeek.setHours(0, 0, 0, 0)
          return { start: startOfWeek, end: now }
        case 'month':
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
          return { start: startOfMonth, end: now }
        case 'year':
          const startOfYear = new Date(now.getFullYear(), 0, 1)
          return { start: startOfYear, end: now }
        case 'custom':
          const customDate = searchParams.get('customDate')
          if (customDate) {
            // Crear fecha en zona horaria local para evitar desfases
            const [year, month, day] = customDate.split('-').map(Number)
            const startOfCustomDay = new Date(year, month - 1, day, 0, 0, 0, 0)
            const endOfCustomDay = new Date(year, month - 1, day, 23, 59, 59, 999)
            return { start: startOfCustomDay, end: endOfCustomDay }
          }
          return { start: startOfDay, end: now }
        default: // today
          return { start: startOfDay, end: now }
      }
    }

    const { start, end } = getDateRange()

    // Obtener estadísticas básicas
    const [
      totalProducts,
      totalCategories,
      totalSuppliers,
      totalSales,
      totalMovements,
      periodSales,
      periodMovements,
      recentSales,
      recentMovements
    ] = await Promise.all([
      // Total de productos
      prisma.product.count(),
      
      // Total de categorías
      prisma.category.count(),
      
      // Total de proveedores
      prisma.supplier.count(),
      
      // Total de ventas (todas)
      prisma.sale.count(),
      
      // Total de movimientos (todos)
      prisma.stockMovement.count(),
      
      // Ventas del período seleccionado
      prisma.sale.count({
        where: {
          createdAt: {
            gte: start,
            lte: end
          }
        }
      }),
      
      // Movimientos del período seleccionado
      prisma.stockMovement.count({
        where: {
          date: {
            gte: start,
            lte: end
          }
        }
      }),
      
      // Ventas recientes del período con paginación
      prisma.sale.findMany({
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: 'desc'
        },
        where: {
          createdAt: {
            gte: start,
            lte: end
          }
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  sku: true
                }
              }
            }
          }
        }
      }),
      
      // Movimientos recientes del período
      prisma.stockMovement.findMany({
        take: 10,
        orderBy: {
          date: 'desc'
        },
        where: {
          date: {
            gte: start,
            lte: end
          }
        },
        include: {
          product: {
            select: {
              name: true,
              sku: true
            }
          }
        }
      })
    ])

    // Calcular ingresos del período
    const periodRevenue = await prisma.sale.aggregate({
      where: {
        createdAt: {
          gte: start,
          lte: end
        }
      },
      _sum: {
        total: true
      }
    })

    // Calcular costos de inversión del período (costos de productos vendidos)
    const periodInvestmentCost = await prisma.saleItem.aggregate({
      where: {
        sale: {
          createdAt: {
            gte: start,
            lte: end
          }
        }
      },
      _sum: {
        qty: true
      }
    })

    // Obtener el costo total de los productos vendidos
    const soldItemsWithCosts = await prisma.saleItem.findMany({
      where: {
        sale: {
          createdAt: {
            gte: start,
            lte: end
          }
        }
      },
      include: {
        product: {
          select: {
            purchasePrice: true
          }
        }
      }
    })

    // Calcular el costo total de inversión
    const totalInvestmentCost = soldItemsWithCosts.reduce((total, item) => {
      return total + (item.qty * item.product.purchasePrice)
    }, 0)

    // Obtener productos con stock bajo
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stockQty: {
          gt: 0
        }
      },
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

    // Filtrar solo los que realmente tienen stock bajo
    const actualLowStockProducts = lowStockProducts.filter(
      (product: any) => product.stockQty <= product.stockMin
    )

    // Calcular estadísticas de movimientos por tipo del período
    const movementsByType = await prisma.stockMovement.groupBy({
      by: ['type'],
      where: {
        date: {
          gte: start,
          lte: end
        }
      },
      _count: {
        type: true
      }
    })

    // Calcular productos más vendidos del período (REAL)
    const topProducts = await prisma.saleItem.groupBy({
      by: ['productId'],
      where: {
        sale: {
          createdAt: {
            gte: start,
            lte: end
          }
        }
      },
      _sum: {
        qty: true
      },
      _count: {
        productId: true
      },
      orderBy: {
        _sum: {
          qty: 'desc'
        }
      },
      take: 10
    })

    // Obtener detalles de los productos más vendidos
    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, salePrice: true }
        })

        const totalRevenue = await prisma.saleItem.aggregate({
          where: {
            productId: item.productId,
            sale: {
              createdAt: {
                gte: start,
                lte: end
              }
            }
          },
          _sum: {
            qty: true
          }
        })

        return {
          id: item.productId,
          name: product?.name || 'Producto desconocido',
          sales: item._count.productId,
          qty: item._sum.qty || 0,
          revenue: (item._sum.qty || 0) * (product?.salePrice || 0)
        }
      })
    )

    // Calcular estadísticas de ventas por día del período
    const daysInPeriod = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    const salesByDay = await Promise.all(
      Array.from({ length: Math.min(daysInPeriod, 30) }, (_, i) => {
        const date = new Date(start)
        date.setDate(start.getDate() + i)
        return date
      }).map(async (date) => {
        const startOfDay = new Date(date)
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(date)
        endOfDay.setHours(23, 59, 59, 999)

        const sales = await prisma.sale.count({
          where: {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay
            }
          }
        })

        const revenue = await prisma.sale.aggregate({
          where: {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay
            }
          },
          _sum: {
            total: true
          }
        })

        return {
          date: date.toISOString().split('T')[0],
          sales,
          revenue: revenue._sum.total || 0
        }
      })
    )

    const response = NextResponse.json({
      // Estadísticas generales
      totalProducts,
      totalCategories,
      totalSuppliers,
      totalSales,
      totalMovements,
      
      // Estadísticas del período
      periodSales,
      periodMovements,
      periodRevenue: periodRevenue._sum.total || 0,
      periodInvestmentCost: totalInvestmentCost,
      
      // Paginación
      currentPage: page,
      totalPages: Math.ceil(periodSales / limit),
      hasMore: offset + limit < periodSales,
      
      // Productos con stock bajo
      lowStockProducts: actualLowStockProducts.length,
      lowStockProductsList: actualLowStockProducts.slice(0, 5),
      
      // Movimientos por tipo del período
      movementsByType: movementsByType.reduce((acc: any, item: any) => {
        acc[item.type] = item._count.type
        return acc
      }, {}),
      
      // Ventas por día del período
      salesByDay,
      
      // Productos más vendidos (REALES)
      topProducts: topProductsWithDetails,
      
      // Datos recientes
      recentSales: recentSales.map((sale: any) => ({
        id: sale.id,
        total: sale.total,
        createdAt: sale.createdAt,
        items: sale.items.length,
        products: sale.items.map((item: any) => item.product.name).join(', ')
      })),
      
      recentMovements: recentMovements.map((movement: any) => ({
        id: movement.id,
        type: movement.type,
        qty: movement.qty,
        date: movement.date,
        reference: movement.reference,
        productName: movement.product.name,
        productSku: movement.product.sku
      }))
    })

    // Agregar headers para evitar caché
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Last-Modified', new Date().toUTCString())

    return response
  } catch (error) {
    console.error('Error fetching detailed stats:', error)
    return NextResponse.json(
      { error: 'Error al obtener estadísticas detalladas' },
      { status: 500 }
    )
  }
}
