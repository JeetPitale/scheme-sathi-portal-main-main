import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../pages/Login';
import { useAuthStore } from '../../lib/store';
import { toast } from 'sonner';

// Mocks
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

describe('Login Component', () => {
    let mockLogin;

    beforeEach(() => {
        vi.clearAllMocks();
        const setupAuthStore = (state) => {
            const mockState = {
                isAuthenticated: false,
                user: null,
                isAuthChecking: false,
                login: vi.fn(),
                ...state
            };
            useAuthStore.mockImplementation((selector) => selector ? selector(mockState) : mockState);
            mockLogin = mockState.login; // Assign the mockLogin from the state
        };
        setupAuthStore({}); // Initialize with default state
    });

    const renderComponent = () => render(
        <BrowserRouter>
            <Login />
        </BrowserRouter>
    );

    it('1. Valid login as citizen', async () => {
        mockLogin.mockResolvedValueOnce({ success: true, role: 'USER' });
        renderComponent();

        await userEvent.type(screen.getByPlaceholderText(/name@example.com/i), 'citizen@example.com');
        await userEvent.type(screen.getByPlaceholderText(/••••••••/i), 'Password123!');

        fireEvent.click(screen.getByRole('button', { name: /login/i, exact: true }));

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('citizen@example.com', 'Password123!');
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
            expect(toast.success).toHaveBeenCalledWith(expect.stringMatching(/login successful/i));
        });
    });

    it('2. Valid login as admin', async () => {
        mockLogin.mockResolvedValueOnce({ success: true, role: 'SUPER_ADMIN' });
        renderComponent();

        await userEvent.type(screen.getByPlaceholderText(/name@example.com/i), 'admin@example.com');
        await userEvent.type(screen.getByPlaceholderText(/••••••••/i), 'AdminPassword123!');

        fireEvent.click(screen.getByRole('button', { name: /login/i, exact: true }));

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('admin@example.com', 'AdminPassword123!');
            expect(mockNavigate).toHaveBeenCalledWith('/admin');
        });
    });

    it('3. Wrong password', async () => {
        mockLogin.mockResolvedValueOnce({ success: false, error: 'Invalid login credentials' });
        renderComponent();

        await userEvent.type(screen.getByPlaceholderText(/name@example.com/i), 'user@example.com');
        await userEvent.type(screen.getByPlaceholderText(/••••••••/i), 'wrongpass');

        fireEvent.click(screen.getByRole('button', { name: /login/i, exact: true }));

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalled();
            expect(toast.error).toHaveBeenCalledWith('Invalid login credentials');
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });

    it('4. Empty fields', async () => {
        renderComponent();

        fireEvent.click(screen.getByRole('button', { name: /login/i, exact: true }));

        await waitFor(() => {
            expect(screen.getByText(/valid email is required/i)).toBeInTheDocument();
            expect(screen.getByText(/password is required/i)).toBeInTheDocument();
            expect(mockLogin).not.toHaveBeenCalled();
        });
    });

    it('5. Show/hide password toggle', async () => {
        renderComponent();

        const passwordInput = screen.getByPlaceholderText(/••••••••/i);
        expect(passwordInput).toHaveAttribute('type', 'password');

        const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });
        fireEvent.click(toggleButton);

        expect(passwordInput).toHaveAttribute('type', 'text');

        fireEvent.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('6. No OTP anywhere', () => {
        renderComponent();

        const otpTextElements = screen.queryAllByText(/otp/i);
        expect(otpTextElements.length).toBe(0);
    });
});
