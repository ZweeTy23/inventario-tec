import { Prisma } from "../../generated/prisma/client.js";

/**
 * Models that support soft delete (have a `deletedAt` column).
 * Mutations on these models are intercepted so that:
 *   - `delete`     -> `update { deletedAt: now() }`
 *   - `deleteMany` -> `updateMany { deletedAt: now() }`
 *
 * Reads (`findMany`, `findFirst`, `findFirstOrThrow`, `count`, `aggregate`) are
 * filtered by `deletedAt: null` by default. Callers that need to include
 * trashed rows can pass `where: { deletedAt: { not: undefined } }` or use the
 * raw client directly.
 *
 * `findUnique` / `findUniqueOrThrow` are intentionally left untouched: lookups
 * by unique key (typically `id`) are usually intentional admin operations.
 */
const SOFT_DELETE_MODELS = ["user", "product", "location"] as const;
type SoftDeleteModel = (typeof SOFT_DELETE_MODELS)[number];

function isSoftDeleteModel(model: string | undefined): model is SoftDeleteModel {
  return !!model && (SOFT_DELETE_MODELS as readonly string[]).includes(model);
}

function applyDeletedAtNullFilter(args: { where?: unknown }): void {
  const existing = (args.where as Record<string, unknown> | undefined) ?? {};
  args.where = {
    AND: [existing, { deletedAt: null }],
  };
}

export const softDeleteExtension = Prisma.defineExtension({
  name: "soft-delete",
  query: {
    $allModels: {
      async delete({ model, args, query }) {
        if (!isSoftDeleteModel(model.toLowerCase())) {
          return query(args);
        }
        return (query as unknown as (a: unknown) => Promise<unknown>)({
          where: (args as { where: unknown }).where,
          data: { deletedAt: new Date() },
        });
      },
      async deleteMany({ model, args, query }) {
        if (!isSoftDeleteModel(model.toLowerCase())) {
          return query(args);
        }
        return (query as unknown as (a: unknown) => Promise<unknown>)({
          where: (args as { where?: unknown }).where,
          data: { deletedAt: new Date() },
        });
      },
      async findMany({ model, args, query }) {
        if (isSoftDeleteModel(model.toLowerCase())) {
          applyDeletedAtNullFilter(args as { where?: unknown });
        }
        return query(args);
      },
      async findFirst({ model, args, query }) {
        if (isSoftDeleteModel(model.toLowerCase())) {
          applyDeletedAtNullFilter(args as { where?: unknown });
        }
        return query(args);
      },
      async findFirstOrThrow({ model, args, query }) {
        if (isSoftDeleteModel(model.toLowerCase())) {
          applyDeletedAtNullFilter(args as { where?: unknown });
        }
        return query(args);
      },
      async count({ model, args, query }) {
        if (isSoftDeleteModel(model.toLowerCase())) {
          applyDeletedAtNullFilter(args as { where?: unknown });
        }
        return query(args);
      },
      async aggregate({ model, args, query }) {
        if (isSoftDeleteModel(model.toLowerCase())) {
          applyDeletedAtNullFilter(args as { where?: unknown });
        }
        return query(args);
      },
    },
  },
  model: {
    $allModels: {
      /** Convenience helper to permanently delete a record (bypasses soft delete). */
      async forceDelete<T>(this: T, where: unknown): Promise<unknown> {
        const ctx = Prisma.getExtensionContext(this) as unknown as {
          $parent: { $queryRawUnsafe: (sql: string) => Promise<unknown> };
          $name: string;
        };
        const modelName = ctx.$name.toLowerCase();
        const tableMap: Record<string, { schema: string; table: string }> = {
          user: { schema: "auth", table: "users" },
          product: { schema: "catalog", table: "products" },
          location: { schema: "warehouse", table: "locations" },
        };
        const t = tableMap[modelName];
        if (!t) {
          throw new Error(`forceDelete is only supported on soft-delete models. Got: ${modelName}`);
        }
        const id = (where as { id: string }).id;
        if (!id) throw new Error("forceDelete requires a { id } where clause.");
        return ctx.$parent.$queryRawUnsafe(
          `DELETE FROM "${t.schema}"."${t.table}" WHERE "id" = '${id.replace(/'/g, "''")}'`
        );
      },
    },
  },
});
