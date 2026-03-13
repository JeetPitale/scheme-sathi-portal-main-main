import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, FileText, Users, ClipboardList,
    Bell, BarChart3, Settings, ChevronLeft, ChevronRight, LogOut, Shield, ShieldCheck
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { getMenuItems, getRoleLabel, getRoleBadgeClass } from '@/lib/rbac';
import ThemeToggle from '@/components/ThemeToggle';

// Icon map for dynamic rendering from rbac.js menu items
const ICON_MAP = {
    LayoutDashboard,
    FileText,
    Users,
    ClipboardList,
    Bell,
    BarChart3,
    Settings,
    ShieldCheck,
};

const AdminSidebar = ({ collapsed, onToggle, menuItems }) => (
    <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="admin-sidebar-header">
            {!collapsed && (
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
                        स
                    </div>
                    <span className="text-sm font-bold text-foreground">Admin Panel</span>
                </div>
            )}
            {collapsed && (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold mx-auto">
                    स
                </div>
            )}
            <button onClick={onToggle} className="admin-sidebar-toggle" aria-label="Toggle sidebar">
                {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
        </div>

        <nav className="admin-sidebar-nav">
            {menuItems.map((item) => {
                const IconComp = ICON_MAP[item.iconKey] || LayoutDashboard;
                return (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                            `admin-nav-item ${isActive ? 'active' : ''}`
                        }
                        title={collapsed ? item.label : undefined}
                    >
                        <IconComp className="admin-nav-icon" />
                        {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                );
            })}
        </nav>
    </aside>
);

const AdminLayout = ({ children }) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const { user, adminLogout } = useAuthStore();
    const navigate = useNavigate();

    // Get role-filtered menu items
    const menuItems = getMenuItems(user?.role);

    const handleLogout = () => {
        adminLogout();
        navigate('/admin/login');
    };

    return (
        <div className="admin-root">
            <AdminSidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                menuItems={menuItems}
            />

            <div className={`admin-main ${sidebarCollapsed ? 'expanded' : ''}`}>
                {/* Top Navbar */}
                <header className="admin-topbar">
                    <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <span className="text-sm font-semibold text-foreground">Scheme Sarthi Admin</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
                            <div className="h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary">
                                {user?.fullName?.[0] || 'A'}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm text-foreground font-medium leading-tight">{user?.fullName || 'Admin'}</span>
                                <span className={`text-[10px] leading-tight px-1.5 py-0.5 rounded-full inline-block mt-0.5 ${getRoleBadgeClass(user?.role)}`}>
                                    {getRoleLabel(user?.role)}
                                </span>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="admin-logout-btn" title="Logout">
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </header>

                {/* Content */}
                <main className="admin-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
