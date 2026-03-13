import { useState, useEffect } from 'react';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendHorizontal, Mic, MicOff } from 'lucide-react';

const ChatInput = ({ onSendMessage, disabled }) => {
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [detectedLang, setDetectedLang] = useState('en-IN');
    const [recognitionRef, setRecognitionRef] = useState(null);

    const startListening = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();

            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = detectedLang;

            recognition.onstart = () => {
                setIsListening(true);
                setShowConfirm(false);
                // Auto-stop after 8 seconds
                setTimeout(() => {
                    if (recognition) recognition.stop();
                }, 8000);
            };

            recognition.onresult = (event) => {
                const result = event.results[0][0];
                const transcript = result.transcript;
                const confidence = result.confidence;

                setInput(transcript);
                setIsListening(false);

                // Low confidence check (< 0.6)
                if (confidence < 0.6) {
                    setShowConfirm(true);
                }
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            setRecognitionRef(recognition);
            recognition.start();
        } else {
            alert("Voice input is not supported in this browser.");
        }
    };

    const stopListening = () => {
        if (recognitionRef) {
            recognitionRef.stop();
        }
        setIsListening(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim() && !disabled && !showConfirm) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="p-3 border-t bg-background flex gap-2 items-center rounded-b-2xl relative"
        >
            {isListening && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 w-full">
                    <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium animate-pulse shadow-md">
                        Listening... (Max 8s)
                    </div>
                    <span className="text-[10px] text-muted-foreground bg-background/80 px-2 rounded">
                        Voice used only for conversion
                    </span>
                </div>
            )}

            {showConfirm && (
                <div className="absolute -top-32 left-0 right-0 p-3 bg-card border rounded-lg shadow-lg z-10 mx-2 flex flex-col gap-2 animate-in slide-in-from-bottom-2">
                    <p className="text-sm font-medium">I detected <strong>{detectedLang === 'en-IN' ? 'English' : detectedLang === 'hi-IN' ? 'Hindi' : 'Gujarati'}</strong>. Is this correct?</p>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="default"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                                setShowConfirm(false);
                                // User confirmed, they can send now
                            }}
                        >
                            Yes, Keep
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                                // Cycle language for next try or manual edit
                                const nextLang = detectedLang === 'en-IN' ? 'hi-IN' : detectedLang === 'hi-IN' ? 'gu-IN' : 'en-IN';
                                setDetectedLang(nextLang);
                                setShowConfirm(false);
                                setInput(''); // Clear to retry
                                alert(`Language switched to ${nextLang === 'en-IN' ? 'English' : nextLang === 'hi-IN' ? 'Hindi' : 'Gujarati'}. Please try speaking again.`);
                            }}
                        >
                            Change Lang
                        </Button>
                    </div>
                </div>
            )}

            <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Listening..." : "Ask about schemes..."}
                className="flex-1 rounded-full border-muted-foreground/20 focus-visible:ring-primary/20 bg-muted/30 pr-10"
                disabled={disabled || showConfirm}
            />

            <div className="absolute right-16 top-1/2 -translate-y-1/2">
                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={isListening ? stopListening : startListening}
                    disabled={disabled || showConfirm}
                    className={`h-8 w-8 rounded-full hover:bg-transparent ${isListening ? 'text-destructive animate-pulse' : 'text-muted-foreground hover:text-primary'}`}
                    title="Voice Search (Privacy: Audio not stored)"
                >
                    {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    <span className="sr-only">{isListening ? "Stop listening" : "Start voice input"}</span>
                </Button>
            </div>

            <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || disabled || showConfirm}
                className="rounded-full h-10 w-10 shrink-0 shadow-sm"
            >
                <SendHorizontal className="h-5 w-5" />
                <span className="sr-only">Send</span>
            </Button>
        </form>
    );
};

export default ChatInput;
