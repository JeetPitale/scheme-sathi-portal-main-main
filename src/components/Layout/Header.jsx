import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store';
import { useTranslation, languageNames } from '@/hooks/useTranslation';
import VoiceSearchInput from '@/components/VoiceSearchInput';
import ThemeToggle from '@/components/ThemeToggle';
import NotificationBell from '@/components/NotificationBell';
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const { t, language, setLanguage } = useTranslation();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setIsLangOpen(false);
  };
  return (<header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
    <div className="container flex h-16 items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
          <span className="text-xl font-bold text-primary-foreground">स</span>
        </div>
        <span className="text-xl font-bold text-foreground">{t('appName')}</span>
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-10">
        {isAuthenticated && (<>
          <Link to="/dashboard" id="dashboard-link" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
            {t('dashboard')}
          </Link>

          <Link to="/eligibility" id="eligibility-link" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
            {t('checkEligibility')}
          </Link>
          <Link to="/applications" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
            {t('myApplications')}
          </Link>
        </>)}
      </nav>

      {/* Global Search */}
      <div className="hidden md:block mr-4" id="voice-search-input">
        <VoiceSearchInput />
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Language Selector */}
        <div className="relative" id="language-selector">
          <Button variant="ghost" size="sm" onClick={() => setIsLangOpen(!isLangOpen)} className="gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">{languageNames[language]}</span>
          </Button>
          {isLangOpen && (<div className="absolute right-0 mt-2 w-48 rounded-lg bg-card/95 backdrop-blur border shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
            {Object.keys(languageNames).map((lang) => (<button key={lang} onClick={() => handleLanguageChange(lang)} className={`w-full px-4 py-2.5 text-sm text-left hover:bg-muted/50 transition-colors ${language === lang ? 'text-primary font-semibold bg-muted/30' : 'text-foreground'}`}>
              {languageNames[lang]}
            </button>))}
          </div>)}
        </div>

        {isAuthenticated ? (<>
          <NotificationBell />
          <Link to="/profile" className="hidden md:block">
            <Button variant="ghost" size="icon" className="hover:bg-muted/60">
              <User className="h-5 w-5" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="hidden md:flex hover:bg-destructive/10 hover:text-destructive">
            <LogOut className="h-5 w-5" />
          </Button>
        </>) : (<div className="hidden md:flex gap-4">
          <Link to="/login">
            <Button variant="outline" size="sm">{t('login')}</Button>
          </Link>
          <Link to="/register">
            <Button size="sm">{t('register')}</Button>
          </Link>
        </div>)}

        {/* Mobile Menu Button */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
    </div>

    {/* Mobile Menu */}
    {isMenuOpen && (<div className="md:hidden border-t bg-card">
      <nav className="container py-4 flex flex-col gap-2">
        {isAuthenticated ? (<>
          <div className="px-4 py-2 text-sm text-muted-foreground">
            {t('welcomeBack')}, {user?.fullName}
          </div>
          <Link to="/dashboard" className="px-4 py-3 rounded-lg hover:bg-muted transition-colors" onClick={() => setIsMenuOpen(false)}>
            {t('dashboard')}
          </Link>

          <Link to="/eligibility" className="px-4 py-3 rounded-lg hover:bg-muted transition-colors" onClick={() => setIsMenuOpen(false)}>
            {t('checkEligibility')}
          </Link>
          <Link to="/applications" className="px-4 py-3 rounded-lg hover:bg-muted transition-colors" onClick={() => setIsMenuOpen(false)}>
            {t('myApplications')}
          </Link>
          <Link to="/notifications" className="px-4 py-3 rounded-lg hover:bg-muted transition-colors" onClick={() => setIsMenuOpen(false)}>
            {t('notifications')}
          </Link>
          <Link to="/profile" className="px-4 py-3 rounded-lg hover:bg-muted transition-colors" onClick={() => setIsMenuOpen(false)}>
            {t('profile')}
          </Link>
          <button onClick={handleLogout} className="px-4 py-3 rounded-lg hover:bg-muted transition-colors text-left text-destructive">
            {t('logout')}
          </button>
        </>) : (<>
          <Link to="/login" className="px-4 py-3 rounded-lg hover:bg-muted transition-colors" onClick={() => setIsMenuOpen(false)}>
            {t('login')}
          </Link>
          <Link to="/register" className="px-4 py-3 rounded-lg hover:bg-muted transition-colors" onClick={() => setIsMenuOpen(false)}>
            {t('register')}
          </Link>
        </>)}
      </nav>
    </div>)}
  </header>);
};
export default Header;
