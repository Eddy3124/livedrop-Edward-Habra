const { MongoClient, ObjectId } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config();

const uri = process.env.MONGODB_URI;
if (!uri) { console.error('MONGODB_URI required in env'); process.exit(1); }

async function run() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  const customers = [
    { name: 'Maya Haddad', email: 'maya.haddad@example.com', phone: '+96170000001', address: 'Beirut, Lebanon', createdAt: new Date() },
    { name: 'Omar Nader', email: 'omar.nader@example.com', phone: '+96170000002', address: 'Tripoli, Lebanon', createdAt: new Date() },
    { name: 'Rami Saliba', email: 'rami.saliba@example.com', phone: '+96170000003', address: 'Sidon, Lebanon', createdAt: new Date() },
    { name: 'Lina Khoury', email: 'lina.khoury@example.com', phone: '+96170000004', address: 'Zahle, Lebanon', createdAt: new Date() },
    { name: 'demo user', email: 'demo@example.com', phone: '+96170000005', address: 'Demo City', createdAt: new Date() }
  ];

  const prodBase = [
    { name: 'Everyday Denim Jacket', description: 'Classic denim jacket, unisex', price: 79.99, category: 'Apparel', tags: ['jacket','denim'], imageUrl: '', stock: 25 },
    { name: 'Commuter Backpack 20L', description: 'Water-resistant commuter backpack', price: 59.99, category: 'Bags', tags: ['bag','backpack'], imageUrl: '', stock: 40 },
    { name: 'Thermal Travel Mug', description: 'Keeps drinks hot for 8 hours', price: 24.5, category: 'Home', tags: ['mug','travel'], imageUrl: '', stock: 120 },
    { name: 'Wireless Earbuds Pro', description: 'Noise-cancelling earbuds', price: 129.99, category: 'Electronics', tags: ['audio','earbuds'], imageUrl: '', stock: 60 },
    { name: 'Minimalist Wallet', description: 'Slim leather card wallet', price: 29.99, category: 'Accessories', tags: ['wallet','leather'], imageUrl: '', stock: 80 },
    { name: 'All-weather Sneakers', description: 'Comfortable everyday sneakers', price: 89.5, category: 'Footwear', tags: ['shoes','sneakers'], imageUrl: '', stock: 30 }
  ];

  // Expand to ~20 products by duplicating variations
  const products = [];
  for (let i=0;i<20;i++) {
    const base = prodBase[i % prodBase.length];
    products.push({ ...base, name: `${base.name} ${i+1}`, price: +(base.price + (i%5)*5).toFixed(2), createdAt: new Date() });
  }

  // Clean collections
  await db.collection('customers').deleteMany({});
  await db.collection('products').deleteMany({});
  await db.collection('orders').deleteMany({});

  const custRes = await db.collection('customers').insertMany(customers);
  const prodRes = await db.collection('products').insertMany(products);

  const customerIds = Object.values(custRes.insertedIds);
  const prodIds = Object.values(prodRes.insertedIds);

  const orders = [];
  for (let i=0;i<15;i++) {
    const cid = customerIds[i % customerIds.length];
    const items = [ { productId: prodIds[i % prodIds.length], name: products[i%products.length].name, price: products[i%products.length].price, quantity: 1 } ];
    const status = ['PENDING','PROCESSING','SHIPPED','DELIVERED'][i % 4];
    orders.push({ customerId: cid, items, total: items.reduce((s,it)=>s+it.price*it.quantity,0), status, carrier: 'LocalExpress', estimatedDelivery: new Date(Date.now()+5*24*3600*1000), createdAt: new Date(Date.now()-(i*86400000)), updatedAt: new Date(Date.now()-(i*86400000)) });
  }

  // Ensure demo@example.com has 2 orders
  const demoCustomer = await db.collection('customers').findOne({ email: 'demo@example.com' });
  if (demoCustomer) {
    orders.push({ customerId: demoCustomer._id, items: [{ productId: prodIds[0], name: products[0].name, price: products[0].price, quantity: 2 }], total: products[0].price*2, status: 'PENDING', carrier: 'LocalExpress', estimatedDelivery: new Date(Date.now()+3*24*3600*1000), createdAt: new Date(), updatedAt: new Date() });
    orders.push({ customerId: demoCustomer._id, items: [{ productId: prodIds[1], name: products[1].name, price: products[1].price, quantity: 1 }], total: products[1].price, status: 'SHIPPED', carrier: 'LocalExpress', estimatedDelivery: new Date(Date.now()+2*24*3600*1000), createdAt: new Date(), updatedAt: new Date() });
  }

  await db.collection('orders').insertMany(orders);

  console.log('Seed complete', { customers: Object.keys(custRes.insertedIds).length, products: Object.keys(prodRes.insertedIds).length, orders: orders.length });
  await client.close();
}

run().catch(err => { console.error(err); process.exit(1); });
