import { CheckCircle, Clock, AlertCircle, CircleDot, FileText } from 'lucide-react';

/**
 * StatusTimeline — Vertical step indicator for application status history
 * @param {{ statusHistory: Array<{status, updatedBy, remark, date}> }} props
 */
const StatusTimeline = ({ statusHistory = [] }) => {
    if (!statusHistory || statusHistory.length === 0) {
        return <p className="text-sm text-muted-foreground">No status history available.</p>;
    }

    const getIcon = (status) => {
        switch (status) {
            case 'approved':
            case 'completed':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'rejected':
                return <AlertCircle className="h-5 w-5 text-red-500" />;
            case 'under_review':
                return <CircleDot className="h-5 w-5 text-blue-500" />;
            case 'pending':
                return <Clock className="h-5 w-5 text-yellow-500" />;
            default:
                return <FileText className="h-5 w-5 text-muted-foreground" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved':
            case 'completed':
                return 'border-green-500 bg-green-50 dark:bg-green-950/20';
            case 'rejected':
                return 'border-red-500 bg-red-50 dark:bg-red-950/20';
            case 'under_review':
                return 'border-blue-500 bg-blue-50 dark:bg-blue-950/20';
            case 'pending':
                return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20';
            default:
                return 'border-muted bg-muted/30';
        }
    };

    const getLineColor = (status) => {
        switch (status) {
            case 'approved':
            case 'completed':
                return 'bg-green-500';
            case 'rejected':
                return 'bg-red-500';
            case 'under_review':
                return 'bg-blue-500';
            default:
                return 'bg-muted-foreground/20';
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            pending: 'Pending',
            under_review: 'Under Review',
            approved: 'Approved',
            rejected: 'Rejected',
            completed: 'Completed',
        };
        return labels[status] || status;
    };

    return (
        <div className="relative pl-6">
            {statusHistory.map((entry, idx) => (
                <div key={idx} className="relative pb-6 last:pb-0">
                    {/* Vertical line */}
                    {idx < statusHistory.length - 1 && (
                        <div className={`absolute left-[-18px] top-6 w-0.5 h-full ${getLineColor(entry.status)}`} />
                    )}

                    {/* Icon dot */}
                    <div className="absolute left-[-26px] top-0.5 flex items-center justify-center h-6 w-6 rounded-full bg-background border-2 border-muted">
                        {getIcon(entry.status)}
                    </div>

                    {/* Content */}
                    <div className={`ml-2 p-3 rounded-lg border-l-4 ${getStatusColor(entry.status)}`}>
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="font-medium text-sm text-foreground">
                                {getStatusLabel(entry.status)}
                            </span>
                            {entry.date && (
                                <span className="text-xs text-muted-foreground">
                                    {new Date(entry.date).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </span>
                            )}
                        </div>
                        {entry.remark && (
                            <p className="text-sm text-muted-foreground mt-1">{entry.remark}</p>
                        )}
                        {entry.updatedBy && entry.updatedBy !== 'system' && (
                            <p className="text-xs text-muted-foreground/70 mt-1">
                                By: {entry.updatedBy}
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StatusTimeline;
