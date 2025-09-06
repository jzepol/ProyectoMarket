// Script para verificar que todos los productos tengan el porcentaje de ganancia correcto
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// CONFIGURACIÓN: El porcentaje de ganancia esperado (markup)
const EXPECTED_GAIN_PERCENTAGE = 50; // 50% de markup = 50% de ganancia sobre precio de compra

async function verifyPrices() {
  try {
    console.log(`🔍 Verificando que todos los productos tengan ${EXPECTED_GAIN_PERCENTAGE}% de ganancia...\n`);

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

    console.log(`📦 Verificando ${products.length} productos\n`);

    let correct = 0;
    let incorrect = 0;
    const issues = [];

    console.log('📊 VERIFICACIÓN DETALLADA:');
    console.log('='.repeat(80));
    console.log('PRODUCTO'.padEnd(25) + '| COMPRA | VENTA | GANANCIA | %GANANCIA | ESTADO');
    console.log('='.repeat(80));

    for (const product of products) {
      // Calcular costo unitario
      const isWeight = product.pricingMode === 'WEIGHT';
      const pkgKg = isWeight ? (product.packageWeightKg || 1) : 1;
      const purchaseUnitCost = isWeight ? (product.purchasePrice / pkgKg) : product.purchasePrice;
      
      // Calcular ganancia real
      const gain = product.salePrice - purchaseUnitCost;
      const gainPercentage = (gain / purchaseUnitCost) * 100;
      
      // Verificar si está correcto (con tolerancia de 0.1%)
      const isCorrect = Math.abs(gainPercentage - EXPECTED_GAIN_PERCENTAGE) < 0.1;
      
      if (isCorrect) {
        correct++;
      } else {
        incorrect++;
        issues.push({
          name: product.name,
          sku: product.sku,
          expected: EXPECTED_GAIN_PERCENTAGE,
          actual: gainPercentage,
          purchasePrice: purchaseUnitCost,
          salePrice: product.salePrice,
          marginPct: product.marginPct
        });
      }

      const name = product.name.length > 24 ? product.name.substring(0, 21) + '...' : product.name;
      const status = isCorrect ? '✅ OK' : '❌ ERROR';
      
      console.log(
        name.padEnd(25) + '| ' +
        `$${purchaseUnitCost.toFixed(0)}`.padStart(6) + ' | ' +
        `$${product.salePrice}`.padStart(5) + ' | ' +
        `$${gain.toFixed(0)}`.padStart(7) + ' | ' +
        `${gainPercentage.toFixed(1)}%`.padStart(8) + ' | ' +
        status
      );
    }

    console.log('='.repeat(80));
    console.log(`\n📈 RESULTADOS:`);
    console.log(`   Productos correctos: ${correct}`);
    console.log(`   Productos con error: ${incorrect}`);
    console.log(`   Total productos: ${products.length}`);

    if (incorrect > 0) {
      console.log(`\n❌ PRODUCTOS CON PROBLEMAS:`);
      issues.forEach(issue => {
        console.log(`   ${issue.name} (SKU: ${issue.sku})`);
        console.log(`     Esperado: ${issue.expected}% de ganancia`);
        console.log(`     Actual: ${issue.actual.toFixed(1)}% de ganancia`);
        console.log(`     Precio de compra: $${issue.purchasePrice.toFixed(2)}`);
        console.log(`     Precio de venta: $${issue.salePrice}`);
        console.log(`     Campo marginPct: ${issue.marginPct}%`);
        console.log('');
      });
      
      console.log('🔧 SOLUCIÓN:');
      console.log('   Ejecuta: node scripts/update-prices.js');
      console.log('   Esto corregirá los precios y el campo marginPct');
    } else {
      console.log('\n✅ ¡PERFECTO! Todos los productos tienen el porcentaje de ganancia correcto.');
      console.log(`   Todos los productos tienen exactamente ${EXPECTED_GAIN_PERCENTAGE}% de ganancia sobre el precio de compra.`);
    }

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar verificación
verifyPrices();
