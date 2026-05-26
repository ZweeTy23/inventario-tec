// CommonJS-compatible helper to lazily initialize the Prisma client (ESM generated client)
const { PrismaPg } = require('@prisma/adapter-pg');
let cached = null;

async function getPrisma() {
  if (cached) return cached;
  // Import the published Prisma client package which is JS-compatible
  const mod = await import('@prisma/client');
  const PrismaClient = mod.PrismaClient;
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  cached = prisma;
  return prisma;
}

module.exports = { getPrisma };
