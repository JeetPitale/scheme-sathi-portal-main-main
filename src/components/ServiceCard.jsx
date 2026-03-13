import { Link } from 'react-router-dom';
import { ChevronRight, MapPin, IndianRupee } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';

const ServiceCard = ({ service }) => {
  const { t } = useTranslation();
  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardContent className="p-5">
        {/* Government Level & Category badges */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {service.governmentLevel && (
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${service.governmentLevel === 'Central'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
              }`}>
              {service.governmentLevel}
            </span>
          )}
          {service.isScheme && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
              {(service.category || 'general').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </span>
          )}
        </div>

        <h3 className="font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {service.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {service.description}
        </p>

        {/* Extra info for schemes */}
        {service.isScheme && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
            {service.incomeLimit && (
              <span className="flex items-center gap-1">
                <IndianRupee className="h-3 w-3" />
                {service.incomeLimit.replace(' per annum', '')}
              </span>
            )}
            {service.state && service.state !== 'central' && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {service.state.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^\w/, c => c.toUpperCase())}
              </span>
            )}
          </div>
        )}

        <Link to={`/schemes/${service.slug || service.id}`}>
          <Button variant="outline" size="sm" className="w-full gap-2">
            {t('viewDetails')}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
