/**
 * Scheme Store — Zustand store wrapping SchemeService (Firestore-backed)
 * Shared by both admin and user pages for real-time sync
 * Includes audit logging and notification broadcasts on admin mutations
 */
import { create } from 'zustand';
import SchemeService from '@/services/SchemeService';
import AuditService, { AUDIT_ACTIONS } from '@/services/AuditService';
import NotificationService, { NOTIF_TYPES } from '@/services/NotificationService';
import { useAuthStore } from '@/lib/store';

export const serviceCategories = [
    { id: 'pensions', icon: '🏦', nameKey: 'pensions' },
    { id: 'social-welfare', icon: '🤝', nameKey: 'socialWelfare' },
    { id: 'transport', icon: '🚗', nameKey: 'transport' },
    { id: 'utilities', icon: '💡', nameKey: 'utilities' },
    { id: 'tax-finance', icon: '💰', nameKey: 'taxFinance' },
    { id: 'health', icon: '🏥', nameKey: 'health' },
    { id: 'education', icon: '🎓', nameKey: 'education' },
    { id: 'agriculture', icon: '🌾', nameKey: 'agriculture' },
    { id: 'women-empowerment', icon: '👩', nameKey: 'womenEmpowerment' },
    { id: 'msme', icon: '🏭', nameKey: 'msme' },
    { id: 'startup', icon: '🚀', nameKey: 'startup' },
    { id: 'housing', icon: '🏠', nameKey: 'housing' },
    { id: 'pension-scheme', icon: '👴', nameKey: 'pensionScheme' },
    { id: 'skill-development', icon: '🛠️', nameKey: 'skillDevelopment' },
    { id: 'disability', icon: '♿', nameKey: 'disability' },
    { id: 'minority', icon: '🕌', nameKey: 'minority' },
    { id: 'tribal-welfare', icon: '🌿', nameKey: 'tribalWelfare' },
    { id: 'youth', icon: '🧑‍💼', nameKey: 'youth' },
    { id: 'digital-india', icon: '💻', nameKey: 'digitalIndia' },
];

export const states = [
    { id: 'central', name: 'Central Government' },
    { id: 'maharashtra', name: 'Maharashtra' },
    { id: 'gujarat', name: 'Gujarat' },
    { id: 'karnataka', name: 'Karnataka' },
    { id: 'delhi', name: 'Delhi' },
    { id: 'tamilnadu', name: 'Tamil Nadu' },
    { id: 'kerala', name: 'Kerala' },
    { id: 'westbengal', name: 'West Bengal' },
    { id: 'rajasthan', name: 'Rajasthan' },
    { id: 'punjab', name: 'Punjab' },
    { id: 'telangana', name: 'Telangana' },
    { id: 'andhrapradesh', name: 'Andhra Pradesh' },
    { id: 'uttarpradesh', name: 'Uttar Pradesh' },
    { id: 'madhyapradesh', name: 'Madhya Pradesh' },
    { id: 'bihar', name: 'Bihar' },
    { id: 'odisha', name: 'Odisha' },
    { id: 'jharkhand', name: 'Jharkhand' },
    { id: 'chhattisgarh', name: 'Chhattisgarh' },
    { id: 'assam', name: 'Assam' },
    { id: 'himachalpradesh', name: 'Himachal Pradesh' },
    { id: 'uttarakhand', name: 'Uttarakhand' },
    { id: 'haryana', name: 'Haryana' },
];

/** Helper to get current admin from auth store */
function getAdmin() {
    return useAuthStore.getState().user;
}

export const useSchemeStore = create((set, get) => ({
    schemes: [],
    searchResults: [],
    totalCount: 0,
    pageSize: 12,
    currentPage: 1,
    loading: false,
    loaded: false,
    error: null,

    loadSchemes: async () => {
        if (get().loaded) return;
        set({ loading: true, error: null });
        try {
            const { data, count } = await SchemeService.filter({}, 1, 1000); // legacy bulk load if needed
            set({ schemes: data || [], totalCount: count || 0, loaded: true });
        } catch (err) {
            set({ error: err.message });
        } finally {
            set({ loading: false });
        }
    },

    refresh: async () => {
        set({ loading: true, error: null });
        try {
            const { data, count } = await SchemeService.filter({}, 1, 1000);
            set({ schemes: data || [], totalCount: count || 0 });
        } catch (err) {
            set({ error: err.message });
        } finally {
            set({ loading: false });
        }
    },

    // ── Getters ──
    getAllActive: () => get().schemes.filter(s => s.status === 'active'),
    getById: (id) => get().schemes.find(s => s.id === id) || null,
    getBySlug: (slug) => get().schemes.find(s => s.slug === slug) || null,

    // ── Server-side Operations with Pagination ──
    searchSchemes: async (query, page = 1) => {
        if (!query) {
            set({ searchResults: [], totalCount: 0, currentPage: 1 });
            return;
        }
        set({ loading: true, currentPage: page });
        const { data, count } = await SchemeService.search(query, page, get().pageSize);
        set({ searchResults: data, totalCount: count, loading: false });
        return { data, count };
    },

    filterSchemes: async (filters, page = 1) => {
        set({ loading: true, currentPage: page });
        const { data, count } = await SchemeService.filter(filters, page, get().pageSize);
        set({ searchResults: data, totalCount: count, loading: false });
        return { data, count };
    },

    setPage: (page) => set({ currentPage: page }),
    setPageSize: (size) => set({ pageSize: size }),

    // ── Admin Mutations (with audit logging) ──
    addScheme: async (data) => {
        const result = await SchemeService.add(data);
        if (result.success) {
            await get().refresh();
            const admin = getAdmin();
            await AuditService.log(
                AUDIT_ACTIONS.SCHEME_CREATED,
                admin?.id, admin?.role, result.scheme.id, 'scheme',
                { schemeName: result.scheme.name }
            );
            await NotificationService.broadcastToAll(
                `New Scheme: ${result.scheme.name}`,
                `A new scheme "${result.scheme.name}" has been added. Check it out!`,
                NOTIF_TYPES.SCHEME
            );
        }
        return result;
    },

    updateScheme: async (id, data) => {
        const result = await SchemeService.update(id, data);
        if (result.success) {
            await get().refresh();
            const admin = getAdmin();
            await AuditService.log(
                AUDIT_ACTIONS.SCHEME_UPDATED,
                admin?.id, admin?.role, id, 'scheme',
                { schemeName: data.name || id }
            );
        }
        return result;
    },

    removeScheme: async (id) => {
        const scheme = get().getById(id);
        const result = await SchemeService.remove(id);
        if (result.success) {
            await get().refresh();
            const admin = getAdmin();
            await AuditService.log(
                AUDIT_ACTIONS.SCHEME_DELETED,
                admin?.id, admin?.role, id, 'scheme',
                { schemeName: scheme?.name || id }
            );
        }
        return result;
    },

    toggleSchemeStatus: async (id) => {
        const result = await SchemeService.toggleStatus(id);
        if (result.success) {
            await get().refresh();
            const admin = getAdmin();
            await AuditService.log(
                AUDIT_ACTIONS.SCHEME_TOGGLED,
                admin?.id, admin?.role, id, 'scheme',
                { schemeName: result.scheme?.name || id, newStatus: result.scheme?.status }
            );
        }
        return result;
    },
}));
