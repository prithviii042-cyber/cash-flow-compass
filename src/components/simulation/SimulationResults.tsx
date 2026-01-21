import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle } from "lucide-react";

interface SimulationResultsProps {
  inflows: number;
  outflows: number;
  netCash: number;
  liquidityRiskLevel: string;
}

export function SimulationResults({
  inflows,
  outflows,
  netCash,
  liquidityRiskLevel,
}: SimulationResultsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Simulation Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Inflows */}
          <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">Total Inflows</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(inflows)}</p>
          </div>

          {/* Outflows */}
          <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-800 dark:text-red-200">Total Outflows</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(outflows)}</p>
          </div>

          {/* Net Cash */}
          <div className={`p-4 rounded-lg border ${
            netCash >= 0 
              ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800' 
              : 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className={`h-4 w-4 ${netCash >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
              <span className={`text-sm font-medium ${netCash >= 0 ? 'text-blue-800 dark:text-blue-200' : 'text-orange-800 dark:text-orange-200'}`}>
                Net Cash Position
              </span>
            </div>
            <p className={`text-2xl font-bold ${netCash >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              {formatCurrency(netCash)}
            </p>
          </div>

          {/* Liquidity Risk */}
          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Liquidity Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getRiskColor(liquidityRiskLevel)}`} />
              <span className="text-xl font-bold text-foreground">{liquidityRiskLevel}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
