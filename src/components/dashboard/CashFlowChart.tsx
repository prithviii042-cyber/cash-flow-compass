import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { DailyCashForecast } from '@/types/cashflow';
import { format } from 'date-fns';

interface CashFlowChartProps {
  data: DailyCashForecast[];
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  const chartData = useMemo(() => {
    return data.map((item) => ({
      date: format(item.date, 'MMM dd'),
      inflows: item.totalInflows / 1000000,
      outflows: item.totalOutflows / 1000000,
      netCash: item.netCash / 1000000,
    }));
  }, [data]);

  const formatTooltipValue = (value: number) => `$${value.toFixed(2)}M`;

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">14-Day Cash Flow Forecast</h3>
          <p className="text-sm text-muted-foreground">Daily projected inflows, outflows, and net position</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-sm text-muted-foreground">Inflows</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span className="text-sm text-muted-foreground">Outflows</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">Net Cash</span>
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="inflowGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="outflowGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 20%)" />
            <XAxis
              dataKey="date"
              stroke="hsl(215, 20%, 55%)"
              tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(222, 30%, 20%)' }}
            />
            <YAxis
              stroke="hsl(215, 20%, 55%)"
              tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(222, 30%, 20%)' }}
              tickFormatter={(value) => `$${value}M`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(222, 47%, 11%)',
                border: '1px solid hsl(222, 30%, 20%)',
                borderRadius: '8px',
                padding: '12px',
              }}
              labelStyle={{ color: 'hsl(210, 40%, 96%)' }}
              formatter={formatTooltipValue}
            />
            <ReferenceLine y={0} stroke="hsl(222, 30%, 30%)" strokeDasharray="3 3" />
            <Area
              type="monotone"
              dataKey="inflows"
              stroke="hsl(160, 84%, 39%)"
              fill="url(#inflowGradient)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="outflows"
              stroke="hsl(0, 72%, 51%)"
              fill="url(#outflowGradient)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="netCash"
              stroke="hsl(173, 80%, 40%)"
              fill="none"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
