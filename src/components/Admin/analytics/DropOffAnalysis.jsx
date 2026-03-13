import { UserMinus, Users, UserCheck } from 'lucide-react';

const DropOffAnalysis = ({ data }) => {
    if (!data) return null;

    const { totalRegistered, usersWithApplications, usersWithoutApplications, dropOffRate } = data;

    // Color based on drop-off severity
    const rateColor = dropOffRate > 60 ? 'text-red-600' : dropOffRate > 30 ? 'text-amber-600' : 'text-green-600';
    const barColor = dropOffRate > 60 ? 'bg-red-500' : dropOffRate > 30 ? 'bg-amber-500' : 'bg-green-500';

    return (
        <div className="rounded-xl border bg-card shadow-sm p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Drop-off Analysis</h3>

            {/* Main metric */}
            <div className="text-center mb-6">
                <p className={`text-5xl font-bold ${rateColor}`}>{dropOffRate}%</p>
                <p className="text-sm text-muted-foreground mt-1">User Drop-off Rate</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                    Users who registered but never applied
                </p>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-muted rounded-full h-3 mb-6 overflow-hidden">
                <div className={`h-full rounded-full ${barColor} transition-all duration-700`} style={{ width: `${dropOffRate}%` }} />
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-lg bg-muted/30">
                    <Users className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                    <p className="text-lg font-bold text-foreground">{totalRegistered}</p>
                    <p className="text-xs text-muted-foreground">Registered</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                    <UserCheck className="h-5 w-5 mx-auto mb-1 text-green-600" />
                    <p className="text-lg font-bold text-foreground">{usersWithApplications}</p>
                    <p className="text-xs text-muted-foreground">Applied</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                    <UserMinus className="h-5 w-5 mx-auto mb-1 text-red-600" />
                    <p className="text-lg font-bold text-foreground">{usersWithoutApplications}</p>
                    <p className="text-xs text-muted-foreground">Dropped Off</p>
                </div>
            </div>
        </div>
    );
};

export default DropOffAnalysis;
