const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config();

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI not set in environment');
}

const client = new MongoClient(uri);

async function connect() {
  if (!client.isConnected || client.topology?.isDestroyed) {
    await client.connect();
  }
  return client.db();
}

module.exports = { connect, client };
