import { useMemo, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { businessUnitStats, generateForecastData, mockARRecords, mockContractTerms } from '@/data/mockData';
import { BusinessUnit } from '@/types/cashflow';
import { Plane, Ship, Truck, BarChart3, TrendingUp, TrendingDown, AlertTriangle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const buConfig: Record<BusinessUnit, { icon: typeof Plane; colorClass: string; description: string }> = {
  Aviation: { icon: Plane, colorClass: 'text-aviation', description: 'High-frequency collections, stable volumes' },
  Marine: { icon: Ship, colorClass: 'text-marine', description: 'Lumpy receipts, larger transaction sizes' },
  Land: { icon: Truck, colorClass: 'text-land', description: 'Stable payment patterns, predictable cash flows' },
  Trading: { icon: BarChart3, colorClass: 'text-trading', description: 'Higher volatility, mark-to-market exposure' },
};

export default function BusinessUnits() {
  const [selectedBU, setSelectedBU] = useState<BusinessUnit>('Aviation');
  const forecastData = useMemo(() => generateForecastData(), []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  const buForecast = useMemo(() => {
    return forecastData.slice(0, 7).map((day) => ({
      date: day.date.toLocaleDateString('en-US', { weekday: 'short' }),
      inflows: (day.byBusinessUnit[selectedBU]?.inflows || 0) / 1000000,
      outflows: (day.byBusinessUnit[selectedBU]?.outflows || 0) / 1000000,
    }));
  }, [forecastData, selectedBU]);

  const contractMix = useMemo(() => {
    const buContracts = mockContractTerms.filter((c) => c.businessUnit === selectedBU);
    const spotCount = buContracts.filter((c) => c.contractType === 'Spot').length;
    const termCount = buContracts.filter((c) => c.contractType === 'Term').length;
    return [
      { name: 'Term', value: termCount, color: 'hsl(173, 80%, 40%)' },
      { name: 'Spot', value: spotCount, color: 'hsl(38, 92%, 50%)' },
    ];
  }, [selectedBU]);

  const stats = businessUnitStats[selectedBU];
  const config = buConfig[selectedBU];
  const Icon = config.icon;

  const buARRecords = mockARRecords.filter((r) => r.businessUnit === selectedBU);

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold gradient-text">Business Unit Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Detailed cash flow analysis by segment
          </p>
        </div>

        {/* BU Selector */}
        <div className="flex gap-3">
          {(Object.keys(businessUnitStats) as BusinessUnit[]).map((bu) => {
            const BUIcon = buConfig[bu].icon;
            const isSelected = bu === selectedBU;
            return (
              <button
                key={bu}
                onClick={() => setSelectedBU(bu)}
                className={cn(
                  'flex items-center gap-3 px-6 py-4 rounded-xl border transition-all duration-200',
                  isSelected
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                )}
              >
                <BUIcon className={cn('w-5 h-5', buConfig[bu].colorClass)} />
                <span className="font-medium">{bu}</span>
              </button>
            );
          })}
        </div>

        {/* Selected BU Overview */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className={cn('p-3 rounded-xl bg-accent', config.colorClass)}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{selectedBU}</h2>
              <p className="text-muted-foreground">{config.description}</p>
            </div>
          </div>

          {selectedBU === 'Trading' && (
            <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/30 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <span className="text-sm text-warning">Higher volatility expected - monitor daily positions</span>
            </div>
          )}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-4 gap-6">
          <MetricCard
            title="Total AR Outstanding"
            value={formatCurrency(stats.totalAR)}
            variant="inflow"
            icon={<TrendingUp className="w-5 h-5 text-success" />}
          />
          <MetricCard
            title="Total AP Outstanding"
            value={formatCurrency(stats.totalAP)}
            variant="outflow"
            icon={<TrendingDown className="w-5 h-5 text-destructive" />}
          />
          <MetricCard
            title="Net Exposure"
            value={formatCurrency(stats.exposure)}
            variant={stats.exposure >= 0 ? 'inflow' : 'outflow'}
          />
          <MetricCard
            title="Active Customers"
            value={buARRecords.length}
            subtitle="With open invoices"
            icon={<FileText className="w-5 h-5 text-primary" />}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-3 gap-6">
          {/* 7-Day Forecast */}
          <div className="col-span-2 bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-1">7-Day Cash Flow Forecast</h3>
            <p className="text-sm text-muted-foreground mb-6">Projected inflows and outflows</p>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={buForecast}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 20%)" />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(215, 20%, 55%)"
                    tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }}
                  />
                  <YAxis
                    stroke="hsl(215, 20%, 55%)"
                    tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }}
                    tickFormatter={(value) => `$${value}M`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(222, 47%, 11%)',
                      border: '1px solid hsl(222, 30%, 20%)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="inflows" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="outflows" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Contract Mix */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-1">Contract Mix</h3>
            <p className="text-sm text-muted-foreground mb-6">Spot vs Term exposure</p>

            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={contractMix}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {contractMix.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(222, 47%, 11%)',
                      border: '1px solid hsl(222, 30%, 20%)',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-center gap-6 mt-4">
              {contractMix.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-muted-foreground">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Customers Table */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-1">Top Customers by Outstanding Amount</h3>
          <p className="text-sm text-muted-foreground mb-6">{selectedBU} segment</p>

          <table className="data-table">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Invoice ID</th>
                <th>Due Date</th>
                <th>Currency</th>
                <th>Outstanding</th>
                <th>Aging</th>
              </tr>
            </thead>
            <tbody>
              {buARRecords
                .sort((a, b) => b.outstandingAmount - a.outstandingAmount)
                .slice(0, 5)
                .map((record) => (
                  <tr key={record.id}>
                    <td className="font-medium text-foreground">{record.customerId}</td>
                    <td className="text-muted-foreground">{record.invoiceId}</td>
                    <td className="text-muted-foreground">{record.dueDate.toLocaleDateString()}</td>
                    <td className="text-muted-foreground">{record.currency}</td>
                    <td className="text-success number-mono">{formatCurrency(record.outstandingAmount)}</td>
                    <td>
                      <span className={cn(
                        'px-2 py-1 rounded text-xs font-medium',
                        record.agingBucket === '0-30' && 'bg-success/20 text-success',
                        record.agingBucket === '31-60' && 'bg-warning/20 text-warning',
                        (record.agingBucket === '61-90' || record.agingBucket === '91-120' || record.agingBucket === '120+') && 'bg-destructive/20 text-destructive'
                      )}>
                        {record.agingBucket}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
