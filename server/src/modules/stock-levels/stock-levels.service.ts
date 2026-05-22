import { NotFoundError } from "../../shared/errors/AppError.js";
import { buildPaginationMeta } from "../../shared/utils/pagination.js";
import type {
  AdjustStockInput,
  ListStockLevelsQuery,
} from "./stock-levels.schemas.js";
import { stockLevelRepository } from "./stock-levels.repository.js";

export const stockLevelService = {
  async list(query: ListStockLevelsQuery) {
    const [data, total] = await stockLevelRepository.list({
      productId: query.productId,
      locationId: query.locationId,
      batchNumber: query.batchNumber,
      expiringBefore: query.expiringBefore,
      pagination: query,
    });
    return { data, meta: buildPaginationMeta(total, query.page, query.perPage) };
  },

  async getById(id: string) {
    const sl = await stockLevelRepository.findById(id);
    if (!sl) throw new NotFoundError("StockLevel");
    return sl;
  },

  async adjust(id: string, input: AdjustStockInput) {
    const sl = await stockLevelRepository.findById(id);
    if (!sl) throw new NotFoundError("StockLevel");
    return stockLevelRepository.update(id, {
      quantity: input.quantity,
      ...(input.expirationDate !== undefined ? { expirationDate: input.expirationDate } : {}),
    });
  },
};
