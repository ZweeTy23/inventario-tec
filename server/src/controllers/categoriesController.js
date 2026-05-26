const prisma = require('../../db');

async function createCategory(req, res) {
  try {
    const { name, parentId } = req.body;
    if (!name) return res.status(400).json({ message: 'name is required' });
    if (parentId) {
      const p = await prisma.category.findUnique({ where: { id: parentId } });
      if (!p) return res.status(400).json({ message: 'parent not found' });
    }
    const created = await prisma.category.create({ data: { name, parentId: parentId ?? null } });
    res.status(201).json({ data: created });
  } catch (e) {
    res.status(500).json({ message: 'Error creating category', error: e.message });
  }
}

async function listCategories(req, res) {
  try {
    const cats = await prisma.category.findMany({ include: { _count: { select: { products: true, children: true } } } });
    res.json({ data: cats });
  } catch (e) {
    res.status(500).json({ message: 'Error listing categories', error: e.message });
  }
}

async function getCategory(req, res) {
  try {
    const { id } = req.params;
    const cat = await prisma.category.findUnique({ where: { id }, include: { _count: { select: { products: true, children: true } } } });
    if (!cat) return res.status(404).json({ message: 'Not found' });
    res.json({ data: cat });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching category', error: e.message });
  }
}

async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, parentId } = req.body;
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Not found' });
    if (parentId === id) return res.status(400).json({ message: 'Cannot set self as parent' });
    if (parentId) {
      const p = await prisma.category.findUnique({ where: { id: parentId } });
      if (!p) return res.status(400).json({ message: 'parent not found' });
    }
    const updated = await prisma.category.update({ where: { id }, data: { ...(name !== undefined ? { name } : {}), ...(parentId !== undefined ? { parentId } : {}) } });
    res.json({ data: updated });
  } catch (e) {
    res.status(500).json({ message: 'Error updating category', error: e.message });
  }
}

async function deleteCategory(req, res) {
  try {
    const { id } = req.params;
    const cat = await prisma.category.findUnique({ where: { id }, include: { _count: { select: { products: true, children: true } } } });
    if (!cat) return res.status(404).json({ message: 'Not found' });
    if (cat._count.products > 0 || cat._count.children > 0) return res.status(400).json({ message: 'Cannot delete category with products/children' });
    await prisma.category.delete({ where: { id } });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ message: 'Error deleting category', error: e.message });
  }
}

module.exports = { createCategory, listCategories, getCategory, updateCategory, deleteCategory };
