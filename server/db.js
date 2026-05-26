// /server/db.js
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const url = process.env.DATABASE_URL || 'postgresql://postgres:Datos2025@127.0.0.1:5432/inventariotec?schema=public';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

module.exports = prisma;