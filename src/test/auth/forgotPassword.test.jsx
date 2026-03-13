import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ForgotPassword from '../../pages/ForgotPassword';
import ResetPassword from '../../pages/ResetPassword';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

// Mocks
vi.mock('../../lib/supabase', () => ({
    supabase: {
        auth: {
            resetPasswordForEmail: vi.fn(),
            updateUser: vi.fn(),
        },
    },
}));

vi.mock('../../hooks/useTranslation', () => ({
    useTranslation: () => ({ t: (key) => key }),
    languageNames: { en: 'English', hi: 'Hindi' },
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
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

describe('Forgot Password Flow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('ForgotPassword Component', () => {
        const renderForgot = () => render(
            <BrowserRouter>
                <ForgotPassword />
            </BrowserRouter>
        );

        it('1. Valid email submitted', async () => {
            supabase.auth.resetPasswordForEmail.mockResolvedValueOnce({ error: null });
            renderForgot();

            await userEvent.type(screen.getByPlaceholderText(/email@example.com/i), 'user@example.com');
            fireEvent.click(screen.getByRole('button', { name: /send reset link/i, exact: false }));

            await waitFor(() => {
                expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('user@example.com', expect.any(Object));
                expect(toast.success).toHaveBeenCalledWith(expect.stringMatching(/password reset/i));
            });
        });

        it('2. Invalid email format', async () => {
            renderForgot();

            await userEvent.type(screen.getByPlaceholderText(/email@example.com/i), 'invalidemail');
            fireEvent.click(screen.getByRole('button', { name: /send reset link/i, exact: false }));

            await waitFor(() => {
                expect(screen.getByText(/valid email is required/i)).toBeInTheDocument();
                expect(supabase.auth.resetPasswordForEmail).not.toHaveBeenCalled();
            });
        });
    });

    describe('ResetPassword Component', () => {
        const renderReset = () => render(
            <BrowserRouter>
                <ResetPassword />
            </BrowserRouter>
        );

        it('3. Valid new password \u002B confirm', async () => {
            supabase.auth.updateUser.mockResolvedValueOnce({ error: null });
            renderReset();

            await userEvent.type(screen.getByPlaceholderText(/Min 8 characters/i), 'NewStrongPass!1');
            await userEvent.type(screen.getByPlaceholderText(/Confirm your password/i), 'NewStrongPass!1');
            fireEvent.click(screen.getByRole('button', { name: /update password/i, exact: false }));

            await waitFor(() => {
                expect(supabase.auth.updateUser).toHaveBeenCalledWith({ password: 'NewStrongPass!1' });
                expect(toast.success).toHaveBeenCalledWith(expect.stringMatching(/password updated/i));
                expect(mockNavigate).toHaveBeenCalledWith('/login');
            });
        });
    });
});
