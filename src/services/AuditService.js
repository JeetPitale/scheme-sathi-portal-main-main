/**
 * AuditService — Immutable audit log for all admin actions
 * Backed by Supabase `audit_logs` table.
 * APPEND-ONLY: Only .insert() is used. No update or delete operations.
 */

import { supabase } from '@/lib/supabase';

const TABLE = 'audit_logs';

/** Action type constants */
export const AUDIT_ACTIONS = {
    SCHEME_CREATED: 'SCHEME_CREATED',
    SCHEME_UPDATED: 'SCHEME_UPDATED',
    SCHEME_DELETED: 'SCHEME_DELETED',
    SCHEME_TOGGLED: 'SCHEME_TOGGLED',
    APPLICATION_REVIEWED: 'APPLICATION_REVIEWED',
    APPLICATION_APPROVED: 'APPLICATION_APPROVED',
    APPLICATION_REJECTED: 'APPLICATION_REJECTED',
    USER_BLOCKED: 'USER_BLOCKED',
    USER_UNBLOCKED: 'USER_UNBLOCKED',
    ROLE_UPDATED: 'ROLE_UPDATED',
    NOTIFICATION_BROADCAST: 'NOTIFICATION_BROADCAST',
    PASSWORD_CHANGED: 'PASSWORD_CHANGED',
    MAINTENANCE_TOGGLED: 'MAINTENANCE_TOGGLED',
};

// ── Dedup: check if same action+target was logged in the last 2 seconds ──
let _lastLog = { actionType: '', targetId: '', time: 0 };

function isDuplicate(actionType, targetId) {
    const now = Date.now();
    if (
        _lastLog.actionType === actionType &&
        _lastLog.targetId === targetId &&
        (now - _lastLog.time) < 2000
    ) {
        return true;
    }
    return false;
}

// ── Public API ──
const AuditService = {
    /** Seed is a no-op */
    seed() {
        // No seeding needed
    },

    /** Get all logs (newest first) */
    async getAll(maxResults = 200) {
        const { data, error } = await supabase
            .from(TABLE)
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(maxResults);

        if (error) {
            console.error('AuditService.getAll error:', error);
            return [];
        }

        return data || [];
    },

    /**
     * Create an audit log entry (APPEND-ONLY)
     */
    async log(actionType, performedBy, performerRole, targetId, targetType, metadata = {}) {
        // Duplicate prevention
        if (isDuplicate(actionType, targetId)) {
            return { success: false, error: 'Duplicate log entry' };
        }

        try {
            const entry = {
                action_type: actionType,
                performed_by: performedBy || null,
                performer_role: performerRole || 'unknown',
                target_id: targetId || 'N/A',
                target_type: targetType || 'system',
                metadata: metadata,
            };

            const { data, error } = await supabase
                .from(TABLE)
                .insert(entry)
                .select()
                .single();

            if (error) throw error;

            // Update dedup
            _lastLog = { actionType, targetId: targetId || '', time: Date.now() };

            return { success: true, entry: data };
        } catch (err) {
            console.error('AuditService.log error:', err);
            return { success: false, error: err.message };
        }
    },

    /** Filter logs by action type */
    async getByActionType(actionType) {
        const { data, error } = await supabase
            .from(TABLE)
            .select('*')
            .eq('action_type', actionType)
            .order('timestamp', { ascending: false })
            .limit(100);

        if (error) {
            console.error('AuditService.getByActionType error:', error);
            return [];
        }
        return data || [];
    },

    /** Get unique action types from the db (could be large, limit used) */
    async getActionTypes() {
        const all = await this.getAll(500);
        const types = new Set(all.map(l => l.action_type));
        return [...types];
    },
};

export default AuditService;
