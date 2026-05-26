(async ()=>{
  const base = 'http://localhost:3000';
  const loginRes = await fetch(base + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@inventory.com', password: 'Admin123*' }),
  });
  const login = await loginRes.json();
  const token = login?.data?.token || login?.token;
  console.log('TOKEN:' + (token || JSON.stringify(login)));

  const authHeader = { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' };

  // Create category
  const catRes = await fetch(base + '/api/categories', { method: 'POST', headers: authHeader, body: JSON.stringify({ name: 'Test Category' }) });
  const cat = await catRes.json();
  const catId = cat?.data?.id;
  console.log('CAT_ID:' + (catId || JSON.stringify(cat)));

  // Create supplier
  const suppRes = await fetch(base + '/api/suppliers', { method: 'POST', headers: authHeader, body: JSON.stringify({ name: 'Test Supplier' }) });
  const supp = await suppRes.json();
  const suppId = supp?.data?.id;
  console.log('SUPP_ID:' + (suppId || JSON.stringify(supp)));

  // Create product
  const prodBody = { categoryId: catId, supplierId: suppId, sku: 'TEST-SKU-001', name: 'Test Product', basePrice: 9.99 };
  const prodRes = await fetch(base + '/api/products', { method: 'POST', headers: authHeader, body: JSON.stringify(prodBody) });
  const prod = await prodRes.json();
  const prodId = prod?.data?.id;
  console.log('PROD_ID:' + (prodId || JSON.stringify(prod)));

  // Lists
  const cats = await (await fetch(base + '/api/categories', { headers: { Authorization: 'Bearer ' + token } })).json();
  console.log('-- categories list --'); console.log(JSON.stringify(cats, null, 2));
  const sups = await (await fetch(base + '/api/suppliers', { headers: { Authorization: 'Bearer ' + token } })).json();
  console.log('-- suppliers list --'); console.log(JSON.stringify(sups, null, 2));
  const prods = await (await fetch(base + '/api/products', { headers: { Authorization: 'Bearer ' + token } })).json();
  console.log('-- products list --'); console.log(JSON.stringify(prods, null, 2));

  // Get product
  const got = await (await fetch(base + '/api/products/' + prodId, { headers: { Authorization: 'Bearer ' + token } })).json();
  console.log('-- get product --'); console.log(JSON.stringify(got, null, 2));

  // Update product
  const upd = await (await fetch(base + '/api/products/' + prodId, { method: 'PATCH', headers: authHeader, body: JSON.stringify({ name: 'Test Product Updated', basePrice: 19.99 }) })).json();
  console.log('-- updated product --'); console.log(JSON.stringify(upd, null, 2));

  // Delete product
  const delp = await fetch(base + '/api/products/' + prodId, { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } });
  console.log('delete product status', delp.status);

  // Delete supplier
  const dels = await fetch(base + '/api/suppliers/' + suppId, { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } });
  console.log('delete supplier status', dels.status);

  // Delete category
  const delc = await fetch(base + '/api/categories/' + catId, { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } });
  console.log('delete category status', delc.status);

  console.log('ALL_DONE');
})();
