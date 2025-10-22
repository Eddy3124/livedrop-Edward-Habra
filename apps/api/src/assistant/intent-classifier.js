// Simple keyword-based intent classifier per spec
const intents = ['policy_question','order_status','product_search','complaint','chitchat','off_topic','violation'];

function classify(text) {
  const q = (text||'').toLowerCase();
  if (!q) return 'off_topic';
  if (['return','refund','warranty','shipping','policy'].some(k => q.includes(k))) return 'policy_question';
  if (q.includes('order') || q.includes('tracking')) return 'order_status';
  if (q.includes('find') || q.includes('search') || q.includes('looking for') || q.includes('do you have')) return 'product_search';
  if (q.includes('not happy') || q.includes('complaint') || q.includes('issue') || q.includes('broken')) return 'complaint';
  if (['hi','hello','hey','how are you'].some(k => q.includes(k))) return 'chitchat';
  if (['stupid','idiot','hate','kill'].some(k => q.includes(k))) return 'violation';
  return 'off_topic';
}

module.exports = { classify, intents };
