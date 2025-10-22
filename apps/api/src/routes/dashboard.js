const express = require('express');
const router = express.Router();
const { connect } = require('../db');

router.get('/business-metrics', async (req, res) => {
  try {
    const db = await connect();
    const orders = db.collection('orders');
    const totalRevenueAgg = await orders.aggregate([{ $group: { _id: null, revenue: { $sum: '$total' }, count: { $sum: 1 }, avg: { $avg: '$total' } } }]).toArray();
    const summary = totalRevenueAgg[0] || { revenue: 0, count: 0, avg: 0 };
    const byStatus = await orders.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]).toArray();
    res.json({ revenue: summary.revenue, ordersCount: summary.count, averageOrderValue: summary.avg, ordersByStatus: byStatus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

router.get('/performance', async (req, res) => {
  // Placeholder performance metrics
  res.json({ apiLatencyMs: 20, sseConnections: 0, llmStatus: 'unknown' });
});

router.get('/assistant-stats', async (req, res) => {
  res.json({ totalQueries: 0, intentDistribution: {}, functionCalls: {} });
});

module.exports = router;
