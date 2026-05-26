-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "auth";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "catalog";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "operations";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "system_alerts";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "warehouse";

-- CreateEnum
CREATE TYPE "warehouse"."LocationType" AS ENUM ('WAREHOUSE', 'ZONE', 'AISLE', 'SHELF', 'LEVEL');

-- CreateEnum
CREATE TYPE "operations"."MovementType" AS ENUM ('PURCHASE_ENTRY', 'RETURN_ENTRY', 'SALE_EXIT', 'LOSS_EXIT', 'EXPIRED_EXIT', 'TRANSFER');

-- CreateEnum
CREATE TYPE "operations"."MovementStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "system_alerts"."NotificationType" AS ENUM ('LOW_STOCK', 'EXPIRATION_WARNING', 'MOVEMENT_ALERT', 'SYSTEM_PROCESS', 'APPROVAL_REQUIRED');

-- CreateTable
CREATE TABLE "auth"."roles" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."permissions" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "module" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."role_permissions" (
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "auth"."users" (
    "id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(180) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."categories" (
    "id" UUID NOT NULL,
    "parent_id" UUID,
    "name" VARCHAR(150) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."suppliers" (
    "id" UUID NOT NULL,
    "name" VARCHAR(180) NOT NULL,
    "contact_info" JSONB NOT NULL DEFAULT '{}',
    "reliability_score" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "deleted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."products" (
    "id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "supplier_id" UUID NOT NULL,
    "sku" VARCHAR(80) NOT NULL,
    "barcode" VARCHAR(80),
    "qr_code" VARCHAR(120),
    "name" VARCHAR(200) NOT NULL,
    "base_price" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "attributes" JSONB NOT NULL DEFAULT '{}',
    "min_stock_alert" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse"."locations" (
    "id" UUID NOT NULL,
    "parent_id" UUID,
    "name" VARCHAR(150) NOT NULL,
    "location_type" "warehouse"."LocationType" NOT NULL,
    "max_capacity" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse"."stock_levels" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "location_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "batch_number" VARCHAR(80) NOT NULL,
    "expiration_date" DATE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "stock_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operations"."movements" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "source_location_id" UUID,
    "destination_location_id" UUID,
    "quantity" INTEGER NOT NULL,
    "movement_type" "operations"."MovementType" NOT NULL,
    "status" "operations"."MovementStatus" NOT NULL DEFAULT 'PENDING',
    "unit_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operations"."audit_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "action" VARCHAR(80) NOT NULL,
    "table_affected" VARCHAR(120) NOT NULL,
    "record_id" UUID NOT NULL,
    "old_data" JSONB,
    "new_data" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_alerts"."notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "type" "system_alerts"."NotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "entity_id" UUID,
    "entity_type" VARCHAR(120),
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "user_agent" VARCHAR(255),
    "ip_address" VARCHAR(80),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "auth"."roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "auth"."permissions"("name");

-- CreateIndex
CREATE INDEX "permissions_module_idx" ON "auth"."permissions"("module");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "auth"."users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "auth"."users"("email");

-- CreateIndex
CREATE INDEX "users_role_id_idx" ON "auth"."users"("role_id");

-- CreateIndex
CREATE INDEX "users_deleted_at_idx" ON "auth"."users"("deleted_at");

-- CreateIndex
CREATE INDEX "categories_parent_id_idx" ON "catalog"."categories"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "catalog"."products"("sku");

-- CreateIndex
CREATE INDEX "products_sku_idx" ON "catalog"."products"("sku");

-- CreateIndex
CREATE INDEX "products_category_id_idx" ON "catalog"."products"("category_id");

-- CreateIndex
CREATE INDEX "products_supplier_id_idx" ON "catalog"."products"("supplier_id");

-- CreateIndex
CREATE INDEX "products_deleted_at_idx" ON "catalog"."products"("deleted_at");

-- CreateIndex
CREATE INDEX "locations_parent_id_idx" ON "warehouse"."locations"("parent_id");

-- CreateIndex
CREATE INDEX "locations_location_type_idx" ON "warehouse"."locations"("location_type");

-- CreateIndex
CREATE INDEX "locations_deleted_at_idx" ON "warehouse"."locations"("deleted_at");

-- CreateIndex
CREATE INDEX "stock_levels_product_id_idx" ON "warehouse"."stock_levels"("product_id");

-- CreateIndex
CREATE INDEX "stock_levels_location_id_idx" ON "warehouse"."stock_levels"("location_id");

-- CreateIndex
CREATE INDEX "stock_levels_batch_number_idx" ON "warehouse"."stock_levels"("batch_number");

-- CreateIndex
CREATE INDEX "stock_levels_expiration_date_idx" ON "warehouse"."stock_levels"("expiration_date");

-- CreateIndex
CREATE UNIQUE INDEX "stock_levels_product_id_location_id_batch_number_key" ON "warehouse"."stock_levels"("product_id", "location_id", "batch_number");

-- CreateIndex
CREATE INDEX "movements_product_id_idx" ON "operations"."movements"("product_id");

-- CreateIndex
CREATE INDEX "movements_user_id_idx" ON "operations"."movements"("user_id");

-- CreateIndex
CREATE INDEX "movements_movement_type_idx" ON "operations"."movements"("movement_type");

-- CreateIndex
CREATE INDEX "movements_status_idx" ON "operations"."movements"("status");

-- CreateIndex
CREATE INDEX "movements_created_at_idx" ON "operations"."movements"("created_at");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "operations"."audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "operations"."audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_table_affected_idx" ON "operations"."audit_logs"("table_affected");

-- CreateIndex
CREATE INDEX "audit_logs_record_id_idx" ON "operations"."audit_logs"("record_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "operations"."audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "system_alerts"."notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "system_alerts"."notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_is_read_idx" ON "system_alerts"."notifications"("is_read");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "system_alerts"."notifications"("created_at");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "auth"."sessions"("user_id");

-- AddForeignKey
ALTER TABLE "auth"."role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "auth"."roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "auth"."permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "auth"."roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "catalog"."categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "catalog"."categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."products" ADD CONSTRAINT "products_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "catalog"."suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse"."locations" ADD CONSTRAINT "locations_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "warehouse"."locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse"."stock_levels" ADD CONSTRAINT "stock_levels_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "catalog"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse"."stock_levels" ADD CONSTRAINT "stock_levels_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "warehouse"."locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operations"."movements" ADD CONSTRAINT "movements_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "catalog"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operations"."movements" ADD CONSTRAINT "movements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operations"."movements" ADD CONSTRAINT "movements_source_location_id_fkey" FOREIGN KEY ("source_location_id") REFERENCES "warehouse"."locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operations"."movements" ADD CONSTRAINT "movements_destination_location_id_fkey" FOREIGN KEY ("destination_location_id") REFERENCES "warehouse"."locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operations"."audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_alerts"."notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
