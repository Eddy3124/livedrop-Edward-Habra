const express = require('express');
const router = express.Router();
const { connect } = require('../db');

router.get('/', async (req, res) => {
  const { search, tag, sort = 'name', page = 1, limit = 20 } = req.query;
  const q = {};
  if (search) q.$text = { $search: search };
  if (tag) q.tags = tag;
  try {
    const db = await connect();
    const cursor = db.collection('products').find(q).sort({ [sort]: 1 }).skip((page - 1) * limit).limit(parseInt(limit, 10));
    const items = await cursor.toArray();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const db = await connect();
    const product = await db.collection('products').findOne({ _id: require('mongodb').ObjectId(req.params.id) });
    if (!product) return res.status(404).json({ error: 'product not found' });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

router.post('/', async (req, res) => {
  const body = req.body;
  if (!body.name || !body.price) return res.status(400).json({ error: 'name and price required' });
  try {
    const db = await connect();
    const result = await db.collection('products').insertOne({ ...body, createdAt: new Date() });
    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

module.exports = router;
