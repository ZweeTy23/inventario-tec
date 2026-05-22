# 📦 Sistema de Gestión de Inventario (ERP)

Este proyecto es una solución integral para el control de inventarios, diseñada para ofrecer trazabilidad total, análisis de datos en tiempo real y gestión logística avanzada. Se desarrolla como un sistema tipo ERP bajo una arquitectura escalable y moderna.

---

## 🚀 Estado Actual del Proyecto

El repositorio está configurado siguiendo un esquema de **Monorepo** para mantener el desacoplamiento de componentes de manera limpia:

* **Backend (`/server`):**
  * [cite_start]Entorno de **Node.js** y **Express.js** inicializado para la API REST[cite: 30].
  * [cite_start]**Prisma ORM** configurado para interactuar con la base de datos[cite: 30].
  * [cite_start]Endpoints base de autenticación listos para migrar de simulación en memoria a persistencia real[cite: 137, 139].
* **Frontend (`/client`):**
  * [cite_start]Proyecto creado y optimizado con **React + Vite**[cite: 30].
  * [cite_start]Instalación de librerías base completada: **Lucide-React** (iconografía), **Date-fns** (procesamiento de fechas) y **Zustand** (gestor de estado global)[cite: 31].

---

## 🏗️ Arquitectura Técnica y Módulos

Para cumplir con los altos estándares y requerimientos del sistema, implementaremos:

* [cite_start]**Seguridad Avanzada:** Autenticación robusta (JWT), Control de Acceso Basado en Roles (RBAC) con permisos granulares y Bitácora de Auditoría dedicada para cambios críticos[cite: 31].
* [cite_start]**Gestión Logística Completa:** Mapeo físico jerárquico del almacén (Almacén ➔ Zona ➔ Pasillo ➔ Estante ➔ Nivel) con soporte multialmacén[cite: 32].
* [cite_start]**Lógica de Stock Inteligente:** Soporte para mermas, lotes, fechas de caducidad aplicando lógica FIFO y recálculo financiero de costo promedio ponderado[cite: 32].
* [cite_start]**Analítica Empresarial:** Dashboard interactivo con Análisis ABC automático y KPIs de rotación y proyección de desabastecimiento en tiempo real[cite: 32].
* [cite_start]**Visualización Espacial:** Renderizado gráfico de ocupación mediante mapas de calor dinámicos sobre la infraestructura de almacenamiento[cite: 32].

---

## 🛠️ Stack Tecnológico

| Tecnología | Propósito |
| :--- | :--- |
| **React** | [cite_start]Interfaz de usuario dinámica, vistas interactivas y dashboard[cite: 32]. |
| **Node.js / Express** | [cite_start]API RESTful ágil, middlewares de seguridad y lógica de negocio[cite: 32]. |
| **PostgreSQL** | [cite_start]Base de datos relacional robusta con soporte JSONB para variantes dinámicas[cite: 32]. |
| **Prisma** | [cite_start]Modelado de datos, tipado estricto y control automatizado de migraciones[cite: 32]. |
| **Socket.io** | [cite_start]Canal de alertas y notificaciones críticas en tiempo real[cite: 32]. |

---

## 👥 Instrucciones de Configuración para el Equipo

> [cite_start]⚠️ **IMPORTANTE (Leer antes de arrancar):** Debido a que el puerto estándar de PostgreSQL (`5432`) suele causar conflictos con servicios fantasmas o instalaciones nativas previas en entornos Windows, **hemos configurado por defecto el puerto 5433** para el mapeo local[cite: 429]. [cite_start]No modifiques esto para asegurar la interoperabilidad con los compañeros[cite: 429].

### Pasos para iniciar el entorno local:

Si acabas de clonar el proyecto o descargar los últimos cambios de GitHub, ejecuta las siguientes instrucciones en tu terminal de Visual Studio Code:

#### 1. Instalación de dependencias del Servidor
Ve a la carpeta del backend e instala los paquetes necesarios (Express, Prisma, JWT, etc.):
```bash
cd server
npm install

cd ../client
npm install

crea el .env en el archivo server e inserta los datos
PORT=5000
JWT_SECRET=tu_clave_secreta_aqui
DATABASE_URL=postgresql://root:password123@localhost:5433/inventario_db?schema=public

regrese a la raiz del proyecto y corre
docker compose up -d

cuando el docker este activado corre
cd server
npx prisma migrate dev

cuando ya este listo todo corre npm run dev en el cliente y servidor
