import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from '../../lib/store';
import { supabase } from '../../lib/supabase';

vi.mock('../../lib/supabase', () => {
    const mockSingle = vi.fn();
    const mockEq = vi.fn(() => ({ single: mockSingle }));
    const mockSelect = vi.fn(() => ({ eq: mockEq }));
    const mockFrom = vi.fn(() => ({ select: mockSelect }));

    return {
        supabase: {
            auth: {
                signInWithPassword: vi.fn(),
                signOut: vi.fn(),
                onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
            },
            from: mockFrom,
        },
    };
});

describe('Auth Store', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAuthStore.setState({
            user: null,
            isAuthenticated: false,
            isAuthChecking: false,
            role: 'USER',
            permissions: [],
        });
    });

    it('1. Confirm signInWithOtp does NOT exist in store', () => {
        const store = useAuthStore.getState();
        expect(store.signInWithOtp).toBeUndefined();
        expect(store.sendOtp).toBeUndefined();
        expect(store.verifyOtp).toBeUndefined();
    });

    it('2. Confirm signInWithGoogle does NOT exist in store', () => {
        const store = useAuthStore.getState();
        expect(store.signInWithGoogle).toBeUndefined();
    });

    it('3 & 7. Confirm login (signIn) exists and works & role is read', async () => {
        const store = useAuthStore.getState();
        expect(store.login).toBeDefined();

        // Mock Supabase signInWithPassword
        supabase.auth.signInWithPassword.mockResolvedValueOnce({
            data: { user: { id: 'user-123' } },
            error: null,
        });

        // Mock Supabase profiles fetch
        supabase.from().select().eq().single.mockResolvedValueOnce({
            data: { role: 'SUPER_ADMIN' },
            error: null,
        });

        const result = await useAuthStore.getState().login('admin@test.com', 'password123');

        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({ email: 'admin@test.com', password: 'password123' });
        expect(result.role).toBe('SUPER_ADMIN');

        // Check state updates
        const state = useAuthStore.getState();
        expect(state.user).toEqual(expect.objectContaining({ id: 'user-123' }));
        expect(state.isAuthenticated).toBe(true);
        expect(state.user.role).toBe('SUPER_ADMIN');
        expect(state.session).toBeUndefined(); // we didn't mock session passing, so undefined is fine
    });

    it('4. Confirm register (signUp) exists', () => {
        const store = useAuthStore.getState();
        expect(store.register).toBeDefined();
    });

    it('5. Confirm logout (signOut) clears user state', async () => {
        // Set some initial state
        useAuthStore.setState({ user: { id: 'test' }, isAuthenticated: true, role: 'USER' });

        supabase.auth.signOut.mockResolvedValueOnce({ error: null });

        await useAuthStore.getState().logout();

        const state = useAuthStore.getState();
        expect(state.user).toBeNull();
        expect(state.isAuthenticated).toBe(false);
        expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('6. Confirm initAuthListener (onAuthStateChange) sets user correctly', async () => {
        const store = useAuthStore.getState();
        expect(store.initAuthListener).toBeDefined();

        let callback;
        supabase.auth.onAuthStateChange.mockImplementationOnce((cb) => {
            callback = cb;
            return { data: { subscription: { unsubscribe: vi.fn() } } };
        });

        store.initAuthListener();
        expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();

        // Simulate auth state change
        supabase.from().select().eq().single.mockResolvedValueOnce({ data: { role: 'CONTENT_ADMIN' }, error: null });

        await callback('SIGNED_IN', { user: { id: 'new-user' } });

        expect(useAuthStore.getState().user).toEqual(expect.objectContaining({ id: 'new-user' }));
        expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });
});
