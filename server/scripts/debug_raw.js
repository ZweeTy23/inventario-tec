const prisma = require('../db');

(async ()=>{
  try{
    const email = 'e2e.tester@example.local';
    console.log('testing public direct param query');
    const rows = await prisma.$queryRaw`SELECT * FROM "User" WHERE email = ${email} LIMIT 1`;
    console.log('rows:', rows);

    console.log('testing unsafe param with $1');
    const rows2 = await prisma.$queryRawUnsafe('SELECT * FROM "public"."User" WHERE email = $1 LIMIT 1', email);
    console.log('rows2:', rows2);
  }catch(e){
    console.error('debug failed', e);
  }finally{
    process.exit(0);
  }
})();