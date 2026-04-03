import admin from 'firebase-admin';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import User from '../models/User.js';
import Application from '../models/Application.js';
import Scheme from '../models/Scheme.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

// Load service account securely
import fs from 'fs';
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB!");

        // 1. Migrate Users (Profiles)
        console.log("Migrating Users...");
        const usersSnapshot = await db.collection('profiles').get();
        let usersCount = 0;
        for (let doc of usersSnapshot.docs) {
            const data = doc.data();
            
            const existing = await User.findOne({ email: data.email });
            if (!existing) {
                // Since we can't extract plain text passwords from Firebase Auth easily, generate a dummy password.
                const hashedPassword = await bcrypt.hash('DefaultPassword!123', 10);
                
                await User.create({
                    firebaseUid: doc.id,
                    email: data.email,
                    fullName: data.fullName || data.email.split("@")[0],
                    password: hashedPassword,
                    role: (data.role || 'USER').toUpperCase(),
                    status: data.status || 'active',
                    language: data.language || 'en'
                });
                usersCount++;
            }
        }
        console.log(`✅ successfully migrated ${usersCount} completely new users.`);

        // 2. Migrate Schemes
        console.log("Migrating Schemes...");
        const schemesSnapshot = await db.collection('schemes').get();
        console.log(`Fetched ${schemesSnapshot.size} schemes from Firestore!`);
        let schemesCount = 0;
        for (let doc of schemesSnapshot.docs) {
            const data = doc.data();

            if (!data.name) continue;

            const existingScheme = await Scheme.findOne({ name: data.name });
            if (!existingScheme) {
                await Scheme.create({
                    name: data.name,
                    description: data.description || "N/A",
                    category: data.category || "General",
                    state: data.state || "central",
                    benefitAmount: data.benefitAmount || 0,
                    rules: data.rules || {},
                    documents: data.documents || []
                });
                schemesCount++;
            }
        }
        console.log(`✅ successfully migrated ${schemesCount} completely new schemes.`);

        // 3. Migrate Applications
        console.log("Migrating Applications...");
        const appsSnapshot = await db.collection('applications').get();
        console.log(`Fetched ${appsSnapshot.size} applications from Firestore!`);
        let appsCount = 0;
        for (let doc of appsSnapshot.docs) {
            const data = doc.data();
            
            // Look up mongo user counterpart to replace firebase UID with Mongo internal _id
            const mongoUser = await User.findOne({ firebaseUid: data.user_id });
            if (!mongoUser) {
                console.log(`Skipping orphaned application ${doc.id} (No user found)`);
                continue;
            }

            // Look up scheme by name to get new Mongo _id for the scheme!
            const mongoScheme = await Scheme.findOne({ name: data.scheme_name });

            // If we don't have application_id, auto-generate it or fallback
            const app_id = data.application_id || doc.id;
            const existingApp = await Application.findOne({ application_id: app_id });
            
            if (!existingApp) {
                await Application.create({
                    application_id: app_id,
                    user_id: mongoUser ? mongoUser._id : null,
                    scheme_id: mongoScheme ? mongoScheme._id : null, 
                    scheme_name: data.scheme_name || 'Legacy App',
                    status: data.status || 'pending',
                    form_data: data.form_data || {},
                    remarks: data.remarks || '',
                    submitted_at: data.submitted_at 
                        ? (typeof data.submitted_at.toDate === 'function' ? data.submitted_at.toDate() : new Date(data.submitted_at)) 
                        : new Date()
                });
                appsCount++;
            }
        }
        console.log(`✅ successfully migrated ${appsCount} completely new applications.`);

        console.log("🎉 Entire Migration Process Completed! You can safely use MongoDB now.");
        process.exit();
    } catch (err) {
        console.error("Migration Error:", err);
        process.exit(1);
    }
};

migrate();
