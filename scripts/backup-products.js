// Script para hacer backup de los productos antes de convertir
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function backupProducts() {
  try {
    console.log('💾 Creando backup de productos...\n');

    const products = await prisma.product.findMany({
      include: {
        category: true,
        supplier: true
      }
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = `backup-products-${timestamp}.json`;
    
    const backupData = {
      timestamp: new Date().toISOString(),
      totalProducts: products.length,
      products: products.map(product => ({
        id: product.id,
        sku: product.sku,
        barcode: product.barcode,
        name: product.name,
        description: product.description,
        categoryId: product.categoryId,
        purchasePrice: product.purchasePrice,
        marginPct: product.marginPct,
        salePrice: product.salePrice,
        pricingMode: product.pricingMode,
        packageWeightKg: product.packageWeightKg,
        stockQty: product.stockQty,
        stockMin: product.stockMin,
        supplierId: product.supplierId,
        category: product.category,
        supplier: product.supplier,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      }))
    };

    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    
    console.log(`✅ Backup creado: ${backupFile}`);
    console.log(`   Productos respaldados: ${products.length}`);
    console.log(`   Tamaño del archivo: ${(fs.statSync(backupFile).size / 1024).toFixed(2)} KB`);
    
    // También crear un CSV para fácil lectura
    const csvFile = `backup-products-${timestamp}.csv`;
    const csvHeader = 'ID,SKU,Barcode,Name,Description,Category,PurchasePrice,MarginPct,SalePrice,PricingMode,PackageWeightKg,StockQty,StockMin,Supplier,CreatedAt,UpdatedAt\n';
    
    const csvRows = products.map(product => 
      `${product.id},"${product.sku}","${product.barcode || ''}","${product.name}","${product.description || ''}","${product.category?.name || ''}",${product.purchasePrice},${product.marginPct},${product.salePrice},"${product.pricingMode}",${product.packageWeightKg || 1},${product.stockQty},${product.stockMin},"${product.supplier?.name || ''}","${product.createdAt}","${product.updatedAt}"`
    ).join('\n');
    
    fs.writeFileSync(csvFile, csvHeader + csvRows);
    
    console.log(`✅ CSV creado: ${csvFile}`);
    console.log('\n📋 Archivos de backup:');
    console.log(`   JSON: ${backupFile}`);
    console.log(`   CSV:  ${csvFile}`);

  } catch (error) {
    console.error('❌ Error creando backup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar backup
backupProducts();
