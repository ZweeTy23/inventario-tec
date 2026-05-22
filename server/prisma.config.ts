import { defineConfig } from '@prisma/config'

export default defineConfig({
  datasource: {
    url: 'postgresql://root:password123@localhost:5433/inventario_db?schema=public',
  },
})