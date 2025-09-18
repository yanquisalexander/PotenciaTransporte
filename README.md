# La Potencia Transporte - Sistema de Gestión

Sistema completo de gestión de transporte desarrollado con Next.js 14+, TypeScript, y PostgreSQL.

## Características

- **Autenticación:** NextAuth.js con roles de admin y chofer
- **Base de Datos:** PostgreSQL con TypeORM
- **UI/UX:** Diseño responsivo basado en el HTML existente con Tailwind CSS y Shadcn/ui
- **Gestión Completa:** CRUD para choferes, proveedores, viajes, liquidaciones y adelantos
- **Multi-moneda:** Soporte para USD, UYU ($), y BRL (R$)
- **Docker:** Configuración lista para producción

## Stack Tecnológico

- **Framework:** Next.js 14+ (App Router)
- **Lenguaje:** TypeScript
- **Styling:** Tailwind CSS, Shadcn/ui
- **Base de Datos:** PostgreSQL (Neon DB recomendado)
- **ORM:** TypeORM
- **Autenticación:** NextAuth.js
- **Contenización:** Docker

## Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/yanquisalexander/PotenciaTransporte.git
cd PotenciaTransporte
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Database
DATABASE_URL="postgresql://username:password@hostname:5432/database_name"

# NextAuth.js
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Configurar la base de datos

Si usas Docker para desarrollo:

```bash
docker-compose up -d db
```

O configura tu instancia de PostgreSQL local/remota.

### 5. Ejecutar migraciones y seed

```bash
npm run seed
```

### 6. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## Usuarios por Defecto

Después de ejecutar el seed:

- **Administrador:** 
  - Usuario: `admin`
  - Contraseña: `admin123`
  
- **Chofer de Ejemplo:**
  - Usuario: `12345678`
  - Contraseña: `driver123`

## Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── api/               # API Routes
│   ├── dashboard/         # Paneles de usuario
│   │   ├── admin/        # Panel de administrador
│   │   └── driver/       # Panel de chofer
│   └── login/            # Página de login
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes base de Shadcn
│   └── providers/        # Providers de contexto
├── entities/             # Entidades de TypeORM
├── lib/                  # Utilidades y configuraciones
└── types/                # Definiciones de tipos
```

## Funcionalidades

### Panel de Administrador (`/dashboard/admin`)
- **Gestión de Choferes:** CRUD completo
- **Gestión de Proveedores:** CRUD completo
- **Gestión de Viajes:** CRUD completo
- **Gestión de Liquidaciones:** Creación y administración
- **Gestión de Adelantos:** CRUD completo
- **Reportes:** Generación dinámica con criterios múltiples

### Panel de Chofer (`/dashboard/driver`)
- **Agregar Viajes:** Creación manual de viajes propios
- **Ver Liquidaciones:** Visualización de liquidaciones asignadas

### Características Técnicas
- **Multi-moneda:** USD, UYU ($), BRL (R$)
- **Cálculo de Toneladas:** Automático (origen - destino) o directo
- **Validaciones:** Estrictas con Zod
- **Responsive:** Diseño adaptativo para móvil y desktop

## Docker

### Desarrollo con Docker

```bash
docker-compose up -d
```

### Producción

```bash
docker build -t potencia-transporte .
docker run -p 3000:3000 potencia-transporte
```

## Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Compilar para producción
- `npm run start` - Servidor de producción
- `npm run lint` - Linter de código
- `npm run seed` - Poblar base de datos con datos iniciales

## Modelo de Datos

### Entidades Principales

1. **Driver** - Choferes del sistema
2. **Provider** - Proveedores de carga
3. **Trip** - Viajes realizados
4. **Liquidation** - Liquidaciones de choferes
5. **Advance** - Adelantos a choferes

### Relaciones

- Un **Trip** pertenece a un **Driver** y un **Provider**
- Una **Liquidation** agrupa múltiples **Trip**s de un **Driver**
- Un **Advance** pertenece a un **Driver** y puede incluirse en una **Liquidation**

## Próximas Funcionalidades

- [ ] Generación de reportes en PDF
- [ ] Exportación a Excel
- [ ] Dashboard con gráficos
- [ ] Notificaciones en tiempo real
- [ ] API para aplicaciones móviles

## Contribución

1. Fork del proyecto
2. Crear rama de feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
