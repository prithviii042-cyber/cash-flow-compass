import { useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { LiquidityIndicator } from '@/components/dashboard/LiquidityIndicator';
import { CashFlowChart } from '@/components/dashboard/CashFlowChart';
import { BusinessUnitBreakdown } from '@/components/dashboard/BusinessUnitBreakdown';
import { TopDelayedItems } from '@/components/dashboard/TopDelayedItems';
import { generateForecastData } from '@/data/mockData';
import { DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react';

export default function TreasuryDashboard() {
  const forecastData = useMemo(() => generateForecastData(), []);

  const totals = useMemo(() => {
    const next7Days = forecastData.slice(0, 7);
    const next14Days = forecastData;

    return {
      openingCash: 45000000,
      net7Days: next7Days.reduce((sum, day) => sum + day.netCash, 0),
      net14Days: next14Days.reduce((sum, day) => sum + day.netCash, 0),
      totalInflows14: next14Days.reduce((sum, day) => sum + day.totalInflows, 0),
      totalOutflows14: next14Days.reduce((sum, day) => sum + day.totalOutflows, 0),
    };
  }, [forecastData]);

  const formatCurrency = (value: number, compact = true) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: compact ? 'compact' : 'standard',
      maximumFractionDigits: 1,
    }).format(value);
  };

  const liquidityStatus = totals.net14Days > 10000000 ? 'Green' : totals.net14Days > 0 ? 'Amber' : 'Red';

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Treasury Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Cash flow forecasting for World Kinect Corporation
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-6">
          <MetricCard
            title="Opening Cash Position"
            value={formatCurrency(totals.openingCash)}
            subtitle="As of today"
            icon={<DollarSign className="w-5 h-5 text-primary" />}
          />
          <MetricCard
            title="Net Cash (7 Days)"
            value={formatCurrency(totals.net7Days)}
            trend={totals.net7Days >= 0 ? 'up' : 'down'}
            trendValue="+4.2%"
            variant={totals.net7Days >= 0 ? 'inflow' : 'outflow'}
            icon={<ArrowUpRight className="w-5 h-5 text-success" />}
          />
          <MetricCard
            title="Net Cash (14 Days)"
            value={formatCurrency(totals.net14Days)}
            trend={totals.net14Days >= 0 ? 'up' : 'down'}
            trendValue="+2.8%"
            variant={totals.net14Days >= 0 ? 'inflow' : 'outflow'}
            icon={<ArrowUpRight className="w-5 h-5 text-success" />}
          />
          <LiquidityIndicator
            status={liquidityStatus}
            netPosition={totals.net14Days}
            threshold={{ green: 20000000, amber: 5000000 }}
          />
        </div>

        {/* Inflow/Outflow Summary */}
        <div className="grid grid-cols-2 gap-6">
          <MetricCard
            title="Total Inflows (14 Days)"
            value={formatCurrency(totals.totalInflows14)}
            trend="up"
            trendValue="+12.5%"
            variant="inflow"
            icon={<TrendingUp className="w-5 h-5 text-success" />}
          />
          <MetricCard
            title="Total Outflows (14 Days)"
            value={formatCurrency(totals.totalOutflows14)}
            trend="down"
            trendValue="-3.2%"
            variant="outflow"
            icon={<TrendingDown className="w-5 h-5 text-destructive" />}
          />
        </div>

        {/* Cash Flow Chart */}
        <CashFlowChart data={forecastData} />

        {/* Business Unit & Delayed Items */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-1">
            <BusinessUnitBreakdown />
          </div>
          <div className="col-span-2">
            <TopDelayedItems />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
