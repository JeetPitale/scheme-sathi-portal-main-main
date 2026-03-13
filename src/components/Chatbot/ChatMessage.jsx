
import { cn } from "@/lib/utils";
import { Bot, User } from 'lucide-react';

const ChatMessage = ({ type, text, timestamp }) => {
    const isUser = type === 'user';

    return (
        <div className={cn("flex w-full gap-2 mb-4", isUser ? "justify-end" : "justify-start")}>
            {!isUser && (
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Bot className="h-5 w-5 text-primary" />
                </div>
            )}

            <div className={cn(
                "max-w-[80%] p-3 rounded-2xl text-sm shadow-sm",
                isUser
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-muted text-foreground rounded-bl-none border border-border"
            )}>
                <p className="whitespace-pre-wrap leading-relaxed">{text}</p>
                <span className="text-[10px] opacity-70 block text-right mt-1">
                    {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>

            {isUser && (
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-secondary flex items-center justify-center border border-border">
                    <User className="h-5 w-5 text-secondary-foreground" />
                </div>
            )}
        </div>
    );
};

export default ChatMessage;
