import { Clock, Zap, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const ProcessingTime = ({ data }) => {
    if (!data || data.count === 0) {
        return (
            <div className="rounded-xl border bg-card shadow-sm p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Processing Time Analysis</h3>
                <p className="text-sm text-muted-foreground">No resolved applications to analyze</p>
            </div>
        );
    }

    const stats = [
        { label: 'Average', value: `${data.average} days`, icon: Clock, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30' },
        { label: 'Fastest', value: `${data.fastest} days`, icon: Zap, color: 'text-green-600 bg-green-50 dark:bg-green-950/30' },
        { label: 'Slowest', value: `${data.slowest} days`, icon: AlertTriangle, color: 'text-red-600 bg-red-50 dark:bg-red-950/30' },
    ];

    return (
        <div className="rounded-xl border bg-card shadow-sm p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Processing Time Analysis</h3>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                {stats.map(s => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="text-center p-3 rounded-lg bg-muted/30">
                            <div className={`inline-flex p-2 rounded-lg ${s.color} mb-2`}>
                                <Icon className="h-4 w-4" />
                            </div>
                            <p className="text-lg font-bold text-foreground">{s.value}</p>
                            <p className="text-xs text-muted-foreground">{s.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Distribution chart */}
            {data.distribution && data.distribution.length > 0 && (
                <div className="h-[200px]">
                    <p className="text-sm text-muted-foreground mb-3">Distribution ({data.count} resolved)</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.distribution}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="range" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                                labelStyle={{ color: 'hsl(var(--foreground))' }}
                            />
                            <Bar dataKey="count" name="Applications" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

export default ProcessingTime;
