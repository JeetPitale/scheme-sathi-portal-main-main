import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-card border rounded-lg shadow-lg p-3 text-sm">
            <p className="font-semibold text-foreground mb-1">{label}</p>
            {payload.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.fill }} />
                    <span className="text-muted-foreground capitalize">{p.dataKey}:</span>
                    <span className="font-medium text-foreground">{p.value}</span>
                </div>
            ))}
        </div>
    );
};

const StateDistribution = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="rounded-xl border bg-card shadow-sm p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">State-wise Distribution</h3>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No state data available
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border bg-card shadow-sm p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">State-wise Distribution</h3>
            <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} />
                        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                        <YAxis type="category" dataKey="state" width={110} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="approved" name="Approved" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="rejected" name="Rejected" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="pending" name="Pending" stackId="a" fill="#eab308" radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default StateDistribution;
