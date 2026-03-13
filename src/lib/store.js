import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import NotificationService from '@/services/NotificationService';
import AuditService, { AUDIT_ACTIONS } from '@/services/AuditService';
import { isAdminRole } from '@/lib/rbac';
import { createApplication, getUserApplications } from '@/lib/applicationService';

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

// ════════════════════════════════════════
// Helper: Fetch user profile from Supabase profiles table
// ════════════════════════════════════════
async function fetchUserProfile(uid) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', uid)
            .single();

        if (error) throw error;
        return data;
    } catch (err) {
        if (import.meta.env.DEV) console.warn('Profile fetch warning:', err.message);
        return null;
    }
}

// ════════════════════════════════════════
// Auth Store — Supabase Auth + Supabase profiles
// ════════════════════════════════════════
export const useAuthStore = create()(persist((set, get) => ({
    user: null,
    isAuthenticated: false,
    isAuthChecking: true,
    language: 'en',
    session: null,

    setUser: (user) => set({ user, isAuthenticated: !!user }),

    setLanguage: (language) => {
        set({ language });
        const user = get().user;
        if (user) set({ user: { ...user, language } });
    },

    /** Initialize Supabase onAuthStateChange listener */
    initAuthListener: () => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                const profile = await fetchUserProfile(session.user.id);
                set({
                    user: {
                        ...(profile || {}),
                        id: session.user.id,
                        email: session.user.email,
                        phone: session.user.phone,
                    },
                    isAuthenticated: true,
                    isAuthChecking: false,
                    session,
                });
            } else {
                set({
                    user: null,
                    isAuthenticated: false,
                    isAuthChecking: false,
                    session: null,
                });
            }
        });
        return () => subscription.unsubscribe();
    },

    /** Check current session (called on app mount) */
    checkSession: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            const profile = await fetchUserProfile(session.user.id);
            set({
                isAuthenticated: true,
                user: {
                    ...(profile || {}),
                    id: session.user.id,
                    email: session.user.email,
                    phone: session.user.phone,
                },
                session,
            });
        }
        set({ isAuthChecking: false });
    },

    // ── Email/Password Login (Admin) ──
    login: async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;

            const profile = await fetchUserProfile(data.user.id);

            set({
                user: {
                    ...(profile || {}),
                    id: data.user.id,
                    email: data.user.email,
                },
                isAuthenticated: true,
                session: data.session,
            });
            return { success: true, role: profile?.role || 'USER' };
        } catch (err) {
            if (import.meta.env.DEV) console.error('Login error:', err);
            return { success: false, error: err.message };
        }
    },



    /** Register new user (email/password) */
    register: async (userData) => {
        const { email, password, fullName, mobile, language } = userData;

        try {
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error) throw error;

            // Note: If email confirmation is required, session might be null here.
            // But assuming we can proceed or that email confirmation is off for now.
            if (data.user) {
                const profile = {
                    id: data.user.id,
                    full_name: fullName,
                    mobile: mobile,
                    language: language || 'en',
                    role: 'USER',
                    email: email,
                };
                await supabase.from('profiles').upsert(profile);

                if (data.session) {
                    set({
                        user: { ...profile, id: data.user.id },
                        isAuthenticated: true,
                        session: data.session
                    });
                }
            }
            return { success: true };
        } catch (err) {
            if (import.meta.env.DEV) console.error('Registration error:', err);
            return { success: false, error: err.message };
        }
    },

    logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, isAuthenticated: false, session: null });
    },

    updateProfile: async (data) => {
        const user = get().user;
        if (user) {
            try {
                const { error } = await supabase
                    .from('profiles')
                    .update(data)
                    .eq('id', user.id);
                if (error) throw error;

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
            // Verify user has an admin role
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
    getAllUsers: async () => {
        try {
            const { data, error } = await supabase.from('profiles').select('*');
            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error('getAllUsers error:', err);
            return [];
        }
    },

    getAdminUsers: async () => {
        try {
            const allUsers = await get().getAllUsers();
            return allUsers.filter(u => isAdminRole(u.role));
        } catch {
            return [];
        }
    },

    toggleUserStatus: async (userId) => {
        try {
            const { data: userDoc, error: fetchErr } = await supabase
                .from('profiles')
                .select('status')
                .eq('id', userId)
                .single();

            if (fetchErr) throw fetchErr;

            const currentStatus = userDoc.status || 'active';
            const newStatus = currentStatus === 'active' ? 'blocked' : 'active';

            const { error: updateErr } = await supabase
                .from('profiles')
                .update({ status: newStatus })
                .eq('id', userId);

            if (updateErr) throw updateErr;
            return { success: true, newStatus };
        } catch (err) {
            return { success: false, error: err.message };
        }
    },

    updateUserRole: async (userId, newRole) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId);
            if (error) throw error;
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    },

    getUserStats: async () => {
        try {
            const allUsers = await get().getAllUsers();
            const today = new Date().toISOString().split('T')[0];
            return {
                total: allUsers.length,
                active: allUsers.filter(u => u.status !== 'blocked').length,
                newToday: allUsers.filter(u => u.created_at?.startsWith(today)).length,
            };
        } catch {
            return { total: 0, active: 0, newToday: 0 };
        }
    },

    changePassword: async (oldPassword, newPassword) => {
        try {
            // Supabase allows password update without old password if session is valid
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });
            if (error) throw error;
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    },
}), {
    name: 'scheme-sarthi-auth',
    partialize: (state) => ({
        language: state.language,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        session: state.session,
    }),
}));

// ════════════════════════════════════════
// Application Store — with Supabase backend
// ════════════════════════════════════════
export const useApplicationStore = create((set, get) => ({
    applications: [],
    loaded: false,

    loadApplications: async () => {
        const user = useAuthStore.getState().user;
        if (!user?.id) return;

        const result = await getUserApplications(user.id);

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
            const result = await applicationService.updateApplicationStatus(appId, status, remarks);
            if (result.success) {
                // Optimistically update the UI arrays
                set((state) => ({
                    applications: state.applications.map(app =>
                        app.id === appId ? { ...app, status: status.toLowerCase().replace(' ', '_'), remarks } : app
                    ),
                    userApplications: state.userApplications.map(app =>
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
// Notification Store — Supabase-backed
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
// Activity Log Store — Supabase-backed
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
