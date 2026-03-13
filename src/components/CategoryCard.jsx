import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { ArrowRight } from 'lucide-react';

const CategoryCard = ({ id, icon, nameKey, count, description }) => {
  const { t } = useTranslation();

  return (
    <Link to={`/category/${id}`} className="group block h-full">
      <Card className="h-full border-muted-foreground/10 shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary/50 overflow-hidden relative bg-gradient-to-br from-card to-muted/30">
        <CardContent className="p-6 flex flex-col items-center text-center gap-4 h-full relative z-10">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl mb-1 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300 shadow-inner">
            {icon}
          </div>

          <div className="space-y-2 flex-grow">
            <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
              {t(nameKey)}
            </h3>
            {description && (
              <p className="text-xs text-muted-foreground line-clamp-2 px-2">
                {description}
              </p>
            )}
            {count !== undefined && (
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground mt-2">
                {count} Services
              </div>
            )}
          </div>

          <div className="pt-2 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex items-center text-xs font-semibold text-primary">
            Browse Category <ArrowRight className="ml-1 h-3 w-3" />
          </div>
        </CardContent>

        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500" />
      </Card>
    </Link>
  );
};

export default CategoryCard;
