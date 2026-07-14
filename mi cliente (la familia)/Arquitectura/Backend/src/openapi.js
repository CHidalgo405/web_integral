const uuid = { type: 'string', format: 'uuid' };
const date = { type: 'string', format: 'date' };
const dateTime = { type: 'string', format: 'date-time' };
const money = { type: 'number', format: 'double' };

const json = (schema) => ({
  'application/json': { schema },
});

const ok = (schema) => ({
  description: 'Correcto',
  content: json(schema),
});

const created = (schema) => ({
  description: 'Creado',
  content: json(schema),
});

const deleted = {
  description: 'Eliminado',
};

const idParam = {
  name: 'id',
  in: 'path',
  required: true,
  schema: uuid,
};

const requestBody = (schema) => ({
  required: true,
  content: json(schema),
});

const crud = ({ tag, schema, createSchema = schema, updateSchema = schema, deleteDescription = 'Deleted' }) => ({
  collection: {
    get: {
      tags: [tag],
      summary: `Listar ${tag.toLowerCase()}`,
      responses: {
        200: ok({ type: 'array', items: { $ref: `#/components/schemas/${schema}` } }),
      },
    },
    post: {
      tags: [tag],
      summary: `Crear ${tag.toLowerCase()}`,
      requestBody: requestBody({ $ref: `#/components/schemas/${createSchema}` }),
      responses: {
        201: created({ $ref: `#/components/schemas/${schema}` }),
      },
    },
  },
  item: {
    parameters: [idParam],
    get: {
      tags: [tag],
      summary: `Obtener ${tag.toLowerCase()} por ID`,
      responses: {
        200: ok({ $ref: `#/components/schemas/${schema}` }),
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
    put: {
      tags: [tag],
      summary: `Actualizar ${tag.toLowerCase()}`,
      requestBody: requestBody({ $ref: `#/components/schemas/${updateSchema}` }),
      responses: {
        200: ok({ $ref: `#/components/schemas/${schema}` }),
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
    delete: {
      tags: [tag],
      summary: `Eliminar ${tag.toLowerCase()}`,
      responses: {
        200: { description: deleteDescription },
        204: deleted,
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
  },
});

const noDeleteCrud = ({ tag, schema, createSchema = schema }) => {
  const docs = crud({ tag, schema, createSchema });
  delete docs.item.put;
  delete docs.item.delete;
  return docs;
};

const category = crud({ tag: 'Categorías', schema: 'Category', createSchema: 'CategoryInput' });
const unit = crud({ tag: 'Unidades', schema: 'UnitOfMeasure', createSchema: 'UnitOfMeasureInput' });
const supplier = crud({ tag: 'Proveedores', schema: 'Supplier', createSchema: 'SupplierInput', deleteDescription: 'Proveedor desactivado' });
const employee = crud({ tag: 'Empleados', schema: 'Employee', createSchema: 'EmployeeInput', deleteDescription: 'Empleado desactivado' });
const schedule = crud({ tag: 'Horarios', schema: 'Schedule', createSchema: 'ScheduleInput' });
const user = crud({ tag: 'Usuarios', schema: 'User', createSchema: 'UserInput', deleteDescription: 'Usuario desactivado' });
const customer = crud({ tag: 'Clientes', schema: 'Customer', createSchema: 'CustomerInput' });
const deliveryZone = crud({ tag: 'Zonas de entrega', schema: 'DeliveryZone', createSchema: 'DeliveryZoneInput', deleteDescription: 'Zona de entrega desactivada' });
const promotion = crud({ tag: 'Promociones', schema: 'Promotion', createSchema: 'PromotionInput', deleteDescription: 'Promoción desactivada' });
const expenseCategory = crud({ tag: 'Categorías de gasto', schema: 'ExpenseCategory', createSchema: 'ExpenseCategoryInput' });
const expense = crud({ tag: 'Gastos', schema: 'Expense', createSchema: 'ExpenseInput' });
const expirationBatch = noDeleteCrud({ tag: 'Lotes de caducidad', schema: 'ExpirationBatch', createSchema: 'ExpirationBatchInput' });
expirationBatch.item.put = {
  tags: ['Lotes de caducidad'],
  summary: 'Actualizar lote de caducidad',
  requestBody: requestBody({ $ref: '#/components/schemas/ExpirationBatchInput' }),
  responses: {
    200: ok({ $ref: '#/components/schemas/ExpirationBatch' }),
    404: { $ref: '#/components/responses/NotFound' },
  },
};
const stockReceipt = noDeleteCrud({ tag: 'Recepciones de existencias', schema: 'StockReceipt', createSchema: 'StockReceiptInput' });
delete stockReceipt.item.put;
const cashAudit = noDeleteCrud({ tag: 'Auditoría de caja', schema: 'CashAudit', createSchema: 'CashAuditInput' });
delete cashAudit.item.put;

const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'Tiendita Maday API',
    description: 'Documentación Swagger/OpenAPI de Tiendita Maday. El rol de gerente comparte el alcance de permisos administrativos.',
    version: '1.0.0',
  },
  servers: [
    {
      url: process.env.BACKEND_URL || 'http://localhost:3000/api',
      description: 'Servidor de la API',
    },
  ],
  security: [
    {
      bearerAuth: [],
    },
  ],
  tags: [
    { name: 'Autenticación' },
    { name: 'Estado' },
    { name: 'Configuración de tienda' },
    { name: 'Categorías' },
    { name: 'Unidades' },
    { name: 'Inventario' },
    { name: 'Códigos de barras' },
    { name: 'Historial de precios' },
    { name: 'Proveedores' },
    { name: 'Órdenes de compra' },
    { name: 'Recepciones de existencias' },
    { name: 'Lotes de caducidad' },
    { name: 'Empleados' },
    { name: 'Horarios' },
    { name: 'Coberturas de turno' },
    { name: 'Usuarios' },
    { name: 'Clientes' },
    { name: 'Zonas de entrega' },
    { name: 'Promociones' },
    { name: 'Compras' },
    { name: 'Devoluciones de compra' },
    { name: 'Categorías de gasto' },
    { name: 'Gastos' },
    { name: 'Movimientos de caja' },
    { name: 'Auditoría de caja' },
    { name: 'Caja registradora' },
    { name: 'Notificaciones' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    responses: {
      NotFound: {
        description: 'Recurso no encontrado',
        content: json({ $ref: '#/components/schemas/Error' }),
      },
      ValidationError: {
        description: 'Datos de solicitud no válidos',
        content: json({ $ref: '#/components/schemas/Error' }),
      },
      Forbidden: {
        description: 'El rol autenticado no puede acceder a este recurso',
        content: json({ $ref: '#/components/schemas/Error' }),
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          detail: { type: 'string' },
        },
      },
      Message: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
      ShopConfig: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          shop_name: { type: 'string' },
          address: { type: 'string', nullable: true },
          latitude: { type: 'number', nullable: true },
          longitude: { type: 'number', nullable: true },
          currency: { type: 'string', example: 'MXN' },
          updated_at: dateTime,
        },
      },
      ShopConfigInput: {
        type: 'object',
        properties: {
          shop_name: { type: 'string' },
          address: { type: 'string', nullable: true },
          latitude: { type: 'number', nullable: true },
          longitude: { type: 'number', nullable: true },
          currency: { type: 'string', example: 'MXN' },
        },
      },
      Category: {
        type: 'object',
        properties: {
          id: uuid,
          parent_id: { ...uuid, nullable: true },
          name: { type: 'string' },
          slug: { type: 'string' },
        },
      },
      CategoryInput: {
        type: 'object',
        required: ['name', 'slug'],
        properties: {
          parent_id: { ...uuid, nullable: true },
          name: { type: 'string' },
          slug: { type: 'string' },
        },
      },
      UnitOfMeasure: {
        type: 'object',
        properties: {
          id: uuid,
          name: { type: 'string' },
          abbreviation: { type: 'string' },
        },
      },
      UnitOfMeasureInput: {
        type: 'object',
        required: ['name', 'abbreviation'],
        properties: {
          name: { type: 'string' },
          abbreviation: { type: 'string' },
        },
      },
      InventoryItem: {
        type: 'object',
        properties: {
          id: uuid,
          name: { type: 'string' },
          sku: { type: 'string', nullable: true },
          description: { type: 'string', nullable: true },
          category_id: { ...uuid, nullable: true },
          uom_id: { ...uuid, nullable: true },
          price: money,
          cost: { ...money, nullable: true },
          stock: { type: 'integer' },
          min_stock: { type: 'integer' },
          has_expiration: { type: 'boolean' },
          active: { type: 'boolean' },
          created_at: dateTime,
          updated_at: dateTime,
        },
      },
      InventoryItemInput: {
        type: 'object',
        required: ['name', 'price'],
        properties: {
          name: { type: 'string' },
          sku: { type: 'string', nullable: true },
          description: { type: 'string', nullable: true },
          category_id: { ...uuid, nullable: true },
          uom_id: { ...uuid, nullable: true },
          price: money,
          cost: { ...money, nullable: true },
          stock: { type: 'integer', default: 0 },
          min_stock: { type: 'integer', default: 0 },
          has_expiration: { type: 'boolean', default: false },
          active: { type: 'boolean', default: true },
        },
      },
      InventoryMovement: {
        type: 'object',
        properties: {
          id: uuid,
          inventory_id: uuid,
          inventory_name: { type: 'string' },
          sku: { type: 'string', nullable: true },
          user_id: { ...uuid, nullable: true },
          performed_by: { type: 'string' },
          movement_type: { type: 'string', enum: ['entry', 'exit'] },
          quantity_delta: { type: 'integer' },
          previous_stock: { type: 'integer' },
          new_stock: { type: 'integer' },
          reason: { type: 'string' },
          notes: { type: 'string', nullable: true },
          created_at: dateTime,
        },
      },
      InventoryAdjustmentInput: {
        type: 'object',
        required: ['quantity_delta', 'reason'],
        properties: {
          quantity_delta: { type: 'integer', description: 'Positivo para entradas y negativo para salidas' },
          reason: { type: 'string', minLength: 2, maxLength: 80 },
          notes: { type: 'string', maxLength: 500, nullable: true },
        },
      },
      Barcode: {
        type: 'object',
        properties: {
          barcode: { type: 'string' },
          inventory_id: uuid,
          description: { type: 'string', nullable: true },
        },
      },
      Supplier: {
        type: 'object',
        properties: {
          id: uuid,
          name: { type: 'string' },
          contact_name: { type: 'string', nullable: true },
          phone: { type: 'string', nullable: true },
          email: { type: 'string', nullable: true },
          address: { type: 'string', nullable: true },
          notes: { type: 'string', nullable: true },
          active: { type: 'boolean' },
          created_at: dateTime,
        },
      },
      SupplierInput: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
          contact_name: { type: 'string', nullable: true },
          phone: { type: 'string', nullable: true },
          email: { type: 'string', nullable: true },
          address: { type: 'string', nullable: true },
          notes: { type: 'string', nullable: true },
          active: { type: 'boolean', default: true },
        },
      },
      SupplierItem: {
        type: 'object',
        properties: {
          supplier_id: uuid,
          inventory_id: uuid,
          supplier_sku: { type: 'string', nullable: true },
          supplier_price: { ...money, nullable: true },
          is_preferred: { type: 'boolean' },
        },
      },
      SupplierItemInput: {
        type: 'object',
        required: ['inventory_id'],
        properties: {
          inventory_id: uuid,
          supplier_sku: { type: 'string', nullable: true },
          supplier_price: { ...money, nullable: true },
          is_preferred: { type: 'boolean', default: false },
        },
      },
      PurchaseOrder: {
        type: 'object',
        properties: {
          id: uuid,
          supplier_id: uuid,
          employee_id: { ...uuid, nullable: true },
          status: { type: 'string', enum: ['draft', 'sent', 'partial', 'received', 'cancelled'] },
          expected_date: { ...date, nullable: true },
          notes: { type: 'string', nullable: true },
          created_at: dateTime,
          updated_at: dateTime,
        },
      },
      PurchaseOrderInput: {
        type: 'object',
        required: ['supplier_id'],
        properties: {
          supplier_id: uuid,
          employee_id: { ...uuid, nullable: true },
          status: { type: 'string', enum: ['draft', 'sent', 'partial', 'received', 'cancelled'], default: 'draft' },
          expected_date: { ...date, nullable: true },
          notes: { type: 'string', nullable: true },
        },
      },
      PurchaseOrderItem: {
        type: 'object',
        properties: {
          id: uuid,
          order_id: uuid,
          inventory_id: uuid,
          quantity_ordered: { type: 'integer' },
          quantity_received: { type: 'integer' },
          unit_cost: { ...money, nullable: true },
        },
      },
      PurchaseOrderItemInput: {
        type: 'object',
        required: ['inventory_id', 'quantity_ordered'],
        properties: {
          inventory_id: uuid,
          quantity_ordered: { type: 'integer', minimum: 1 },
          quantity_received: { type: 'integer', default: 0 },
          unit_cost: { ...money, nullable: true },
        },
      },
      StockReceipt: {
        type: 'object',
        properties: {
          id: uuid,
          inventory_id: uuid,
          supplier_id: { ...uuid, nullable: true },
          purchase_order_id: { ...uuid, nullable: true },
          quantity: { type: 'integer' },
          cost_per_unit: { ...money, nullable: true },
          expiration_date: { ...date, nullable: true },
          received_at: dateTime,
          notes: { type: 'string', nullable: true },
        },
      },
      StockReceiptInput: {
        type: 'object',
        required: ['inventory_id', 'quantity'],
        properties: {
          inventory_id: uuid,
          supplier_id: { ...uuid, nullable: true },
          purchase_order_id: { ...uuid, nullable: true },
          quantity: { type: 'integer', minimum: 1 },
          cost_per_unit: { ...money, nullable: true },
          expiration_date: { ...date, nullable: true },
          notes: { type: 'string', nullable: true },
        },
      },
      ExpirationBatch: {
        type: 'object',
        properties: {
          id: uuid,
          inventory_id: uuid,
          receipt_id: { ...uuid, nullable: true },
          quantity: { type: 'integer' },
          expiration_date: date,
          notified: { type: 'boolean' },
          removed: { type: 'boolean' },
          removed_at: { ...dateTime, nullable: true },
          created_at: dateTime,
        },
      },
      ExpirationBatchInput: {
        type: 'object',
        required: ['inventory_id', 'quantity', 'expiration_date'],
        properties: {
          inventory_id: uuid,
          receipt_id: { ...uuid, nullable: true },
          quantity: { type: 'integer', minimum: 0 },
          expiration_date: date,
          notified: { type: 'boolean', default: false },
          removed: { type: 'boolean', default: false },
        },
      },
      Employee: {
        type: 'object',
        properties: {
          id: uuid,
          first_name: { type: 'string' },
          last_name: { type: 'string' },
          phone: { type: 'string', nullable: true },
          email: { type: 'string', nullable: true },
          role: { type: 'string' },
          pin: { type: 'string', nullable: true },
          active: { type: 'boolean' },
          hired_at: { ...date, nullable: true },
          created_at: dateTime,
        },
      },
      EmployeeInput: {
        type: 'object',
        required: ['first_name', 'last_name'],
        properties: {
          first_name: { type: 'string' },
          last_name: { type: 'string' },
          phone: { type: 'string', nullable: true },
          email: { type: 'string', nullable: true },
          role: { type: 'string', default: 'cashier' },
          pin: { type: 'string', nullable: true, minLength: 4, maxLength: 4 },
          active: { type: 'boolean', default: true },
          hired_at: { ...date, nullable: true },
        },
      },
      Schedule: {
        type: 'object',
        properties: {
          id: uuid,
          employee_id: uuid,
          work_date: date,
          shift: { type: 'string', enum: ['morning', 'afternoon'] },
        },
      },
      ScheduleInput: {
        type: 'object',
        required: ['employee_id', 'work_date', 'shift'],
        properties: {
          employee_id: uuid,
          work_date: date,
          shift: { type: 'string', enum: ['morning', 'afternoon'] },
        },
      },
      ShiftCover: {
        type: 'object',
        properties: {
          id: uuid,
          schedule_id: uuid,
          original_employee_id: uuid,
          covering_employee_id: uuid,
          work_date: date,
          shift: { type: 'string', enum: ['morning', 'afternoon'] },
          discount_applied: { type: 'boolean' },
          notes: { type: 'string', nullable: true },
          registered_at: dateTime,
        },
      },
      ShiftCoverInput: {
        type: 'object',
        required: ['schedule_id', 'original_employee_id', 'covering_employee_id', 'work_date', 'shift'],
        properties: {
          schedule_id: uuid,
          original_employee_id: uuid,
          covering_employee_id: uuid,
          work_date: date,
          shift: { type: 'string', enum: ['morning', 'afternoon'] },
          discount_applied: { type: 'boolean', default: false },
          notes: { type: 'string', nullable: true },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: uuid,
          employee_id: { ...uuid, nullable: true },
          username: { type: 'string' },
          role: {
            type: 'string',
            enum: ['admin', 'manager', 'cashier', 'stock', 'customer'],
            description: 'El gerente comparte el alcance de permisos administrativos y conserva la etiqueta de su rol.',
          },
          active: { type: 'boolean' },
          must_change_password: { type: 'boolean' },
          created_at: dateTime,
          updated_at: dateTime,
        },
      },
      UserInput: {
        type: 'object',
        required: ['username'],
        properties: {
          employee_id: { ...uuid, nullable: true },
          username: { type: 'string' },
          password: { type: 'string', format: 'password' },
          password_hash: { type: 'string', format: 'password' },
          role: {
            type: 'string',
            enum: ['admin', 'manager', 'cashier', 'stock', 'customer'],
            default: 'cashier',
            description: 'El gerente comparte el alcance de permisos administrativos y conserva la etiqueta de su rol.',
          },
          active: { type: 'boolean', default: true },
          must_change_password: { type: 'boolean', default: false },
        },
      },
      Customer: {
        type: 'object',
        properties: {
          id: uuid,
          name: { type: 'string' },
          phone: { type: 'string', nullable: true },
          email: { type: 'string', nullable: true },
          address: { type: 'string', nullable: true },
          created_at: dateTime,
        },
      },
      CustomerInput: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
          phone: { type: 'string', nullable: true },
          email: { type: 'string', nullable: true },
          address: { type: 'string', nullable: true },
        },
      },
      DeliveryZone: {
        type: 'object',
        properties: {
          id: uuid,
          name: { type: 'string' },
          min_km: { type: 'number' },
          max_km: { type: 'number' },
          base_fee: money,
          fee_per_km: money,
          active: { type: 'boolean' },
          updated_by: { ...uuid, nullable: true },
          created_at: dateTime,
          updated_at: dateTime,
        },
      },
      DeliveryZoneInput: {
        type: 'object',
        required: ['name', 'max_km', 'base_fee'],
        properties: {
          name: { type: 'string' },
          min_km: { type: 'number', default: 0 },
          max_km: { type: 'number' },
          base_fee: money,
          fee_per_km: { ...money, default: 0 },
          active: { type: 'boolean', default: true },
          updated_by: { ...uuid, nullable: true },
        },
      },
      DeliveryFee: {
        type: 'object',
        properties: {
          distance_km: { type: 'number' },
          delivery_fee: money,
        },
      },
      Promotion: {
        type: 'object',
        properties: {
          id: uuid,
          name: { type: 'string' },
          description: { type: 'string', nullable: true },
          discount_pct: { type: 'number', nullable: true },
          discount_fixed: { ...money, nullable: true },
          inventory_id: { ...uuid, nullable: true },
          auto_generated: { type: 'boolean' },
          active: { type: 'boolean' },
          valid_from: { ...date, nullable: true },
          valid_until: { ...date, nullable: true },
          created_at: dateTime,
        },
      },
      PromotionInput: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
          description: { type: 'string', nullable: true },
          discount_pct: { type: 'number', nullable: true },
          discount_fixed: { ...money, nullable: true },
          inventory_id: { ...uuid, nullable: true },
          auto_generated: { type: 'boolean', default: false },
          active: { type: 'boolean', default: true },
          valid_from: { ...date, nullable: true },
          valid_until: { ...date, nullable: true },
        },
      },
      Purchase: {
        type: 'object',
        properties: {
          id: uuid,
          customer_id: { ...uuid, nullable: true },
          employee_id: { ...uuid, nullable: true },
          delivery_method: { type: 'string', enum: ['on_spot', 'home_delivery', 'pickup'] },
          delivery_address: { type: 'string', nullable: true },
          delivery_distance_km: { type: 'number', nullable: true },
          delivery_zone_id: { ...uuid, nullable: true },
          delivery_fee: money,
          payment_method: { type: 'string', enum: ['cash', 'card'] },
          status: { type: 'string', enum: ['pending', 'completed', 'cancelled'] },
          subtotal: money,
          discount_total: money,
          total: money,
          cash_tendered: { ...money, nullable: true },
          change_given: { ...money, nullable: true },
          notes: { type: 'string', nullable: true },
          created_at: dateTime,
        },
      },
      PurchaseInput: {
        type: 'object',
        required: ['payment_method', 'items'],
        properties: {
          customer_id: { ...uuid, nullable: true },
          employee_id: { ...uuid, nullable: true },
          delivery_method: { type: 'string', enum: ['on_spot', 'home_delivery', 'pickup'], default: 'on_spot' },
          delivery_address: { type: 'string', nullable: true },
          delivery_distance_km: { type: 'number', nullable: true },
          delivery_zone_id: { ...uuid, nullable: true },
          delivery_fee: { ...money, default: 0 },
          payment_method: { type: 'string', enum: ['cash', 'card'] },
          status: { type: 'string', enum: ['pending', 'completed', 'cancelled'], default: 'completed' },
          subtotal: { ...money, default: 0 },
          discount_total: { ...money, default: 0 },
          total: { ...money, default: 0 },
          cash_tendered: { ...money, nullable: true },
          notes: { type: 'string', nullable: true },
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/PurchaseItemInput' },
          },
        },
      },
      PurchaseStatusInput: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['pending', 'completed', 'cancelled'] },
        },
      },
      PurchaseItem: {
        type: 'object',
        properties: {
          id: uuid,
          purchase_id: uuid,
          inventory_id: uuid,
          promotion_id: { ...uuid, nullable: true },
          quantity: { type: 'integer' },
          unit_price: money,
          discount_pct: { type: 'number' },
          line_total: money,
        },
      },
      PurchaseItemInput: {
        type: 'object',
        required: ['inventory_id', 'quantity', 'unit_price', 'line_total'],
        properties: {
          inventory_id: uuid,
          promotion_id: { ...uuid, nullable: true },
          quantity: { type: 'integer', minimum: 1 },
          unit_price: money,
          discount_pct: { type: 'number', default: 0 },
          line_total: money,
        },
      },
      PurchaseReturn: {
        type: 'object',
        properties: {
          id: uuid,
          purchase_id: uuid,
          employee_id: { ...uuid, nullable: true },
          refund_method: { type: 'string', enum: ['cash', 'card'] },
          reason: { type: 'string', enum: ['defective', 'wrong_item', 'expired', 'customer_changed_mind', 'other'] },
          notes: { type: 'string', nullable: true },
          total_refunded: money,
          created_at: dateTime,
        },
      },
      PurchaseReturnInput: {
        type: 'object',
        required: ['purchase_id', 'refund_method', 'reason', 'total_refunded', 'items'],
        properties: {
          purchase_id: uuid,
          employee_id: { ...uuid, nullable: true },
          refund_method: { type: 'string', enum: ['cash', 'card'] },
          reason: { type: 'string', enum: ['defective', 'wrong_item', 'expired', 'customer_changed_mind', 'other'] },
          notes: { type: 'string', nullable: true },
          total_refunded: money,
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/PurchaseReturnItemInput' },
          },
        },
      },
      PurchaseReturnItem: {
        type: 'object',
        properties: {
          id: uuid,
          return_id: uuid,
          purchase_item_id: uuid,
          inventory_id: uuid,
          quantity: { type: 'integer' },
          unit_price: money,
          restock: { type: 'boolean' },
        },
      },
      PurchaseReturnItemInput: {
        type: 'object',
        required: ['purchase_item_id', 'inventory_id', 'quantity', 'unit_price'],
        properties: {
          purchase_item_id: uuid,
          inventory_id: uuid,
          quantity: { type: 'integer', minimum: 1 },
          unit_price: money,
          restock: { type: 'boolean', default: true },
        },
      },
      ExpenseCategory: {
        type: 'object',
        properties: {
          id: uuid,
          name: { type: 'string' },
        },
      },
      ExpenseCategoryInput: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
        },
      },
      Expense: {
        type: 'object',
        properties: {
          id: uuid,
          category_id: { ...uuid, nullable: true },
          employee_id: { ...uuid, nullable: true },
          description: { type: 'string' },
          amount: money,
          payment_method: { type: 'string', enum: ['cash', 'card'] },
          receipt_ref: { type: 'string', nullable: true },
          expense_date: date,
          created_at: dateTime,
        },
      },
      ExpenseInput: {
        type: 'object',
        required: ['description', 'amount', 'payment_method'],
        properties: {
          category_id: { ...uuid, nullable: true },
          employee_id: { ...uuid, nullable: true },
          description: { type: 'string' },
          amount: money,
          payment_method: { type: 'string', enum: ['cash', 'card'] },
          receipt_ref: { type: 'string', nullable: true },
          expense_date: date,
        },
      },
      TillMovement: {
        type: 'object',
        properties: {
          id: uuid,
          employee_id: { ...uuid, nullable: true },
          shift: { type: 'string', enum: ['morning', 'afternoon'], nullable: true },
          movement_type: { type: 'string', enum: ['float_in', 'float_out', 'sale', 'refund', 'expense', 'correction'] },
          amount: money,
          reference_id: { ...uuid, nullable: true },
          notes: { type: 'string', nullable: true },
          created_at: dateTime,
        },
      },
      TillMovementInput: {
        type: 'object',
        required: ['movement_type', 'amount'],
        properties: {
          employee_id: { ...uuid, nullable: true },
          shift: { type: 'string', enum: ['morning', 'afternoon'], nullable: true },
          movement_type: { type: 'string', enum: ['float_in', 'float_out', 'sale', 'refund', 'expense', 'correction'] },
          amount: money,
          reference_id: { ...uuid, nullable: true },
          notes: { type: 'string', nullable: true },
        },
      },
      TillBalance: {
        type: 'object',
        properties: {
          shift: { type: 'string', enum: ['morning', 'afternoon'] },
          drawer_date: date,
          balance: money,
        },
      },
      CashAudit: {
        type: 'object',
        properties: {
          id: uuid,
          employee_id: { ...uuid, nullable: true },
          shift: { type: 'string', enum: ['morning', 'afternoon'], nullable: true },
          audit_type: { type: 'string', enum: ['open', 'close', 'count', 'adjustment'] },
          expected_amount: { ...money, nullable: true },
          counted_amount: money,
          difference: money,
          notes: { type: 'string', nullable: true },
          created_at: dateTime,
        },
      },
      CashAuditInput: {
        type: 'object',
        required: ['audit_type', 'counted_amount'],
        properties: {
          employee_id: { ...uuid, nullable: true },
          shift: { type: 'string', enum: ['morning', 'afternoon'], nullable: true },
          audit_type: { type: 'string', enum: ['open', 'close', 'count', 'adjustment'] },
          expected_amount: { ...money, nullable: true },
          counted_amount: money,
          notes: { type: 'string', nullable: true },
        },
      },
      Notification: {
        type: 'object',
        properties: {
          id: uuid,
          type: { type: 'string', enum: ['expiry_warning', 'expired_removed', 'low_stock', 'promo_created', 'cash_discrepancy'] },
          reference_id: { ...uuid, nullable: true },
          message: { type: 'string' },
          seen: { type: 'boolean' },
          seen_by: { ...uuid, nullable: true },
          seen_at: { ...dateTime, nullable: true },
          created_at: dateTime,
        },
      },
      NotificationInput: {
        type: 'object',
        required: ['type', 'message'],
        properties: {
          type: { type: 'string', enum: ['expiry_warning', 'expired_removed', 'low_stock', 'promo_created', 'cash_discrepancy'] },
          reference_id: { ...uuid, nullable: true },
          message: { type: 'string' },
          seen: { type: 'boolean', default: false },
          seen_by: { ...uuid, nullable: true },
        },
      },
      PriceHistory: {
        type: 'object',
        properties: {
          id: uuid,
          inventory_id: uuid,
          old_price: { ...money, nullable: true },
          new_price: money,
          changed_by: { ...uuid, nullable: true },
          changed_at: dateTime,
        },
      },
    },
  },
  paths: {
    '/': {
      get: {
        tags: ['Estado'],
        summary: 'Comprobar el estado de la API',
        security: [],
        responses: {
          200: ok({ $ref: '#/components/schemas/Message' }),
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Autenticación'],
        summary: 'Registrar un usuario nuevo e iniciar sesión automáticamente',
        security: [],
        requestBody: requestBody({
          type: 'object',
          required: ['first_name', 'last_name', 'email', 'password'],
          properties: {
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            password: { type: 'string', format: 'password' },
          },
        }),
        responses: {
          201: created({
            type: 'object',
            properties: {
              message: { type: 'string' },
              user: { $ref: '#/components/schemas/User' },
              accessToken: { type: 'string' },
              refreshToken: { type: 'string' },
            },
          }),
          400: { $ref: '#/components/responses/ValidationError' },
          409: { description: 'El usuario ya existe' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Autenticación'],
        summary: 'Iniciar sesión y obtener tokens',
        security: [],
        requestBody: requestBody({
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', format: 'password' },
            remember_me: { type: 'boolean', default: false },
          },
        }),
        responses: {
          200: ok({
            type: 'object',
            properties: {
              message: { type: 'string' },
              user: { $ref: '#/components/schemas/User' },
              accessToken: { type: 'string' },
              refreshToken: { type: 'string' },
            },
          }),
          400: { $ref: '#/components/responses/ValidationError' },
          401: { description: 'Credenciales no válidas' },
          403: { description: 'El usuario está desactivado' },
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Autenticación'],
        summary: 'Renovar el token de acceso mediante el token de renovación',
        security: [],
        requestBody: requestBody({
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string' },
          },
        }),
        responses: {
          200: ok({
            type: 'object',
            properties: {
              accessToken: { type: 'string' },
              refreshToken: { type: 'string' },
            },
          }),
          401: { description: 'Se requiere el token de renovación' },
          403: { description: 'El token de renovación no es válido, expiró o fue revocado' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Autenticación'],
        summary: 'Cerrar sesión y revocar el token de renovación',
        security: [],
        requestBody: requestBody({
          type: 'object',
          properties: {
            refreshToken: { type: 'string' },
          },
        }),
        responses: {
          204: deleted,
        },
      },
    },
    '/auth/forgot-password': {
      post: {
        tags: ['Autenticación'],
        summary: 'Solicitar un enlace para restablecer la contraseña',
        security: [],
        requestBody: requestBody({
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email' },
          },
        }),
        responses: {
          200: ok({
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          }),
          400: { $ref: '#/components/responses/ValidationError' },
        },
      },
    },
    '/auth/reset-password': {
      post: {
        tags: ['Autenticación'],
        summary: 'Restablecer la contraseña mediante un token',
        security: [],
        requestBody: requestBody({
          type: 'object',
          required: ['email', 'token', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            token: { type: 'string' },
            password: { type: 'string', format: 'password', minLength: 8 },
          },
        }),
        responses: {
          200: ok({
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          }),
          400: { description: 'Token o credenciales no válidos' },
        },
      },
    },
    '/shop-config': {
      get: {
        tags: ['Configuración de tienda'],
        summary: 'Obtener la configuración de la tienda',
        responses: {
          200: ok({ $ref: '#/components/schemas/ShopConfig' }),
        },
      },
      put: {
        tags: ['Configuración de tienda'],
        summary: 'Actualizar la configuración de la tienda',
        requestBody: requestBody({ $ref: '#/components/schemas/ShopConfigInput' }),
        responses: {
          200: ok({ $ref: '#/components/schemas/ShopConfig' }),
        },
      },
    },
    '/categories': category.collection,
    '/categories/{id}': category.item,
    '/units': unit.collection,
    '/units/{id}': unit.item,
    '/inventory': {
      get: {
        tags: ['Inventario'],
        summary: 'Listar artículos del inventario',
        parameters: [
          { name: 'active', in: 'query', schema: { type: 'boolean' } },
          { name: 'category_id', in: 'query', schema: uuid },
        ],
        responses: {
          200: ok({ type: 'array', items: { $ref: '#/components/schemas/InventoryItem' } }),
        },
      },
      post: {
        tags: ['Inventario'],
        summary: 'Crear artículo de inventario',
        requestBody: requestBody({ $ref: '#/components/schemas/InventoryItemInput' }),
        responses: {
          201: created({ $ref: '#/components/schemas/InventoryItem' }),
        },
      },
    },
    '/inventory/low-stock': {
      get: {
        tags: ['Inventario'],
        summary: 'Listar artículos con existencias bajas',
        responses: {
          200: ok({ type: 'array', items: { $ref: '#/components/schemas/InventoryItem' } }),
        },
      },
    },
    '/inventory/movements': {
      get: {
        tags: ['Inventario'],
        summary: 'Listar movimientos auditables de existencias',
        parameters: [
          { name: 'inventory_id', in: 'query', schema: uuid },
          { name: 'movement_type', in: 'query', schema: { type: 'string', enum: ['entry', 'exit'] } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 250, default: 100 } },
        ],
        responses: {
          200: ok({ type: 'array', items: { $ref: '#/components/schemas/InventoryMovement' } }),
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/inventory/barcode/{barcode}': {
      parameters: [{ name: 'barcode', in: 'path', required: true, schema: { type: 'string' } }],
      get: {
        tags: ['Códigos de barras'],
        summary: 'Buscar un artículo por código de barras',
        responses: {
          200: ok({ $ref: '#/components/schemas/InventoryItem' }),
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/inventory/{id}': {
      parameters: [idParam],
      get: {
        tags: ['Inventario'],
        summary: 'Obtener un artículo por ID',
        responses: {
          200: ok({ $ref: '#/components/schemas/InventoryItem' }),
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      put: {
        tags: ['Inventario'],
        summary: 'Actualizar un artículo de inventario',
        requestBody: requestBody({ $ref: '#/components/schemas/InventoryItemInput' }),
        responses: {
          200: ok({ $ref: '#/components/schemas/InventoryItem' }),
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Inventario'],
        summary: 'Desactivar un artículo de inventario',
        responses: {
          200: ok({ $ref: '#/components/schemas/InventoryItem' }),
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/inventory/{id}/barcodes': {
      parameters: [idParam],
      get: {
        tags: ['Códigos de barras'],
        summary: 'Listar códigos de barras de un artículo',
        responses: {
          200: ok({ type: 'array', items: { $ref: '#/components/schemas/Barcode' } }),
        },
      },
      post: {
        tags: ['Códigos de barras'],
        summary: 'Agregar un código de barras a un artículo',
        requestBody: requestBody({
          type: 'object',
          required: ['barcode'],
          properties: {
            barcode: { type: 'string' },
            description: { type: 'string', nullable: true },
          },
        }),
        responses: {
          201: created({ $ref: '#/components/schemas/Barcode' }),
        },
      },
    },
    '/inventory/{id}/adjustments': {
      parameters: [idParam],
      post: {
        tags: ['Inventario'],
        summary: 'Ajustar existencias y registrar el movimiento',
        requestBody: requestBody({ $ref: '#/components/schemas/InventoryAdjustmentInput' }),
        responses: {
          201: created({ $ref: '#/components/schemas/InventoryMovement' }),
          400: { $ref: '#/components/responses/ValidationError' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/inventory/{id}/barcodes/{barcode}': {
      parameters: [
        idParam,
        { name: 'barcode', in: 'path', required: true, schema: { type: 'string' } },
      ],
      delete: {
        tags: ['Códigos de barras'],
        summary: 'Quitar un código de barras de un artículo',
        responses: {
          204: deleted,
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/price-history': {
      get: {
        tags: ['Historial de precios'],
        summary: 'Listar el historial de precios',
        responses: {
          200: ok({ type: 'array', items: { $ref: '#/components/schemas/PriceHistory' } }),
        },
      },
    },
    '/price-history/inventory/{id}': {
      parameters: [idParam],
      get: {
        tags: ['Historial de precios'],
        summary: 'Listar el historial de precios de un artículo',
        responses: {
          200: ok({ type: 'array', items: { $ref: '#/components/schemas/PriceHistory' } }),
        },
      },
    },
    '/suppliers': supplier.collection,
    '/suppliers/{id}': supplier.item,
    '/suppliers/{id}/items': {
      parameters: [idParam],
      get: {
        tags: ['Proveedores'],
        summary: 'Listar productos del proveedor',
        responses: {
          200: ok({ type: 'array', items: { $ref: '#/components/schemas/SupplierItem' } }),
        },
      },
      post: {
        tags: ['Proveedores'],
        summary: 'Agregar un producto al proveedor',
        requestBody: requestBody({ $ref: '#/components/schemas/SupplierItemInput' }),
        responses: {
          201: created({ $ref: '#/components/schemas/SupplierItem' }),
        },
      },
    },
    '/suppliers/{id}/items/{inventoryId}': {
      parameters: [
        idParam,
        { name: 'inventoryId', in: 'path', required: true, schema: uuid },
      ],
      put: {
        tags: ['Proveedores'],
        summary: 'Actualizar un producto del proveedor',
        requestBody: requestBody({ $ref: '#/components/schemas/SupplierItemInput' }),
        responses: {
          200: ok({ $ref: '#/components/schemas/SupplierItem' }),
        },
      },
      delete: {
        tags: ['Proveedores'],
        summary: 'Quitar un producto del proveedor',
        responses: {
          204: deleted,
        },
      },
    },
    '/purchase-orders': {
      get: {
        tags: ['Órdenes de compra'],
        summary: 'Listar órdenes de compra',
        responses: {
          200: ok({ type: 'array', items: { $ref: '#/components/schemas/PurchaseOrder' } }),
        },
      },
      post: {
        tags: ['Órdenes de compra'],
        summary: 'Crear una orden de compra',
        requestBody: requestBody({ $ref: '#/components/schemas/PurchaseOrderInput' }),
        responses: {
          201: created({ $ref: '#/components/schemas/PurchaseOrder' }),
        },
      },
    },
    '/purchase-orders/{id}': {
      parameters: [idParam],
      get: {
        tags: ['Órdenes de compra'],
        summary: 'Obtener una orden de compra por ID',
        responses: {
          200: ok({ $ref: '#/components/schemas/PurchaseOrder' }),
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      put: {
        tags: ['Órdenes de compra'],
        summary: 'Actualizar una orden de compra',
        requestBody: requestBody({ $ref: '#/components/schemas/PurchaseOrderInput' }),
        responses: {
          200: ok({ $ref: '#/components/schemas/PurchaseOrder' }),
        },
      },
      delete: {
        tags: ['Órdenes de compra'],
        summary: 'Eliminar una orden de compra',
        responses: {
          204: deleted,
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/purchase-orders/{id}/items': {
      parameters: [idParam],
      get: {
        tags: ['Órdenes de compra'],
        summary: 'Listar productos de una orden de compra',
        responses: {
          200: ok({ type: 'array', items: { $ref: '#/components/schemas/PurchaseOrderItem' } }),
        },
      },
      post: {
        tags: ['Órdenes de compra'],
        summary: 'Agregar un producto a la orden de compra',
        requestBody: requestBody({ $ref: '#/components/schemas/PurchaseOrderItemInput' }),
        responses: {
          201: created({ $ref: '#/components/schemas/PurchaseOrderItem' }),
        },
      },
    },
    '/purchase-orders/{id}/items/{itemId}': {
      parameters: [
        idParam,
        { name: 'itemId', in: 'path', required: true, schema: uuid },
      ],
      put: {
        tags: ['Órdenes de compra'],
        summary: 'Actualizar un producto de la orden de compra',
        requestBody: requestBody({ $ref: '#/components/schemas/PurchaseOrderItemInput' }),
        responses: {
          200: ok({ $ref: '#/components/schemas/PurchaseOrderItem' }),
        },
      },
      delete: {
        tags: ['Órdenes de compra'],
        summary: 'Quitar un producto de la orden de compra',
        responses: {
          204: deleted,
        },
      },
    },
    '/stock-receipts': stockReceipt.collection,
    '/stock-receipts/{id}': stockReceipt.item,
    '/expiration-batches': expirationBatch.collection,
    '/expiration-batches/{id}': expirationBatch.item,
    '/employees': employee.collection,
    '/employees/{id}': employee.item,
    '/schedules': schedule.collection,
    '/schedules/{id}': schedule.item,
    '/shift-covers': {
      get: {
        tags: ['Coberturas de turno'],
        summary: 'Listar coberturas de turno',
        responses: {
          200: ok({ type: 'array', items: { $ref: '#/components/schemas/ShiftCover' } }),
        },
      },
      post: {
        tags: ['Coberturas de turno'],
        summary: 'Crear una cobertura de turno',
        requestBody: requestBody({ $ref: '#/components/schemas/ShiftCoverInput' }),
        responses: {
          201: created({ $ref: '#/components/schemas/ShiftCover' }),
        },
      },
    },
    '/shift-covers/{id}': {
      parameters: [idParam],
      get: {
        tags: ['Coberturas de turno'],
        summary: 'Obtener una cobertura de turno por ID',
        responses: {
          200: ok({ $ref: '#/components/schemas/ShiftCover' }),
        },
      },
      delete: {
        tags: ['Coberturas de turno'],
        summary: 'Eliminar una cobertura de turno',
        responses: {
          204: deleted,
        },
      },
    },
    '/users': user.collection,
    '/users/cashiers': {
      post: {
        tags: ['Usuarios'],
        summary: 'Crear un cajero y su cuenta de acceso',
        requestBody: requestBody({
          type: 'object',
          required: ['first_name', 'last_name', 'email', 'password'],
          properties: {
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            password: { type: 'string', format: 'password', minLength: 8 },
            pin: { type: 'string', pattern: '^\\d{4}$' },
          },
        }),
        responses: { 201: created({ $ref: '#/components/schemas/User' }) },
      },
    },
    '/users/{id}': user.item,
    '/customers': customer.collection,
    '/customers/{id}': customer.item,
    '/delivery-zones': deliveryZone.collection,
    '/delivery-zones/fee': {
      get: {
        tags: ['Zonas de entrega'],
        summary: 'Calcular la tarifa de entrega por distancia',
        parameters: [
          { name: 'distance_km', in: 'query', required: true, schema: { type: 'number' } },
        ],
        responses: {
          200: ok({ $ref: '#/components/schemas/DeliveryFee' }),
        },
      },
    },
    '/delivery-zones/{id}': deliveryZone.item,
    '/delivery-zones/{id}/audit': {
      parameters: [idParam],
      get: {
        tags: ['Zonas de entrega'],
        summary: 'Listar auditorías de una zona de entrega',
        responses: {
          200: ok({ type: 'array', items: { type: 'object' } }),
        },
      },
    },
    '/promotions': promotion.collection,
    '/promotions/{id}': promotion.item,
    '/purchases': {
      get: {
        tags: ['Compras'],
        summary: 'Listar compras',
        responses: {
          200: ok({ type: 'array', items: { $ref: '#/components/schemas/Purchase' } }),
        },
      },
      post: {
        tags: ['Compras'],
        summary: 'Crear una compra con sus productos',
        requestBody: requestBody({ $ref: '#/components/schemas/PurchaseInput' }),
        responses: {
          201: created({ $ref: '#/components/schemas/Purchase' }),
        },
      },
    },
    '/purchases/pos': {
      post: {
        tags: ['Caja registradora'],
        summary: 'Crear una venta de caja con precios calculados por el servidor',
        requestBody: requestBody({
          type: 'object',
          required: ['items', 'payment_method'],
          properties: {
            customer_id: { ...uuid, nullable: true },
            payment_method: { type: 'string', enum: ['cash', 'card'] },
            cash_tendered: { ...money, nullable: true },
            notes: { type: 'string' },
            items: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                required: ['inventory_id', 'quantity'],
                properties: { inventory_id: uuid, quantity: { type: 'integer', minimum: 1 } },
              },
            },
          },
        }),
        responses: {
          201: created({ $ref: '#/components/schemas/Purchase' }),
          409: { description: 'Caja cerrada o existencias insuficientes' },
        },
      },
    },
    '/purchases/{id}': {
      parameters: [idParam],
      get: {
        tags: ['Compras'],
        summary: 'Obtener una compra por ID',
        responses: {
          200: ok({ $ref: '#/components/schemas/Purchase' }),
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/purchases/{id}/items': {
      parameters: [idParam],
      get: {
        tags: ['Compras'],
        summary: 'Listar productos de una compra',
        responses: {
          200: ok({ type: 'array', items: { $ref: '#/components/schemas/PurchaseItem' } }),
        },
      },
    },
    '/purchases/{id}/status': {
      parameters: [idParam],
      patch: {
        tags: ['Compras'],
        summary: 'Actualizar el estado de una compra',
        requestBody: requestBody({ $ref: '#/components/schemas/PurchaseStatusInput' }),
        responses: {
          200: ok({ $ref: '#/components/schemas/Purchase' }),
        },
      },
    },
    '/returns': {
      get: {
        tags: ['Devoluciones de compra'],
        summary: 'Listar devoluciones de compra',
        responses: {
          200: ok({ type: 'array', items: { $ref: '#/components/schemas/PurchaseReturn' } }),
        },
      },
      post: {
        tags: ['Devoluciones de compra'],
        summary: 'Crear una devolución con sus productos',
        requestBody: requestBody({ $ref: '#/components/schemas/PurchaseReturnInput' }),
        responses: {
          201: created({ $ref: '#/components/schemas/PurchaseReturn' }),
        },
      },
    },
    '/returns/{id}': {
      parameters: [idParam],
      get: {
        tags: ['Devoluciones de compra'],
        summary: 'Obtener una devolución por ID',
        responses: {
          200: ok({ $ref: '#/components/schemas/PurchaseReturn' }),
        },
      },
    },
    '/returns/{id}/items': {
      parameters: [idParam],
      get: {
        tags: ['Devoluciones de compra'],
        summary: 'Listar productos devueltos',
        responses: {
          200: ok({ type: 'array', items: { $ref: '#/components/schemas/PurchaseReturnItem' } }),
        },
      },
    },
    '/expense-categories': expenseCategory.collection,
    '/expense-categories/{id}': expenseCategory.item,
    '/expenses': expense.collection,
    '/expenses/{id}': expense.item,
    '/till-movements': {
      get: {
        tags: ['Movimientos de caja'],
        summary: 'Listar movimientos de caja',
        responses: {
          200: ok({ type: 'array', items: { $ref: '#/components/schemas/TillMovement' } }),
        },
      },
      post: {
        tags: ['Movimientos de caja'],
        summary: 'Crear un movimiento de caja',
        requestBody: requestBody({ $ref: '#/components/schemas/TillMovementInput' }),
        responses: {
          201: created({ $ref: '#/components/schemas/TillMovement' }),
        },
      },
    },
    '/till-movements/balance': {
      get: {
        tags: ['Movimientos de caja'],
        summary: 'Obtener el resumen de saldo de caja',
        responses: {
          200: ok({ type: 'array', items: { $ref: '#/components/schemas/TillBalance' } }),
        },
      },
    },
    '/till-movements/{id}': {
      parameters: [idParam],
      get: {
        tags: ['Movimientos de caja'],
        summary: 'Obtener un movimiento de caja por ID',
        responses: {
          200: ok({ $ref: '#/components/schemas/TillMovement' }),
        },
      },
    },
    '/cash-audit': cashAudit.collection,
    '/cash-audit/{id}': cashAudit.item,
    '/cash-register/status': {
      get: {
        tags: ['Caja registradora'],
        summary: 'Obtener el estado de caja y los totales diarios del cajero autenticado',
        responses: { 200: ok({ type: 'object' }) },
      },
    },
    '/cash-register/open': {
      post: {
        tags: ['Caja registradora'],
        summary: 'Abrir la caja del cajero autenticado',
        requestBody: requestBody({
          type: 'object',
          required: ['opening_amount'],
          properties: {
            opening_amount: money,
            shift: { type: 'string', enum: ['morning', 'afternoon'] },
          },
        }),
        responses: { 201: created({ type: 'object' }), 409: { description: 'La caja ya está abierta' } },
      },
    },
    '/cash-register/close': {
      post: {
        tags: ['Caja registradora'],
        summary: 'Cerrar la caja del cajero autenticado y calcular la diferencia',
        requestBody: requestBody({
          type: 'object',
          required: ['counted_amount'],
          properties: { counted_amount: money },
        }),
        responses: { 201: created({ type: 'object' }), 409: { description: 'No hay una caja abierta' } },
      },
    },
    '/notifications': {
      get: {
        tags: ['Notificaciones'],
        summary: 'Listar notificaciones',
        responses: {
          200: ok({ type: 'array', items: { $ref: '#/components/schemas/Notification' } }),
        },
      },
      post: {
        tags: ['Notificaciones'],
        summary: 'Crear una notificación',
        requestBody: requestBody({ $ref: '#/components/schemas/NotificationInput' }),
        responses: {
          201: created({ $ref: '#/components/schemas/Notification' }),
        },
      },
    },
    '/notifications/seen-all': {
      patch: {
        tags: ['Notificaciones'],
        summary: 'Marcar todas las notificaciones como vistas',
        responses: {
          200: ok({ $ref: '#/components/schemas/Message' }),
        },
      },
    },
    '/notifications/{id}': {
      parameters: [idParam],
      get: {
        tags: ['Notificaciones'],
        summary: 'Obtener una notificación por ID',
        responses: {
          200: ok({ $ref: '#/components/schemas/Notification' }),
        },
      },
    },
    '/notifications/{id}/seen': {
      parameters: [idParam],
      patch: {
        tags: ['Notificaciones'],
        summary: 'Marcar una notificación como vista',
        responses: {
          200: ok({ $ref: '#/components/schemas/Notification' }),
        },
      },
    },
  },
};

module.exports = openapi;
