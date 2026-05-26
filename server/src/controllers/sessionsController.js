const { getPrisma } = require('../lib/prismaClient');

async function listSessions(req, res) {
  try {
    const prisma = await getPrisma();
    const userId = req.user?.id;
    const sessions = await prisma.session.findMany({ where: { userId } , orderBy: { createdAt: 'desc' } });
    res.json({ data: sessions });
  } catch (err) {
    res.status(500).json({ message: 'Error listing sessions', error: err.message });
  }
}

async function revokeSession(req, res) {
  try {
    const prisma = await getPrisma();
    const { id } = req.params;
    const userId = req.user?.id;
    const s = await prisma.session.findUnique({ where: { id } });
    if (!s) return res.status(404).json({ message: 'Session not found' });
    if (s.userId !== userId) return res.status(403).json({ message: 'Forbidden' });
    await prisma.session.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: 'Error revoking session', error: err.message });
  }
}

module.exports = { listSessions, revokeSession };
