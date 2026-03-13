import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, FileText, CheckCircle, Clock, XCircle, ChevronRight, LayoutDashboard } from 'lucide-react';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import Layout from '@/components/Layout/Layout';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore, useApplicationStore } from '@/lib/store';
import { useSchemeStore } from '@/stores/schemeStore';
import { calculateMetrics } from '@/lib/analytics';

const statusConfig = {
  submitted: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', label: 'submitted', icon: FileText },
  'in-review': { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'inReview', icon: Clock },
  verification: { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', label: 'verification', icon: Clock },
  approved: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', label: 'approved', icon: CheckCircle },
  completed: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', label: 'completed', icon: CheckCircle },
  rejected: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: 'rejected', icon: XCircle },
};

const Dashboard = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated, isAuthChecking } = useAuthStore();
  const { getApplicationsByUser } = useApplicationStore();
  const { schemes } = useSchemeStore();

  // --- Data Logic ---
  const { applications, metrics, recentApps } = useMemo(() => {
    if (!user?.id) return { applications: [], metrics: null, recentApps: [] };

    const userApps = getApplicationsByUser(user.id) || [];
    const sortedApps = [...userApps].sort((a, b) => new Date(b.dateApplied) - new Date(a.dateApplied));

    return {
      applications: sortedApps,
      metrics: calculateMetrics(sortedApps),
      recentApps: sortedApps.slice(0, 5) // Top 5
    };
  }, [user?.id, getApplicationsByUser]);

  const recommendedSchemes = useMemo(() => {
    return schemes.slice(0, 5); // Just showing first 5 as "Recommended" for now
  }, [schemes]);

  // --- Loading & Auth States ---
  if (isAuthChecking || (isAuthenticated && user && !applications)) {
    return (
      <Layout>
        <div className="container py-8 space-y-8">
          <Skeleton className="h-16 w-3/4 md:w-1/2" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 w-full" />)}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // --- Helpers ---
  const displayName = user.fullName || user.full_name || user.email?.split('@')[0] || 'User';
  const firstName = displayName.split(' ')[0];
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <Layout>
      <div className="container py-8 md:py-12 space-y-10 max-w-6xl">

        {/* SECTION 1: Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b">
          <div className="space-y-1">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {currentDate}
            </h2>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              {t('welcomeBack')}, {firstName} 👋
            </h1>
            <p className="text-muted-foreground max-w-xl">
              {t('dashboardOverview')}
            </p>
          </div>

          <Link to="/profile">
            <div className="flex items-center gap-3 p-2 pr-4 bg-muted/50 rounded-full hover:bg-muted transition-colors border border-transparent hover:border-border cursor-pointer">
              <Avatar className="h-10 w-10 border-2 border-background">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {firstName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm hidden sm:block">
                <p className="font-medium leading-none">{displayName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">View Profile</p>
              </div>
            </div>
          </Link>
        </div>

        {/* SECTION 2: Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <StatsCard
            title={t('totalApplications')}
            value={metrics?.total || 0}
            icon={LayoutDashboard}
            color="bg-blue-500/10 text-blue-600"
          />
          <StatsCard
            title={t('approved')}
            value={metrics?.approved || 0}
            icon={CheckCircle}
            color="bg-green-500/10 text-green-600"
          />
          <StatsCard
            title={t('pending')}
            value={(metrics?.pending || 0) + (metrics?.inReview || 0)}
            icon={Clock}
            color="bg-yellow-500/10 text-yellow-600"
          />
          <StatsCard
            title={t('rejected')}
            value={metrics?.rejected || 0}
            icon={XCircle}
            color="bg-red-500/10 text-red-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">

          {/* SECTION 3: Recent Applications (Main Column) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold tracking-tight">{t('recentApplications')}</h3>
              <Link to="/applications">
                <Button variant="ghost" size="sm" className="gap-1 text-primary">
                  {t('viewAll')} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <Card className="border-none shadow-sm bg-card/50">
              <CardContent className="p-0">
                {recentApps.length > 0 ? (
                  <div className="divide-y">
                    {recentApps.map((app) => {
                      const status = statusConfig[app.status] || statusConfig.submitted;
                      const StatusIcon = status.icon;

                      return (
                        <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-6 gap-4 hover:bg-muted/30 transition-colors">
                          <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-full ${status.color} mt-1`}>
                              <StatusIcon className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-base mb-1">{app.serviceName}</h4>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                <span>{t('appliedOn')} {new Date(app.dateApplied).toLocaleDateString()}</span>
                                <span className="hidden sm:inline">•</span>
                                <span>ID: {app.id}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pl-14 sm:pl-0">
                            <Badge variant="outline" className={`${status.color} border-transparent font-medium border`}>
                              {t(status.label)}
                            </Badge>
                            <Link to={`/applications/${app.id}`}>
                              <Button variant="outline" size="sm" className="h-8">{t('details')}</Button>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                    <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                      <FileText className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">{t('noApplicationsYet')}</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm">
                      {t('noApplicationsDesc')}
                    </p>
                    <Link to="/services">
                      <Button>{t('browseSchemes')}</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* SECTION 4: Recommended / Sidebar */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold tracking-tight">{t('recommended')}</h3>
              <Link to="/services">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {recommendedSchemes.map((scheme) => (
                <Link key={scheme.id} to={`/service/${scheme.id}`} className="block group">
                  <Card className="overflow-hidden hover:shadow-md transition-all duration-300 border-border/50 group-hover:border-primary/20">
                    <div className="h-2 w-full bg-gradient-to-r from-primary/20 to-primary/5 group-hover:from-primary/40 group-hover:to-primary/10 transition-all" />
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider">
                          {scheme.category === 'financial' ? 'Financial' : 'Social'}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <h4 className="font-semibold line-clamp-1 mb-1 group-hover:text-primary transition-colors">{scheme.name}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {scheme.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <span className="text-green-600 dark:text-green-400">{t('openForApplication')}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

// --- Subcomponents ---

const StatsCard = ({ title, value, icon: Icon, color }) => (
  <Card className="border-border/50 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
    <CardContent className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${color} transition-colors bg-opacity-10`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default Dashboard;
