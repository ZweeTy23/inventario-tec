const prisma = require('../../db');

async function createProduct(req, res) {
  try {
    const { categoryId, supplierId, sku, name, basePrice, attributes } = req.body;
    if (!categoryId || !supplierId || !sku || !name) return res.status(400).json({ message: 'categoryId, supplierId, sku and name are required' });
    // validate foreign keys
    const cat = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!cat) return res.status(400).json({ message: 'category not found' });
    const sup = await prisma.supplier.findUnique({ where: { id: supplierId } });
    if (!sup) return res.status(400).json({ message: 'supplier not found' });

    const created = await prisma.product.create({ data: { categoryId, supplierId, sku, name, basePrice: basePrice ?? 0, attributes: attributes ?? {} } });
    res.status(201).json({ data: created });
  } catch (e) {
    res.status(500).json({ message: 'Error creating product', error: e.message });
  }
}

async function listProducts(req, res) {
  try {
    const prods = await prisma.product.findMany({ where: {}, take: 100 });
    res.json({ data: prods });
  } catch (e) {
    res.status(500).json({ message: 'Error listing products', error: e.message });
  }
}

async function getProduct(req, res) {
  try {
    const { id } = req.params;
    const p = await prisma.product.findUnique({ where: { id } });
    if (!p) return res.status(404).json({ message: 'Not found' });
    res.json({ data: p });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching product', error: e.message });
  }
}

async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const body = req.body;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Not found' });
    const updated = await prisma.product.update({ where: { id }, data: body });
    res.json({ data: updated });
  } catch (e) {
    res.status(500).json({ message: 'Error updating product', error: e.message });
  }
}

async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    const p = await prisma.product.findUnique({ where: { id } });
    if (!p) return res.status(404).json({ message: 'Not found' });
    await prisma.product.delete({ where: { id } });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ message: 'Error deleting product', error: e.message });
  }
}

module.exports = { createProduct, listProducts, getProduct, updateProduct, deleteProduct };
