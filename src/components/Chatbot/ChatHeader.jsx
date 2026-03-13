
import { X, Bot } from 'lucide-react';
import { Button } from "@/components/ui/button";

const ChatHeader = ({ onClose }) => {
    return (
        <div className="flex items-center justify-between p-4 border-b bg-primary/5 rounded-t-2xl">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Bot className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h3 className="font-semibold text-sm text-foreground">Scheme Sathi Assistant</h3>
                    <p className="text-xs text-muted-foreground">Government Scheme Help</p>
                </div>
            </div>
            <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-full hover:bg-background/80"
            >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
            </Button>
        </div>
    );
};

export default ChatHeader;
