const customerCreateSchema = {
  type: 'object',
  required: ['name', 'email', 'phone'],
  properties: {
    name: { type: 'string', minLength: 2, maxLength: 100 },
    email: { type: 'string', format: 'email' },
    phone: { type: 'string', pattern: '^[+]?[1-9]\\d{1,14}$' },
    avatar: { type: 'string', format: 'uri' },
    preferences: { type: 'string', maxLength: 500 }
  },
  additionalProperties: false
};

const customerUpdateSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 2, maxLength: 100 },
    email: { type: 'string', format: 'email' },
    phone: { type: 'string', pattern: '^[+]?[1-9]\\d{1,14}$' },
    avatar: { type: 'string', format: 'uri' },
    preferences: { type: 'string', maxLength: 500 }
  },
  additionalProperties: false
};

const customerResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    email: { type: 'string' },
    phone: { type: 'string' },
    avatar: { type: 'string' },
    loyaltyPoints: { type: 'integer' },
    totalVisits: { type: 'integer' },
    lastVisit: { type: 'string', format: 'date-time' },
    preferences: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  }
};

const customersListResponseSchema = {
  type: 'object',
  properties: {
    customers: {
      type: 'array',
      items: customerResponseSchema
    },
    pagination: {
      type: 'object',
      properties: {
        page: { type: 'integer' },
        limit: { type: 'integer' },
        total: { type: 'integer' },
        pages: { type: 'integer' }
      }
    }
  }
};

module.exports = {
  customerCreateSchema,
  customerUpdateSchema,
  customerResponseSchema,
  customersListResponseSchema
};
