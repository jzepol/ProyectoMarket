# 📋 Guía: SKU vs Código de Barras

## 🎯 **Diferencias Importantes**

### **SKU (Stock Keeping Unit)**
- **Propósito**: Identificación interna del producto
- **Uso**: Gestión de inventario, reportes, administración
- **Formato**: Libre (puedes usar cualquier formato)
- **Ejemplos**:
  - `MANZANA-ROJA-001`
  - `PROD-001`
  - `ABC-123`
  - `LAPTOP-DELL-001`

### **Código de Barras**
- **Propósito**: Escaneo en punto de venta
- **Uso**: Lectura por escáner, POS, inventario físico
- **Formato**: Debe seguir estándares (EAN-13, UPC, etc.)
- **Ejemplos**:
  - `1234567890123` (13 dígitos)
  - `123456789012` (12 dígitos)
  - `1234567890` (10 dígitos)

## ✅ **Mejores Prácticas**

### **SKU**
1. **Sé descriptivo**: `MANZANA-ROJA-GRANDE` es mejor que `MRG001`
2. **Usa separadores**: Guiones o puntos para claridad
3. **Mantén consistencia**: Mismo formato para productos similares
4. **Ejemplos buenos**:
   - `LAPTOP-DELL-INSPIRON-15`
   - `MANZANA-ROJA-GRANDE`
   - `CAMISETA-AZUL-M`

### **Código de Barras**
1. **Sigue estándares**: EAN-13 (13 dígitos) es el más común
2. **Único globalmente**: No debe repetirse nunca
3. **Solo números**: Sin letras ni caracteres especiales
4. **Ejemplos buenos**:
   - `1234567890123`
   - `9876543210987`

## 🔄 **Casos de Uso**

### **Producto Nuevo**
- **SKU**: `MANZANA-ROJA-001`
- **Código de Barras**: `1234567890123`
- **Resultado**: Ambos diferentes, cada uno con su propósito

### **Producto Sin Código de Barras**
- **SKU**: `PROD-INTERNO-001`
- **Código de Barras**: *(vacío)*
- **Resultado**: Solo SKU, código de barras opcional

### **Producto con Código de Barras Existente**
- **SKU**: `LAPTOP-DELL-001`
- **Código de Barras**: `9876543210987` (del fabricante)
- **Resultado**: Usar el código del fabricante

## ⚠️ **Qué NO Hacer**

1. **NO uses el mismo número** para SKU y código de barras
2. **NO uses códigos de barras** con letras o caracteres especiales
3. **NO repitas códigos de barras** entre productos diferentes
4. **NO cambies códigos de barras** de productos ya en venta

## 💡 **Recomendaciones**

1. **SKU obligatorio**: Siempre requerido para identificación interna
2. **Código de barras opcional**: Solo si tienes escáner o POS
3. **Flexibilidad**: Pueden ser completamente diferentes
4. **Escalabilidad**: Planifica el formato desde el inicio

## 🎯 **Ejemplo Práctico**

```
Producto: Manzana Roja Grande
SKU: MANZANA-ROJA-GRANDE-001
Código de Barras: 1234567890123

Producto: Laptop Dell Inspiron 15
SKU: LAPTOP-DELL-INSPIRON-15-001
Código de Barras: 9876543210987

Producto: Camiseta Azul Mediana
SKU: CAMISETA-AZUL-M-001
Código de Barras: (vacío - sin escáner)
```

---

**Conclusión**: Usa SKU para gestión interna y código de barras solo si necesitas escaneo. Pueden ser completamente diferentes y eso está perfecto.
