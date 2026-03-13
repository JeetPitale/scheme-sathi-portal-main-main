import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0];
    return (
        <div className="bg-card border rounded-lg shadow-lg p-3 text-sm">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.payload.color }} />
                <span className="font-semibold text-foreground">{d.name}</span>
            </div>
            <p className="text-muted-foreground mt-1">{d.value} applications</p>
        </div>
    );
};

const renderLabel = ({ name, percent }) => {
    return `${name} ${(percent * 100).toFixed(0)}%`;
};

const StatusDistribution = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="rounded-xl border bg-card shadow-sm p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Status Distribution</h3>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No data available
                </div>
            </div>
        );
    }

    const total = data.reduce((s, d) => s + d.value, 0);

    return (
        <div className="rounded-xl border bg-card shadow-sm p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Status Distribution</h3>
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={100}
                            paddingAngle={3}
                            dataKey="value"
                            label={renderLabel}
                            labelLine={false}
                        >
                            {data.map((entry, i) => (
                                <Cell key={i} fill={entry.color} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-4">
                {data.map(d => (
                    <div key={d.name} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="text-muted-foreground">{d.name}: <span className="font-medium text-foreground">{d.value}</span></span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StatusDistribution;
