/**
 * AuditService — Immutable audit log for all admin actions
 * Backed by Firebase `audit_logs` collection.
 * APPEND-ONLY: Only addDoc is used. No update or delete operations.
 */

import { db } from '@/lib/firebase';
import { 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where, 
    orderBy, 
    limit, 
    serverTimestamp 
} from 'firebase/firestore';

const COLLECTION = 'audit_logs';

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
            const q = query(
                collection(db, COLLECTION),
                orderBy('timestamp', 'desc'),
                limit(maxResults)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate()?.toISOString() || new Date().toISOString()
            }));
        } catch (error) {
            console.error('AuditService.getAll error:', error);
            return [];
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
                action_type: actionType,
                performed_by: performedBy || null,
                performer_role: performerRole || 'unknown',
                target_id: targetId || 'N/A',
                target_type: targetType || 'system',
                metadata: metadata,
                timestamp: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, COLLECTION), entry);

            _lastLog = { actionType, targetId: targetId || '', time: Date.now() };

            return { success: true, id: docRef.id };
        } catch (err) {
            console.error('AuditService.log error:', err);
            return { success: false, error: err.message };
        }
    },

    /** Filter logs by action type */
    async getByActionType(actionType) {
        try {
            const q = query(
                collection(db, COLLECTION),
                where('action_type', '==', actionType),
                orderBy('timestamp', 'desc'),
                limit(100)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate()?.toISOString() || new Date().toISOString()
            }));
        } catch (error) {
            console.error('AuditService.getByActionType error:', error);
            return [];
        }
    },

    /** Get unique action types */
    async getActionTypes() {
        const all = await this.getAll(500);
        const types = new Set(all.map(l => l.action_type));
        return [...types];
    },
};

export default AuditService;
