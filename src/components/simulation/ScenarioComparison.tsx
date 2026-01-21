import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, GitCompare } from "lucide-react";
import type { ScenarioResult } from "@/types/simulation";

interface ScenarioComparisonProps {
  scenarios: ScenarioResult[];
  selectedScenarios: string[];
  onSelectScenario: (id: string) => void;
  onDeleteScenario: (id: string) => void;
}

export function ScenarioComparison({
  scenarios,
  selectedScenarios,
  onSelectScenario,
  onDeleteScenario,
}: ScenarioComparisonProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <GitCompare className="h-5 w-5 text-primary" />
          Saved Scenarios
        </CardTitle>
      </CardHeader>
      <CardContent>
        {scenarios.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No saved scenarios yet.</p>
            <p className="text-sm mt-1">Run a simulation and save it to compare.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  selectedScenarios.includes(scenario.id!)
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => onSelectScenario(scenario.id!)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-foreground">{scenario.scenario_name}</h4>
                    <p className="text-xs text-muted-foreground">{scenario.scenario_date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getRiskBadgeVariant(scenario.liquidity_risk_level)}>
                      {scenario.liquidity_risk_level}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteScenario(scenario.id!);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Inflows</p>
                    <p className="font-semibold text-green-600">{formatCurrency(scenario.inflows)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Outflows</p>
                    <p className="font-semibold text-red-600">{formatCurrency(scenario.outflows)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Net Cash</p>
                    <p className={`font-semibold ${scenario.net_cash >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(scenario.net_cash)}
                    </p>
                  </div>
                </div>
                {scenario.simulation_params && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>Delay: {scenario.simulation_params.customerPaymentDelayDays}d</span>
                      <span>•</span>
                      <span>Efficiency: {scenario.simulation_params.collectionEfficiencyAdjustment}%</span>
                      <span>•</span>
                      <span>Oil: {scenario.simulation_params.oilPriceChange > 0 ? '+' : ''}{scenario.simulation_params.oilPriceChange}%</span>
                      <span>•</span>
                      <span>FX: {scenario.simulation_params.fxChange > 0 ? '+' : ''}{scenario.simulation_params.fxChange}%</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
