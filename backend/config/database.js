const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('❌ MONGODB_URI is not defined in .env file');
        }

        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,        
            maxPoolSize: 10,                
            retryWrites: true,             
            w: "majority"                   
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📂 Database Name: ${conn.connection.name}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ Database connection error:', err.message);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ Database disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('🔄 Database reconnected');
        });

        // Graceful shutdown (close DB connection before exit)
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('🔌 MongoDB connection closed due to app termination (SIGINT)');
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            await mongoose.connection.close();
            console.log('🔌 MongoDB connection closed due to app termination (SIGTERM)');
            process.exit(0);
        });

    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
