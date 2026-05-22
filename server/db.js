// /server/db.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  // Prisma 7 permite pasar la URL directo aquí para asegurar que tu servidor use el puerto 5433
  datasourceUrl: 'postgresql://root:password123@localhost:5433/inventario_db?schema=public',
});

module.exports = prisma;