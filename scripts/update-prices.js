// Script para actualizar precios de venta con markup fijo
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// CONFIGURACIÓN: Cambia este valor para el porcentaje de ganancia que quieras aplicar
const MARKUP_PERCENTAGE = 50; // 50% de markup = 50% de ganancia sobre precio de compra

async function updatePrices() {
  try {
    console.log(`🚀 Actualizando precios con ${MARKUP_PERCENTAGE}% de markup...\n`);

    const products = await prisma.product.findMany();

    let updated = 0;
    let unchanged = 0;
    let totalDifference = 0;

    console.log('📝 PROCESANDO PRODUCTOS:');
    console.log('-'.repeat(60));

    for (const product of products) {
      // Calcular costo unitario
      const isWeight = product.pricingMode === 'WEIGHT';
      const pkgKg = isWeight ? (product.packageWeightKg || 1) : 1;
      const purchaseUnitCost = isWeight ? (product.purchasePrice / pkgKg) : product.purchasePrice;
      
      // Calcular nuevo precio con markup fijo
      const newSalePrice = Math.round(purchaseUnitCost * (1 + MARKUP_PERCENTAGE / 100));
      
      // Solo actualizar si hay diferencia
      if (newSalePrice !== product.salePrice) {
        await prisma.product.update({
          where: { id: product.id },
          data: { 
            salePrice: newSalePrice,
            marginPct: MARKUP_PERCENTAGE // Actualizar el campo marginPct con el nuevo porcentaje de ganancia
          }
        });
        
        const difference = newSalePrice - product.salePrice;
        totalDifference += difference;
        updated++;
        
        console.log(`✅ ${product.name}: $${product.salePrice} → $${newSalePrice} (${difference >= 0 ? '+' : ''}$${difference})`);
      } else {
        unchanged++;
        console.log(`➖ ${product.name}: Sin cambios ($${product.salePrice})`);
      }
    }

    console.log('-'.repeat(60));
    console.log(`\n🎉 ACTUALIZACIÓN COMPLETADA:`);
    console.log(`   Productos actualizados: ${updated}`);
    console.log(`   Productos sin cambios: ${unchanged}`);
    console.log(`   Total productos procesados: ${products.length}`);
    console.log(`   Diferencia total: $${totalDifference.toFixed(2)}`);
    console.log(`   Markup aplicado: ${MARKUP_PERCENTAGE}%`);

    if (updated > 0) {
      console.log('\n✅ Todos los precios han sido actualizados exitosamente.');
      console.log('   Los productos ahora usan la fórmula de markup.');
    } else {
      console.log('\nℹ️  No se encontraron productos que necesiten actualización.');
    }

  } catch (error) {
    console.error('❌ Error durante la actualización:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar actualización
updatePrices();
