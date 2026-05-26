import { BadRequestError, NotFoundError } from "../../shared/errors/AppError.js";
import { buildPaginationMeta } from "../../shared/utils/pagination.js";
import type {
  CreateCategoryInput,
  ListCategoriesQuery,
  UpdateCategoryInput,
} from "./categories.schemas.js";
import { categoryRepository } from "./categories.repository.js";
import { createAuditLog } from "../../lib/audit.js";

export const categoryService = {
  async list(query: ListCategoriesQuery) {
    const [data, total] = await categoryRepository.list({
      q: query.q,
      parentId: query.parentId,
      rootOnly: query.rootOnly,
      pagination: query,
    });
    return { data, meta: buildPaginationMeta(total, query.page, query.perPage) };
  },

  tree() {
    return categoryRepository.tree();
  },

  async getById(id: string) {
    const cat = await categoryRepository.findById(id);
    if (!cat) throw new NotFoundError("Category");
    return cat;
  },

  async create(input: CreateCategoryInput) {
    if (input.parentId) {
      const parent = await categoryRepository.findById(input.parentId);
      if (!parent) throw new BadRequestError("Parent category does not exist");
    }
    const created = await categoryRepository.create({ name: input.name, parentId: input.parentId ?? null });
    await createAuditLog({ userId: null as any, action: 'CREATE', table: 'categories', recordId: created.id, newData: created });
    return created;
  },

  async update(id: string, input: UpdateCategoryInput) {
    const existing = await categoryRepository.findById(id);
    if (!existing) throw new NotFoundError("Category");
    if (input.parentId === id) {
      throw new BadRequestError("A category cannot be its own parent");
    }
    if (input.parentId) {
      const parent = await categoryRepository.findById(input.parentId);
      if (!parent) throw new BadRequestError("Parent category does not exist");
    }
    const updated = await categoryRepository.update(id, {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.parentId !== undefined ? { parentId: input.parentId } : {}),
    });
    await createAuditLog({ userId: null as any, action: 'UPDATE', table: 'categories', recordId: updated.id, oldData: existing, newData: updated });
    return updated;
  },

  async delete(id: string) {
    const existing = await categoryRepository.findById(id);
    if (!existing) throw new NotFoundError("Category");
    if (existing._count.products > 0 || existing._count.children > 0) {
      throw new BadRequestError("Cannot delete a category that has products or sub-categories");
    }
    await categoryRepository.delete(id);
    await createAuditLog({ userId: null as any, action: 'DELETE', table: 'categories', recordId: id, oldData: existing });
  },
};
