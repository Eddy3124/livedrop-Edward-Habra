const express = require('express');
const router = express.Router();
const { connect } = require('../db');
const ObjectId = require('mongodb').ObjectId;
const { createOrderStream } = require('../sse/order-status');

router.post('/', async (req, res) => {
  const body = req.body;
  if (!Array.isArray(body.items) || body.items.length === 0) return res.status(400).json({ error: 'invalid order - items required' });
  try {
    const db = await connect();
    let customerId = null;
    if (body.customerId) {
      customerId = ObjectId(body.customerId);
    } else if (body.customerEmail) {
      const customer = await db.collection('customers').findOne({ email: body.customerEmail.toLowerCase() });
      if (customer) customerId = customer._id;
    }

    const order = {
      customerId: customerId,
      items: body.items,
      total: body.total || body.items.reduce((s, it) => s + (it.price || 0) * (it.quantity || 1), 0),
      status: 'PENDING',
      carrier: body.carrier || null,
      estimatedDelivery: body.estimatedDelivery || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await db.collection('orders').insertOne(order);
    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const db = await connect();
    const order = await db.collection('orders').findOne({ _id: ObjectId(req.params.id) });
    if (!order) return res.status(404).json({ error: 'order not found' });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

// SSE stream for order status
router.get('/:id/stream', async (req, res) => {
  const orderId = req.params.id;
  try {
    const db = await connect();
    const order = await db.collection('orders').findOne({ _id: ObjectId(orderId) });
    if (!order) return res.status(404).json({ error: 'order not found' });
    createOrderStream(req, res, db, order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

router.get('/', async (req, res) => {
  try {
    const db = await connect();
    const { customerId, email } = req.query;
    const q = {};
    if (customerId) q.customerId = ObjectId(customerId);
    if (email) {
      const customer = await db.collection('customers').findOne({ email: String(email).toLowerCase() });
      if (customer) q.customerId = customer._id;
    }
    const items = await db.collection('orders').find(q).toArray();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

module.exports = router;
