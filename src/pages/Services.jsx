import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Navigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import ServiceCard from '@/components/ServiceCard';
import CategoryCard from '@/components/CategoryCard';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/lib/store';
import { useSchemeStore, serviceCategories, states } from '@/stores/schemeStore';


const Services = () => {
  const { t } = useTranslation();
  const { isAuthenticated, isAuthChecking } = useAuthStore();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Pre-fill search from URL query param
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearchQuery(q);
  }, [searchParams]);

  const {
    schemes,
    searchResults,
    totalCount,
    currentPage: storePage,
    pageSize,
    loading,
    searchSchemes,
    filterSchemes,
    loadSchemes,
    setPage
  } = useSchemeStore();

  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  // Load schemes on mount — initial page 1
  useEffect(() => {
    loadSchemes();
    filterSchemes({}, 1);
  }, [loadSchemes, filterSchemes]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle Search and Filter logic with Pagination
  useEffect(() => {
    if (debouncedSearch) {
      searchSchemes(debouncedSearch, storePage);
    } else {
      filterSchemes({
        category: selectedCategory || undefined,
        state: selectedState || undefined,
      }, storePage);
    }
  }, [debouncedSearch, selectedCategory, selectedState, storePage, searchSchemes, filterSchemes]);

  const totalPages = Math.ceil(totalCount / pageSize);
  const paginatedServices = searchResults;

  // Compute counts per category for badges
  const categoryCounts = useMemo(() => {
    const counts = {};
    if (schemes && schemes.length > 0) {
      schemes.forEach((s) => {
        if (s.status === 'active' && s.category) {
          counts[s.category] = (counts[s.category] || 0) + 1;
        }
      });
    }
    return counts;
  }, [schemes]);

  // Reset page on any search query CHANGE (not page change)
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };
  const handleCategoryChange = (cat) => {
    const newCat = cat === selectedCategory ? '' : cat;
    setSelectedCategory(newCat);
    setPage(1);
    setSearchQuery('');
  };
  const handleStateChange = (e) => {
    setSelectedState(e.target.value);
    setPage(1);
  };

  const handlePageChange = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isAuthChecking) {
    return <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (<Layout>
    <div className="container py-6 md:py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{t('services')}</h1>
        <p className="text-muted-foreground">{t('browse')} {totalCount} {t('governmentSchemes')}</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
          <Filter className="h-4 w-4" />
          {t('filters')}
        </Button>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 border rounded-lg bg-muted/30">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">{t('state')}</label>
            <select
              value={selectedState}
              onChange={handleStateChange}
              className="w-full border rounded-md px-3 py-2 bg-background text-foreground text-sm"
            >
              <option value="">{t('allStates')}</option>
              {states.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">{t('category')}</label>
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); setSearchQuery(''); }}
              className="w-full border rounded-md px-3 py-2 bg-background text-foreground text-sm"
            >
              <option value="">{t('allCategories')}</option>
              {serviceCategories.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {t(c.nameKey)} ({categoryCounts[c.id] || 0})</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Category Cards Grid (only when no search/filter) */}
      {!searchQuery && !selectedCategory && !selectedState && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-foreground mb-4">{t('categories')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {serviceCategories.map((cat) => (
              <div key={cat.id} onClick={() => handleCategoryChange(cat.id)} className="cursor-pointer">
                <CategoryCard {...cat} count={categoryCounts[cat.id] || 0} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {t('showing')} {paginatedServices.length} {t('of')} {totalCount} {t('servicesText')}
          {selectedCategory && ` in ${selectedCategory.replace(/-/g, ' ')}`}
          {selectedState && ` for ${states.find(s => s.id === selectedState)?.name || selectedState}`}
        </p>
        {selectedCategory && (
          <Button variant="ghost" size="sm" onClick={() => { setSelectedCategory(''); setPage(1); }}>
            {t('clearFilter')}
          </Button>
        )}
      </div>

      {/* Service Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
          <p className="text-muted-foreground">{t('loading')}...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>

          {/* Empty State */}
          {paginatedServices.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg mb-2">{t('noServicesFound')}</p>
              <p className="text-sm text-muted-foreground">{t('tryAdjustingSearch')}</p>
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            disabled={storePage === 1}
            onClick={() => handlePageChange(storePage - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            let page;
            if (totalPages <= 7) {
              page = i + 1;
            } else if (storePage <= 4) {
              page = i + 1;
            } else if (storePage >= totalPages - 3) {
              page = totalPages - 6 + i;
            } else {
              page = storePage - 3 + i;
            }
            return (
              <Button
                key={page}
                variant={storePage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePageChange(page)}
                className="w-9"
              >
                {page}
              </Button>
            );
          })}
          <Button
            variant="outline"
            size="sm"
            disabled={storePage === totalPages}
            onClick={() => handlePageChange(storePage + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  </Layout>);
};

export default Services;
