import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}

    if (productId) {
      where.productId = parseInt(productId)
    }

    if (type) {
      where.type = type
    }

    const movements = await prisma.stockMovement.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true
          }
        }
      },
      take: limit,
      skip: offset,
      orderBy: {
        date: 'desc'
      }
    })

    const total = await prisma.stockMovement.count({ where })

    const response = NextResponse.json({
      movements,
      total,
      hasMore: offset + limit < total
    })

    // Agregar headers para evitar caché
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Last-Modified', new Date().toUTCString())

    return response
  } catch (error) {
    console.error('Error fetching movements:', error)
    return NextResponse.json(
      { error: 'Error al obtener movimientos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, type, qty, reference } = body

    // Verificar que el producto existe
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Verificar stock disponible para salidas
    if (type === 'OUT' && product.stockQty < qty) {
      return NextResponse.json(
        { error: 'Stock insuficiente para realizar el movimiento' },
        { status: 400 }
      )
    }

    // Crear movimiento y actualizar stock en una transacción
    const movement = await prisma.$transaction(async (tx) => {
      // Crear el movimiento
      const movement = await tx.stockMovement.create({
        data: {
          productId,
          type,
          qty,
          reference
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true
            }
          }
        }
      })

      // Actualizar stock del producto
      await tx.product.update({
        where: { id: productId },
        data: {
          stockQty: {
            increment: type === 'IN' ? qty : -qty
          }
        }
      })

      return movement
    })

    return NextResponse.json(movement, { status: 201 })
  } catch (error) {
    console.error('Error creating movement:', error)
    return NextResponse.json(
      { error: 'Error al crear movimiento' },
      { status: 500 }
    )
  }
}

