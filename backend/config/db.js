import mongoose from 'mongoose';
import 'dotenv/config';
import dns from 'node:dns';

// Hack for Atlas SRV lookup failures on some networks
dns.setServers(['8.8.8.8', '1.1.1.1']);

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            family: 4
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
