const { connect } = require('../db');

class FunctionRegistry {
  constructor() {
    this.fns = new Map();
  }
  register(name, fn, schema) {
    this.fns.set(name, { fn, schema });
  }
  getAllSchemas() {
    const arr = [];
    for (const [name, { schema }] of this.fns.entries()) {
      arr.push({ name, schema });
    }
    return arr;
  }
  async execute(name, args) {
    const entry = this.fns.get(name);
    if (!entry) throw new Error('function not found');
    return entry.fn(args);
  }
}

const registry = new FunctionRegistry();

// getOrderStatus(orderId)
registry.register('getOrderStatus', async ({ orderId }) => {
  const db = await connect();
  const order = await db.collection('orders').findOne({ _id: require('mongodb').ObjectId(orderId) });
  if (!order) return { error: 'not found' };
  return { status: order.status, order };
}, { params: { type: 'object', properties: { orderId: { type: 'string' } }, required: ['orderId'] } });

// searchProducts(query, limit)
registry.register('searchProducts', async ({ query, limit = 10 }) => {
  const db = await connect();
  const items = await db.collection('products').find({ $text: { $search: query } }).limit(limit).toArray();
  return { results: items };
}, { params: { type: 'object', properties: { query: { type: 'string' }, limit: { type: 'number' } }, required: ['query'] } });

// getCustomerOrders(email)
registry.register('getCustomerOrders', async ({ email }) => {
  const db = await connect();
  const customer = await db.collection('customers').findOne({ email: email.toLowerCase() });
  if (!customer) return { error: 'customer not found' };
  const orders = await db.collection('orders').find({ customerId: customer._id }).toArray();
  return { orders };
}, { params: { type: 'object', properties: { email: { type: 'string' } }, required: ['email'] } });

module.exports = registry;
