const prisma = require('../db');

(async () => {
  try {
    const res = await prisma.$queryRaw`SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog','information_schema') ORDER BY table_schema, table_name`;
    console.log(JSON.stringify(res, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
