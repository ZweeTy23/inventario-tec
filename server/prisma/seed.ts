import { logger } from "../src/lib/logger.js";
import { disconnectPrisma } from "../src/lib/prisma.js";
import { seedRoles } from "./seeders/roles.seeder.js";
import { seedPermissions } from "./seeders/permissions.seeder.js";
import { seedRolePermissions } from "./seeders/role-permission.seeder.js";
import { seedUsers } from "./seeders/user.seeder.js";
import { seedCategories } from "./seeders/categories.seeder.js";
import { seedSuppliers } from "./seeders/suppliers.seeder.js";
import { seedProducts } from "./seeders/products.seeder.js";
import { seedWarehouse } from "./seeders/warehouse.seeder.js";
import { seedStock } from "./seeders/stock.seeder.js";
import { seedMovements } from "./seeders/movement.seeder.js";

interface Step {
  name: string;
  run: () => Promise<void>;
}

const STEPS: Step[] = [
  { name: "roles", run: seedRoles },
  { name: "permissions", run: seedPermissions },
  { name: "role-permissions", run: seedRolePermissions },
  { name: "users", run: seedUsers },
  { name: "categories", run: seedCategories },
  { name: "suppliers", run: seedSuppliers },
  { name: "products", run: seedProducts },
  { name: "warehouse", run: seedWarehouse },
  { name: "stock", run: seedStock },
  { name: "movements", run: seedMovements },
];

async function main(): Promise<void> {
  logger.info(`Starting seed with ${STEPS.length} steps`);
  for (const step of STEPS) {
    const start = Date.now();
    logger.info(`> ${step.name}: running`);
    await step.run();
    logger.info(`> ${step.name}: done in ${Date.now() - start}ms`);
  }
  logger.info("Seed completed successfully");
}

main()
  .catch(async (err) => {
    logger.error({ err }, "Seed failed");
    await disconnectPrisma();
    process.exit(1);
  })
  .then(async () => {
    await disconnectPrisma();
  });
