/**
 * applicationService — Create and fetch user applications
 * Backed by Firebase `applications` collection.
 */

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, updateDoc, query, where, orderBy, doc, getDoc, serverTimestamp } from 'firebase/firestore';

const COLLECTION = 'applications';

/**
 * Generates a unique Application ID in the format SSA-YYYY-XXXXX
 */
export const generateApplicationId = () => {
    const year = new Date().getFullYear();
    const randomStr = Math.floor(10000 + Math.random() * 90000); // 5 digit random
    return `SSA-${year}-${randomStr}`;
};

/**
 * Creates a new application in Firebase
 * @param {Object} payload The application data payload
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export const createApplication = async (payload) => {
    try {
        let appId = generateApplicationId();
        let isUnique = false;
        let attempts = 0;

        // Retry loop to ensure zero collisions
        while (!isUnique && attempts < 3) {
            const q = query(collection(db, COLLECTION), where("application_id", "==", appId));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                isUnique = true;
            } else {
                appId = generateApplicationId();
                attempts++;
            }
        }

        if (!isUnique) {
            return { success: false, error: "Failed to generate a unique Application ID. Please try again." };
        }

        const applicationRecord = {
            application_id: appId,
            user_id: payload.userId,
            scheme_id: payload.serviceId || payload.scheme_id,
            scheme_name: payload.serviceName || payload.scheme_name,
            status: 'Pending',
            form_data: payload.formData || {},
            submitted_at: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, COLLECTION), applicationRecord);
        const newDoc = await getDoc(docRef);

        return {
            success: true,
            data: {
                ...newDoc.data(),
                id: appId,
                internalId: docRef.id,
                userId: payload.userId,
                serviceId: payload.serviceId || payload.scheme_id,
                serviceName: payload.serviceName || payload.scheme_name,
            },
        };
    } catch (error) {
        console.error("Application creation failed:", error);
        return { success: false, error: error.message || "An unexpected error occurred." };
    }
};

/**
 * Fetches all applications for a given user ID
 * @param {string} userId
 * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
 */
export const getUserApplications = async (userId) => {
    try {
        const q = query(
            collection(db, COLLECTION),
            where("user_id", "==", userId)
        );
        const querySnapshot = await getDocs(q);

        const mapped = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: data.application_id,
                internalId: doc.id,
                userId: data.user_id,
                serviceId: data.scheme_id,
                serviceName: data.scheme_name,
                status: (data.status || '').toLowerCase().replace(' ', '_'),
                dateApplied: data.submitted_at?.toDate()?.toISOString() || new Date().toISOString(),
                formData: data.form_data,
                remarks: data.remarks,
            };
        });
        // Sort so the latest applications pop up at the top
        mapped.sort((a, b) => new Date(b.dateApplied) - new Date(a.dateApplied));

        return { success: true, data: mapped };
    } catch (error) {
        console.error("Fetching applications failed:", error);
        return { success: false, error: error.message || "An unexpected error occurred." };
    }
};

/**
 * Fetches ALL applications (admin view)
 * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
 */
export const getAllApplications = async () => {
    try {
        const q = query(
            collection(db, COLLECTION),
            orderBy("submitted_at", "desc")
        );
        const querySnapshot = await getDocs(q);

        const mapped = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: data.application_id,
                internalId: doc.id,
                userId: data.user_id,
                serviceId: data.scheme_id,
                serviceName: data.scheme_name,
                status: (data.status || '').toLowerCase().replace(' ', '_'),
                dateApplied: data.submitted_at?.toDate()?.toISOString() || new Date().toISOString(),
                formData: data.form_data,
                remarks: data.remarks,
            };
        });

        return { success: true, data: mapped };
    } catch (error) {
        console.error("Fetching all applications failed:", error);
        return { success: false, error: error.message || "An unexpected error occurred." };
    }
};

export const updateApplicationStatus = async (appId, newStatus, remarks = null) => {
    try {
        const updateData = { status: newStatus };
        if (remarks !== null) updateData.remarks = remarks;

        // First find the doc by application_id
        const q = query(collection(db, COLLECTION), where("application_id", "==", appId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            throw new Error("Application not found");
        }

        const docRef = doc(db, COLLECTION, querySnapshot.docs[0].id);
        await updateDoc(docRef, updateData);

        return { success: true, data: { ...querySnapshot.docs[0].data(), ...updateData } };
    } catch (err) {
        console.error("Update application failed:", err);
        return { success: false, error: err.message };
    }
};
