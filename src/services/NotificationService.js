/**
 * NotificationService — Create, read, mark-read notifications
 * Backed by Node.js/MongoDB REST API
 */

const getApiUrl = () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5001';
    return `${baseUrl}/api`;
};

export const NOTIF_TYPES = {
    APPROVAL: 'approval',
    REJECTION: 'rejection',
    SYSTEM: 'system',
    ANNOUNCEMENT: 'announcement',
    SCHEME: 'scheme',
};

// Local fallback memory store until backend implements API
let _notifications = [];
let _recentNotifs = [];

function isDuplicate(userId, title) {
    const now = Date.now();
    _recentNotifs = _recentNotifs.filter(n => (now - n.time) < 60000);
    return _recentNotifs.some(n => n.userId === userId && n.title === title);
}

function trackNotif(userId, title) {
    _recentNotifs.push({ userId, title, time: Date.now() });
}

const NotificationService = {
    seed() {},

    async getAll(maxResults = 200) {
        try {
            // Once backend supports notifications:
            // const res = await fetch(`${getApiUrl()}/notifications`);
            // return await res.json();
            return [..._notifications].sort((a,b) => new Date(b.sentAt) - new Date(a.sentAt)).slice(0, maxResults);
        } catch (error) {
            console.error('NotificationService.getAll error:', error);
            return [];
        }
    },

    async getByUser(userId) {
        try {
            // Wait for backend
            return _notifications
                .filter(n => n.userId === userId || n.target === 'all')
                .sort((a,b) => new Date(b.sentAt) - new Date(a.sentAt));
        } catch (error) {
            console.error('NotificationService.getByUser error:', error);
            return [];
        }
    },

    async add(notifData) {
        if (notifData.userId && isDuplicate(notifData.userId, notifData.title)) {
            return { success: false, error: 'Duplicate notification' };
        }

        try {
            const newNotif = {
                id: Date.now().toString(),
                title: notifData.title,
                description: notifData.description || notifData.message || '',
                target: notifData.target || (notifData.userId ? 'user' : 'all'),
                userId: notifData.userId || null,
                status: 'sent',
                read: false,
                type: notifData.type || NOTIF_TYPES.ANNOUNCEMENT,
                sentAt: new Date().toISOString()
            };

            // backend add route 
            // await fetch(`${getApiUrl()}/notifications`, { method: 'POST', body: JSON.stringify(newNotif) });
            _notifications.unshift(newNotif);

            if (notifData.userId) {
                trackNotif(notifData.userId, notifData.title);
            }

            return { success: true, notification: newNotif };
        } catch (err) {
            console.error('NotificationService.add error:', err);
            return { success: false, error: err.message };
        }
    },

    async sendToUser(userId, title, message, type = NOTIF_TYPES.SYSTEM) {
        return this.add({
            userId,
            title,
            description: message,
            target: 'user',
            type,
        });
    },

    async broadcastToAll(title, message, type = NOTIF_TYPES.ANNOUNCEMENT) {
        return this.add({
            title,
            description: message,
            target: 'all',
            type,
        });
    },

    async markRead(notifId) {
        try {
            const notif = _notifications.find(n => n.id === notifId);
            if (notif) notif.read = true;
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    },

    async markAllRead(userId) {
        try {
            _notifications.forEach(n => {
                if (n.userId === userId) {
                    n.read = true;
                }
            });
            return { success: true };
        } catch (err) {
            console.error('NotificationService.markAllRead error:', err);
            return { success: false, error: err.message };
        }
    },

    async getUnreadCount(userId) {
        try {
            return _notifications.filter(n => 
                (n.target === 'all' || n.userId === userId) && !n.read
            ).length;
        } catch (error) {
            console.error('NotificationService.getUnreadCount error:', error);
            return 0;
        }
    },
};

export default NotificationService;
