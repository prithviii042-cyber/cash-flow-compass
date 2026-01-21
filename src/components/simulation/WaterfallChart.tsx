import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import { TrendingUp } from "lucide-react";

interface WaterfallChartProps {
  baseInflows: number;
  baseOutflows: number;
  simulatedInflows: number;
  simulatedOutflows: number;
}

export function WaterfallChart({
  baseInflows,
  baseOutflows,
  simulatedInflows,
  simulatedOutflows,
}: WaterfallChartProps) {
  const baseNetCash = baseInflows - baseOutflows;
  const simulatedNetCash = simulatedInflows - simulatedOutflows;
  
  const inflowImpact = simulatedInflows - baseInflows;
  const outflowImpact = simulatedOutflows - baseOutflows;
  const netImpact = simulatedNetCash - baseNetCash;

  const data = [
    { name: 'Base Net Cash', value: baseNetCash, color: 'hsl(var(--primary))' },
    { name: 'Inflow Impact', value: inflowImpact, color: inflowImpact >= 0 ? '#22c55e' : '#ef4444' },
    { name: 'Outflow Impact', value: -outflowImpact, color: outflowImpact <= 0 ? '#22c55e' : '#ef4444' },
    { name: 'Simulated Net Cash', value: simulatedNetCash, color: simulatedNetCash >= 0 ? '#22c55e' : '#ef4444' },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Net Cash Impact Waterfall
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                tickFormatter={(value) => formatCurrency(value)}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), 'Amount']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <ReferenceLine y={0} stroke="hsl(var(--border))" />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-4 gap-4 mt-4 text-center">
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">Base</p>
            <p className="font-semibold text-foreground">{formatCurrency(baseNetCash)}</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">Inflow Δ</p>
            <p className={`font-semibold ${inflowImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {inflowImpact >= 0 ? '+' : ''}{formatCurrency(inflowImpact)}
            </p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">Outflow Δ</p>
            <p className={`font-semibold ${outflowImpact <= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {outflowImpact > 0 ? '+' : ''}{formatCurrency(outflowImpact)}
            </p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">Simulated</p>
            <p className={`font-semibold ${simulatedNetCash >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(simulatedNetCash)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
