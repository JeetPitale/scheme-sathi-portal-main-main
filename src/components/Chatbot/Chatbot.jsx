import { useState, useEffect, useRef } from 'react';
import { processMessage } from './logic';
import ChatTrigger from './ChatTrigger';
import ChatWindow from './ChatWindow';
import { Button } from "@/components/ui/button";

const Chatbot = () => {
    const INITIAL_MESSAGE = {
        id: 1,
        type: 'assistant',
        text: "Hi 👋\nI’m Scheme Sathi Assistant.\nI can help you find government schemes, check eligibility, and guide you through application steps.\n\n_Note: I provide guidance only. Please verify updates on official portals._",
        timestamp: new Date().toISOString()
    };

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([INITIAL_MESSAGE]);
    const [isTyping, setIsTyping] = useState(false);
    const [chatContext, setChatContext] = useState({});

    // Close chat when pressing Escape
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    const handleSendMessage = async (text) => {
        // Add user message
        const userMsg = {
            id: Date.now(),
            type: 'user',
            text: text,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMsg]);

        // Simulate assistant typing and response
        setIsTyping(true);

        try {
            const { response, newContext } = await processMessage(text, chatContext);
            setChatContext(newContext);

            const assistantMsg = {
                id: Date.now() + 1,
                type: 'assistant',
                text: response,
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, assistantMsg]);
        } catch (error) {
            console.error(error);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            <div className="pointer-events-auto">
                <ChatWindow
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isTyping={isTyping}
                />
            </div>
            <div className="mt-4 pointer-events-auto">
                <ChatTrigger
                    isOpen={isOpen}
                    onClick={() => {
                        if (isOpen) {
                            // Reset on close
                            setIsOpen(false);
                            setTimeout(() => {
                                setMessages([INITIAL_MESSAGE]);
                                setChatContext({});
                            }, 300); // Wait for animation
                        } else {
                            setIsOpen(true);
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default Chatbot;
