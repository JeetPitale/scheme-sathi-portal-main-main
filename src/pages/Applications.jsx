import { Link, Navigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Clock } from 'lucide-react';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout/Layout';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore, useApplicationStore } from '@/lib/store';
import { Skeleton } from '@/components/ui/skeleton';

const statusColors = {
  submitted: 'bg-blue-100 text-blue-700 border-blue-200',
  'in-review': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  approved: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
};

const statusLabels = {
  submitted: 'submitted',
  'in-review': 'inReview',
  approved: 'approved',
  rejected: 'rejected',
};

// Timeline component moved to ApplicationDetail.jsx

const Applications = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated, isAuthChecking } = useAuthStore();
  const { getApplicationsByUser, applications: storeApps, loaded } = useApplicationStore();

  const applications = useMemo(() => {
    if (!user) return [];
    return getApplicationsByUser(user.id);
  }, [user, getApplicationsByUser, storeApps]);

  if (isAuthChecking || (isAuthenticated && user && !loaded)) {
    return (
      <Layout>
        <div className="container py-6 md:py-10 space-y-6">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full roudned-xl" />)}
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <div className="container py-6 md:py-10">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-8">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2 mb-4">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {t('myApplications')}
            </h1>
            <p className="text-muted-foreground mt-1">
              Track the real-time status of your scheme applications.
            </p>
          </div>

          {applications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  You haven't submitted any applications yet.
                </p>
                <Link to="/services">
                  <Button>{t('exploreServices')}</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
              {applications.map((app) => (
                <Link key={app.id} to={`/applications/${app.id}`}>
                  <Card
                    className="cursor-pointer hover:shadow-md transition-all border-l-4"
                    style={{ borderLeftColor: app.status === 'approved' ? '#22c55e' : app.status === 'rejected' ? '#ef4444' : app.status === 'in-review' ? '#eab308' : '#3b82f6' }}
                  >
                    <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColors[app.status] || statusColors.submitted}`}>
                            {t(statusLabels[app.status] || 'submitted')}
                          </span>
                          <span className="text-xs text-muted-foreground">ID: {app.id}</span>
                        </div>
                        <h3 className="font-semibold text-lg text-foreground truncate">
                          {app.serviceName}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          Last updated: {new Date(app.lastUpdated || app.dateApplied).toLocaleDateString()}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground hidden sm:block" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8 p-4 bg-muted/50 rounded-lg text-xs text-muted-foreground text-center">
            <p>Disclaimer: Status information is for reference only. Final decisions are made by the concerned government department.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Applications;
