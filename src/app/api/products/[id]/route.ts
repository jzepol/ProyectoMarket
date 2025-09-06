import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        supplier: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Error al obtener producto' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    const { 
      sku, 
      barcode, 
      name, 
      description, 
      categoryId, 
      purchasePrice, 
      marginPct, 
      salePrice, 
      stockQty, 
      stockMin, 
      supplierId,
      pricingMode,
      packageWeightKg
    } = body

    // Verificar que el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que el SKU no esté duplicado (si se está cambiando)
    if (sku && sku !== existingProduct.sku) {
      const duplicateSku = await prisma.product.findUnique({
        where: { sku }
      })
      if (duplicateSku) {
        return NextResponse.json(
          { error: 'El SKU ya existe' },
          { status: 400 }
        )
      }
    }

    // Verificar que el código de barras no esté duplicado (si se está cambiando)
    if (barcode && barcode !== existingProduct.barcode) {
      const duplicateBarcode = await prisma.product.findUnique({
        where: { barcode }
      })
      if (duplicateBarcode) {
        return NextResponse.json(
          { error: 'El código de barras ya existe' },
          { status: 400 }
        )
      }
    }

    // Actualizar el producto
    const isWeight = pricingMode === 'WEIGHT'
    const pkgKg = isWeight ? parseFloat(packageWeightKg || 1) || 1 : 1
    const purchaseUnitCost = isWeight ? (parseFloat(purchasePrice) / pkgKg) : parseFloat(purchasePrice)
    const computedSalePrice = Math.round(parseFloat(salePrice ?? (purchaseUnitCost * (1 + parseFloat(marginPct) / 100))))
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        sku,
        barcode,
        name,
        description,
        categoryId: categoryId ? parseInt(categoryId) : null,
        purchasePrice: parseFloat(purchasePrice),
        marginPct: parseFloat(marginPct),
        salePrice: computedSalePrice,
        stockQty: parseFloat(stockQty),
        stockMin: parseFloat(stockMin),
        pricingMode: isWeight ? 'WEIGHT' : 'UNIT',
        packageWeightKg: isWeight ? pkgKg : 1,
        supplierId: supplierId ? parseInt(supplierId) : null
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        supplier: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Error al actualizar producto' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    // Verificar si hay ventas asociadas a este producto
    const salesWithProduct = await prisma.saleItem.findMany({
      where: { productId: id }
    })

    if (salesWithProduct.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar el producto porque tiene ventas asociadas' },
        { status: 400 }
      )
    }

    // Eliminar movimientos de stock asociados
    await prisma.stockMovement.deleteMany({
      where: { productId: id }
    })

    // Eliminar el producto
    await prisma.product.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Producto eliminado correctamente' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Error al eliminar producto' },
      { status: 500 }
    )
  }
}
