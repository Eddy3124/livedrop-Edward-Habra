const ObjectId = require('mongodb').ObjectId;

function sendSSE(res, event, data) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

function createOrderStream(req, res, db, order) {
  // Set headers
  res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
  res.flushHeaders && res.flushHeaders();

  let closed = false;

  // send current status immediately
  sendSSE(res, 'status', { status: order.status, orderId: order._id, updatedAt: order.updatedAt });

  const statuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  let idx = statuses.indexOf(order.status);
  if (idx === -1) idx = 0;

  const advance = async () => {
    idx++;
    if (idx >= statuses.length) return endStream();
    const next = statuses[idx];
    // update DB
    try {
      await db.collection('orders').updateOne({ _id: ObjectId(order._id) }, { $set: { status: next, updatedAt: new Date() } });
      sendSSE(res, 'status', { status: next, orderId: order._id, updatedAt: new Date() });
      if (next === 'DELIVERED') {
        endStream();
      }
    } catch (err) {
      console.error('SSE advance error', err);
      sendSSE(res, 'error', { message: 'failed to update order' });
      endStream();
    }
  };

  const scheduleNext = () => {
    const delay = idx === 0 ? 3000 + Math.floor(Math.random() * 2000) : 5000 + Math.floor(Math.random() * 2000);
    return setTimeout(advance, delay);
  };

  let timer = scheduleNext();

  req.on('close', () => {
    closed = true;
    clearTimeout(timer);
  });

  function endStream() {
    if (closed) return;
    sendSSE(res, 'end', { message: 'delivered' });
    try { res.end(); } catch (e) {}
    closed = true;
  }
}

module.exports = { createOrderStream };
