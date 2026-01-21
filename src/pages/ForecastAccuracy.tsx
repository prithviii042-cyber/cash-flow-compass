import { useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { BusinessUnit } from '@/types/cashflow';
import { Target, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

// Mock accuracy data
const accuracyData = [
  { week: 'Week 1', forecast: 12.5, actual: 11.8, variance: 5.6 },
  { week: 'Week 2', forecast: 14.2, actual: 13.9, variance: 2.1 },
  { week: 'Week 3', forecast: 11.8, actual: 12.4, variance: -5.1 },
  { week: 'Week 4', forecast: 15.1, actual: 14.6, variance: 3.3 },
];

const buAccuracy: Record<BusinessUnit, { accuracy: number; trend: 'up' | 'down'; mape: number }> = {
  Aviation: { accuracy: 94.2, trend: 'up', mape: 3.8 },
  Marine: { accuracy: 88.5, trend: 'down', mape: 7.2 },
  Land: { accuracy: 96.8, trend: 'up', mape: 2.1 },
  Trading: { accuracy: 82.3, trend: 'down', mape: 11.4 },
};

const monthlyTrend = [
  { month: 'Sep', accuracy: 89 },
  { month: 'Oct', accuracy: 91 },
  { month: 'Nov', accuracy: 88 },
  { month: 'Dec', accuracy: 93 },
  { month: 'Jan', accuracy: 92 },
];

export default function ForecastAccuracy() {
  const overallAccuracy = useMemo(() => {
    const total = Object.values(buAccuracy).reduce((sum, bu) => sum + bu.accuracy, 0);
    return (total / Object.keys(buAccuracy).length).toFixed(1);
  }, []);

  const formatCurrency = (value: number) => {
    return `$${value.toFixed(1)}M`;
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold gradient-text">Forecast Accuracy</h1>
          <p className="text-muted-foreground mt-1">
            Compare forecasted vs actual cash flows and track prediction performance
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-6">
          <MetricCard
            title="Overall Accuracy"
            value={`${overallAccuracy}%`}
            trend="up"
            trendValue="+2.1%"
            icon={<Target className="w-5 h-5 text-primary" />}
          />
          <MetricCard
            title="Mean Absolute % Error"
            value="5.6%"
            subtitle="Lower is better"
            trend="down"
            trendValue="-0.8%"
            variant="inflow"
          />
          <MetricCard
            title="Best Performing"
            value="Land"
            subtitle="96.8% accuracy"
            icon={<CheckCircle className="w-5 h-5 text-success" />}
          />
          <MetricCard
            title="Needs Attention"
            value="Trading"
            subtitle="82.3% accuracy"
            icon={<AlertCircle className="w-5 h-5 text-warning" />}
            variant="warning"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-2 gap-6">
          {/* Forecast vs Actual */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-1">Forecast vs Actual</h3>
            <p className="text-sm text-muted-foreground mb-6">Weekly net cash comparison</p>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={accuracyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 20%)" />
                  <XAxis
                    dataKey="week"
                    stroke="hsl(215, 20%, 55%)"
                    tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }}
                  />
                  <YAxis
                    stroke="hsl(215, 20%, 55%)"
                    tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }}
                    tickFormatter={formatCurrency}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(222, 47%, 11%)',
                      border: '1px solid hsl(222, 30%, 20%)',
                      borderRadius: '8px',
                    }}
                    formatter={formatCurrency}
                  />
                  <Legend />
                  <Bar dataKey="forecast" name="Forecast" fill="hsl(173, 80%, 40%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual" name="Actual" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Accuracy Trend */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-1">Accuracy Trend</h3>
            <p className="text-sm text-muted-foreground mb-6">Monthly forecast accuracy %</p>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 20%)" />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(215, 20%, 55%)"
                    tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }}
                  />
                  <YAxis
                    domain={[80, 100]}
                    stroke="hsl(215, 20%, 55%)"
                    tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(222, 47%, 11%)',
                      border: '1px solid hsl(222, 30%, 20%)',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value}%`, 'Accuracy']}
                  />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    stroke="hsl(173, 80%, 40%)"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(173, 80%, 40%)', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Business Unit Accuracy Table */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-1">Accuracy by Business Unit</h3>
          <p className="text-sm text-muted-foreground mb-6">Detailed performance breakdown</p>

          <table className="data-table">
            <thead>
              <tr>
                <th>Business Unit</th>
                <th>Accuracy</th>
                <th>Trend</th>
                <th>MAPE</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(Object.keys(buAccuracy) as BusinessUnit[]).map((bu) => {
                const data = buAccuracy[bu];
                const isGood = data.accuracy >= 90;
                const isWarning = data.accuracy >= 80 && data.accuracy < 90;

                return (
                  <tr key={bu}>
                    <td className="font-medium text-foreground">{bu}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              isGood && 'bg-success',
                              isWarning && 'bg-warning',
                              !isGood && !isWarning && 'bg-destructive'
                            )}
                            style={{ width: `${data.accuracy}%` }}
                          />
                        </div>
                        <span className="number-mono text-foreground">{data.accuracy}%</span>
                      </div>
                    </td>
                    <td>
                      <div className={cn(
                        'flex items-center gap-1',
                        data.trend === 'up' ? 'text-success' : 'text-destructive'
                      )}>
                        <TrendingUp className={cn('w-4 h-4', data.trend === 'down' && 'rotate-180')} />
                        <span className="text-sm">{data.trend === 'up' ? 'Improving' : 'Declining'}</span>
                      </div>
                    </td>
                    <td className="number-mono text-muted-foreground">{data.mape}%</td>
                    <td>
                      {isGood && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-success/20 text-success text-xs">
                          <CheckCircle className="w-3 h-3" />
                          On Target
                        </span>
                      )}
                      {isWarning && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-warning/20 text-warning text-xs">
                          <AlertCircle className="w-3 h-3" />
                          Monitor
                        </span>
                      )}
                      {!isGood && !isWarning && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-destructive/20 text-destructive text-xs">
                          <AlertCircle className="w-3 h-3" />
                          Action Needed
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Variance Analysis */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-1">Variance Analysis</h3>
          <p className="text-sm text-muted-foreground mb-6">Weekly forecast variance breakdown</p>

          <div className="grid grid-cols-4 gap-4">
            {accuracyData.map((week) => (
              <div
                key={week.week}
                className="p-4 rounded-lg bg-accent/30 border border-border"
              >
                <p className="text-sm text-muted-foreground mb-2">{week.week}</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Forecast</span>
                    <span className="number-mono text-foreground">{formatCurrency(week.forecast)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Actual</span>
                    <span className="number-mono text-foreground">{formatCurrency(week.actual)}</span>
                  </div>
                  <div className="pt-2 border-t border-border flex justify-between">
                    <span className="text-sm text-muted-foreground">Variance</span>
                    <span className={cn(
                      'number-mono font-medium',
                      week.variance >= 0 ? 'text-success' : 'text-destructive'
                    )}>
                      {week.variance >= 0 ? '+' : ''}{week.variance.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
