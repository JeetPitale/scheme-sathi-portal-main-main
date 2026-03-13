import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-card border rounded-lg shadow-lg p-3 text-sm">
            <p className="font-semibold text-foreground mb-1">{label}</p>
            {payload.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-muted-foreground capitalize">{p.dataKey}:</span>
                    <span className="font-medium text-foreground">{p.value}</span>
                </div>
            ))}
        </div>
    );
};

const ApplicationTrends = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="rounded-xl border bg-card shadow-sm p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Application Trends</h3>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No trend data available for selected filters
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border bg-card shadow-sm p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Application Trends</h3>
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="applications" name="Total" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="approved" name="Approved" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 5" />
                        <Line type="monotone" dataKey="rejected" name="Rejected" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 5" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ApplicationTrends;
