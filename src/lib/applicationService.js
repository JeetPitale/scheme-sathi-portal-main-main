/**
 * applicationService — Create and fetch user applications
 * Backed by Supabase `applications` table.
 */

import { supabase } from '@/lib/supabase';

const TABLE = 'applications';

/**
 * Generates a unique Application ID in the format SSA-YYYY-XXXXX
 */
export const generateApplicationId = () => {
    const year = new Date().getFullYear();
    const randomStr = Math.floor(10000 + Math.random() * 90000); // 5 digit random
    return `SSA-${year}-${randomStr}`;
};

/**
 * Creates a new application in Supabase
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
            const { data, error } = await supabase
                .from(TABLE)
                .select('id')
                .eq('application_id', appId)
                .limit(1);

            if (error) throw error;

            if (!data || data.length === 0) {
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
        };

        const { data, error } = await supabase
            .from(TABLE)
            .insert(applicationRecord)
            .select()
            .single();

        if (error) throw error;

        return {
            success: true,
            data: {
                ...data,
                id: data.application_id,
                internalId: data.id,
                userId: data.user_id,
                serviceId: data.scheme_id,
                serviceName: data.scheme_name,
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
        const { data, error } = await supabase
            .from(TABLE)
            .select('*')
            .eq('user_id', userId)
            .order('submitted_at', { ascending: false });

        if (error) throw error;

        const mapped = data.map(app => {
            return {
                id: app.application_id,
                internalId: app.id,
                userId: app.user_id,
                serviceId: app.scheme_id,
                serviceName: app.scheme_name,
                status: (app.status || '').toLowerCase().replace(' ', '_'),
                dateApplied: app.submitted_at,
                formData: app.form_data,
                remarks: app.remarks,
            };
        });

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
        const { data, error } = await supabase
            .from(TABLE)
            .select('*')
            .order('submitted_at', { ascending: false });

        if (error) throw error;

        const mapped = data.map(app => {
            return {
                id: app.application_id,
                internalId: app.id,
                userId: app.user_id,
                serviceId: app.scheme_id,
                serviceName: app.scheme_name,
                status: (app.status || '').toLowerCase().replace(' ', '_'),
                dateApplied: app.submitted_at,
                formData: app.form_data,
                remarks: app.remarks,
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

        const { data, error } = await supabase
            .from(TABLE)
            .update(updateData)
            .eq('application_id', appId)
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (err) {
        console.error("Update application failed:", err);
        return { success: false, error: err.message };
    }
};
