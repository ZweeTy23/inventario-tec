# 📦 Sistema de Gestión de Inventario Pro (ERP)

[cite_start]Este proyecto es una solución integral para el control de inventarios, diseñada para ofrecer trazabilidad total, análisis de datos en tiempo real y gestión logística avanzada[cite: 70]. [cite_start]Se desarrolla como un sistema tipo ERP con arquitectura escalable[cite: 28, 29].

## 🚀 Estado Inicial del Proyecto
[cite_start]Se ha configurado la estructura base siguiendo un esquema de **Monorepo**[cite: 30, 72].

### Acciones Realizadas:
* [cite_start]**Repositorio:** Inicialización de Git y creación de archivos base[cite: 73].
* **Backend (`/server`):**
    * [cite_start]Entorno de **Node.js** inicializado[cite: 74].
    * [cite_start]**Express.js** instalado como framework de servidor[cite: 75].
    * [cite_start]**Prisma ORM** configurado para la gestión de **PostgreSQL**[cite: 76].
* **Frontend (`/client`):**
    * [cite_start]Proyecto creado con **React + Vite**[cite: 77].
    * [cite_start]Instalación de librerías base: **Lucide-React** (iconos), **Date-fns** (fechas) y **Zustand** (estado global)[cite: 78].

## 🏗️ Arquitectura Técnica Seleccionada
Para cumplir con los módulos de alta complejidad, el sistema implementará:

* [cite_start]**Seguridad:** Autenticación, RBAC (Control de Acceso Basado en Roles) y Bitácora de Auditoría[cite: 1, 2, 79].
* [cite_start]**Logística:** Gestión Multialmacén con mapeo físico jerárquico (Pasillos, Estantes, Niveles)[cite: 5, 80].
* [cite_start]**Inventario:** Soporte para lotes, caducidad (FIFO) y cálculo de costo promedio[cite: 8, 13, 81].
* [cite_start]**Inteligencia:** Dashboards con Análisis ABC y KPIs de rotación en tiempo real[cite: 14, 16, 82].
* [cite_start]**Visualización:** Mapa de calor de ocupación y zonas de alta rotación[cite: 18, 21, 83].

## 🛠️ Stack Tecnológico
| Tecnología | Propósito |
| :--- | :--- |
| **React** | [cite_start]Interfaz de usuario dinámica y dashboard[cite: 84]. |
| **Node.js / Express** | [cite_start]API RESTful y lógica de negocio[cite: 85]. |
| **PostgreSQL** | [cite_start]Base de datos relacional con soporte JSONB[cite: 86]. |
| **Prisma** | [cite_start]Modelado de datos y migraciones seguras[cite: 86]. |
| **Socket.io** | [cite_start]Notificaciones y alertas en tiempo real[cite: 87]. |

---
> [cite_start]**Nota de Desarrollo:** El sistema cuenta con una base sólida para escalar desde un registro simple a una gestión empresarial completa con trazabilidad de auditoría[cite: 87].