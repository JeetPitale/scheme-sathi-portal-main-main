import { Navigate, Link } from 'react-router-dom';
import { ArrowLeft, Bell, FileText, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Layout from '@/components/Layout/Layout';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore, useNotificationStore } from '@/lib/store';

const typeIcons = {
  scheme: <Bell className="h-5 w-5" />,
  status: <FileText className="h-5 w-5" />,
  announcement: <Megaphone className="h-5 w-5" />,
};
const typeColors = {
  scheme: 'bg-primary/20 text-primary',
  status: 'bg-accent/20 text-accent',
  announcement: 'bg-navy/20 text-navy',
};
const Notifications = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated, isAuthChecking } = useAuthStore();
  const { getNotificationsByUser, markAsRead } = useNotificationStore();

  if (isAuthChecking) {
    return <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  const userNotifications = getNotificationsByUser(user.id);
  const formatTimeAgo = (timestamp) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (days > 0)
      return `${days}d ago`;
    if (hours > 0)
      return `${hours}h ago`;
    if (minutes > 0)
      return `${minutes}m ago`;
    return 'Just now';
  };
  return (<Layout>
    <div className="container py-6 md:py-10 max-w-2xl">
      <div className="mb-8">
        <Link to="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {t('notifications')}
        </h1>
      </div>

      {userNotifications.length === 0 ? (<Card>
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Bell className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">{t('noNotifications')}</p>
        </CardContent>
      </Card>) : (<div className="space-y-3">
        {userNotifications.map((notification) => (<Card key={notification.id} className={`transition-all ${!notification.read ? 'border-primary/50 bg-primary/5' : ''}`}>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className={`p-2 rounded-lg ${typeColors[notification.type]} flex-shrink-0`}>
                {typeIcons[notification.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-foreground">
                    {notification.title}
                  </h3>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatTimeAgo(notification.sentAt || notification.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {notification.description || notification.message}
                </p>
                {!notification.read && (<Button variant="ghost" size="sm" className="mt-2 text-primary" onClick={() => markAsRead(notification.id)}>
                  {t('markAsRead')}
                </Button>)}
              </div>
            </div>
          </CardContent>
        </Card>))}
      </div>)}
    </div>
  </Layout>);
};
export default Notifications;
