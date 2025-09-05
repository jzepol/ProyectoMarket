import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, total } = body

    // Verificar stock disponible
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      })

      if (!product) {
        return NextResponse.json(
          { error: `Producto con ID ${item.productId} no encontrado` },
          { status: 404 }
        )
      }

      if (product.stockQty < item.qty) {
        return NextResponse.json(
          { error: `Stock insuficiente para ${product.name}` },
          { status: 400 }
        )
      }
    }

    // Crear la venta y actualizar stock en una transacción
    const sale = await prisma.$transaction(async (tx) => {
      // Crear la venta
      const sale = await tx.sale.create({
        data: {
          total,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              qty: item.qty,
              price: item.price
            }))
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      })

      // Actualizar stock y crear movimientos
      for (const item of items) {
        // Actualizar stock del producto
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQty: {
              decrement: item.qty
            }
          }
        })

        // Crear movimiento de salida
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: 'OUT',
            qty: item.qty,
            reference: `Venta #${sale.id}`
          }
        })
      }

      return sale
    })

    return NextResponse.json(sale, { status: 201 })
  } catch (error) {
    console.error('Error processing sale:', error)
    return NextResponse.json(
      { error: 'Error al procesar la venta' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const sales = await prisma.sale.findMany({
      take: limit,
      skip: offset,
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const total = await prisma.sale.count()

    return NextResponse.json({
      sales,
      total,
      hasMore: offset + limit < total
    })
  } catch (error) {
    console.error('Error fetching sales:', error)
    return NextResponse.json(
      { error: 'Error al obtener ventas' },
      { status: 500 }
    )
  }
}

