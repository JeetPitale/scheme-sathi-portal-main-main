import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Register from '../../pages/Register';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/store';
import { toast } from 'sonner';

// Mocks
vi.mock('../../lib/supabase', () => ({
    supabase: {
        auth: {
            signUp: vi.fn(),
        },
        from: vi.fn(() => ({
            upsert: vi.fn(() => Promise.resolve({ error: null })),
        })),
    },
}));

vi.mock('../../lib/store', () => ({
    useAuthStore: vi.fn(),
    useThemeStore: () => ({ theme: 'light', toggleTheme: vi.fn(), initTheme: vi.fn() }),
    useApplicationStore: () => ({ loadApplications: vi.fn() }),
    useNotificationStore: () => ({ loadNotifications: vi.fn() }),
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock('../../hooks/useTranslation', () => ({
    useTranslation: () => ({ t: (key) => key }),
    languageNames: { en: 'English', hi: 'Hindi' },
}));

vi.mock('../../components/Layout/Layout', () => ({
    default: ({ children }) => <div data-testid="layout-mock">{children}</div>
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('Register Component', () => {
    let mockCheckSession;

    beforeEach(() => {
        vi.clearAllMocks();
        mockCheckSession = vi.fn();
        const mockState = {
            isAuthenticated: false,
            isAuthChecking: false,
            checkSession: mockCheckSession,
        };
        useAuthStore.mockImplementation((selector) => selector ? selector(mockState) : mockState);
    });

    const renderComponent = () => render(
        <BrowserRouter>
            <Register />
        </BrowserRouter>
    );

    it('1. Valid registration', async () => {
        supabase.auth.signUp.mockResolvedValueOnce({
            data: { user: { id: 'user-123' } },
            error: null,
        });
        supabase.from().upsert.mockResolvedValueOnce({ error: null });

        renderComponent();

        await userEvent.type(screen.getByPlaceholderText(/Enter your full name/i), 'John Doe');
        await userEvent.type(screen.getByPlaceholderText(/email@example.com/i), 'john@example.com');
        await userEvent.type(screen.getByPlaceholderText(/Min 8 characters/i), 'StrongPass!123');
        await userEvent.type(screen.getByPlaceholderText(/Confirm your password/i), 'StrongPass!123');
        await userEvent.selectOptions(screen.getByRole('combobox', { name: /state/i }), 'maharashtra'); // Andaman and Nicobar

        fireEvent.click(screen.getByRole('button', { name: /register/i, exact: true }));

        await waitFor(() => {
            expect(supabase.auth.signUp).toHaveBeenCalledWith({
                email: 'john@example.com',
                password: 'StrongPass!123',
                options: {
                    data: {
                        full_name: 'John Doe',
                        state: 'maharashtra',
                        phone: null,
                    }
                }
            });
            expect(supabase.from).toHaveBeenCalledWith('profiles');
            expect(mockCheckSession).toHaveBeenCalled();
            expect(toast.success).toHaveBeenCalledWith('Welcome to Scheme Saarthi!');
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        });
    });

    it('2. Password mismatch', async () => {
        renderComponent();

        await userEvent.type(screen.getByPlaceholderText(/Enter your full name/i), 'John Doe');
        await userEvent.type(screen.getByPlaceholderText(/email@example.com/i), 'john@example.com');
        await userEvent.type(screen.getByPlaceholderText(/Min 8 characters/i), 'StrongPass!');
        await userEvent.type(screen.getByPlaceholderText(/Confirm your password/i), 'DifferentPass!');
        await userEvent.selectOptions(screen.getByRole('combobox', { name: /state/i }), 'maharashtra');

        fireEvent.click(screen.getByRole('button', { name: /register/i, exact: true }));

        await waitFor(() => {
            expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument();
            expect(supabase.auth.signUp).not.toHaveBeenCalled();
        });
    });

    it('3. Weak password', async () => {
        renderComponent();

        await userEvent.type(screen.getByPlaceholderText(/Enter your full name/i), 'John Doe');
        await userEvent.type(screen.getByPlaceholderText(/email@example.com/i), 'john@example.com');
        await userEvent.type(screen.getByPlaceholderText(/Min 8 characters/i), 'short');
        await userEvent.type(screen.getByPlaceholderText(/Confirm your password/i), 'short');

        fireEvent.click(screen.getByRole('button', { name: /register/i, exact: true }));

        await waitFor(() => {
            expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
            expect(supabase.auth.signUp).not.toHaveBeenCalled();
        });
    });

    it('4. Invalid email format', async () => {
        renderComponent();

        await userEvent.type(screen.getByPlaceholderText(/email@example.com/i), 'notanemail');
        fireEvent.click(screen.getByRole('button', { name: /register/i, exact: true }));

        await waitFor(() => {
            expect(screen.getByText(/valid email is required/i)).toBeInTheDocument();
            expect(supabase.auth.signUp).not.toHaveBeenCalled();
        });
    });

    it('5. Duplicate email', async () => {
        supabase.auth.signUp.mockResolvedValueOnce({
            data: { user: null },
            error: { message: 'User already registered' }
        });
        renderComponent();

        await userEvent.type(screen.getByPlaceholderText(/Enter your full name/i), 'John Doe');
        await userEvent.type(screen.getByPlaceholderText(/email@example.com/i), 'duplicate@example.com');
        await userEvent.type(screen.getByPlaceholderText(/Min 8 characters/i), 'StrongPass!123');
        await userEvent.type(screen.getByPlaceholderText(/Confirm your password/i), 'StrongPass!123');
        await userEvent.selectOptions(screen.getByRole('combobox', { name: /state/i }), 'maharashtra');

        fireEvent.click(screen.getByRole('button', { name: /register/i, exact: true }));

        await waitFor(() => {
            expect(supabase.auth.signUp).toHaveBeenCalled();
            expect(screen.getByText(/email already registered/i)).toBeInTheDocument();
        });
    });

    it('6. Password strength indicator', async () => {
        renderComponent();

        const pwInput = screen.getByPlaceholderText(/Min 8 characters/i);

        await userEvent.clear(pwInput);
        await userEvent.type(pwInput, '1234');
        expect(screen.getByText('Weak')).toBeInTheDocument();

        await userEvent.clear(pwInput);
        await userEvent.type(pwInput, 'Pass1234');
        expect(screen.getByText('Medium')).toBeInTheDocument();

        await userEvent.clear(pwInput);
        await userEvent.type(pwInput, 'Pass@1234!');
        expect(screen.getByText('Strong')).toBeInTheDocument();
    });
});
