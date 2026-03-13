
import { Button } from "@/components/ui/button";
import { Search, FileText, CheckCircle, HelpCircle, Star } from 'lucide-react';

const actions = [
    { label: "Find schemes", icon: Search, query: "Find schemes for me" },
    { label: "Check eligibility", icon: CheckCircle, query: "Check eligibility" },
    { label: "Documents", icon: FileText, query: "Required documents" },
    { label: "How to apply", icon: HelpCircle, query: "How to apply" },
    { label: "Popular", icon: Star, query: "Popular schemes" }
];

const QuickActions = ({ onActionClick }) => {
    return (
        <div className="flex flex-wrap gap-2 mt-4">
            {actions.map((action, index) => (
                <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => onActionClick(action.query)}
                    className="rounded-full bg-background hover:bg-primary/5 border-primary/20 text-xs px-3 h-8 shadow-sm transition-all"
                >
                    <action.icon className="h-3 w-3 mr-1.5 text-primary" />
                    {action.label}
                </Button>
            ))}
        </div>
    );
};

export default QuickActions;
