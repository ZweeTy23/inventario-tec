const prisma = require('../../db');

async function createSupplier(req, res) {
  try {
    const { name, contactInfo } = req.body;
    if (!name) return res.status(400).json({ message: 'name is required' });
    const created = await prisma.supplier.create({ data: { name, contactInfo: contactInfo ?? {} } });
    try { await prisma.auditLog.create({ data: { userId: req.user?.id || null, action: 'CREATE', tableAffected: 'suppliers', recordId: created.id, newData: created } }); } catch(e){}
    res.status(201).json({ data: created });
  } catch (e) {
    res.status(500).json({ message: 'Error creating supplier', error: e.message });
  }
}

async function listSuppliers(req, res) {
  try {
    const sup = await prisma.supplier.findMany();
    res.json({ data: sup });
  } catch (e) {
    res.status(500).json({ message: 'Error listing suppliers', error: e.message });
  }
}

async function getSupplier(req, res) {
  try {
    const { id } = req.params;
    const s = await prisma.supplier.findUnique({ where: { id } });
    if (!s) return res.status(404).json({ message: 'Not found' });
    res.json({ data: s });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching supplier', error: e.message });
  }
}

async function updateSupplier(req, res) {
  try {
    const { id } = req.params;
    const { name, contactInfo } = req.body;
    const existing = await prisma.supplier.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Not found' });
    const updated = await prisma.supplier.update({ where: { id }, data: { ...(name !== undefined ? { name } : {}), ...(contactInfo !== undefined ? { contactInfo } : {}) } });
    try { await prisma.auditLog.create({ data: { userId: req.user?.id || null, action: 'UPDATE', tableAffected: 'suppliers', recordId: updated.id, oldData: existing, newData: updated } }); } catch(e){}
    res.json({ data: updated });
  } catch (e) {
    res.status(500).json({ message: 'Error updating supplier', error: e.message });
  }
}

async function deleteSupplier(req, res) {
  try {
    const { id } = req.params;
    const s = await prisma.supplier.findUnique({ where: { id } });
    if (!s) return res.status(404).json({ message: 'Not found' });
    // check products linked
    const products = await prisma.product.count({ where: { supplierId: id } });
    if (products > 0) return res.status(400).json({ message: `Cannot delete supplier: ${products} active products are linked to it` });
    await prisma.supplier.delete({ where: { id } });
    try { await prisma.auditLog.create({ data: { userId: req.user?.id || null, action: 'DELETE', tableAffected: 'suppliers', recordId: id, oldData: s } }); } catch(e){}
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ message: 'Error deleting supplier', error: e.message });
  }
}

module.exports = { createSupplier, listSuppliers, getSupplier, updateSupplier, deleteSupplier };
