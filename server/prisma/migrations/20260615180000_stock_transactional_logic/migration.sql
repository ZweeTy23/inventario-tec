-- Transactional stock logic: weighted-average cost ("Costo Promedio"),
-- richer movement metadata (batch / expiration / notes) captured at creation,
-- and an immutable cost-history ledger for inventory valuation over time.

-- AlterTable: products gain a moving weighted-average cost.
ALTER TABLE "catalog"."products"
  ADD COLUMN "average_cost" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- AlterTable: movements carry the intended batch/expiration and free-form notes
-- (e.g. rejection reason) so a PENDING movement is fully self-describing.
ALTER TABLE "operations"."movements"
  ADD COLUMN "batch_number" VARCHAR(80),
  ADD COLUMN "expiration_date" DATE,
  ADD COLUMN "notes" TEXT;

-- CreateTable: stock_cost_history (weighted-average cost ledger).
CREATE TABLE "operations"."stock_cost_history" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "movement_id" UUID,
    "quantity_in" INTEGER NOT NULL,
    "unit_cost" DECIMAL(12,2) NOT NULL,
    "previous_quantity" INTEGER NOT NULL,
    "previous_avg_cost" DECIMAL(12,2) NOT NULL,
    "new_quantity" INTEGER NOT NULL,
    "new_avg_cost" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_cost_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "stock_cost_history_product_id_idx" ON "operations"."stock_cost_history"("product_id");

-- CreateIndex
CREATE INDEX "stock_cost_history_movement_id_idx" ON "operations"."stock_cost_history"("movement_id");

-- CreateIndex
CREATE INDEX "stock_cost_history_created_at_idx" ON "operations"."stock_cost_history"("created_at");

-- AddForeignKey
ALTER TABLE "operations"."stock_cost_history"
  ADD CONSTRAINT "stock_cost_history_product_id_fkey"
  FOREIGN KEY ("product_id") REFERENCES "catalog"."products"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operations"."stock_cost_history"
  ADD CONSTRAINT "stock_cost_history_movement_id_fkey"
  FOREIGN KEY ("movement_id") REFERENCES "operations"."movements"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- CHECK constraints (consistent with the domain-level guards added previously).
ALTER TABLE "catalog"."products"
  ADD CONSTRAINT "products_average_cost_nonneg_chk"
  CHECK ("average_cost" >= 0);

ALTER TABLE "operations"."stock_cost_history"
  ADD CONSTRAINT "stock_cost_history_quantity_in_positive_chk"
  CHECK ("quantity_in" > 0);
