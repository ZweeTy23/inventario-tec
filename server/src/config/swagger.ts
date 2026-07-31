export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Control de Inventarios - Tecnológico de Software",
    version: "1.0.0",
    description:
      "API RESTful Enterprise para la gestión integral de almacén, catálogo de productos, control de existencias por ubicaciones/lotes, entradas, salidas, transferencias y módulo de reportes financieros. Desarrollado por el equipo de 3 roles operativos: Almacenista, Gerente y Administrador.",
    contact: {
      name: "Tecnológico de Software",
      email: "soporte@tecnologicodesoftware.com",
    },
  },
  servers: [
    {
      url: "http://localhost:3000/api",
      description: "Servidor de Desarrollo Local",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Ingrese el token JWT obtenido en /api/auth/login",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Descripción del error ocurrido" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", example: "admin@inventario.com" },
          password: { type: "string", example: "admin123" },
        },
      },
      LoginResponse: {
        type: "object",
        properties: {
          token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR..." },
          user: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              name: { type: "string", example: "Super Admin" },
              email: { type: "string", example: "admin@inventario.com" },
              role: {
                type: "object",
                properties: {
                  name: { type: "string", example: "SUPER_ADMIN" },
                },
              },
            },
          },
        },
      },
      Product: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "Teclado Mecánico RGB" },
          sku: { type: "string", example: "SKU-KEY-001" },
          categoryId: { type: "string", format: "uuid" },
          supplierId: { type: "string", format: "uuid" },
          basePrice: { type: "number", example: 49.99 },
          averageCost: { type: "number", example: 35.00 },
          minStockAlert: { type: "integer", example: 5 },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      CreateProductRequest: {
        type: "object",
        required: ["name", "sku", "categoryId", "supplierId", "basePrice"],
        properties: {
          name: { type: "string", example: "Teclado Mecánico RGB" },
          sku: { type: "string", example: "SKU-KEY-001" },
          categoryId: { type: "string", format: "uuid" },
          supplierId: { type: "string", format: "uuid" },
          basePrice: { type: "number", example: 49.99 },
          minStockAlert: { type: "integer", example: 5 },
        },
      },
      Movement: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          productId: { type: "string", format: "uuid" },
          userId: { type: "string", format: "uuid" },
          sourceLocationId: { type: "string", format: "uuid", nullable: true },
          destinationLocationId: { type: "string", format: "uuid", nullable: true },
          quantity: { type: "integer", example: 10 },
          movementType: {
            type: "string",
            enum: ["PURCHASE_ENTRY", "RETURN_ENTRY", "SALE_EXIT", "LOSS_EXIT", "EXPIRED_EXIT", "TRANSFER"],
          },
          status: { type: "string", enum: ["PENDING", "APPROVED", "REJECTED"] },
          unitCost: { type: "number", example: 25.5 },
          batchNumber: { type: "string", example: "LOT-2026-001" },
          notes: { type: "string", example: "Entrada por orden de compra 4021" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      CreateMovementRequest: {
        type: "object",
        required: ["productId", "quantity", "movementType"],
        properties: {
          productId: { type: "string", format: "uuid" },
          movementType: {
            type: "string",
            enum: ["PURCHASE_ENTRY", "RETURN_ENTRY", "SALE_EXIT", "LOSS_EXIT", "EXPIRED_EXIT", "TRANSFER"],
          },
          quantity: { type: "integer", example: 10 },
          sourceLocationId: { type: "string", format: "uuid" },
          destinationLocationId: { type: "string", format: "uuid" },
          unitCost: { type: "number", example: 25.5 },
          batchNumber: { type: "string", example: "LOT-2026-001" },
          notes: { type: "string", example: "Entrada por compra de almacén" },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  paths: {
    "/auth/login": {
      post: {
        tags: ["Autenticación"],
        summary: "Iniciar sesión de usuario",
        description: "Autentica al usuario (Almacenista, Gerente o Administrador) y devuelve el token JWT.",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Inicio de sesión exitoso",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginResponse" },
              },
            },
          },
          "401": {
            description: "Credenciales inválidas",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Autenticación"],
        summary: "Obtener perfil de usuario autenticado",
        responses: {
          "200": { description: "Perfil del usuario con sus permisos asignados" },
          "401": { description: "No autorizado" },
        },
      },
    },
    "/products": {
      get: {
        tags: ["Catálogo de Productos"],
        summary: "Listar catálogo de productos",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "perPage", in: "query", schema: { type: "integer", default: 20 } },
          { name: "q", in: "query", schema: { type: "string" }, description: "Búsqueda en tiempo real por nombre o SKU" },
          { name: "categoryId", in: "query", schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Lista paginada de productos" },
        },
      },
      post: {
        tags: ["Catálogo de Productos"],
        summary: "Crear nuevo producto",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateProductRequest" },
            },
          },
        },
        responses: {
          "201": { description: "Producto creado exitosamente" },
        },
      },
    },
    "/products/{id}": {
      get: {
        tags: ["Catálogo de Productos"],
        summary: "Obtener detalle de un producto",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Detalle del producto" } },
      },
      patch: {
        tags: ["Catálogo de Productos"],
        summary: "Actualizar datos de un producto",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Producto actualizado" } },
      },
      delete: {
        tags: ["Catálogo de Productos"],
        summary: "Eliminar un producto (soft delete)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Producto eliminado" } },
      },
    },
    "/categories": {
      get: {
        tags: ["Categorías"],
        summary: "Listar categorías de productos",
        responses: { "200": { description: "Lista de categorías" } },
      },
      post: {
        tags: ["Categorías"],
        summary: "Crear nueva categoría",
        responses: { "201": { description: "Categoría creada" } },
      },
    },
    "/suppliers": {
      get: {
        tags: ["Proveedores"],
        summary: "Listar proveedores registrados",
        responses: { "200": { description: "Lista de proveedores" } },
      },
      post: {
        tags: ["Proveedores"],
        summary: "Registrar nuevo proveedor",
        responses: { "201": { description: "Proveedor registrado" } },
      },
    },
    "/locations": {
      get: {
        tags: ["Almacenes y Ubicaciones"],
        summary: "Listar estructura de almacén y ubicaciones multilevel",
        responses: { "200": { description: "Ubicaciones del almacén" } },
      },
      post: {
        tags: ["Almacenes y Ubicaciones"],
        summary: "Crear nueva ubicación en almacén",
        responses: { "201": { description: "Ubicación creada" } },
      },
    },
    "/stock-levels": {
      get: {
        tags: ["Control de Stock"],
        summary: "Listar niveles de stock por ubicación y lotes de vencimiento",
        responses: { "200": { description: "Existencias detalladas" } },
      },
    },
    "/movements": {
      get: {
        tags: ["Entradas y Salidas"],
        summary: "Listar historial de movimientos de inventario",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "movementType", in: "query", schema: { type: "string" } },
          { name: "status", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "Historial de movimientos" } },
      },
      post: {
        tags: ["Entradas y Salidas"],
        summary: "Registrar nueva entrada, salida o transferencia",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateMovementRequest" },
            },
          },
        },
        responses: { "201": { description: "Movimiento registrado" } },
      },
    },
    "/movements/{id}/approve": {
      post: {
        tags: ["Entradas y Salidas"],
        summary: "Aprobar un movimiento de almacén pendiente (Requiere rol Gerente/Admin)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Movimiento aprobado e inventario actualizado" } },
      },
    },
    "/reports/valuation": {
      get: {
        tags: ["Módulo de Reportes"],
        summary: "Obtener reporte de valoración de inventario (Precio Base y Costo Promedio)",
        responses: { "200": { description: "Resumen financiero de valoración" } },
      },
    },
    "/reports/movements-summary": {
      get: {
        tags: ["Módulo de Reportes"],
        summary: "Obtener reporte consolidado de entradas, salidas y montos por tipo",
        parameters: [
          { name: "startDate", in: "query", schema: { type: "string", format: "date" } },
          { name: "endDate", in: "query", schema: { type: "string", format: "date" } },
          { name: "movementType", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "Consolidado de movimientos" } },
      },
    },
    "/reports/low-stock": {
      get: {
        tags: ["Módulo de Reportes"],
        summary: "Obtener reporte de productos con stock crítico y reposiciones pendientes",
        responses: { "200": { description: "Alertas de existencias" } },
      },
    },
    "/reports/suppliers": {
      get: {
        tags: ["Módulo de Reportes"],
        summary: "Obtener reporte de rendimiento e inventario agrupado por proveedor",
        responses: { "200": { description: "Reporte de proveedores" } },
      },
    },
    "/audit-logs": {
      get: {
        tags: ["Auditoría"],
        summary: "Consultar log de auditoría (Registro de quién realizó cada cambio)",
        responses: { "200": { description: "Bitácora de auditoría del sistema" } },
      },
    },
    "/dashboard/stats": {
      get: {
        tags: ["Dashboard Operativo"],
        summary: "Obtener estadísticas en tiempo real del panel de control",
        responses: { "200": { description: "Estadísticas globales" } },
      },
    },
    "/users": {
      get: {
        tags: ["Administración de Usuarios y Roles"],
        summary: "Listar usuarios del sistema",
        responses: { "200": { description: "Lista de usuarios y sus roles asignados" } },
      },
    },
    "/roles": {
      get: {
        tags: ["Administración de Usuarios y Roles"],
        summary: "Listar roles del sistema (Almacenista, Gerente, Admin)",
        responses: { "200": { description: "Lista de roles" } },
      },
    },
  },
};
