/**
 * applicationService — Create and fetch user applications
 * Backed by Express MongoDB backend API.
 */

// We assume the backend is running on port 5001. In production, this should be an environment variable.
const API_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Creates a new application in MongoDB Backend
 * @param {Object} payload The application data payload
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export const createApplication = async (payload) => {
    try {
        const response = await fetch(`${API_URL}/applications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: payload.userId,
                scheme_id: payload.serviceId || payload.scheme_id,
                scheme_name: payload.serviceName || payload.scheme_name,
                form_data: payload.formData || {}
            })
        });
        
        const data = await response.json();
        
        if (!data.success) throw new Error(data.error);

        return {
            success: true,
            data: {
                ...data.data,
                id: data.data.application_id, // Map for frontend convenience
                userId: data.data.user_id,
                serviceId: data.data.scheme_id,
                serviceName: data.data.scheme_name,
                status: data.data.status.toLowerCase().replace(' ', '_'),
                dateApplied: data.data.submitted_at
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
        const response = await fetch(`${API_URL}/applications/user/${userId}`);
        const data = await response.json();
        
        if (!data.success) throw new Error(data.error);

        const mapped = data.data.map(app => ({
            id: app.application_id,
            internalId: app._id,
            userId: app.user_id,
            serviceId: app.scheme_id,
            serviceName: app.scheme_name,
            status: (app.status || '').toLowerCase().replace(' ', '_'),
            dateApplied: app.submitted_at,
            formData: app.form_data,
            remarks: app.remarks,
        }));

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
        const response = await fetch(`${API_URL}/applications`);
        const data = await response.json();
        
        if (!data.success) throw new Error(data.error);

        const mapped = data.data.map(app => ({
            id: app.application_id,
            internalId: app._id,
            userId: app.user_id,
            serviceId: app.scheme_id,
            serviceName: app.scheme_name,
            status: (app.status || '').toLowerCase().replace(' ', '_'),
            dateApplied: app.submitted_at,
            formData: app.form_data,
            remarks: app.remarks,
        }));

        return { success: true, data: mapped };
    } catch (error) {
        console.error("Fetching all applications failed:", error);
        return { success: false, error: error.message || "An unexpected error occurred." };
    }
};

export const updateApplicationStatus = async (appId, newStatus, remarks = null) => {
    try {
        const response = await fetch(`${API_URL}/applications/${appId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus, remarks })
        });
        
        const data = await response.json();
        if (!data.success) throw new Error(data.error);

        return { success: true, data: data.data };
    } catch (err) {
        console.error("Update application failed:", err);
        return { success: false, error: err.message };
    }
};
