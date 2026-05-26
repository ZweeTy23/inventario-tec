const prisma = require('../db');
(async ()=>{
  try{
    const cats = await prisma.category.findMany();
    console.log('categories count', cats.length);
  }catch(e){
    console.error('err', e.message);
  }finally{process.exit(0);} 
})();