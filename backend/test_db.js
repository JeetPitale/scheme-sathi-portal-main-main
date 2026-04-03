
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';

async function testConnection() {
    try {
        dotenv.config({ path: './.env' });
        console.log('Connecting to: ' + process.env.MONGO_URI);
        
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log('CONNECTED TO DB: ' + mongoose.connection.name);
        
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\nCollections in current DB:');
        for (const col of collections) {
            const count = await mongoose.connection.db.collection(col.name).countDocuments();
            console.log(`- ${col.name}: ${count} documents`);
        }
        
        // Let's also check if there is a 'test' database or something else nearby
        const admin = mongoose.connection.db.admin();
        const dbs = await admin.listDatabases();
        console.log('\nOther Databases in cluster:');
        for (const dbInfo of dbs.databases) {
            console.log(`- ${dbInfo.name}`);
        }
        
    } catch (err) {
        console.error('ERROR: ' + err.message);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

testConnection();
