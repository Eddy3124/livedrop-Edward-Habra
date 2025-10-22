const express = require('express');
const router = express.Router();
const { connect } = require('../db');

router.get('/', async (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).json({ error: 'email query required' });
  try {
    const db = await connect();
    const customer = await db.collection('customers').findOne({ email: email.toLowerCase() });
    if (!customer) return res.status(404).json({ error: 'customer not found' });
    res.json(customer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const db = await connect();
    const customer = await db.collection('customers').findOne({ _id: require('mongodb').ObjectId(req.params.id) });
    if (!customer) return res.status(404).json({ error: 'customer not found' });
    res.json(customer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

module.exports = router;
