# 📋 Guía: Conversión a Sistema de Markup

Esta carpeta contiene scripts para convertir tus productos al sistema de **markup** con un porcentaje fijo de ganancia.

## 🎯 **Objetivo**
Convertir todos los productos para que usen **50% de markup** (50% de ganancia sobre el precio de compra).

## 📁 **Archivos Incluidos**

- `backup-products.js` - Crea backup de seguridad
- `analyze-products.js` - Analiza cambios sin modificar datos
- `update-prices.js` - Aplica los cambios a la base de datos
- `README.md` - Esta guía

## 🚀 **Guía Paso a Paso**

### **Paso 1: Preparación**
```bash
# Asegúrate de estar en la raíz del proyecto
cd C:\Users\Micaela\Documents\ProyectoMarket\ProyectoMarket

# Verifica que la base de datos esté funcionando
npm run dev
```

### **Paso 2: Backup de Seguridad** ⚠️ **OBLIGATORIO**
```bash
node scripts/backup-products.js
```
**Resultado esperado:**
```
💾 Creando backup de productos...
✅ Backup creado: backup-products-2025-01-09T18-30-00-000Z.json
✅ CSV creado: backup-products-2025-01-09T18-30-00-000Z.csv
```

### **Paso 3: Análisis de Cambios** 🔍
```bash
node scripts/analyze-products.js
```
**Resultado esperado:**
```
🔍 Analizando productos con 50% de markup...
📦 Encontrados 5 productos para analizar

📊 ANÁLISIS DETALLADO:
PRODUCTO                 | COMPRA | ACTUAL | NUEVO  | DIFERENCIA | MARGEN ACTUAL | MARGEN NUEVO
Coca 1.5l               |  $1000 |  $2000 |  $1500 |     -$500 |        50.0% |        33.3%
Pan                      |  $7000 | $14000 | $10500 |    -$3500 |        50.0% |        33.3%
```

### **Paso 4: Aplicar Cambios** ⚡
```bash
node scripts/update-prices.js
```
**Resultado esperado:**
```
🚀 Actualizando precios con 50% de markup...
📝 PROCESANDO PRODUCTOS:
✅ Coca 1.5l: $2000 → $1500 (-$500)
✅ Pan: $14000 → $10500 (-$3500)

🎉 ACTUALIZACIÓN COMPLETADA:
   Productos actualizados: 5
   Diferencia total: -$4000.00
   Markup aplicado: 50%
```

### **Paso 5: Verificación** ✅
1. Abre tu aplicación: `npm run dev`
2. Ve a la página de productos
3. Verifica que los precios se vean correctos
4. Prueba crear un nuevo producto para confirmar que el sistema funciona

## ⚙️ **Configuración**

### **Cambiar el Porcentaje de Markup**
Si quieres usar un porcentaje diferente al 50%, edita estos archivos:

**En `analyze-products.js` (línea 8):**
```javascript
const MARKUP_PERCENTAGE = 30; // Cambia a 30% por ejemplo
```

**En `update-prices.js` (línea 8):**
```javascript
const MARKUP_PERCENTAGE = 30; // Cambia a 30% por ejemplo
```

### **Ejemplos de Porcentajes Comunes:**
- `25` = 25% de markup
- `30` = 30% de markup  
- `50` = 50% de markup (actual)
- `75` = 75% de markup
- `100` = 100% de markup (precio doble)

## 📊 **Fórmula de Markup**

**Precio de Venta = Precio de Compra × (1 + Markup%)**

**Ejemplos con 50% de markup:**
- Precio de compra: $1000 → Precio de venta: $1500 (ganancia: $500 = 50%)
- Precio de compra: $500 → Precio de venta: $750 (ganancia: $250 = 50%)
- Precio de compra: $2000 → Precio de venta: $3000 (ganancia: $1000 = 50%)

## 🔍 **¿Qué es Markup?**

**Markup** = Porcentaje de ganancia sobre el precio de compra

- **50% de markup** = 50% de ganancia sobre el precio de compra
- **Fórmula**: Precio de Venta = Precio de Compra × 1.5
- **Ejemplo**: Si compras a $1000, vendes a $1500 (ganancia de $500)

## ⚠️ **Importante**

1. **SIEMPRE haz backup primero** - Los datos son valiosos
2. **Revisa el análisis** - Asegúrate de que los cambios sean correctos
3. **Verifica después** - Comprueba que todo funcione bien
4. **Los archivos de backup** se crean en la carpeta `scripts/`

## 🆘 **Si Algo Sale Mal**

### **Restaurar desde Backup:**
```bash
# Si tienes el archivo JSON de backup, puedes restaurar manualmente
# Contacta al desarrollador para ayuda con la restauración
```

### **Verificar Estado:**
```bash
# Ejecuta el análisis para ver el estado actual
node scripts/analyze-products.js
```

## 📞 **Soporte**

Si encuentras algún problema:
1. Revisa los mensajes de error en la consola
2. Verifica que la base de datos esté funcionando
3. Asegúrate de tener permisos de escritura en la carpeta

## 📝 **Resumen del Sistema**

Tu aplicación ahora usa **markup** en lugar de margen:

- ✅ **Campo en BD**: `marginPct` (aunque el nombre sea confuso)
- ✅ **Fórmula aplicada**: `Precio de Venta = Precio de Compra × (1 + Markup%)`
- ✅ **Resultado**: Porcentaje de ganancia sobre el precio de compra
- ✅ **Ejemplo**: 50% de markup = 50% de ganancia sobre $1000 = $500 de ganancia

---

**¡Listo! Con estos pasos tendrás todos tus productos usando el sistema de markup con 50% de ganancia sobre el precio de compra.**
