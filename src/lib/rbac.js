/**
 * RBAC — Role-Based Access Control
 * Roles: SUPER_ADMIN, CONTENT_ADMIN, REVIEW_ADMIN
 * All permission checks go through this module.
 */

export const ROLES = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    CONTENT_ADMIN: 'CONTENT_ADMIN',
    REVIEW_ADMIN: 'REVIEW_ADMIN',
    USER: 'USER',
};

export const ADMIN_ROLES = [ROLES.SUPER_ADMIN, ROLES.CONTENT_ADMIN, ROLES.REVIEW_ADMIN];

export const ACTIONS = {
    ADD_SCHEME: 'ADD_SCHEME',
    EDIT_SCHEME: 'EDIT_SCHEME',
    DELETE_SCHEME: 'DELETE_SCHEME',
    APPROVE_APPLICATION: 'APPROVE_APPLICATION',
    REJECT_APPLICATION: 'REJECT_APPLICATION',
    REVIEW_APPLICATION: 'REVIEW_APPLICATION',
    VIEW_USERS: 'VIEW_USERS',
    VIEW_AUDIT_LOGS: 'VIEW_AUDIT_LOGS',
    MANAGE_ROLES: 'MANAGE_ROLES',
    SEND_NOTIFICATIONS: 'SEND_NOTIFICATIONS',
    VIEW_ANALYTICS: 'VIEW_ANALYTICS',
};

/**
 * Permission matrix: role → allowed actions
 */
const PERMISSION_MAP = {
    [ROLES.SUPER_ADMIN]: [
        ACTIONS.ADD_SCHEME,
        ACTIONS.EDIT_SCHEME,
        ACTIONS.DELETE_SCHEME,
        ACTIONS.APPROVE_APPLICATION,
        ACTIONS.REJECT_APPLICATION,
        ACTIONS.REVIEW_APPLICATION,
        ACTIONS.VIEW_USERS,
        ACTIONS.VIEW_AUDIT_LOGS,
        ACTIONS.MANAGE_ROLES,
        ACTIONS.SEND_NOTIFICATIONS,
        ACTIONS.VIEW_ANALYTICS,
    ],
    [ROLES.CONTENT_ADMIN]: [
        ACTIONS.ADD_SCHEME,
        ACTIONS.EDIT_SCHEME,
        ACTIONS.SEND_NOTIFICATIONS,
    ],
    [ROLES.REVIEW_ADMIN]: [
        ACTIONS.APPROVE_APPLICATION,
        ACTIONS.REJECT_APPLICATION,
        ACTIONS.REVIEW_APPLICATION,
        ACTIONS.VIEW_ANALYTICS,
    ],
    [ROLES.USER]: [],
};

/**
 * Check if a role has permission for a given action
 * @param {string} role
 * @param {string} action
 * @returns {boolean}
 */
export function hasPermission(role, action) {
    const perms = PERMISSION_MAP[role];
    if (!perms) return false;
    return perms.includes(action);
}

/**
 * Check if a role is any admin role
 */
export function isAdminRole(role) {
    return ADMIN_ROLES.includes(role);
}

/**
 * Sidebar menu items filtered by role
 */
const ALL_MENU = [
    { to: '/admin', label: 'Dashboard', iconKey: 'LayoutDashboard', end: true, requiredAction: null },
    { to: '/admin/schemes', label: 'Schemes', iconKey: 'FileText', requiredAction: ACTIONS.ADD_SCHEME },
    { to: '/admin/users', label: 'Users', iconKey: 'Users', requiredAction: ACTIONS.VIEW_USERS },
    { to: '/admin/applications', label: 'Applications', iconKey: 'ClipboardList', requiredAction: ACTIONS.APPROVE_APPLICATION },
    { to: '/admin/notifications', label: 'Notifications', iconKey: 'Bell', requiredAction: ACTIONS.SEND_NOTIFICATIONS },
    { to: '/admin/analytics', label: 'Analytics', iconKey: 'BarChart3', requiredAction: ACTIONS.VIEW_ANALYTICS },
    { to: '/admin/roles', label: 'Role Management', iconKey: 'ShieldCheck', requiredAction: ACTIONS.MANAGE_ROLES },
    { to: '/admin/settings', label: 'Settings', iconKey: 'Settings', requiredAction: null },
];

/**
 * Get filtered menu items for a given role.
 * Items with no requiredAction are shown to all admins.
 */
export function getMenuItems(role) {
    return ALL_MENU.filter(item => {
        if (!item.requiredAction) return true;
        return hasPermission(role, item.requiredAction);
    });
}

/**
 * Get a human-readable role label
 */
export function getRoleLabel(role) {
    const labels = {
        [ROLES.SUPER_ADMIN]: 'Super Admin',
        [ROLES.CONTENT_ADMIN]: 'Content Admin',
        [ROLES.REVIEW_ADMIN]: 'Review Admin',
        [ROLES.USER]: 'User',
    };
    return labels[role] || role;
}

/**
 * Get role badge color class
 */
export function getRoleBadgeClass(role) {
    const classes = {
        [ROLES.SUPER_ADMIN]: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        [ROLES.CONTENT_ADMIN]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        [ROLES.REVIEW_ADMIN]: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        [ROLES.USER]: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    };
    return classes[role] || classes[ROLES.USER];
}
