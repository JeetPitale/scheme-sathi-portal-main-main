/**
 * NotificationService — Create, read, mark-read notifications
 * Backed by Supabase `notifications` table.
 * Supports broadcast (target='all') and per-user targeting.
 */

import { supabase } from '@/lib/supabase';

const TABLE = 'notifications';

// ── Notification type constants ──
export const NOTIF_TYPES = {
    APPROVAL: 'approval',
    REJECTION: 'rejection',
    SYSTEM: 'system',
    ANNOUNCEMENT: 'announcement',
    SCHEME: 'scheme',
};

// ── Dedup: prevent same userId+title within 60s (client-side) ──
let _recentNotifs = [];

function isDuplicate(userId, title) {
    const now = Date.now();
    // Clean old entries
    _recentNotifs = _recentNotifs.filter(n => (now - n.time) < 60000);
    return _recentNotifs.some(n => n.userId === userId && n.title === title);
}

function trackNotif(userId, title) {
    _recentNotifs.push({ userId, title, time: Date.now() });
}

// ── Helper to convert db row to app object ──
function dbToNotif(n) {
    return {
        ...n,
        userId: n.user_id,
        sentAt: n.sent_at,
    };
}

// ── Public API ──
const NotificationService = {
    /** Seed is a no-op */
    seed() {
        // No seeding needed
    },

    /** Get all notifications (admin view, newest first) */
    async getAll(maxResults = 200) {
        const { data, error } = await supabase
            .from(TABLE)
            .select('*')
            .order('sent_at', { ascending: false })
            .limit(maxResults);

        if (error) {
            console.error('NotificationService.getAll error:', error);
            return [];
        }
        return (data || []).map(dbToNotif);
    },

    /** Get notifications for a specific user (their own + broadcasts) */
    async getByUser(userId) {
        const { data, error } = await supabase
            .from(TABLE)
            .select('*')
            .or(`user_id.eq.${userId},target.eq.all`)
            .order('sent_at', { ascending: false })
            .limit(100);

        if (error) {
            console.error('NotificationService.getByUser error:', error);
            return [];
        }
        return (data || []).map(dbToNotif);
    },

    /** Add a notification (generic) */
    async add(notifData) {
        // Dedup check
        if (notifData.userId && isDuplicate(notifData.userId, notifData.title)) {
            return { success: false, error: 'Duplicate notification' };
        }

        try {
            const newNotif = {
                title: notifData.title,
                description: notifData.description || notifData.message || '',
                target: notifData.target || (notifData.userId ? 'user' : 'all'),
                user_id: notifData.userId || null,
                status: 'sent',
                read: false,
                type: notifData.type || NOTIF_TYPES.ANNOUNCEMENT,
            };

            const { data, error } = await supabase
                .from(TABLE)
                .insert(newNotif)
                .select()
                .single();

            if (error) throw error;

            if (notifData.userId) {
                trackNotif(notifData.userId, notifData.title);
            }

            return { success: true, notification: dbToNotif(data) };
        } catch (err) {
            console.error('NotificationService.add error:', err);
            return { success: false, error: err.message };
        }
    },

    /** Send notification to a specific user */
    async sendToUser(userId, title, message, type = NOTIF_TYPES.SYSTEM) {
        return this.add({
            userId,
            title,
            description: message,
            target: 'user',
            type,
        });
    },

    /** Broadcast to all users */
    async broadcastToAll(title, message, type = NOTIF_TYPES.ANNOUNCEMENT) {
        return this.add({
            title,
            description: message,
            target: 'all',
            type,
        });
    },

    /** Mark a notification as read */
    async markRead(notifId) {
        try {
            const { error } = await supabase
                .from(TABLE)
                .update({ read: true })
                .eq('id', notifId);

            if (error) throw error;
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    },

    /** Mark all notifications as read for a user */
    async markAllRead(userId) {
        try {
            const { error } = await supabase
                .from(TABLE)
                .update({ read: true })
                .eq('user_id', userId)
                .eq('read', false);

            if (error) throw error;
            return { success: true };
        } catch (err) {
            console.error('NotificationService.markAllRead error:', err);
            return { success: false, error: err.message };
        }
    },

    /** Get count of unread for a user */
    async getUnreadCount(userId) {
        const { count, error } = await supabase
            .from(TABLE)
            .select('*', { count: 'exact', head: true })
            .or(`user_id.eq.${userId},target.eq.all`)
            .eq('read', false);

        if (error) {
            console.error('NotificationService.getUnreadCount error:', error);
            return 0;
        }
        return count || 0;
    },
};

export default NotificationService;
