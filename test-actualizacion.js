#!/usr/bin/env node

/**
 * Script de prueba para verificar la actualización de datos en tiempo real
 * 
 * Uso: node test-actualizacion.js
 * 
 * Este script simula ventas y verifica que los datos se actualicen
 */

const BASE_URL = 'http://localhost:3000'

async function testAPI(endpoint, description) {
  try {
    console.log(`\n🔍 Probando: ${description}`)
    
    const response = await fetch(`${BASE_URL}${endpoint}?t=${Date.now()}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // Verificar headers anti-caché
    const cacheControl = response.headers.get('cache-control')
    const pragma = response.headers.get('pragma')
    const expires = response.headers.get('expires')
    
    console.log(`✅ ${description} - OK`)
    console.log(`   Cache-Control: ${cacheControl}`)
    console.log(`   Pragma: ${pragma}`)
    console.log(`   Expires: ${expires}`)
    
    if (endpoint === '/api/dashboard') {
      console.log(`   Productos con stock bajo: ${data.lowStockProducts}`)
      console.log(`   Ventas de hoy: ${data.totalSales}`)
      console.log(`   Ingresos de hoy: $${data.totalRevenue}`)
    }
    
    if (endpoint === '/api/stats') {
      console.log(`   Total productos: ${data.totalProducts}`)
      console.log(`   Total ventas: ${data.totalSales}`)
      console.log(`   Total movimientos: ${data.totalMovements}`)
    }
    
    return data
  } catch (error) {
    console.error(`❌ Error en ${description}:`, error.message)
    return null
  }
}

async function testSale() {
  try {
    console.log('\n🛒 Probando creación de venta...')
    
    // Obtener productos disponibles
    const productsResponse = await fetch(`${BASE_URL}/api/products?t=${Date.now()}`)
    const products = await productsResponse.json()
    
    if (!products || products.length === 0) {
      console.log('⚠️  No hay productos disponibles para probar ventas')
      return
    }
    
    const product = products[0]
    console.log(`   Producto seleccionado: ${product.name} (Stock: ${product.stockQty})`)
    
    // Crear una venta de prueba
    const saleData = {
      total: product.salePrice,
      items: [{
        productId: product.id,
        qty: 1,
        price: product.salePrice
      }]
    }
    
    const saleResponse = await fetch(`${BASE_URL}/api/sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(saleData)
    })
    
    if (saleResponse.ok) {
      const sale = await saleResponse.json()
      console.log(`✅ Venta creada exitosamente - ID: ${sale.id}`)
      return sale.id
    } else {
      const error = await saleResponse.json()
      console.log(`⚠️  No se pudo crear venta: ${error.error}`)
      return null
    }
  } catch (error) {
    console.error('❌ Error creando venta:', error.message)
    return null
  }
}

async function testDataUpdate() {
  try {
    console.log('\n📊 Probando actualización de datos...')
    
    // Obtener datos iniciales
    console.log('\n📈 Datos iniciales:')
    const initialDashboard = await testAPI('/api/dashboard', 'Dashboard inicial')
    const initialStats = await testAPI('/api/stats', 'Estadísticas iniciales')
    
    if (!initialDashboard || !initialStats) {
      console.log('⚠️  No se pudieron obtener datos iniciales')
      return
    }
    
    // Crear una venta
    const saleId = await testSale()
    
    if (!saleId) {
      console.log('⚠️  No se pudo crear venta de prueba')
      return
    }
    
    // Esperar un momento para que se procese la venta
    console.log('\n⏳ Esperando 2 segundos para procesar la venta...')
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Verificar que los datos se hayan actualizado
    console.log('\n📈 Datos después de la venta:')
    const updatedDashboard = await testAPI('/api/dashboard', 'Dashboard actualizado')
    const updatedStats = await testAPI('/api/stats', 'Estadísticas actualizadas')
    
    if (updatedDashboard && updatedStats) {
      // Comparar datos
      const salesDiff = updatedDashboard.totalSales - initialDashboard.totalSales
      const revenueDiff = updatedDashboard.totalRevenue - initialDashboard.totalRevenue
      
      console.log('\n📊 Comparación de datos:')
      console.log(`   Ventas: ${initialDashboard.totalSales} → ${updatedDashboard.totalSales} (${salesDiff > 0 ? '+' : ''}${salesDiff})`)
      console.log(`   Ingresos: $${initialDashboard.totalRevenue} → $${updatedDashboard.totalRevenue} (${revenueDiff > 0 ? '+' : ''}$${revenueDiff})`)
      
      if (salesDiff > 0 && revenueDiff > 0) {
        console.log('\n🎉 ¡Prueba exitosa! Los datos se actualizaron correctamente.')
      } else {
        console.log('\n⚠️  Los datos no se actualizaron como se esperaba.')
      }
    }
    
  } catch (error) {
    console.error('❌ Error en prueba de actualización:', error.message)
  }
}

async function runTests() {
  console.log('🚀 Iniciando pruebas de actualización de datos...')
  console.log(`📍 URL base: ${BASE_URL}`)
  
  try {
    // Probar APIs individuales
    await testAPI('/api/dashboard', 'API Dashboard')
    await testAPI('/api/stats', 'API Estadísticas')
    await testAPI('/api/movements', 'API Movimientos')
    await testAPI('/api/products', 'API Productos')
    
    // Probar actualización de datos
    await testDataUpdate()
    
    console.log('\n✨ Pruebas completadas.')
    
  } catch (error) {
    console.error('❌ Error ejecutando pruebas:', error.message)
  }
}

// Ejecutar pruebas si el script se ejecuta directamente
if (require.main === module) {
  runTests().catch(console.error)
}

module.exports = { runTests, testAPI, testSale, testDataUpdate }
