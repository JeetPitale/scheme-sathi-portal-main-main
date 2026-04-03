/**
 * AuditService — Immutable audit log for all admin actions
 * Backed by Node.js/MongoDB REST API
 * APPEND-ONLY: Only addDoc is used. No update or delete operations.
 */

// Local fallback memory store until backend implements API
let _logs = [];

const getApiUrl = () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5001';
    return `${baseUrl}/api`;
};

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
    seed() {},

    /** Get all logs (newest first) */
    async getAll(maxResults = 200) {
        try {
            // Once backend supports audits:
            // const res = await fetch(`${getApiUrl()}/audits`);
            // return await res.json();
            return _logs.slice(0, maxResults);
        } catch (error) {
            console.error('AuditService.getAll error:', error);
            return _logs;
        }
    },

    /**
     * Create an audit log entry (APPEND-ONLY)
     */
    async log(actionType, performedBy, performerRole, targetId, targetType, metadata = {}) {
        if (isDuplicate(actionType, targetId)) {
            return { success: false, error: 'Duplicate log entry' };
        }

        try {
            const entry = {
                id: Date.now().toString(),
                action_type: actionType,
                performed_by: performedBy || null,
                performer_role: performerRole || 'unknown',
                target_id: targetId || 'N/A',
                target_type: targetType || 'system',
                metadata: metadata,
                timestamp: new Date().toISOString()
            };

            // Wait for backend support
            // await fetch(`${getApiUrl()}/audits`, { method: 'POST', body: JSON.stringify(entry) });
            _logs.unshift(entry);

            _lastLog = { actionType, targetId: targetId || '', time: Date.now() };

            return { success: true, id: entry.id };
        } catch (err) {
            console.error('AuditService.log error:', err);
            return { success: false, error: err.message };
        }
    },

    /** Filter logs by action type */
    async getByActionType(actionType) {
        return _logs.filter(l => l.action_type === actionType);
    },

    /** Get unique action types */
    async getActionTypes() {
        const types = new Set(_logs.map(l => l.action_type));
        return [...types];
    },
};

export default AuditService;
