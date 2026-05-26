import { ConflictError, NotFoundError } from "../../shared/errors/AppError.js";
import { buildPaginationMeta } from "../../shared/utils/pagination.js";
import type {
  CreateProductInput,
  ListProductsQuery,
  UpdateProductInput,
} from "./products.schemas.js";
import { productRepository } from "./products.repository.js";
import { createAuditLog } from "../../lib/audit.js";

export const productService = {
  async list(query: ListProductsQuery) {
    if (query.belowMinStock) {
      const data = await productRepository.belowMinStock();
      return { data, meta: { page: 1, perPage: data.length, total: data.length, totalPages: 1 } };
    }
    const [data, total] = await productRepository.list({
      q: query.q,
      categoryId: query.categoryId,
      supplierId: query.supplierId,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      pagination: query,
    });
    return { data, meta: buildPaginationMeta(total, query.page, query.perPage) };
  },

  async getById(id: string) {
    const product = await productRepository.findById(id);
    if (!product) throw new NotFoundError("Product");
    return product;
  },

  async create(input: CreateProductInput, actorId?: string) {
    const dup = await productRepository.findBySku(input.sku);
    if (dup) throw new ConflictError(`SKU "${input.sku}" already exists`);
    const created = await productRepository.create({
      categoryId: input.categoryId,
      supplierId: input.supplierId,
      sku: input.sku,
      name: input.name,
      basePrice: input.basePrice,
      attributes: input.attributes as object,
      minStockAlert: input.minStockAlert,
    });
    if (actorId) {
      await createAuditLog({
        userId: actorId,
        action: "create",
        table: "products",
        recordId: created.id,
        newData: created,
      });
    }
    return created;
  },

  async update(id: string, input: UpdateProductInput, actorId?: string) {
    const existing = await productRepository.findById(id);
    if (!existing) throw new NotFoundError("Product");

    if (input.sku && input.sku !== existing.sku) {
      const dup = await productRepository.findBySku(input.sku);
      if (dup) throw new ConflictError(`SKU "${input.sku}" already exists`);
    }

    const updated = await productRepository.update(id, {
      ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
      ...(input.supplierId !== undefined ? { supplierId: input.supplierId } : {}),
      ...(input.sku !== undefined ? { sku: input.sku } : {}),
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.basePrice !== undefined ? { basePrice: input.basePrice } : {}),
      ...(input.attributes !== undefined
        ? { attributes: input.attributes as object }
        : {}),
      ...(input.minStockAlert !== undefined
        ? { minStockAlert: input.minStockAlert }
        : {}),
    });
    if (actorId) {
      await createAuditLog({
        userId: actorId,
        action: "update",
        table: "products",
        recordId: id,
        oldData: existing,
        newData: updated,
      });
    }
    return updated;
  },

  async delete(id: string, actorId?: string) {
    const product = await productRepository.findById(id);
    if (!product) throw new NotFoundError("Product");
    await productRepository.softDelete(id);
    if (actorId) {
      await createAuditLog({
        userId: actorId,
        action: "delete",
        table: "products",
        recordId: id,
        oldData: product,
      });
    }
  },
};
