import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

const OfflineIndicator = () => {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isOffline) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-yellow-500/90 text-yellow-950 px-4 py-2 text-center text-sm font-medium z-[100] backdrop-blur-sm flex items-center justify-center gap-2 animate-in slide-in-from-bottom">
            <WifiOff className="h-4 w-4" />
            <span>You are offline. Showing saved content.</span>
        </div>
    );
};

export default OfflineIndicator;
