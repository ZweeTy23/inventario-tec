import { prisma } from "../../lib/prisma.js";
import { skipTake, type PaginationQuery } from "../../shared/utils/pagination.js";

const CATEGORY_SELECT = {
  id: true,
  name: true,
  parentId: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { products: true, children: true } },
} as const;

export const categoryRepository = {
  list(filters: {
    q?: string;
    parentId?: string;
    rootOnly?: boolean;
    pagination: PaginationQuery;
  }) {
    const where = {
      ...(filters.parentId ? { parentId: filters.parentId } : {}),
      ...(filters.rootOnly ? { parentId: null } : {}),
      ...(filters.q
        ? { name: { contains: filters.q, mode: "insensitive" as const } }
        : {}),
    };
    return Promise.all([
      prisma.category.findMany({
        where,
        ...skipTake(filters.pagination),
        orderBy: { [filters.pagination.sortBy ?? "name"]: filters.pagination.sortDir },
        select: CATEGORY_SELECT,
      }),
      prisma.category.count({ where }),
    ]);
  },

  findById(id: string) {
    return prisma.category.findUnique({ where: { id }, select: CATEGORY_SELECT });
  },

  /** Returns the full tree (max depth not enforced). */
  async tree() {
    const all = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    type Node = (typeof all)[number] & { children: Node[] };
    const byId = new Map<string, Node>(all.map((c) => [c.id, { ...c, children: [] }]));
    const roots: Node[] = [];
    for (const node of byId.values()) {
      if (node.parentId && byId.has(node.parentId)) {
        byId.get(node.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  },

  create(data: { name: string; parentId?: string | null }) {
    return prisma.category.create({ data, select: CATEGORY_SELECT });
  },

  update(id: string, data: { name?: string; parentId?: string | null }) {
    return prisma.category.update({ where: { id }, data, select: CATEGORY_SELECT });
  },

  delete(id: string) {
    return prisma.category.delete({ where: { id } });
  },
};
