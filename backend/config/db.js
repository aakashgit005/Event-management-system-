const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
  try {
    const dbUri = process.env.MONGO_URI || 'mongodb://localhost:27017/eventflow';
    console.log(`Attempting to connect to MongoDB at: ${dbUri}...`);
    
    // Try connecting with a 2-second timeout
    const conn = await mongoose.connect(dbUri, {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`Failed to connect to local/configured MongoDB: ${error.message}`);
    console.log('Starting an in-memory MongoDB server instead...');
    try {
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      console.log(`In-memory MongoDB started at: ${mongoUri}`);
      
      const conn = await mongoose.connect(mongoUri);
      console.log(`MongoDB Connected (In-Memory): ${conn.connection.host}`);
    } catch (memError) {
      console.error(`Error starting/connecting to in-memory MongoDB: ${memError.message}`);
      process.exit(1);
    }
  }
};

// Graceful cleanup on exit
process.on('SIGINT', async () => {
  if (mongoServer) {
    console.log('Stopping in-memory MongoDB server...');
    await mongoServer.stop();
  }
  process.exit(0);
});

module.exports = connectDB;
