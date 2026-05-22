import { BadRequestError, NotFoundError } from "../../shared/errors/AppError.js";
import { buildPaginationMeta } from "../../shared/utils/pagination.js";
import type {
  CreateSupplierInput,
  ListSuppliersQuery,
  UpdateSupplierInput,
} from "./suppliers.schemas.js";
import { supplierRepository } from "./suppliers.repository.js";

export const supplierService = {
  async list(query: ListSuppliersQuery) {
    const [data, total] = await supplierRepository.list({
      q: query.q,
      minReliability: query.minReliability,
      pagination: query,
    });
    return { data, meta: buildPaginationMeta(total, query.page, query.perPage) };
  },

  async getById(id: string) {
    const s = await supplierRepository.findById(id);
    if (!s) throw new NotFoundError("Supplier");
    return s;
  },

  create(input: CreateSupplierInput) {
    return supplierRepository.create({
      name: input.name,
      contactInfo: input.contactInfo,
      reliabilityScore: input.reliabilityScore,
    });
  },

  async update(id: string, input: UpdateSupplierInput) {
    const s = await supplierRepository.findById(id);
    if (!s) throw new NotFoundError("Supplier");
    return supplierRepository.update(id, input);
  },

  async delete(id: string) {
    const s = await supplierRepository.findById(id);
    if (!s) throw new NotFoundError("Supplier");
    const usage = await supplierRepository.countProducts(id);
    if (usage > 0) {
      throw new BadRequestError(
        `Cannot delete supplier: ${usage} active products are linked to it`
      );
    }
    await supplierRepository.delete(id);
  },
};
