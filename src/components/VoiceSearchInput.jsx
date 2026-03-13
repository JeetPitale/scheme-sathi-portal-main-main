import { useState, useEffect } from 'react';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Mic, MicOff, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VoiceSearchInput = ({ className, placeholder = "Search schemes..." }) => {
    const {
        isListening,
        transcript,
        confidence,
        showConfirm,
        setShowConfirm,
        detectedLang,
        startListening,
        stopListening,
        changeLanguage,
        setTranscript
    } = useVoiceInput();

    const [input, setInput] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (transcript) setInput(transcript);
    }, [transcript]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (input.trim() && !showConfirm) {
            // Navigate to schemes page with query
            navigate(`/services?q=${encodeURIComponent(input.trim())}`);
            // Since we don't have a real backend search yet, this demonstrates the intent
            console.log("Searching for:", input);
        }
    };

    return (
        <div className={`relative ${className}`}>
            <form onSubmit={handleSearch} className="relative flex items-center">
                <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                <Input
                    value={input}
                    onChange={(e) => {
                        setInput(e.target.value);
                        setTranscript(e.target.value);
                    }}
                    placeholder={isListening ? "Listening..." : placeholder}
                    className="pl-9 pr-12 rounded-full bg-muted/50 focus-visible:ring-primary/20 transition-all hover:bg-muted/80 w-[200px] sm:w-[300px]"
                    disabled={showConfirm}
                />

                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {showConfirm ? (
                        <div className="absolute top-12 right-0 bg-card border p-3 rounded-lg shadow-xl z-50 w-64 animate-in slide-in-from-top-2">
                            <p className="text-xs font-medium mb-2">Detected <strong>{detectedLang}</strong>. Correct?</p>
                            <div className="flex gap-2">
                                <Button size="sm" variant="default" className="h-7 text-xs flex-1" onClick={() => setShowConfirm(false)}>Yes</Button>
                                <Button size="sm" variant="outline" className="h-7 text-xs flex-1" onClick={() => changeLanguage()}>Change</Button>
                            </div>
                        </div>
                    ) : null}

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 rounded-full ${isListening ? 'text-destructive animate-pulse' : 'text-muted-foreground hover:text-primary'}`}
                        onClick={isListening ? stopListening : startListening}
                        title="Voice Search"
                    >
                        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                </div>
            </form>

            {isListening && (
                <div className="absolute top-12 left-0 right-0 text-center">
                    <span className="text-[10px] bg-primary/90 text-primary-foreground px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                        Listening...
                    </span>
                </div>
            )}
        </div>
    );
};

export default VoiceSearchInput;
