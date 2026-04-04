import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import NotificationService from '@/services/NotificationService';
import AuditService, { AUDIT_ACTIONS } from '@/services/AuditService';
import { isAdminRole } from '@/lib/rbac';
import { createApplication, getUserApplications, getAllApplications, updateApplicationStatus as updateAppStatusFirestore } from '@/lib/applicationService';

// ════════════════════════════════════════
// Theme Store (unchanged)
// ════════════════════════════════════════
export const useThemeStore = create()(persist((set, get) => ({
    theme: 'light',
    toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: next });
        applyTheme(next);
    },
    initTheme: () => {
        const stored = get().theme;
        applyTheme(stored);
    },
}), {
    name: 'scheme-sarthi-theme',
}));

function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
}

import { login as apiLogin, register as apiRegister, getProfile } from '@/lib/authService';

// ════════════════════════════════════════
// Auth Store — Express MongoDB backend
// ════════════════════════════════════════
export const useAuthStore = create()(persist((set, get) => ({
    user: null,
    isAuthenticated: false,
    isAuthChecking: true,
    language: 'en',
    session: null, // holds token
    users: [],
    adminUsers: [], // for admin management
    usersLoaded: false,
    adminUsersLoaded: false,

    setUser: (user) => set({ user, isAuthenticated: !!user }),

    setLanguage: (language) => {
        set({ language });
        const user = get().user;
        if (user) set({ user: { ...user, language } });
    },

    /** Initialize listener — check local storage token */
    initAuthListener: async () => {
        set({ isAuthChecking: true });
        const token = get().session?.token;
        if (token) {
            try {
                const res = await getProfile(token);
                if (res.success) {
                    set({ user: res.data, isAuthenticated: true, isAuthChecking: false });
                } else {
                    set({ user: null, isAuthenticated: false, session: null, isAuthChecking: false });
                }
            } catch {
                set({ user: null, isAuthenticated: false, session: null, isAuthChecking: false });
            }
        } else {
            set({ user: null, isAuthenticated: false, isAuthChecking: false });
        }
    },

    // ── Email/Password Login (Admin/User) ──
    login: async (email, password) => {
        try {
            const res = await apiLogin(email, password);
            if (res.success) {
                set({
                    user: res.data,
                    isAuthenticated: true,
                    session: { token: res.data.token }
                });
                return { success: true, role: res.data.role || 'USER' };
            }
            return { success: false, error: res.error || 'Login Failed' };
        } catch (err) {
            return { success: false, error: err.message };
        }
    },

    /** Register new user (email/password) */
    register: async (userData) => {
        try {
            const res = await apiRegister(userData);
            if (res.success) {
                set({
                    user: res.data,
                    isAuthenticated: true,
                    session: { token: res.data.token }
                });
                return { success: true };
            }
            return { success: false, error: res.error || 'Registration Failed' };
        } catch (err) {
            return { success: false, error: err.message };
        }
    },

    logout: async () => {
        set({ user: null, isAuthenticated: false, session: null });
    },

    updateProfile: async (data) => {
        const user = get().user;
        if (user) {
            try {
                // In MongoDB we'd call an API here
                set({ user: { ...user, ...data } });
                return { success: true };
            } catch (err) {
                return { success: false, error: err.message };
            }
        }
        return { success: false };
    },

    // ── Admin auth (routed through standard login) ──
    adminLogin: async (email, password) => {
        const result = await get().login(email, password);
        if (result.success) {
            const user = get().user;
            if (!user?.role || !isAdminRole(user.role)) {
                await get().logout();
                return { success: false, error: 'Access denied. Admin role required.' };
            }
        }
        return result;
    },

    adminLogout: () => get().logout(),

    // ── Admin user management ──
    getAllUsers: () => get().users,

    loadAllUsers: async () => {
        const token = get().session?.token;
        if (!token) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/auth/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                set({ users: data.data, usersLoaded: true });
            }
        } catch (err) {
            console.error('Failed to load users:', err);
        }
    },

    getAdminUsers: () => {
        return get().adminUsers;
    },

    loadAdminUsers: async () => {
        const token = get().session?.token;
        if (!token) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/auth/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                const admins = data.data.filter(u => ['SUPER_ADMIN', 'CONTENT_ADMIN', 'REVIEW_ADMIN'].includes(u.role));
                set({ adminUsers: admins });
            }
        } catch (err) {
            console.error('Failed to load admin users:', err);
        }
    },

    toggleUserStatus: async (userId) => {
        const token = get().session?.token;
        if (!token) return { success: false, error: 'No token' };

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/auth/users/${userId}/status`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                // Update local state
                set(s => ({
                    users: s.users.map(u => u.id === userId ? { ...u, status: data.status } : u)
                }));
                return { success: true };
            }
            return { success: false, error: data.error };
        } catch (err) {
            return { success: false, error: err.message };
        }
    },

    updateUserRole: async (userId, newRole) => {
        return { success: false, error: "Not implemented in MongoDB yet" };
    },

    getUserStats: async () => {
        return { total: 0, active: 0, newToday: 0 };
    },

    changePassword: async (oldPassword, newPassword) => {
        return { success: false, error: "Not implemented in MongoDB yet" };
    },
}), {
    name: 'scheme-sarthi-auth',
    partialize: (state) => ({
        language: state.language,
        user: state.user,
        session: state.session
    }),
}));

// ════════════════════════════════════════
// Application Store — MongoDB backend
// ════════════════════════════════════════
export const useApplicationStore = create((set, get) => ({
    applications: [],
    loaded: false,

    loadApplications: async () => {
        const user = useAuthStore.getState().user;
        if (!user?.id) return;

        let result;
        if (isAdminRole(user.role)) {
            result = await getAllApplications();
        } else {
            result = await getUserApplications(user.id);
        }

        if (result.success) {
            set({ applications: result.data, loaded: true });
        }
    },

    refresh: () => get().loadApplications(),

    addApplication: async (appData) => {
        const result = await createApplication(appData);

        if (result.success) {
            get().loadApplications();
            return { success: true, application: result.data };
        }

        return { success: false, error: result.error };
    },

    getApplicationsByUser: (userId) => {
        return get().applications.filter(app => app.userId === userId);
    },

    getAllApplications: () => get().applications,

    moveToReview: async (appId) => {
        return await get().updateApplicationStatus(appId, 'Under Review', 'Application placed under review.');
    },

    updateApplicationStatus: async (appId, status, remarks) => {
        try {
            const result = await updateAppStatusFirestore(appId, status, remarks);
            if (result.success) {
                // Optimistically update the UI arrays
                set((state) => ({
                    applications: state.applications.map(app =>
                        app.id === appId ? { ...app, status: status.toLowerCase().replace(' ', '_'), remarks } : app
                    )
                }));
                return { success: true };
            }
            return { success: false, message: result.error || "Failed to update application" };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    getApplicationStats: () => {
        const apps = get().applications;
        return {
            total: apps.length,
            pending: apps.filter(a => a.status === 'pending').length,
            approved: apps.filter(a => a.status === 'approved').length,
        };
    },

    getApplicationById: (id) => get().applications.find(a => a.id === id) || null,
}));

// ════════════════════════════════════════
// Notification Store — MongoDB backend
// ════════════════════════════════════════
export const useNotificationStore = create((set, get) => ({
    notifications: [],
    loaded: false,

    loadNotifications: async () => {
        const user = useAuthStore.getState().user;
        if (!user?.id) {
            const all = await NotificationService.getAll();
            set({ notifications: all, loaded: true });
        } else {
            const userNotifs = await NotificationService.getByUser(user.id);
            set({ notifications: userNotifs, loaded: true });
        }
    },

    refresh: () => get().loadNotifications(),

    addNotification: async (notifData) => {
        const result = await NotificationService.add(notifData);
        if (result.success) {
            await get().loadNotifications();
        }
        return result;
    },

    broadcastNotification: async (title, message, type) => {
        const admin = useAuthStore.getState().user;
        const result = await NotificationService.broadcastToAll(title, message, type);
        if (result.success) {
            await get().loadNotifications();
            await AuditService.log(
                AUDIT_ACTIONS.NOTIFICATION_BROADCAST,
                admin?.id, admin?.role, result.notification.id, 'notification',
                { title }
            );
        }
        return result;
    },

    notifyUser: async (userId, title, message, type) => {
        const result = await NotificationService.sendToUser(userId, title, message, type);
        if (result.success) {
            await get().loadNotifications();
        }
        return result;
    },

    getNotificationsByUser: (userId) => {
        return get().notifications.filter(n =>
            n.target === 'all' || n.userId === userId
        );
    },

    getAllNotifications: () => get().notifications,

    markAsRead: async (id) => {
        await NotificationService.markRead(id);
        await get().loadNotifications();
    },

    markAllRead: async (userId) => {
        await NotificationService.markAllRead(userId);
        await get().loadNotifications();
    },

    getUnreadCount: (userId) => {
        return get().notifications.filter(n =>
            (n.target === 'all' || n.userId === userId) && !n.read
        ).length;
    },
}));

// ════════════════════════════════════════
// Activity Log Store — MongoDB backend
// ════════════════════════════════════════
export const useActivityLogStore = create((set, get) => ({
    logs: [],
    loaded: false,

    loadLogs: async () => {
        const logs = await AuditService.getAll(50);
        set({ logs, loaded: true });
    },

    addLog: async (action) => {
        const admin = useAuthStore.getState().user;
        await AuditService.log(
            action,
            admin?.id || 'system',
            admin?.role || 'SYSTEM',
            'N/A',
            'system',
            { action }
        );
        await get().loadLogs();
    },

    maintenanceMode: false,
    toggleMaintenance: () => set((s) => ({ maintenanceMode: !s.maintenanceMode })),
}));
