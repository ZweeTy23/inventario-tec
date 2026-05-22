import { ConflictError, NotFoundError } from "../../shared/errors/AppError.js";
import { buildPaginationMeta } from "../../shared/utils/pagination.js";
import type {
  CreateProductInput,
  ListProductsQuery,
  UpdateProductInput,
} from "./products.schemas.js";
import { productRepository } from "./products.repository.js";

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

  async create(input: CreateProductInput) {
    const dup = await productRepository.findBySku(input.sku);
    if (dup) throw new ConflictError(`SKU "${input.sku}" already exists`);
    return productRepository.create({
      categoryId: input.categoryId,
      supplierId: input.supplierId,
      sku: input.sku,
      name: input.name,
      basePrice: input.basePrice,
      attributes: input.attributes as object,
      minStockAlert: input.minStockAlert,
    });
  },

  async update(id: string, input: UpdateProductInput) {
    const existing = await productRepository.findById(id);
    if (!existing) throw new NotFoundError("Product");

    if (input.sku && input.sku !== existing.sku) {
      const dup = await productRepository.findBySku(input.sku);
      if (dup) throw new ConflictError(`SKU "${input.sku}" already exists`);
    }

    return productRepository.update(id, {
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
  },

  async delete(id: string) {
    const product = await productRepository.findById(id);
    if (!product) throw new NotFoundError("Product");
    await productRepository.softDelete(id);
  },
};
