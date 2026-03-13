import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updatePassword } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
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
// Helper: Fetch user profile from Firebase profiles collection
// ════════════════════════════════════════
async function fetchUserProfile(uid) {
    try {
        const docRef = doc(db, 'profiles', uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            return null;
        }
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

    /** Initialize Firebase onAuthStateChanged listener */
    initAuthListener: () => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const profile = await fetchUserProfile(firebaseUser.uid);
                set({
                    user: {
                        ...(profile || {}),
                        id: firebaseUser.uid,
                        email: firebaseUser.email,
                        phone: firebaseUser.phoneNumber,
                    },
                    isAuthenticated: true,
                    isAuthChecking: false,
                    session: { user: firebaseUser }, // Mapping to match previous structure
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
        return unsubscribe;
    },

    /** Check current session (Firebase handles this automatically via onAuthStateChanged) */
    checkSession: async () => {
        const firebaseUser = auth.currentUser;
        if (firebaseUser) {
            const profile = await fetchUserProfile(firebaseUser.uid);
            set({
                isAuthenticated: true,
                user: {
                    ...(profile || {}),
                    id: firebaseUser.uid,
                    email: firebaseUser.email,
                    phone: firebaseUser.phoneNumber,
                },
                session: { user: firebaseUser },
            });
        }
        set({ isAuthChecking: false });
    },

    // ── Email/Password Login (Admin/User) ──
    login: async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            const profile = await fetchUserProfile(firebaseUser.uid);

            set({
                user: {
                    ...(profile || {}),
                    id: firebaseUser.uid,
                    email: firebaseUser.email,
                },
                isAuthenticated: true,
                session: { user: firebaseUser },
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
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            if (firebaseUser) {
                const profile = {
                    id: firebaseUser.uid,
                    full_name: fullName,
                    mobile: mobile,
                    language: language || 'en',
                    role: 'USER',
                    email: email,
                    status: 'active',
                    created_at: new Date().toISOString()
                };
                
                await setDoc(doc(db, 'profiles', firebaseUser.uid), profile);

                set({
                    user: profile,
                    isAuthenticated: true,
                    session: { user: firebaseUser }
                });
            }
            return { success: true };
        } catch (err) {
            if (import.meta.env.DEV) console.error('Registration error:', err);
            return { success: false, error: err.message };
        }
    },

    logout: async () => {
        await signOut(auth);
        set({ user: null, isAuthenticated: false, session: null });
    },

    updateProfile: async (data) => {
        const user = get().user;
        if (user) {
            try {
                const docRef = doc(db, 'profiles', user.id);
                await updateDoc(docRef, data);

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
            const querySnapshot = await getDocs(collection(db, 'profiles'));
            const users = [];
            querySnapshot.forEach((doc) => {
                users.push({ id: doc.id, ...doc.data() });
            });
            return users;
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
            const docRef = doc(db, 'profiles', userId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) throw new Error("User not found");

            const currentStatus = docSnap.data().status || 'active';
            const newStatus = currentStatus === 'active' ? 'blocked' : 'active';

            await updateDoc(docRef, { status: newStatus });

            return { success: true, newStatus };
        } catch (err) {
            return { success: false, error: err.message };
        }
    },

    updateUserRole: async (userId, newRole) => {
        try {
            const docRef = doc(db, 'profiles', userId);
            await updateDoc(docRef, { role: newRole });
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
            const user = auth.currentUser;
            if (!user) throw new Error("No user logged in");
            await updatePassword(user, newPassword);
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
