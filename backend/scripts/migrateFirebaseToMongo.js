import admin from 'firebase-admin';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Application from '../models/Application.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// IMPORTANT: Download your Firebase Service Account JSON from Firebase Console -> Project Settings -> Service Accounts
// Save it as serviceAccountKey.json in this folder!
// import serviceAccount from './serviceAccountKey.json' assert { type: "json" };

dotenv.config({ path: path.join(__dirname, '../.env') });

/*
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();
const auth = admin.auth();
*/

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        console.log("Migration script is ready. Uncomment the Firebase initialization lines above once you download your serviceAccountKey.json");

        // --- SAMPLE MIGRATION LOGIC (UNCOMMENT ONCE FIREBASE IS LINKED) ---

        /*
        console.log("Migrating Users...");
        const usersSnapshot = await db.collection('profiles').get();
        for (let doc of usersSnapshot.docs) {
            const data = doc.data();
            
            const existing = await User.findOne({ email: data.email });
            if (!existing) {
                // Since we can't extract plain text passwords from Firebase easily, generate a dummy password.
                // The user will have to reset their password later or login via OTP if implemented.
                const hashedPassword = await bcrypt.hash('DefaultPassword!123', 10);
                
                await User.create({
                    firebaseUid: doc.id,
                    email: data.email,
                    fullName: data.fullName,
                    password: hashedPassword,
                    role: data.role || 'USER',
                    status: data.status || 'active',
                    language: data.language || 'en'
                });
            }
        }
        console.log("Users Migrated Successfully.");

        console.log("Migrating Applications...");
        const appsSnapshot = await db.collection('applications').get();
        for (let doc of appsSnapshot.docs) {
            const data = doc.data();
            
            // Look up mongo user counterpart
            const mongoUser = await User.findOne({ firebaseUid: data.user_id });

            const existingApp = await Application.findOne({ application_id: data.application_id });
            if (!existingApp) {
                await Application.create({
                    application_id: data.application_id,
                    user_id: mongoUser ? mongoUser._id : data.user_id, // Swap ID
                    scheme_id: data.scheme_id,
                    scheme_name: data.scheme_name,
                    status: data.status,
                    form_data: data.form_data,
                    remarks: data.remarks,
                    submitted_at: data.submitted_at ? data.submitted_at.toDate() : new Date()
                });
            }
        }
        console.log("Applications Migrated Successfully.");
        */

        console.log("Migration Process Completed.");
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

migrate();
