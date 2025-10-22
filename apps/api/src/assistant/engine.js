const classifier = require('./intent-classifier');
const registry = require('./function-registry');
const fs = require('fs');
const path = require('path');
const YAML = require('yaml');
const groundTruth = require('../../storefront/src/assistant/ground-truth.json');

// load prompts.yaml if exists
let prompts = {};
try {
  const p = fs.readFileSync(path.join(__dirname, '..', '..', 'docs', 'prompts.yaml'), 'utf8');
  prompts = YAML.parse(p);
} catch (e) {
  prompts = {};
}

function findRelevantPolicies(userQuery) {
  const query = (userQuery || '').toLowerCase();
  const categoryKeywords = {
    'returns': ['return', 'refund', 'exchange', 'money back'],
    'shipping': ['shipping', 'ship', 'delivery', 'track', 'carrier'],
    'warranty': ['warranty', 'guarantee'],
    'privacy': ['privacy', 'data', 'personal']
  };
  let matchedCategory = null;
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(kw => query.includes(kw))) { matchedCategory = category; break; }
  }
  return matchedCategory ? groundTruth.filter(p => p.category === matchedCategory) : [];
}

function validateCitations(text) {
  const ids = Array.from((text || '').matchAll(/\[(Policy[0-9\.\-A-Za-z]+|[A-Za-z]+[0-9\.\-]+)\]/g)).map(m => m[1]);
  const valid = []; const invalid = [];
  ids.forEach(id => {
    if (groundTruth.find(p => p.id === id)) valid.push(id); else invalid.push(id);
  });
  return { isValid: invalid.length === 0, validCitations: valid, invalidCitations: invalid };
}

async function handleUserInput(text, context = {}) {
  const intent = classifier.classify(text);
  const result = { intent, text: '', citations: [], functionsCalled: [] };

  if (intent === 'policy_question') {
    const policies = findRelevantPolicies(text);
    if (policies.length > 0) {
      const first = policies[0];
      result.text = `${first.answer} [${first.id}]`;
      result.citations = [first.id];
      result.citationValidation = validateCitations(result.text);
      return result;
    }
    result.text = 'I could not find a policy that matches exactly. I can ask a colleague or check further.';
    return result;
  }

  if (intent === 'order_status') {
    // expect an order id in text
    const m = (text||'').match(/([a-f0-9]{24})/i);
    if (m) {
      const orderId = m[1];
      const fnRes = await registry.execute('getOrderStatus', { orderId });
      result.functionsCalled.push('getOrderStatus');
      result.text = `Order ${orderId} is currently ${fnRes.status}`;
      return result;
    }
    result.text = 'Please provide your order id so I can check the status.';
    return result;
  }

  if (intent === 'product_search') {
    const q = text;
    const fnRes = await registry.execute('searchProducts', { query: q, limit: 5 });
    result.functionsCalled.push('searchProducts');
    result.text = `I found ${fnRes.results.length} results.`;
    result.results = fnRes.results;
    return result;
  }

  if (intent === 'complaint') {
    result.text = "I'm sorry to hear that — I can help. Can you provide your order id and a brief description of the issue?";
    return result;
  }

  if (intent === 'chitchat') {
    result.text = "Hi there! I'm Sam, your LiveDrop support specialist. How can I help today?";
    return result;
  }

  if (intent === 'violation') {
    result.text = "I want to help, but I can't continue if the conversation includes abusive language. Let's keep this constructive.";
    return result;
  }

  result.text = "I'm not sure I understand. Could you rephrase or ask about orders, products, or policies?";
  return result;
}

module.exports = { handleUserInput, validateCitations, findRelevantPolicies };
