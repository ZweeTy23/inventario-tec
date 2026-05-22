-- Domain-level CHECK constraints that Prisma schema cannot express directly.
-- These guarantee non-negative or strictly-positive amounts at the database layer
-- in addition to the validation enforced at the application layer (Zod schemas).

-- Movements: quantity must be strictly positive.
ALTER TABLE "operations"."movements"
  ADD CONSTRAINT "movements_quantity_positive_chk"
  CHECK ("quantity" > 0);

-- Products: base price must be non-negative.
ALTER TABLE "catalog"."products"
  ADD CONSTRAINT "products_base_price_nonneg_chk"
  CHECK ("base_price" >= 0);

-- Products: min stock alert must be non-negative.
ALTER TABLE "catalog"."products"
  ADD CONSTRAINT "products_min_stock_alert_nonneg_chk"
  CHECK ("min_stock_alert" >= 0);

-- Stock levels: quantity must be non-negative.
ALTER TABLE "warehouse"."stock_levels"
  ADD CONSTRAINT "stock_levels_quantity_nonneg_chk"
  CHECK ("quantity" >= 0);

-- Locations: max capacity must be non-negative.
ALTER TABLE "warehouse"."locations"
  ADD CONSTRAINT "locations_max_capacity_nonneg_chk"
  CHECK ("max_capacity" >= 0);

-- Suppliers: reliability score must be within 0-100.
ALTER TABLE "catalog"."suppliers"
  ADD CONSTRAINT "suppliers_reliability_score_range_chk"
  CHECK ("reliability_score" >= 0 AND "reliability_score" <= 100);

-- Movements: business rules enforced by domain logic, but we add a sanity check
-- that source and destination cannot be the same location.
ALTER TABLE "operations"."movements"
  ADD CONSTRAINT "movements_source_dest_diff_chk"
  CHECK (
    "source_location_id" IS NULL
    OR "destination_location_id" IS NULL
    OR "source_location_id" <> "destination_location_id"
  );
