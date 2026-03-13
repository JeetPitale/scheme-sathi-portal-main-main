/**
 * NotificationService — Create, read, mark-read notifications
 * Backed by Firebase `notifications` collection.
 */

import { db } from '@/lib/firebase';
import { 
    collection, 
    addDoc, 
    getDocs, 
    updateDoc, 
    query, 
    where, 
    orderBy, 
    limit, 
    doc, 
    getDoc, 
    serverTimestamp,
    writeBatch,
    or
} from 'firebase/firestore';

const COLLECTION = 'notifications';

export const NOTIF_TYPES = {
    APPROVAL: 'approval',
    REJECTION: 'rejection',
    SYSTEM: 'system',
    ANNOUNCEMENT: 'announcement',
    SCHEME: 'scheme',
};

let _recentNotifs = [];

function isDuplicate(userId, title) {
    const now = Date.now();
    _recentNotifs = _recentNotifs.filter(n => (now - n.time) < 60000);
    return _recentNotifs.some(n => n.userId === userId && n.title === title);
}

function trackNotif(userId, title) {
    _recentNotifs.push({ userId, title, time: Date.now() });
}

function dbToNotif(doc) {
    const n = doc.data();
    return {
        ...n,
        id: doc.id,
        userId: n.user_id,
        sentAt: n.sent_at?.toDate()?.toISOString() || new Date().toISOString(),
    };
}

const NotificationService = {
    seed() {},

    async getAll(maxResults = 200) {
        try {
            const q = query(
                collection(db, COLLECTION),
                orderBy('sent_at', 'desc'),
                limit(maxResults)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(dbToNotif);
        } catch (error) {
            console.error('NotificationService.getAll error:', error);
            return [];
        }
    },

    async getByUser(userId) {
        try {
            const q = query(
                collection(db, COLLECTION),
                or(where('user_id', '==', userId), where('target', '==', 'all')),
                orderBy('sent_at', 'desc'),
                limit(100)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(dbToNotif);
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
                title: notifData.title,
                description: notifData.description || notifData.message || '',
                target: notifData.target || (notifData.userId ? 'user' : 'all'),
                user_id: notifData.userId || null,
                status: 'sent',
                read: false,
                type: notifData.type || NOTIF_TYPES.ANNOUNCEMENT,
                sent_at: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, COLLECTION), newNotif);
            const snapshot = await getDoc(docRef);

            if (notifData.userId) {
                trackNotif(notifData.userId, notifData.title);
            }

            return { success: true, notification: dbToNotif(snapshot) };
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
            const docRef = doc(db, COLLECTION, notifId);
            await updateDoc(docRef, { read: true });
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    },

    async markAllRead(userId) {
        try {
            const q = query(
                collection(db, COLLECTION),
                where('user_id', '==', userId),
                where('read', '==', false)
            );
            const snapshot = await getDocs(q);
            
            const batch = writeBatch(db);
            snapshot.docs.forEach((doc) => {
                batch.update(doc.ref, { read: true });
            });
            await batch.commit();
            
            return { success: true };
        } catch (err) {
            console.error('NotificationService.markAllRead error:', err);
            return { success: false, error: err.message };
        }
    },

    async getUnreadCount(userId) {
        try {
            const q = query(
                collection(db, COLLECTION),
                or(where('user_id', '==', userId), where('target', '==', 'all')),
                where('read', '==', false)
            );
            const snapshot = await getDocs(q);
            return snapshot.size;
        } catch (error) {
            console.error('NotificationService.getUnreadCount error:', error);
            return 0;
        }
    },
};

export default NotificationService;
