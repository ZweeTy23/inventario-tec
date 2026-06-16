export const PERMISSIONS = {
  INVENTORY_VIEW: 'inventory.view',
  INVENTORY_CREATE: 'inventory.create',
  INVENTORY_UPDATE: 'inventory.update',
  INVENTORY_DELETE: 'inventory.delete',
  PRODUCTS_VIEW: 'products.view',
  PRODUCTS_CREATE: 'products.create',
  PRODUCTS_UPDATE: 'products.update',
  PRODUCTS_DELETE: 'products.delete',
  MOVEMENTS_VIEW: 'movements.view',
  MOVEMENTS_CREATE: 'movements.create',
  MOVEMENTS_APPROVE: 'movements.approve',
  REPORTS_VIEW: 'reports.view',
  ALERTS_VIEW: 'alerts.view',
  USERS_MANAGE: 'users.manage',
}

export const MOVEMENT_TYPES = {
  PURCHASE_ENTRY: { label: 'Entrada por compra', direction: 'in' },
  RETURN_ENTRY: { label: 'Entrada por devolución', direction: 'in' },
  SALE_EXIT: { label: 'Salida por venta', direction: 'out' },
  LOSS_EXIT: { label: 'Salida por merma', direction: 'out' },
  EXPIRED_EXIT: { label: 'Salida por caducidad', direction: 'out' },
  TRANSFER: { label: 'Traspaso entre almacenes', direction: 'transfer' },
}

export const MOVEMENT_STATUS = {
  PENDING: { label: 'Pendiente', color: 'amber' },
  APPROVED: { label: 'Aprobado', color: 'green' },
  REJECTED: { label: 'Rechazado', color: 'red' },
}

export const LOCATION_TYPES = {
  WAREHOUSE: 'Almacén',
  ZONE: 'Zona',
  AISLE: 'Pasillo',
  SHELF: 'Estante',
  LEVEL: 'Nivel',
}

export const NOTIFICATION_TYPES = {
  LOW_STOCK: 'Stock bajo',
  EXPIRATION_WARNING: 'Próximo a caducar',
  MOVEMENT_ALERT: 'Movimiento inusual',
  SYSTEM_PROCESS: 'Proceso del sistema',
  APPROVAL_REQUIRED: 'Requiere aprobación',
}

export const ROLE_LABELS = {
  SUPER_ADMIN: 'Super Administrador',
  MANAGER: 'Gerente',
  WAREHOUSE_OPERATOR: 'Operador de Almacén',
  AUDITOR: 'Auditor',
}
