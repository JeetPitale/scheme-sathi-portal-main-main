import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Grid, CheckCircle2, FileText, LogOut, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Sidebar = ({ isCollapsed, toggleSidebar, isMobile, isOpen, closeMobileSidebar }) => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuthStore();

    const navLinks = [
        { path: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
        { path: '/services', label: t('services'), icon: Grid },
        { path: '/eligibility', label: 'Check Eligibility', icon: CheckCircle2 },
        { path: '/applications', label: t('myApplications'), icon: FileText },
    ];

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;

    // Mobile overlay classes
    const mobileOverlayClass = isMobile && isOpen
        ? "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity opacity-100"
        : "hidden opacity-0";

    // Sidebar classes
    const sidebarClass = cn(
        "fixed top-0 left-0 z-50 h-screen bg-bharat-navy text-white transition-all duration-300 ease-in-out flex flex-col border-r border-white/10 shadow-xl",
        isMobile
            ? (isOpen ? "translate-x-0 w-64" : "-translate-x-full w-64")
            : (isCollapsed ? "w-20" : "w-64")
    );

    return (
        <>
            {/* Mobile Overlay */}
            <div className={mobileOverlayClass} onClick={closeMobileSidebar} />

            <aside className={sidebarClass}>
                {/* Header / Logo */}
                <div className={cn("flex items-center h-16 px-4 border-b border-white/10", isCollapsed && !isMobile ? "justify-center" : "justify-between")}>
                    <Link to="/dashboard" className="flex items-center gap-3 overflow-hidden" onClick={isMobile ? closeMobileSidebar : undefined}>
                        <div className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors border border-white/10">
                            <span className="text-lg font-bold text-bharat-saffron">स</span>
                        </div>
                        {(!isCollapsed || isMobile) && (
                            <div className="flex flex-col animate-in fade-in duration-300">
                                <span className="text-base font-bold leading-none tracking-tight text-white">{t('appName')}</span>
                                <span className="text-[9px] text-white/50 font-medium tracking-wider uppercase">Portal</span>
                            </div>
                        )}
                    </Link>

                    {isMobile && (
                        <Button variant="ghost" size="icon" onClick={closeMobileSidebar} className="text-white hover:bg-white/10">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto overflow-x-hidden">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        const active = isActive(link.path);

                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={isMobile ? closeMobileSidebar : undefined}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative",
                                    active
                                        ? "bg-white/10 text-white shadow-md border-l-4 border-bharat-saffron"
                                        : "text-white/70 hover:bg-white/5 hover:text-white hover:pl-4"
                                )}
                                title={isCollapsed && !isMobile ? link.label : undefined}
                            >
                                <Icon className={cn("h-5 w-5 flex-shrink-0", active ? "text-bharat-saffron" : "text-white/60 group-hover:text-white")} />

                                {(!isCollapsed || isMobile) && (
                                    <span className="text-sm font-medium whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-200">
                                        {link.label === t('services') ? 'Discover Schemes' : link.label}
                                    </span>
                                )}

                                {/* Tooltip for collapsed mode */}
                                {isCollapsed && !isMobile && (
                                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                                        {link.label}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Actions */}
                <div className="p-3 border-t border-white/10 space-y-1">
                    {/* Settings (UI Only) */}
                    <button
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-white/70 hover:bg-white/5 hover:text-white transition-colors",
                            isCollapsed && !isMobile && "justify-center"
                        )}
                        title={t('settings') || "Settings"}
                    >
                        <Settings className="h-5 w-5 flex-shrink-0" />
                        {(!isCollapsed || isMobile) && <span className="text-sm font-medium">Settings</span>}
                    </button>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors",
                            isCollapsed && !isMobile && "justify-center"
                        )}
                        title={t('logout')}
                    >
                        <LogOut className="h-5 w-5 flex-shrink-0" />
                        {(!isCollapsed || isMobile) && <span className="text-sm font-medium">{t('logout')}</span>}
                    </button>

                    {/* Collapse Toggle (Desktop Only) */}
                    {!isMobile && (
                        <button
                            onClick={toggleSidebar}
                            className="w-full flex items-center justify-center py-2 mt-2 text-white/40 hover:text-white transition-colors"
                        >
                            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                        </button>
                    )}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
