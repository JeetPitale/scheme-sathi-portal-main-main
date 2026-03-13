import { useState, useRef, useEffect } from 'react';

export const useVoiceInput = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [confidence, setConfidence] = useState(0);
    const [error, setError] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [detectedLang, setDetectedLang] = useState('en-IN');

    const recognitionRef = useRef(null);
    const timeoutRef = useRef(null);

    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const startListening = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();

            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = detectedLang;

            recognition.onstart = () => {
                setIsListening(true);
                setError(null);
                setShowConfirm(false);
                setTranscript('');

                // Auto-stop after 8 seconds
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                timeoutRef.current = setTimeout(() => {
                    if (recognitionRef.current) recognitionRef.current.stop();
                }, 8000);
            };

            recognition.onresult = (event) => {
                const result = event.results[0][0];
                const text = result.transcript;
                const conf = result.confidence;

                setTranscript(text);
                setConfidence(conf);
                setIsListening(false);

                // Low confidence check (< 0.6)
                if (conf < 0.6) {
                    setShowConfirm(true);
                }
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setError(event.error);
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
            recognition.start();
        } else {
            setError("not_supported");
            alert("Voice input is not supported in this browser.");
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsListening(false);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    const reset = () => {
        setTranscript('');
        setShowConfirm(false);
        setError(null);
    };

    const changeLanguage = () => {
        const nextLang = detectedLang === 'en-IN' ? 'hi-IN' : detectedLang === 'hi-IN' ? 'gu-IN' : 'en-IN';
        setDetectedLang(nextLang);
        return nextLang;
    };

    return {
        isListening,
        transcript,
        confidence,
        error,
        showConfirm,
        setShowConfirm,
        detectedLang,
        startListening,
        stopListening,
        reset,
        changeLanguage,
        setTranscript // Allow manual edit updates
    };
};
