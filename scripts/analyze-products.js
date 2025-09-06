// Script para analizar productos y mostrar cambios con markup fijo
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// CONFIGURACIÓN: Cambia este valor para el porcentaje de ganancia que quieras aplicar
const MARKUP_PERCENTAGE = 50; // 50% de markup = 50% de ganancia sobre precio de compra

async function analyzeProducts() {
  try {
    console.log(`🔍 Analizando productos con ${MARKUP_PERCENTAGE}% de markup...\n`);

    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        purchasePrice: true,
        marginPct: true,
        salePrice: true,
        pricingMode: true,
        packageWeightKg: true
      }
    });

    console.log(`📦 Encontrados ${products.length} productos para analizar\n`);

    const analysis = [];

    for (const product of products) {
      // Calcular el costo unitario (considerando si es por peso)
      const isWeight = product.pricingMode === 'WEIGHT';
      const pkgKg = isWeight ? (product.packageWeightKg || 1) : 1;
      const purchaseUnitCost = isWeight ? (product.purchasePrice / pkgKg) : product.purchasePrice;
      
      // Calcular el nuevo precio de venta usando markup fijo
      const newSalePrice = Math.round(purchaseUnitCost * (1 + MARKUP_PERCENTAGE / 100));
      
      // Calcular el margen real actual
      const currentMargin = ((product.salePrice - purchaseUnitCost) / product.salePrice) * 100;
      
      // Calcular el nuevo margen real
      const newMargin = ((newSalePrice - purchaseUnitCost) / newSalePrice) * 100;
      
      analysis.push({
        id: product.id,
        name: product.name,
        sku: product.sku,
        purchasePrice: product.purchasePrice,
        purchaseUnitCost: purchaseUnitCost,
        currentMarginPct: product.marginPct,
        currentSalePrice: product.salePrice,
        currentRealMargin: currentMargin,
        newSalePrice: newSalePrice,
        newRealMargin: newMargin,
        difference: newSalePrice - product.salePrice,
        isWeight: isWeight
      });
    }

    // Mostrar análisis detallado
    console.log('📊 ANÁLISIS DETALLADO:');
    console.log('='.repeat(100));
    console.log('PRODUCTO'.padEnd(25) + '| COMPRA | ACTUAL | NUEVO  | DIFERENCIA | MARGEN ACTUAL | MARGEN NUEVO');
    console.log('='.repeat(100));
    
    let totalDifference = 0;
    let totalCurrentValue = 0;
    let totalNewValue = 0;
    
    analysis.forEach(item => {
      const name = item.name.length > 24 ? item.name.substring(0, 21) + '...' : item.name;
      console.log(
        name.padEnd(25) + '| ' +
        `$${item.purchaseUnitCost.toFixed(0)}`.padStart(6) + ' | ' +
        `$${item.currentSalePrice}`.padStart(6) + ' | ' +
        `$${item.newSalePrice}`.padStart(5) + ' | ' +
        `${item.difference >= 0 ? '+' : ''}$${item.difference}`.padStart(9) + ' | ' +
        `${item.currentRealMargin.toFixed(1)}%`.padStart(12) + ' | ' +
        `${item.newRealMargin.toFixed(1)}%`
      );
      
      totalDifference += item.difference;
      totalCurrentValue += item.currentSalePrice;
      totalNewValue += item.newSalePrice;
    });
    
    console.log('='.repeat(100));
    console.log(`Total productos: ${analysis.length}`);
    console.log(`Valor total actual: $${totalCurrentValue.toFixed(2)}`);
    console.log(`Valor total nuevo: $${totalNewValue.toFixed(2)}`);
    console.log(`Diferencia total: $${totalDifference.toFixed(2)}`);
    console.log(`Promedio de cambio: $${(totalDifference / analysis.length).toFixed(2)} por producto`);
    
    // Estadísticas adicionales
    const increased = analysis.filter(item => item.difference > 0).length;
    const decreased = analysis.filter(item => item.difference < 0).length;
    const unchanged = analysis.filter(item => item.difference === 0).length;
    
    console.log('\n📈 ESTADÍSTICAS:');
    console.log(`   Productos que aumentan: ${increased}`);
    console.log(`   Productos que disminuyen: ${decreased}`);
    console.log(`   Productos sin cambio: ${unchanged}`);
    
    console.log('\n⚠️  IMPORTANTE:');
    console.log('   Este análisis NO modifica la base de datos.');
    console.log('   Para aplicar los cambios, ejecuta: node update-prices.js');
    console.log('   Asegúrate de haber hecho backup antes de continuar.');

  } catch (error) {
    console.error('❌ Error durante el análisis:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el análisis
analyzeProducts();
