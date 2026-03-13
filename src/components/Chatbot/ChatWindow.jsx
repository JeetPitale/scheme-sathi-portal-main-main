import { useEffect, useRef } from 'react';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import QuickActions from './QuickActions';
import { cn } from "@/lib/utils";

const ChatWindow = ({ isOpen, onClose, messages, onSendMessage, isTyping }) => {
    const scrollRef = useRef(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping, isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className={cn(
                "fixed bottom-[90px] right-6 z-50 flex flex-col bg-background border shadow-2xl transition-all duration-300 ease-in-out",
                "w-[380px] h-[600px] max-h-[80vh] rounded-2xl overflow-hidden",
                "animate-in slide-in-from-bottom-5 fade-in-0"
            )}
            style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
        >
            <ChatHeader onClose={onClose} />

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
            >
                {messages.map((msg) => (
                    <ChatMessage
                        key={msg.id}
                        type={msg.type}
                        text={msg.text}
                        timestamp={msg.timestamp}
                    />
                ))}

                {isTyping && (
                    <div className="flex w-full gap-2 mb-4 justify-start">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                            {/* Bot Icon or just placeholder */}
                            <div className="h-4 w-4 rounded-full bg-primary/40 animate-pulse" />
                        </div>
                        <div className="bg-muted p-3 rounded-2xl rounded-bl-none text-sm items-center flex gap-1 h-10">
                            <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                )}

                {/* Show Quick Actions if only the Welcome message is present, or maybe always at the bottom? 
            Let's show them if there are less than 3 messages to keep it clean, or just after the first one. 
            For now, I'll show them if the last message is from the assistant and it's the first message.
        */}
                {messages.length === 1 && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
                        <QuickActions onActionClick={onSendMessage} />
                    </div>
                )}
            </div>

            <ChatInput onSendMessage={onSendMessage} disabled={isTyping} />
        </div>
    );
};

export default ChatWindow;
