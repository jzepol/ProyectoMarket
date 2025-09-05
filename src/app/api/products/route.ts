import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')
    const lowStock = searchParams.get('lowStock') === 'true'

    const where: any = {}

    if (categoryId) {
      where.categoryId = parseInt(categoryId)
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (lowStock) {
      where.stockQty = {
        lte: prisma.product.fields.stockMin
      }
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        supplier: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    const response = NextResponse.json(products)
    
    // Agregar headers para evitar caché
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Last-Modified', new Date().toUTCString())

    return response
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      sku,
      barcode,
      name,
      description,
      categoryId,
      purchasePrice,
      marginPct,
      stockQty,
      stockMin,
      pricingMode,
      packageWeightKg,
      supplierId
    } = body

    // Calcular precio de venta usando margen (ganancia sobre precio de venta)
    // Si es por peso y el precio de compra es por paquete, convertir a costo por kg
    const isWeight = pricingMode === 'WEIGHT'
    const pkgKg = isWeight ? parseFloat(packageWeightKg || 1) || 1 : 1
    const purchaseUnitCost = isWeight ? (parseFloat(purchasePrice) / pkgKg) : parseFloat(purchasePrice)
    const salePrice = purchaseUnitCost / (1 - parseFloat(marginPct) / 100)

    const createData: any = {
        sku,
        barcode,
        name,
        description,
        categoryId: categoryId ? parseInt(categoryId) : null,
        purchasePrice: parseFloat(purchasePrice),
        marginPct: parseFloat(marginPct),
        salePrice,
        pricingMode: isWeight ? 'WEIGHT' : 'UNIT',
        packageWeightKg: isWeight ? pkgKg : 1,
        stockQty: parseFloat(stockQty),
        stockMin: parseFloat(stockMin),
        supplierId: supplierId ? parseInt(supplierId) : null
      }

    const product = await prisma.product.create({
      data: createData,
      include: {
        category: true,
        supplier: true
      }
    })

    // Si hay stock inicial, crear movimiento de entrada
    if (parseFloat(stockQty) > 0) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          type: 'IN',
          qty: parseFloat(stockQty),
          reference: 'Stock inicial'
        }
      })
    }

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Error al crear producto' },
      { status: 500 }
    )
  }
}

