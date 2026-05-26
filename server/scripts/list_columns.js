const prisma = require('../db');
(async () => {
  try {
    const cols = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='User'`;
    console.log('User columns:', cols.map(c => c.column_name));
    const colsRole = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='Role'`;
    console.log('Role columns:', colsRole.map(c => c.column_name));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
