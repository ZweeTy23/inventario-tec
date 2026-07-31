# Control de Inventarios - Tecnológico de Software

Sistema Enterprise para el control de inventarios, gestión logística de almacén, entradas, salidas, transferencias y análisis financiero. Desarrollado colaborativamente por el equipo de 3 roles operativos: Almacenista, Gerente y Administrador.

---

## Equipo de Desarrollo y Roles del Sistema

El proyecto fue concebido y desarrollado para dar soporte integral a los 3 perfiles principales del almacén:

1. **Almacenista**: Responsable del registro de entradas, salidas, transferencias físicas entre ubicaciones y verificación visual de existencias.
2. **Gerente**: Encargado de la aprobación de movimientos pendientes, monitoreo de métricas operativas, analítica de rotación y valoración financiera.
3. **Administrador**: Gestión global de usuarios, asignación de roles, permisos de acceso y supervisión de la bitácora de auditoría.

---

## Documentación de la API (Swagger / OpenAPI 3.0)

La API cuenta con documentación interactiva con estándares OpenAPI 3.0. Puedes explorar todos los endpoints y ejecutarlos directamente desde el navegador:

- **Swagger UI:** `http://localhost:3000/api/docs` (o `http://localhost:3000/api-docs`)
- **Especificación JSON:** Especificación nativa disponible para importación directa en Postman o Insomnia.

---

## Estándares para Pruebas en Postman

Para realizar pruebas en Postman cumpliendo los estándares de arquitectura RESTful:

1. **Headers Requeridos:**
   - `Content-Type: application/json`
   - `Authorization: Bearer <token_jwt>` (para rutas protegidas)

2. **Autenticación en Postman:**
   - Realizar una petición `POST` a `/api/auth/login` con:
     ```json
     {
       "email": "admin@inventario.com",
       "password": "admin123"
     }
     ```
   - Copiar el `token` de la respuesta y configurarlo en la pestaña **Authorization** (Tipo: `Bearer Token`) en Postman.

3. **Códigos de Estado HTTP Estándar:**
   - `200 OK`: Petición procesada exitosamente.
   - `201 Created`: Recurso creado correctamente.
   - `400 Bad Request`: Datos de entrada inválidos o faltantes (validación Zod).
   - `401 Unauthorized`: Token faltante o expirado.
   - `403 Forbidden`: El usuario no posee los permisos requeridos para la acción.
   - `404 Not Found`: Recurso no encontrado.
   - `500 Internal Server Error`: Error interno del servidor.

---

## Estructura del Proyecto

El repositorio está organizado como un Monorepo desacoplado:

- **Backend (`/server`):** Node.js + Express.js + Prisma ORM + PostgreSQL + Swagger UI.
- **Frontend (`/client`):** React + Vite + Tailwind CSS + Flowbite + Lucide Icons + jsPDF / SheetJS.

---

## Instrucciones de Instalación y Ejecución

### 1. Iniciar Base de Datos con Docker
```bash
docker-compose up -d
```

### 2. Configuración y Ejecución del Backend
```bash
cd server
npm install
npm run db:setup
npm run dev
```

El servidor API iniciará en `http://localhost:3000/api`.

### 3. Ejecución del Frontend
```bash
cd client
npm install
npm run dev
```

El cliente web iniciará en `http://localhost:5173`.
