import { Link } from 'react-router-dom';
import { Search, Shield, Languages, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Layout from '@/components/Layout/Layout';
import { useTranslation } from '@/hooks/useTranslation';
import LiveCounter from '@/components/LiveCounter';
import HeroSearch from '@/components/HeroSearch';
import { useAuthStore } from '@/lib/store';
const features = [
  {
    icon: Search,
    titleKey: 'smartDiscovery',
    descKey: 'smartDiscoveryDesc',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: Shield,
    titleKey: 'centralState',
    descKey: 'centralStateDesc',
    color: 'text-navy',
    bgColor: 'bg-navy/10',
  },
  {
    icon: Zap,
    titleKey: 'secureLogin',
    descKey: 'secureLoginDesc',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
  },
  {
    icon: Languages,
    titleKey: 'multiLanguage',
    descKey: 'multiLanguageDesc',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
];
const Index = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  return (<Layout>
    {/* Hero Section */}
    <section className="gradient-hero py-16 md:py-24">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <span>🇮🇳</span>
            <span>{t('digitalIndiaInitiative')}</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-primary mb-6 leading-tight">
            {t('heroTitle')}
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('heroSubtitle')}
          </p>

          {/* Hero Search Bar */}
          <div className="mb-8">
            <HeroSearch />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (<Link to="/dashboard">
              <Button variant="hero" size="lg" className="w-full sm:w-auto">
                {t('dashboard')}
              </Button>
            </Link>) : (<>
              <Link to="/register">
                <Button variant="hero" size="lg" className="w-full sm:w-auto">
                  {t('getStarted')}
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  {t('login')}
                </Button>
              </Link>
            </>)}
          </div>

          {/* Live Stats Counter */}
          <div className="mt-12 md:mt-16">
            <LiveCounter />
          </div>
        </div>
      </div>
    </section>

    {/* Features Section */}
    <section className="py-16 md:py-20">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            {t('whyChoose')}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {t('trustedCompanion')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (<Card key={feature.titleKey} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
            <CardContent className="p-6 text-center">
              <div className={`inline-flex p-3 rounded-xl ${feature.bgColor} mb-4`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                {t(feature.titleKey)}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t(feature.descKey)}
              </p>
            </CardContent>
          </Card>))}
        </div>
      </div>
    </section>

    {/* CTA Section */}
    <section className="py-16 bg-muted">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            {t('readyToSimplify')}
          </h2>
          <p className="text-muted-foreground mb-8">
            {t('joinLakhs')}
          </p>
          {!isAuthenticated && (<Link to="/register">
            <Button variant="hero" size="lg">
              {t('getStarted')} →
            </Button>
          </Link>)}
        </div>
      </div>
    </section>
  </Layout>);
};
export default Index;
