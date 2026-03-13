/**
 * Audit Store — Zustand store wrapping AuditService (Firestore-backed)
 * Only SUPER_ADMIN can access logs.
 */
import { create } from 'zustand';
import AuditService, { AUDIT_ACTIONS } from '@/services/AuditService';
import { ROLES } from '@/lib/rbac';

export { AUDIT_ACTIONS };

export const useAuditStore = create((set, get) => ({
    logs: [],
    loaded: false,

    /** Load logs from Firestore */
    loadLogs: async () => {
        const logs = await AuditService.getAll();
        set({ logs, loaded: true });
    },

    refresh: async () => {
        const logs = await AuditService.getAll();
        set({ logs });
    },

    /**
     * Log an admin action (called from other stores).
     */
    logAction: async (actionType, performedBy, performerRole, targetId, targetType, metadata) => {
        const result = await AuditService.log(actionType, performedBy, performerRole, targetId, targetType, metadata);
        if (result.success) {
            await get().refresh();
        }
        return result;
    },

    /** Get logs — only returns data for SUPER_ADMIN */
    getLogs: (callerRole, filters = {}) => {
        if (callerRole !== ROLES.SUPER_ADMIN) return [];
        let logs = get().logs;
        if (filters.actionType) {
            logs = logs.filter(l => l.actionType === filters.actionType);
        }
        return logs;
    },

    /** Get unique action types */
    getActionTypes: async () => {
        return AuditService.getActionTypes();
    },
}));
