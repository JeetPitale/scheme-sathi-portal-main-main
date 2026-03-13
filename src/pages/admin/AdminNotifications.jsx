import { useState } from 'react';
import { Send, Bell } from 'lucide-react';
import AdminLayout from '@/components/Admin/AdminLayout';
import { useNotificationStore, useActivityLogStore } from '@/lib/store';
import { toast } from 'sonner';

const AdminNotifications = () => {
    const { notifications, addNotification } = useNotificationStore();
    const addLog = useActivityLogStore(s => s.addLog);

    const [form, setForm] = useState({ title: '', description: '', target: 'all' });

    const handleSend = (e) => {
        e.preventDefault();
        if (!form.title || !form.description) {
            toast.error('Title and description are required');
            return;
        }
        addNotification({
            title: form.title,
            description: form.description,
            target: form.target,
            type: 'announcement',
        });
        toast.success('Notification sent');
        addLog(`Notification sent: ${form.title}`);
        setForm({ title: '', description: '', target: 'all' });
    };

    return (
        <AdminLayout>
            <div className="admin-page">
                <h1 className="admin-page-title">Notifications</h1>

                {/* Send Notification Form */}
                <div className="admin-card mb-6">
                    <h2 className="admin-card-title">Send New Notification</h2>
                    <form onSubmit={handleSend} className="admin-form-grid">
                        <div className="admin-field">
                            <label>Title</label>
                            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                                className="admin-input" placeholder="Notification title" />
                        </div>
                        <div className="admin-field">
                            <label>Target Audience</label>
                            <select value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} className="admin-select">
                                <option value="all">All Users</option>
                                <option value="maharashtra">Maharashtra Users</option>
                                <option value="gujarat">Gujarat Users</option>
                                <option value="karnataka">Karnataka Users</option>
                            </select>
                        </div>
                        <div className="admin-field col-span-full">
                            <label>Description</label>
                            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                                className="admin-input" rows="3" placeholder="Notification message..." />
                        </div>
                        <div className="col-span-full">
                            <button type="submit" className="admin-btn admin-btn-primary">
                                <Send className="h-4 w-4" /> Send Notification
                            </button>
                        </div>
                    </form>
                </div>

                {/* History */}
                <div className="admin-card">
                    <h2 className="admin-card-title">Notification History ({notifications.length})</h2>
                    <div className="space-y-3">
                        {notifications.map(n => (
                            <div key={n.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <Bell className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm text-foreground">{n.title}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{n.description}</p>
                                    <div className="flex gap-3 mt-1">
                                        <span className="text-xs text-muted-foreground">Target: {n.target}</span>
                                        <span className="text-xs text-muted-foreground">{n.sentAt}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {notifications.length === 0 && (
                            <p className="text-center text-muted-foreground py-6">No notifications sent yet</p>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminNotifications;
