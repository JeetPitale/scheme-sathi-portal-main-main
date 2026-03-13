import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Scheme from '../models/Scheme.js';
import schemes from './schemes.js';

dotenv.config();

const importData = async () => {
    try {
        await connectDB();

        await Scheme.deleteMany();

        await Scheme.insertMany(schemes);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
