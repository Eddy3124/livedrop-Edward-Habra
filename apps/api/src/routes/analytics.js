const express = require('express');
const router = express.Router();
const { connect } = require('../db');
const { ObjectId } = require('mongodb');

// GET /api/analytics/daily-revenue?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get('/daily-revenue', async (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) return res.status(400).json({ error: 'from and to required' });
  try {
    const db = await connect();
    const results = await db.collection('orders').aggregate([
      { $match: { createdAt: { $gte: new Date(from), $lte: new Date(to) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, orderCount: { $sum: 1 } } },
      { $project: { date: '$_id', revenue: 1, orderCount: 1, _id: 0 } },
      { $sort: { date: 1 } }
    ]).toArray();
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

module.exports = router;
