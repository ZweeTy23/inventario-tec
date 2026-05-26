const prisma = require('../../db');

async function loadUserPermissions(req, res, next) {
  try {
    const user = req.user;
    if (!user || !user.roleId) return next();
    const role = await prisma.role.findUnique({ where: { id: user.roleId }, include: { rolePermissions: { include: { permission: true } } } });
    const perms = (role && role.rolePermissions) ? role.rolePermissions.map(rp => rp.permission.name) : [];
    req.user.permissions = perms;
    return next();
  } catch (e) {
    console.error('loadUserPermissions error', e.message);
    return next();
  }
}

function requirePermission(permission) {
  return (req, res, next) => {
    const perms = req.user?.permissions ?? [];
    if (perms.includes(permission) || perms.includes('*')) return next();
    // If no permissions are defined, do not block by default (configurable later)
    if (perms.length === 0) return next();
    return res.status(403).json({ message: 'Permission denied' });
  };
}

module.exports = { loadUserPermissions, requirePermission };
