const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

/**
 * Call beforeAll in tests:
 *   await setupTestDB();
 *   // optionally seed
 * Call afterAll:
 *   await teardownTestDB();
 */

async function setupTestDB() {
  mongoServer = await MongoMemoryServer.create({
    binary: { version: "6.0.6" } // optional pin
  });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
  });
}

async function teardownTestDB() {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
}

async function clearTestDB() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}

module.exports = {
  setupTestDB,
  teardownTestDB,
  clearTestDB,
};
