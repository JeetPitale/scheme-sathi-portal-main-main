import { Users, FileCheck, TrendingUp, Clock, Award, AlertTriangle, BarChart3, UserCheck } from 'lucide-react';

const iconMap = {
    totalUsers: Users,
    activeUsers: UserCheck,
    totalApplications: FileCheck,
    approvalRate: TrendingUp,
    rejectionRate: AlertTriangle,
    pendingApplications: Clock,
    mostAppliedScheme: Award,
    avgProcessingDays: BarChart3,
};

const cards = [
    { key: 'totalUsers', label: 'Total Users', format: v => v, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30' },
    { key: 'activeUsers', label: 'Active Users', format: v => v, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' },
    { key: 'totalApplications', label: 'Total Applications', format: v => v, color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/30' },
    { key: 'approvalRate', label: 'Approval Rate', format: v => `${v}%`, color: 'text-green-600 bg-green-50 dark:bg-green-950/30' },
    { key: 'rejectionRate', label: 'Rejection Rate', format: v => `${v}%`, color: 'text-red-600 bg-red-50 dark:bg-red-950/30' },
    { key: 'pendingApplications', label: 'Pending Apps', format: v => v, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30' },
    { key: 'mostAppliedScheme', label: 'Most Applied Scheme', format: v => v?.name || '—', color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30' },
    { key: 'avgProcessingDays', label: 'Avg Processing', format: v => `${v} days`, color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/30' },
];

const KpiCards = ({ data }) => {
    if (!data) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map(card => {
                const Icon = iconMap[card.key];
                const value = data[card.key];
                return (
                    <div key={card.key} className="rounded-xl border bg-card shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
                        <div className={`p-3 rounded-lg ${card.color}`}>
                            <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm text-muted-foreground font-medium">{card.label}</p>
                            <p className="text-2xl font-bold text-foreground mt-1 truncate">
                                {card.format(value)}
                            </p>
                            {card.key === 'mostAppliedScheme' && value?.count && (
                                <p className="text-xs text-muted-foreground mt-0.5">{value.count} applications</p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default KpiCards;
