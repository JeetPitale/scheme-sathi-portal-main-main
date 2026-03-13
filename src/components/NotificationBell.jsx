import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, X } from 'lucide-react';
import { useNotificationStore, useAuthStore } from '@/lib/store';

/**
 * NotificationBell — Dropdown bell icon with unread count badge
 */
const NotificationBell = () => {
    const { user } = useAuthStore();
    const { getNotificationsByUser, getUnreadCount, markAsRead, markAllRead } = useNotificationStore();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const userId = user?.id;
    const notifications = userId ? getNotificationsByUser(userId).slice(0, 10) : [];
    const unreadCount = userId ? getUnreadCount(userId) : 0;

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleNotificationClick = (id) => {
        markAsRead(id);
    };

    const handleMarkAllRead = () => {
        if (userId) markAllRead(userId);
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'approval': return '✅';
            case 'rejection': return '❌';
            case 'scheme': return '📋';
            case 'system': return '⚙️';
            default: return '📢';
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    };

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(!open)}
                className="relative inline-flex items-center justify-center h-9 w-9 rounded-lg border bg-background hover:bg-muted transition-colors"
                aria-label="Notifications"
            >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 top-12 w-80 bg-card border rounded-xl shadow-lg z-50 overflow-hidden"
                    style={{ animation: 'fadeInDown 0.2s ease-out' }}>
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                        <span className="font-semibold text-sm text-foreground">
                            Notifications {unreadCount > 0 && `(${unreadCount})`}
                        </span>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button onClick={handleMarkAllRead}
                                    className="text-xs text-primary hover:underline flex items-center gap-1">
                                    <CheckCheck className="h-3 w-3" /> Mark all read
                                </button>
                            )}
                            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Notification list */}
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="py-8 text-center text-sm text-muted-foreground">
                                No notifications yet
                            </div>
                        ) : (
                            notifications.map(n => (
                                <button
                                    key={n.id}
                                    onClick={() => handleNotificationClick(n.id)}
                                    className={`w-full text-left px-4 py-3 border-b last:border-0 hover:bg-muted/50 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}
                                >
                                    <div className="flex items-start gap-2.5">
                                        <span className="text-base mt-0.5">{getTypeIcon(n.type)}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className={`text-sm truncate ${!n.read ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                                                    {n.title}
                                                </p>
                                                {!n.read && <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.description}</p>
                                            <p className="text-[10px] text-muted-foreground/60 mt-1">{formatDate(n.sentAt)}</p>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
