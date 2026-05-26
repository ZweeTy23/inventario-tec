import { defineConfig } from '@prisma/config'

export default defineConfig({
  datasource: {
    // Prefer DATABASE_URL env var (used in local .env). Fallback to the previous local default.
    url: process.env.DATABASE_URL || 'postgresql://root:password123@localhost:5433/inventario_db?schema=public',
  },
})