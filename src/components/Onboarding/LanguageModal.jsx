import { useOnboarding } from './OnboardingProvider';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

const LanguageModal = () => {
    const { conversationalModalOpen, startTour } = useOnboarding();

    if (!conversationalModalOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-card p-8 rounded-xl shadow-2xl border animate-in fade-in zoom-in duration-300">
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Globe className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Welcome to Scheme Sathi</h2>
                    <p className="text-muted-foreground">Please select your preferred language to get started.</p>
                </div>

                <div className="space-y-3">
                    <Button
                        onClick={() => startTour('en')}
                        className="w-full h-12 text-lg"
                        variant="outline"
                    >
                        🇬🇧 English
                    </Button>
                    <Button
                        onClick={() => startTour('hi')}
                        className="w-full h-12 text-lg font-hindi"
                        variant="outline"
                    >
                        🇮🇳 हिंदी
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default LanguageModal;
