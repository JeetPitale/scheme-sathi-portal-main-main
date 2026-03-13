import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
const Footer = () => {
    const { t } = useTranslation();
    return (<footer className="border-t bg-card mt-auto">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <span className="text-sm font-bold text-primary-foreground">स</span>
            </div>
            <span className="font-semibold text-foreground">{t('appName')}</span>
          </div>

          <nav className="flex flex-wrap justify-center gap-6 text-sm">
            <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
              {t('about')}
            </Link>
            <Link to="/help" className="text-muted-foreground hover:text-foreground transition-colors">
              {t('help')}
            </Link>
            <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
              {t('privacy')}
            </Link>
            <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
              {t('terms')}
            </Link>
          </nav>
        </div>

        <div className="mt-6 pt-6 border-t">
          <p className="text-xs text-center text-muted-foreground">
            {t('disclaimer')}
          </p>
        </div>
      </div>
    </footer>);
};
export default Footer;
