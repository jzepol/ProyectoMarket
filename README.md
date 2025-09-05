# Proyecto Market - Sistema de Gestión de Inventario

Un sistema completo de gestión de inventario y punto de venta desarrollado con Next.js, TypeScript, PostgreSQL y Prisma.

## 🚀 Funcionalidades

### 📦 Módulo de Productos
- ✅ Alta de productos con cálculo automático de precio de venta
- ✅ Edición y eliminación de productos
- ✅ Gestión de stock y stock mínimo
- ✅ Alertas de stock bajo
- ✅ Códigos de barras y SKU únicos

### 📥📤 Movimientos de Stock
- ✅ Registro de entradas y salidas
- ✅ Historial completo por producto
- ✅ Referencias y motivos de movimientos
- ✅ Validación de stock disponible

### 🛒 Punto de Venta (POS)
- ✅ Carrito de compras interactivo
- ✅ Búsqueda por nombre, SKU o código de barras
- ✅ Cálculo automático de totales
- ✅ Registro de ventas con actualización automática de stock

### 📊 Dashboard
- ✅ Estadísticas en tiempo real
- ✅ Productos con stock bajo resaltados
- ✅ Acciones rápidas
- ✅ Navegación intuitiva

### 🗃 Categorías y Proveedores
- ✅ Gestión de categorías de productos
- ✅ Gestión de proveedores
- ✅ Asociación de productos a categorías y proveedores

## 🛠 Tecnologías Utilizadas

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de Datos**: PostgreSQL
- **ORM**: Prisma
- **Iconos**: Lucide React
- **Autenticación**: NextAuth.js (preparado)

## 📋 Requisitos Previos

- Node.js 18+ 
- PostgreSQL
- npm o yarn

## 🔧 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <tu-repositorio>
   cd ProyectoMarket
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp env.example .env.local
   ```
   
   Editar `.env.local` con tus credenciales:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/proyecto_market"
   NEXTAUTH_SECRET="tu-secret-key-aqui"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Configurar la base de datos**
   ```bash
   # Generar el cliente de Prisma
   npx prisma generate
   
   # Crear las tablas en la base de datos
   npx prisma db push
   
   # (Opcional) Abrir Prisma Studio para ver la base de datos
   npx prisma studio
   ```

5. **Ejecutar el proyecto**
   ```bash
   npm run dev
   ```

6. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── api/                    # API Routes
│   │   ├── products/          # Gestión de productos
│   │   ├── categories/        # Gestión de categorías
│   │   ├── suppliers/         # Gestión de proveedores
│   │   ├── movements/         # Movimientos de stock
│   │   └── sales/             # Ventas
│   ├── products/              # Páginas de productos
│   ├── pos/                   # Punto de venta
│   ├── movements/             # Movimientos de stock
│   └── page.tsx               # Dashboard principal
├── lib/
│   └── prisma.ts              # Configuración de Prisma
└── components/                # Componentes reutilizables
```

## 🗄 Esquema de Base de Datos

### Modelos Principales

- **Product**: Productos con precios, stock y categorías
- **Category**: Categorías de productos
- **Supplier**: Proveedores
- **StockMovement**: Movimientos de entrada/salida
- **Sale**: Ventas realizadas
- **SaleItem**: Items de cada venta
- **User**: Usuarios del sistema (preparado para autenticación)

## 🚀 Scripts Disponibles

```bash
npm run dev          # Desarrollo
npm run build        # Construir para producción
npm run start        # Iniciar en producción
npm run lint         # Linter
npm run db:generate  # Generar cliente Prisma
npm run db:push      # Sincronizar esquema con BD
npm run db:studio    # Abrir Prisma Studio
```

## 🔐 Autenticación

El sistema está preparado para implementar autenticación con NextAuth.js. Los modelos de usuario ya están configurados en el esquema de Prisma.

## 📱 Características del Frontend

- **Responsive Design**: Funciona en desktop, tablet y móvil
- **UI Moderna**: Diseño limpio con Tailwind CSS
- **Interactividad**: Estados de carga, validaciones en tiempo real
- **Accesibilidad**: Componentes accesibles y navegación por teclado

## 🔄 Flujo de Trabajo Típico

1. **Configurar categorías y proveedores**
2. **Agregar productos** con precios y stock inicial
3. **Realizar movimientos de stock** (entradas/salidas)
4. **Usar el punto de venta** para vender productos
5. **Monitorear el dashboard** para estadísticas

## 🐛 Solución de Problemas

### Error de conexión a la base de datos
- Verificar que PostgreSQL esté ejecutándose
- Confirmar las credenciales en `.env.local`
- Ejecutar `npx prisma db push` para sincronizar el esquema

### Error de dependencias
- Eliminar `node_modules` y `package-lock.json`
- Ejecutar `npm install` nuevamente

### Error de compilación TypeScript
- Verificar que todas las dependencias estén instaladas
- Ejecutar `npm run build` para ver errores específicos

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Si tienes alguna pregunta o problema, por favor abre un issue en el repositorio.

---

**¡Disfruta usando Proyecto Market! 🎉**

