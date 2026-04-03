import { useEffect } from 'react';
import { useParams, Navigate, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout/Layout';
import ServiceCard from '@/components/ServiceCard';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/lib/store';
import { serviceCategories } from '@/lib/services';
import { useSchemeStore } from '@/stores/schemeStore';

const Category = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const { searchResults, totalCount, filterSchemes, isLoading } = useSchemeStore();

  useEffect(() => {
    if (categoryId) {
      // Just fetching the first page for this category view
      filterSchemes({ category: categoryId }, 1);
    }
  }, [categoryId, filterSchemes]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const category = serviceCategories.find((c) => c.id === categoryId);

  if (!category) {
    return (
      <Layout>
        <div className="container py-6 md:py-10 text-center">
          <h2 className="text-3xl font-bold mb-4">Category Not Found</h2>
          <p className="text-muted-foreground mb-6">The category you are looking for does not exist or has been removed.</p>
          <Link to="/dashboard">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-6 md:py-10">
        <div className="mb-8">
          <Button variant="ghost" size="sm" className="gap-2 mb-4" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-4">
            <span className="text-4xl">{category.icon}</span>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {t(category.nameKey)}
              </h1>
              <p className="text-muted-foreground">
                {totalCount} schemes available
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((scheme) => (
                <ServiceCard key={scheme.id} service={scheme} />
              ))}
            </div>
            
            {totalCount > searchResults.length && (
              <div className="text-center mt-12">
                <Link to={`/services?category=${categoryId}`}>
                  <Button variant="outline" size="lg">
                    View All {totalCount} Schemes
                  </Button>
                </Link>
              </div>
            )}

            {searchResults.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No schemes found in this category</p>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Category;
