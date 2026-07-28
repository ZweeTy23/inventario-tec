# Documentación de Integración: API de Movimientos e Historial (Juan)

Esta API gestiona todas las operaciones de entrada, salida y transferencia de inventario, así como el historial de valorización (Kardex).

## Base URL
`GET /api/movements`

---

## 1. Listar Movimientos
Obtiene el historial de movimientos con soporte para paginación y filtros avanzados.

- **URL:** `/api/movements`
- **Método:** `GET`
- **Permiso Requerido:** `MOVEMENTS_VIEW`
- **Filtros (Query Params):**
    - `page`: Número de página (default: 1)
    - `perPage`: Resultados por página (default: 20)
    - `productId`: Filtrar por un producto específico (UUID)
    - `locationId`: Filtrar por movimientos que involucren una ubicación (origen O destino)
    - `userId`: Filtrar por el usuario que registró el movimiento
    - `movementType`: `PURCHASE_ENTRY`, `RETURN_ENTRY`, `SALE_EXIT`, `LOSS_EXIT`, `EXPIRED_EXIT`, `TRANSFER`
    - `status`: `PENDING`, `APPROVED`, `REJECTED`
    - `fromDate`: Fecha inicial (ISO 8601)
    - `toDate`: Fecha final (ISO 8601)

### Ejemplo de Respuesta
```json
{
  "data": [
    {
      "id": "uuid",
      "quantity": 50,
      "movementType": "PURCHASE_ENTRY",
      "status": "APPROVED",
      "createdAt": "2026-06-16T17:00:00Z",
      "product": { "name": "Producto A", "sku": "SKU-001" },
      "sourceLocation": null,
      "destinationLocation": { "name": "Almacén Central" }
    }
  ],
  "meta": {
    "total": 120,
    "page": 1,
    "perPage": 20,
    "totalPages": 6
  }
}
```

---

## 2. Crear Movimiento
Registra una nueva operación de inventario.

- **URL:** `/api/movements`
- **Método:** `POST`
- **Permiso Requerido:** `MOVEMENTS_CREATE`
- **Cuerpo (JSON):**
```json
{
  "productId": "uuid",
  "movementType": "TRANSFER",
  "quantity": 10,
  "sourceLocationId": "uuid-origen",
  "destinationLocationId": "uuid-destino",
  "unitCost": 15.50, // Opcional, solo impacta en PURCHASE_ENTRY
  "batchNumber": "LOTE-2026", // Opcional
  "expirationDate": "2027-01-01", // Opcional
  "notes": "Transferencia interna de stock" // Opcional
}
```

> **Nota sobre Auto-Aprobación:**
> - Los movimientos de tipo `LOSS_EXIT` **siempre** quedan en `PENDING`.
> - Los movimientos que superan los umbrales configurados (ej: > 100 unidades o > $50,000) quedan en `PENDING`.
> - El resto se aprueba y aplica al stock automáticamente (`APPROVED`).

---

## 3. Aprobar / Rechazar Movimiento
Para movimientos en estado `PENDING`.

### Aprobar
- **URL:** `/api/movements/:id/approve`
- **Método:** `POST`
- **Permiso Requerido:** `MOVEMENTS_APPROVE`
- **Cuerpo (Opcional):** Permite corregir lote/vencimiento al momento de la recepción física.
```json
{
  "batchNumber": "LOTE-REAL-001",
  "expirationDate": "2027-05-20"
}
```

### Rechazar
- **URL:** `/api/movements/:id/reject`
- **Método:** `POST`
- **Cuerpo (Opcional):**
```json
{
  "reason": "Documentación incompleta"
}
```

---

## 4. Historial de Costos (Kardex)
Obtiene el ledger de valorización de un producto (Costo Promedio Ponderado).

- **URL:** `/api/movements/cost-history/:productId`
- **Método:** `GET`
- **Permiso Requerido:** `MOVEMENTS_VIEW`

### Ejemplo de Respuesta
```json
{
  "product": { "id": "uuid", "name": "Producto A", "averageCost": 12.50 },
  "history": [
    {
      "id": "uuid-ledger",
      "quantityIn": 100,
      "unitCost": 15.00,
      "previousAvgCost": 10.00,
      "newAvgCost": 12.50,
      "createdAt": "2026-06-16T10:00:00Z",
      "movement": { "id": "uuid-mov", "movementType": "PURCHASE_ENTRY" }
    }
  ]
}
```

---

## Errores Comunes
- `400 Bad Request`: Datos inválidos o stock insuficiente en origen.
- `403 Forbidden`: No tienes los permisos necesarios.
- `409 Conflict`: Intentar aprobar un movimiento que ya no está en `PENDING`.
