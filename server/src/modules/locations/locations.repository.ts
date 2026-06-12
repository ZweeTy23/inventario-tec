import { prisma } from "../../lib/prisma.js";
import type { LocationType } from "../../../generated/prisma/enums.js";
import type { Prisma } from "../../../generated/prisma/client.js";
import { skipTake, type PaginationQuery } from "../../shared/utils/pagination.js";

const LOCATION_SELECT = {
  id: true,
  name: true,
  locationType: true,
  parentId: true,
  maxCapacity: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { children: true, stockLevels: true } },
} as const;

export const locationRepository = {
  list(filters: {
    q?: string;
    locationType?: LocationType;
    parentId?: string;
    rootOnly?: boolean;
    pagination: PaginationQuery;
  }) {
    const where: Prisma.LocationWhereInput = {
      ...(filters.locationType ? { locationType: filters.locationType } : {}),
      ...(filters.parentId ? { parentId: filters.parentId } : {}),
      ...(filters.rootOnly ? { parentId: null } : {}),
      ...(filters.q
        ? { name: { contains: filters.q, mode: "insensitive" } }
        : {}),
    };
    return Promise.all([
      prisma.location.findMany({
        where,
        ...skipTake(filters.pagination),
        orderBy: { [filters.pagination.sortBy ?? "name"]: filters.pagination.sortDir },
        select: LOCATION_SELECT,
      }),
      prisma.location.count({ where }),
    ]);
  },

  findById(id: string) {
    return prisma.location.findUnique({ where: { id }, select: LOCATION_SELECT });
  },

  /** Returns the full warehouse tree (Warehouse -> Zone -> Aisle -> Shelf -> Level). */
  async tree() {
    const all = await prisma.location.findMany({
      orderBy: [{ locationType: "asc" }, { name: "asc" }],
    });
    type Node = (typeof all)[number] & { children: Node[] };
    const byId = new Map<string, Node>(all.map((l) => [l.id, { ...l, children: [] }]));
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

  create(data: Prisma.LocationUncheckedCreateInput) {
    return prisma.location.create({ data, select: LOCATION_SELECT });
  },

  update(id: string, data: Prisma.LocationUncheckedUpdateInput) {
    return prisma.location.update({ where: { id }, data, select: LOCATION_SELECT });
  },

  softDelete(id: string) {
    return prisma.location.delete({ where: { id } });
  },
};
