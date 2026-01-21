import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Building2 } from "lucide-react";

interface BusinessUnitData {
  inflows: number;
  outflows: number;
  netCash: number;
}

interface BusinessUnitSensitivityProps {
  byBusinessUnit: Record<string, BusinessUnitData>;
}

const SENSITIVITY_INFO = {
  aviation: { label: 'Aviation', oil: 'High', fx: 'Medium', color: '#3b82f6' },
  marine: { label: 'Marine', oil: 'Medium', fx: 'High', color: '#22c55e' },
  trading: { label: 'Trading', oil: 'Medium', fx: 'Medium', color: '#f59e0b' },
  land: { label: 'Land', oil: 'Low', fx: 'Low', color: '#8b5cf6' },
};

export function BusinessUnitSensitivity({ byBusinessUnit }: BusinessUnitSensitivityProps) {
  const data = Object.entries(byBusinessUnit).map(([bu, values]) => {
    const info = SENSITIVITY_INFO[bu as keyof typeof SENSITIVITY_INFO] || { 
      label: bu.charAt(0).toUpperCase() + bu.slice(1), 
      color: '#64748b' 
    };
    return {
      name: info.label,
      inflows: Math.round(values.inflows),
      outflows: Math.round(values.outflows),
      netCash: Math.round(values.netCash),
      color: info.color,
    };
  });

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
          <Building2 className="h-5 w-5 text-primary" />
          Business Unit Sensitivity
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
                formatter={(value: number, name: string) => [formatCurrency(value), name]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend />
              <Bar dataKey="inflows" name="Inflows" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="outflows" name="Outflows" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="netCash" name="Net Cash" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Sensitivity Legend */}
        <div className="mt-4 grid grid-cols-4 gap-2">
          {Object.entries(SENSITIVITY_INFO).map(([bu, info]) => (
            <div key={bu} className="p-3 bg-muted/50 rounded-lg text-center">
              <div 
                className="w-3 h-3 rounded-full mx-auto mb-1"
                style={{ backgroundColor: info.color }}
              />
              <p className="text-xs font-medium text-foreground">{info.label}</p>
              <p className="text-xs text-muted-foreground">Oil: {info.oil}</p>
              <p className="text-xs text-muted-foreground">FX: {info.fx}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
