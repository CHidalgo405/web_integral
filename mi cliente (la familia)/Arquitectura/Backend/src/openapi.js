const uuid = { type: 'string', format: 'uuid' };
const date = { type: 'string', format: 'date' };
const dateTime = { type: 'string', format: 'date-time' };
const money = { type: 'number', format: 'double' };

const json = (schema) => ({
  'application/json': { schema },
});

const ok = (schema) => ({
  description: 'OK',
  content: json(schema),
});

const created = (schema) => ({
  description: 'Created',
  content: json(schema),
});

const deleted = {
  description: 'Deleted',
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

const crud = ({ tag, schema, createSchema = schema, updateSchema = schema, deleteDescription = 'Deleted', roles = [] }) => {
  const rolesStr = roles.length ? ` [Roles permitidos: ${roles.join(', ')}]` : '';
  const authResponses = {
    401: { $ref: '#/components/responses/Unauthorized' },
    403: { $ref: '#/components/responses/Forbidden' }
  };
  return {
    collection: {
      get: {
        tags: [tag],
        summary: `List ${tag.toLowerCase()}${rolesStr}`,
        responses: {
          200: ok({ type: 'array', items: { $ref: `#/components/schemas/${schema}` } }),
          ...authResponses
        },
      },
      post: {
        tags: [tag],
        summary: `Create ${tag.toLowerCase()}${rolesStr}`,
        requestBody: requestBody({ $ref: `#/components/schemas/${createSchema}` }),
        responses: {
          201: created({ $ref: `#/components/schemas/${schema}` }),
          ...authResponses
        },
      },
    },
    item: {
      parameters: [idParam],
      get: {
        tags: [tag],
        summary: `Get ${tag.toLowerCase()} by ID${rolesStr}`,
        responses: {
          200: ok({ $ref: `#/components/schemas/${schema}` }),
          404: { $ref: '#/components/responses/NotFound' },
          ...authResponses
        },
      },
      put: {
        tags: [tag],
        summary: `Update ${tag.toLowerCase()}${rolesStr}`,
        requestBody: requestBody({ $ref: `#/components/schemas/${updateSchema}` }),
        responses: {
          200: ok({ $ref: `#/components/schemas/${schema}` }),
          404: { $ref: '#/components/responses/NotFound' },
          ...authResponses
        },
      },
      delete: {
        tags: [tag],
        summary: `Delete ${tag.toLowerCase()}${rolesStr}`,
        responses: {
          200: { description: deleteDescription },
          204: deleted,
          404: { $ref: '#/components/responses/NotFound' },
          ...authResponses
        },
      },
    },
  };
};

const noDeleteCrud = ({ tag, schema, createSchema = schema, roles = [] }) => {
  const docs = crud({ tag, schema, createSchema, roles });
  delete docs.item.put;
  delete docs.item.delete;
  return docs;
};

const category = crud({ tag: 'Categories', schema: 'Category', createSchema: 'CategoryInput', roles: ['admin'] });
const unit = crud({ tag: 'Units', schema: 'UnitOfMeasure', createSchema: 'UnitOfMeasureInput', roles: ['admin'] });
const supplier = crud({ tag: 'Suppliers', schema: 'Supplier', createSchema: 'SupplierInput', deleteDescription: 'Supplier deactivated', roles: ['admin'] });
const employee = crud({ tag: 'Employees', schema: 'Employee', createSchema: 'EmployeeInput', deleteDescription: 'Employee deactivated', roles: ['admin'] });
const schedule = crud({ tag: 'Schedules', schema: 'Schedule', createSchema: 'ScheduleInput', roles: ['admin'] });
const user = crud({ tag: 'Users', schema: 'User', createSchema: 'UserInput', deleteDescription: 'User deactivated', roles: ['admin'] });
const customer = crud({ tag: 'Customers', schema: 'Customer', createSchema: 'CustomerInput', roles: ['admin', 'customer', 'cashier'] });
const deliveryZone = crud({ tag: 'Delivery Zones', schema: 'DeliveryZone', createSchema: 'DeliveryZoneInput', deleteDescription: 'Delivery zone deactivated', roles: ['admin'] });
const promotion = crud({ tag: 'Promotions', schema: 'Promotion', createSchema: 'PromotionInput', deleteDescription: 'Promotion deactivated', roles: ['admin'] });
const expenseCategory = crud({ tag: 'Expense Categories', schema: 'ExpenseCategory', createSchema: 'ExpenseCategoryInput', roles: ['admin'] });
const expense = crud({ tag: 'Expenses', schema: 'Expense', createSchema: 'ExpenseInput', roles: ['admin'] });
const expirationBatch = noDeleteCrud({ tag: 'Expiration Batches', schema: 'ExpirationBatch', createSchema: 'ExpirationBatchInput', roles: ['admin', 'stock'] });
expirationBatch.item.put = {
  tags: ['Expiration Batches'],
  summary: 'Update expiration batch [Roles permitidos: admin, stock]',
  requestBody: requestBody({ $ref: '#/components/schemas/ExpirationBatchInput' }),
  responses: {
    200: ok({ $ref: '#/components/schemas/ExpirationBatch' }),
    401: { $ref: '#/components/responses/Unauthorized' },
    403: { $ref: '#/components/responses/Forbidden' },
    404: { $ref: '#/components/responses/NotFound' },
  },
};
const stockReceipt = noDeleteCrud({ tag: 'Stock Receipts', schema: 'StockReceipt', createSchema: 'StockReceiptInput', roles: ['admin', 'stock'] });
delete stockReceipt.item.put;
const cashAudit = noDeleteCrud({ tag: 'Cash Audit', schema: 'CashAudit', createSchema: 'CashAuditInput', roles: ['admin', 'cashier'] });
delete cashAudit.item.put;

const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'Tiendita "La familia" API',
    description: 'Swagger/OpenAPI documentación oficial de la tiendita "La familia"',
    version: '1.0.0',
  },
  servers: [
    {
      url: process.env.BACKEND_URL || 'http://localhost:3000/api',
      description: 'API Server',
    },
  ],
  security: [
    {
      bearerAuth: [],
    },
  ],
  tags: [
    { name: 'Auth' },
    { name: 'Health' },
    { name: 'Shop Config' },
    { name: 'Categories' },
    { name: 'Units' },
    { name: 'Inventory' },
    { name: 'Barcodes' },
    { name: 'Price History' },
    { name: 'Suppliers' },
    { name: 'Purchase Orders' },
    { name: 'Stock Receipts' },
    { name: 'Expiration Batches' },
    { name: 'Employees' },
    { name: 'Schedules' },
    { name: 'Shift Covers' },
    { name: 'Users' },
    { name: 'Customers' },
    { name: 'Delivery Zones' },
    { name: 'Promotions' },
    { name: 'Purchases' },
    { name: 'Purchase Returns' },
    { name: 'Expense Categories' },
    { name: 'Expenses' },
    { name: 'Till Movements' },
    { name: 'Cash Audit' },
    { name: 'Cash Register' },
    { name: 'Notifications' },
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
        description: 'Resource not found',
        content: json({ $ref: '#/components/schemas/Error' }),
      },
      ValidationError: {
        description: 'Invalid request payload',
        content: json({ $ref: '#/components/schemas/Error' }),
      },
      Unauthorized: {
        description: 'Authentication token is missing, invalid, or expired',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              error: 'Unauthorized: Invalid or expired token'
            }
          }
        }
      },
      Forbidden: {
        description: 'The authenticated role cannot access this resource',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              error: 'Forbidden: Requires one of these roles: admin, manager',
              detail: 'No tienes permitido esto. Rol requerido no coincide o no tienes acceso.'
            }
          }
        }
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
          quantity_delta: { type: 'integer', description: 'Positive for entries, negative for exits' },
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
            description: 'Manager shares the administrative permission scope while retaining its role label.',
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
            description: 'Manager shares the administrative permission scope while retaining its role label.',
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
          shipping_tier: { type: 'string', enum: ['standard', 'express', 'pickup'], nullable: true },
          delivery_address: { type: 'string', nullable: true },
          delivery_distance_km: { type: 'number', nullable: true },
          delivery_zone_id: { ...uuid, nullable: true },
          delivery_fee: money,
          payment_method: { type: 'string', enum: ['cash', 'card', 'paypal'] },
          status: { type: 'string', enum: ['pending', 'preparing', 'shipped', 'delivered', 'completed', 'cancelled'] },
          subtotal: money,
          discount_total: money,
          total: money,
          cash_tendered: { ...money, nullable: true },
          change_given: { ...money, nullable: true },
          notes: { type: 'string', nullable: true },
          created_at: dateTime,
        },
      },
      CheckoutInput: {
        type: 'object',
        required: ['shipping_method', 'items'],
        properties: {
          address_id: { ...uuid, nullable: true, description: 'Required unless shipping_method is pickup' },
          shipping_method: { type: 'string', enum: ['standard', 'express', 'pickup'] },
          coupon_code: { type: 'string', nullable: true },
          items: {
            type: 'array',
            minItems: 1,
            items: { $ref: '#/components/schemas/PurchaseItemInput' },
          },
        },
      },
      PurchaseInput: {
        allOf: [
          { $ref: '#/components/schemas/CheckoutInput' },
          {
            type: 'object',
            required: ['payment_method'],
            properties: {
              payment_method: { type: 'string', enum: ['cash', 'paypal'] },
              paypal_order_id: { type: 'string', nullable: true },
            },
          },
        ],
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
        required: ['inventory_id', 'quantity'],
        properties: {
          inventory_id: uuid,
          quantity: { type: 'integer', minimum: 1, maximum: 1000 },
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
        tags: ['Health'],
        summary: 'API health check',
        security: [],
        responses: {
          200: ok({ $ref: '#/components/schemas/Message' }),
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user and login automatically',
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
          409: { description: 'Username already exists' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login and get tokens',
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
          401: { description: 'Invalid credentials' },
          403: { description: 'User is deactivated' },
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access token using refresh token (Refresh Token Rotation)',
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
          401: { description: 'Refresh token is required' },
          403: { description: 'Invalid, expired, or revoked refresh token' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout and revoke refresh token',
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
        tags: ['Auth'],
        summary: 'Request a password reset link',
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
        tags: ['Auth'],
        summary: 'Reset password using token',
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
          400: { description: 'Invalid token or credentials' },
        },
      },
    },
    '/shop-config': {
      get: {
        tags: ['Shop Config'],
        summary: 'Get shop configuration',
        responses: {
          200: ok({ $ref: '#/components/schemas/ShopConfig' }),
        },
      },
      put: {
        tags: ['Shop Config'],
        summary: 'Update shop configuration',
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
        tags: ['Inventory'],
        summary: 'List inventory items',
        parameters: [
          { name: 'active', in: 'query', schema: { type: 'boolean' } },
          { name: 'category_id', in: 'query', schema: uuid },
        ],
        responses: {
          200: ok({ type: 'array', items: { $ref: '#/components/schemas/InventoryItem' } }),
        },
      },
      post: {
        tags: ['Inventory'],
        summary: 'Create inventory item',
        requestBody: requestBody({ $ref: '#/components/schemas/InventoryItemInput' }),
        responses: {
          201: created({ $ref: '#/components/schemas/InventoryItem' }),
        },
      },
    },
    '/inventory/low-stock': {
      get: {
        tags: ['Inventory'],
        summary: 'List low-stock inventory items',
        responses: {
          200: ok({ type: 'array', items: { $ref: '#/components/schemas/InventoryItem' } }),
        },
      },
    },
    '/inventory/movements': {
      get: {
        tags: ['Inventory'],
        summary: 'List auditable stock movements (admin or stock role)',
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
        tags: ['Barcodes'],
        summary: 'Find inventory item by barcode',
        responses: {
          200: ok({ $ref: '#/components/schemas/InventoryItem' }),
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/inventory/{id}': {
      parameters: [idParam],
      get: {
        tags: ['Inventory'],
        summary: 'Get inventory item by ID',
        responses: {
          200: ok({ $ref: '#/components/schemas/InventoryItem' }),
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      put: {
        tags: ['Inventory'],
        summary: 'Update inventory item',
        requestBody: requestBody({ $ref: '#/components/schemas/InventoryItemInput' }),
        responses: {
          200: ok({ $ref: '#/components/schemas/InventoryItem' }),
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Inventory'],
        summary: 'Deactivate inventory item',
        responses: {
          200: ok({ $ref: '#/components/schemas/InventoryItem' }),
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/inventory/{id}/barcodes': {
      parameters: [idParam],
      get: {
        tags: ['Barcodes'],
        summary: 'List barcodes for an inventory item',
        responses: {
          200: ok({ type: 'array', items: { $ref: '#/components/schemas/Barcode' } }),
        },
      },
      post: {
        tags: ['Barcodes'],
        summary: 'Add barcode to an inventory item',
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
        tags: ['Inventory'],
        summary: 'Adjust stock and record the movement (admin or stock role)',
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
        tags: ['Barcodes'],
        summary: 'Remove barcode from an inventory item',
        responses: {
          204: deleted,
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/price-history': {
      get: {
        tags: ['Price History'],
        summary: 'List price history entries',
        responses: {
          200: ok({ type: 'array', items: { $ref: '#/components/schemas/PriceHistory' } }),
        },
      },
    },
    '/price-history/inventory/{id}': {
      parameters: [idParam],
      get: {
        tags: ['Price History'],
        summary: 'List price history for one inventory item',
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
        tags: ['Suppliers'],
        summary: 'List supplier items',
        responses: {
          200: ok({ type: 'array', items: { $ref: '#/components/schemas/SupplierItem' } }),
        },
      },
      post: {
        tags: ['Suppliers'],
        summary: 'Add item to supplier',
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
        tags: ['Suppliers'],
        summary: 'Update supplier item',
        requestBody: requestBody({ $ref: '#/components/schemas/SupplierItemInput' }),
        responses: {
          200: ok({ $ref: '#/components/schemas/SupplierItem' }),
        },
      },
      delete: {
        tags: ['Suppliers'],
        summary: 'Remove supplier item',
        responses: {
          204: deleted,
        },
      },
    },
    '/purchase-orders': {
      get: {
        tags: ['Purchase Orders'],
        summary: 'List purchase orders',
        responses: {
          200: ok({ type: 'array', items: { $ref: '#/components/schemas/PurchaseOrder' } }),
        },
      },
      post: {
        tags: ['Purchase Orders'],
        summary: 'Create purchase order',
        requestBody: requestBody({ $ref: '#/components/schemas/PurchaseOrderInput' }),
        responses: {
          201: created({ $ref: '#/components/schemas/PurchaseOrder' }),
        },
      },
    },
    '/purchase-orders/{id}': {
      parameters: [idParam],
      get: {
        tags: ['Purchase Orders'],
        summary: 'Get purchase order by ID',
        responses: {
          200: ok({ $ref: '#/components/schemas/PurchaseOrder' }),
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      put: {
        tags: ['Purchase Orders'],
        summary: 'Update purchase order',
        requestBody: requestBody({ $ref: '#/components/schemas/PurchaseOrderInput' }),
        responses: {
          200: ok({ $ref: '#/components/schemas/PurchaseOrder' }),
        },
      },
      delete: {
        tags: ['Purchase Orders'],
        summary: 'Delete purchase order',
        responses: {
          204: deleted,
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/purchase-orders/{id}/items': {
      parameters: [idParam],
      get: {
        tags: ['Purchase Orders'],
        summary: 'List purchase order items',
        responses: {
          200: ok({ type: 'array', items: { $ref: '#/components/schemas/PurchaseOrderItem' } }),
        },
      },
      post: {
        tags: ['Purchase Orders'],
        summary: 'Add item to purchase order',
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
        tags: ['Purchase Orders'],
        summary: 'Update purchase order item',
        requestBody: requestBody({ $ref: '#/components/schemas/PurchaseOrderItemInput' }),
        responses: {
          200: ok({ $ref: '#/components/schemas/PurchaseOrderItem' }),
        },
      },
      delete: {
        tags: ['Purchase Orders'],
        summary: 'Remove purchase order item',
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
        tags: ['Shift Covers'],
        summary: 'List shift covers',
        responses: {
          200: ok({ type: 'array', items: { $ref: '#/components/schemas/ShiftCover' } }),
        },
      },
      post: {
        tags: ['Shift Covers'],
        summary: 'Create shift cover',
        requestBody: requestBody({ $ref: '#/components/schemas/ShiftCoverInput' }),
        responses: {
          201: created({ $ref: '#/components/schemas/ShiftCover' }),
        },
      },
    },
    '/shift-covers/{id}': {
      parameters: [idParam],
      get: {
        tags: ['Shift Covers'],
        summary: 'Get shift cover by ID',
        responses: {
          200: ok({ $ref: '#/components/schemas/ShiftCover' }),
        },
      },
      delete: {
        tags: ['Shift Covers'],
        summary: 'Delete shift cover',
        responses: {
          204: deleted,
        },
      },
    },
    '/users': user.collection,
    '/users/cashiers': {
      post: {
        tags: ['Users'],
        summary: 'Create a cashier employee and login account (admin only)',
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
        tags: ['Delivery Zones'],
        summary: 'Calculate delivery fee by distance',
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
        tags: ['Delivery Zones'],
        summary: 'List audit entries for a delivery zone',
        responses: {
          200: ok({ type: 'array', items: { type: 'object' } }),
        },
      },
    },
    '/promotions': promotion.collection,
    '/promotions/{id}': promotion.item,
    '/purchases': {
      get: {
        tags: ['Purchases'],
        summary: 'List purchases',
        responses: {
          200: ok({ type: 'array', items: { $ref: '#/components/schemas/Purchase' } }),
        },
      },
      post: {
        tags: ['Purchases'],
        summary: 'Create purchase with line items',
        requestBody: requestBody({ $ref: '#/components/schemas/PurchaseInput' }),
        responses: {
          201: created({ $ref: '#/components/schemas/Purchase' }),
        },
      },
    },
    '/purchases/quote': {
      post: {
        tags: ['Purchases'],
        summary: 'Calculate an authoritative checkout quote from current prices and stock',
        requestBody: requestBody({ $ref: '#/components/schemas/CheckoutInput' }),
        responses: {
          200: ok({ type: 'object' }),
          409: { description: 'Insufficient stock' },
        },
      },
    },
    '/paypal/config': {
      get: {
        tags: ['Payments'],
        summary: 'Get public PayPal checkout configuration',
        responses: { 200: ok({ type: 'object' }), 503: { description: 'PayPal is not configured' } },
      },
    },
    '/paypal/create-order': {
      post: {
        tags: ['Payments'],
        summary: 'Create a PayPal order using the authoritative server quote',
        requestBody: requestBody({ $ref: '#/components/schemas/CheckoutInput' }),
        responses: { 201: created({ type: 'object' }), 409: { description: 'Insufficient stock' } },
      },
    },
    '/paypal/capture-order': {
      post: {
        tags: ['Payments'],
        summary: 'Capture a PayPal order owned by the authenticated user',
        requestBody: requestBody({
          type: 'object',
          required: ['paypalOrderId'],
          properties: { paypalOrderId: { type: 'string' } },
        }),
        responses: { 200: ok({ type: 'object' }), 403: { $ref: '#/components/responses/Forbidden' } },
      },
    },
    '/purchases/pos': {
      post: {
        tags: ['Cash Register'],
        summary: 'Create a point-of-sale purchase using server-side prices',
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
          409: { description: 'Register closed or insufficient stock' },
        },
      },
    },
    '/purchases/{id}': {
      parameters: [idParam],
      get: {
        tags: ['Purchases'],
        summary: 'Get purchase by ID',
        responses: {
          200: ok({ $ref: '#/components/schemas/Purchase' }),
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/purchases/{id}/items': {
      parameters: [idParam],
      get: {
        tags: ['Purchases'],
        summary: 'List purchase line items',
        responses: {
          200: ok({ type: 'array', items: { $ref: '#/components/schemas/PurchaseItem' } }),
        },
      },
    },
    '/purchases/{id}/status': {
      parameters: [idParam],
      patch: {
        tags: ['Purchases'],
        summary: 'Update purchase status',
        requestBody: requestBody({ $ref: '#/components/schemas/PurchaseStatusInput' }),
        responses: {
          200: ok({ $ref: '#/components/schemas/Purchase' }),
        },
      },
    },
    '/returns': {
      get: {
        tags: ['Purchase Returns'],
        summary: 'List purchase returns',
        responses: {
          200: ok({ type: 'array', items: { $ref: '#/components/schemas/PurchaseReturn' } }),
        },
      },
      post: {
        tags: ['Purchase Returns'],
        summary: 'Create purchase return with returned items',
        requestBody: requestBody({ $ref: '#/components/schemas/PurchaseReturnInput' }),
        responses: {
          201: created({ $ref: '#/components/schemas/PurchaseReturn' }),
        },
      },
    },
    '/returns/{id}': {
      parameters: [idParam],
      get: {
        tags: ['Purchase Returns'],
        summary: 'Get purchase return by ID',
        responses: {
          200: ok({ $ref: '#/components/schemas/PurchaseReturn' }),
        },
      },
    },
    '/returns/{id}/items': {
      parameters: [idParam],
      get: {
        tags: ['Purchase Returns'],
        summary: 'List returned items',
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
        tags: ['Till Movements'],
        summary: 'List till movements',
        responses: {
          200: ok({ type: 'array', items: { $ref: '#/components/schemas/TillMovement' } }),
        },
      },
      post: {
        tags: ['Till Movements'],
        summary: 'Create till movement',
        requestBody: requestBody({ $ref: '#/components/schemas/TillMovementInput' }),
        responses: {
          201: created({ $ref: '#/components/schemas/TillMovement' }),
        },
      },
    },
    '/till-movements/balance': {
      get: {
        tags: ['Till Movements'],
        summary: 'Get till balance summary',
        responses: {
          200: ok({ type: 'array', items: { $ref: '#/components/schemas/TillBalance' } }),
        },
      },
    },
    '/till-movements/{id}': {
      parameters: [idParam],
      get: {
        tags: ['Till Movements'],
        summary: 'Get till movement by ID',
        responses: {
          200: ok({ $ref: '#/components/schemas/TillMovement' }),
        },
      },
    },
    '/cash-audit': cashAudit.collection,
    '/cash-audit/{id}': cashAudit.item,
    '/cash-register/status': {
      get: {
        tags: ['Cash Register'],
        summary: 'Get the authenticated cashier register status and daily totals',
        responses: { 200: ok({ type: 'object' }) },
      },
    },
    '/cash-register/open': {
      post: {
        tags: ['Cash Register'],
        summary: 'Open the authenticated cashier register',
        requestBody: requestBody({
          type: 'object',
          required: ['opening_amount'],
          properties: {
            opening_amount: money,
            shift: { type: 'string', enum: ['morning', 'afternoon'] },
          },
        }),
        responses: { 201: created({ type: 'object' }), 409: { description: 'Register already open' } },
      },
    },
    '/cash-register/close': {
      post: {
        tags: ['Cash Register'],
        summary: 'Close the authenticated cashier register and calculate difference',
        requestBody: requestBody({
          type: 'object',
          required: ['counted_amount'],
          properties: { counted_amount: money },
        }),
        responses: { 201: created({ type: 'object' }), 409: { description: 'No open register' } },
      },
    },
    '/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'List notifications',
        responses: {
          200: ok({ type: 'array', items: { $ref: '#/components/schemas/Notification' } }),
        },
      },
      post: {
        tags: ['Notifications'],
        summary: 'Create notification',
        requestBody: requestBody({ $ref: '#/components/schemas/NotificationInput' }),
        responses: {
          201: created({ $ref: '#/components/schemas/Notification' }),
        },
      },
    },
    '/notifications/seen-all': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark all notifications as seen',
        responses: {
          200: ok({ $ref: '#/components/schemas/Message' }),
        },
      },
    },
    '/notifications/{id}': {
      parameters: [idParam],
      get: {
        tags: ['Notifications'],
        summary: 'Get notification by ID',
        responses: {
          200: ok({ $ref: '#/components/schemas/Notification' }),
        },
      },
    },
    '/notifications/{id}/seen': {
      parameters: [idParam],
      patch: {
        tags: ['Notifications'],
        summary: 'Mark notification as seen',
        responses: {
          200: ok({ $ref: '#/components/schemas/Notification' }),
        },
      },
    },
  },
};

module.exports = openapi;
