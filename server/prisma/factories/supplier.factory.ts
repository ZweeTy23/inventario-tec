import { faker } from "@faker-js/faker/locale/en";

export interface MakeSupplierOverrides {
  name?: string;
  contactInfo?: Record<string, unknown>;
  reliabilityScore?: number;
}

export function makeSupplier(overrides: MakeSupplierOverrides = {}) {
  return {
    name: overrides.name ?? `${faker.company.name()} ${faker.company.buzzNoun()}`,
    contactInfo:
      overrides.contactInfo ?? {
        email: faker.internet.email().toLowerCase(),
        phone: faker.phone.number(),
        address: `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.country()}`,
        contactPerson: faker.person.fullName(),
        website: faker.internet.url(),
      },
    reliabilityScore:
      overrides.reliabilityScore ??
      Number(faker.number.float({ min: 60, max: 100, fractionDigits: 2 }).toFixed(2)),
  };
}
