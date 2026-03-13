import Header from './Header';
import Footer from './Footer';
import Chatbot from '@/components/Chatbot/Chatbot';
import OfflineIndicator from '@/components/OfflineIndicator';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans antialiased">
      <OfflineIndicator />
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
};
export default Layout;
