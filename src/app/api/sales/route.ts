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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const saleId = searchParams.get('id')

    if (!saleId) {
      return NextResponse.json(
        { error: 'ID de venta requerido' },
        { status: 400 }
      )
    }

    const saleIdNum = parseInt(saleId)

    // Obtener la venta con sus items
    const sale = await prisma.sale.findUnique({
      where: { id: saleIdNum },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    if (!sale) {
      return NextResponse.json(
        { error: 'Venta no encontrada' },
        { status: 404 }
      )
    }

    // Cancelar la venta: devolver productos al stock y crear movimientos
    await prisma.$transaction(async (tx) => {
      // Para cada item de la venta
      for (const item of sale.items) {
        // Devolver el producto al stock (incrementar)
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQty: {
              increment: item.qty
            }
          }
        })

        // Crear movimiento de entrada (devolución)
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: 'IN',
            qty: item.qty,
            reference: `Cancelación de Venta #${sale.id}`
          }
        })
      }

      // Primero eliminar los items de la venta
      await tx.saleItem.deleteMany({
        where: { saleId: saleIdNum }
      })

      // Luego eliminar la venta
      await tx.sale.delete({
        where: { id: saleIdNum }
      })
    })

    return NextResponse.json(
      { message: 'Venta cancelada exitosamente', saleId: saleIdNum },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error canceling sale:', error)
    return NextResponse.json(
      { error: 'Error al cancelar la venta' },
      { status: 500 }
    )
  }
}

