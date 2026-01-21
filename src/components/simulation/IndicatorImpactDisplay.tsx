import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";

interface IndicatorImpact {
  oilPriceMultiplier: number;
  fxMultiplier: number;
  paymentDelayDays: number;
  collectionRateAdjustment: number;
  macroMultiplier: number;
}

interface IndicatorImpactDisplayProps {
  impact: IndicatorImpact;
}

export function IndicatorImpactDisplay({ impact }: IndicatorImpactDisplayProps) {
  const formatMultiplier = (value: number) => {
    const percent = (value - 1) * 100;
    if (Math.abs(percent) < 0.1) return '0%';
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(1)}%`;
  };

  const getImpactIcon = (value: number, inverse = false) => {
    const threshold = inverse ? 1 : 1;
    if (Math.abs(value - 1) < 0.001) return <Minus className="h-4 w-4 text-muted-foreground" />;
    if (inverse) {
      return value > threshold 
        ? <TrendingDown className="h-4 w-4 text-destructive" />
        : <TrendingUp className="h-4 w-4 text-green-600" />;
    }
    return value > threshold 
      ? <TrendingUp className="h-4 w-4 text-green-600" />
      : <TrendingDown className="h-4 w-4 text-destructive" />;
  };

  const getImpactColor = (value: number, inverse = false) => {
    if (Math.abs(value - 1) < 0.001) return 'text-muted-foreground';
    if (inverse) {
      return value > 1 ? 'text-destructive' : 'text-green-600';
    }
    return value > 1 ? 'text-green-600' : 'text-destructive';
  };

  const impacts = [
    {
      label: 'Oil Price Effect',
      value: impact.oilPriceMultiplier,
      display: formatMultiplier(impact.oilPriceMultiplier),
      inverse: true, // Higher oil = higher costs = negative
      description: 'Impact on fuel-related costs',
    },
    {
      label: 'FX Rate Effect',
      value: impact.fxMultiplier,
      display: formatMultiplier(impact.fxMultiplier),
      inverse: false,
      description: 'Currency conversion impact',
    },
    {
      label: 'Payment Delay',
      value: impact.paymentDelayDays,
      display: `${impact.paymentDelayDays >= 0 ? '+' : ''}${impact.paymentDelayDays} days`,
      isDelay: true,
      description: 'Additional collection delay',
    },
    {
      label: 'Collection Boost',
      value: 1 + impact.collectionRateAdjustment / 100,
      display: `${impact.collectionRateAdjustment >= 0 ? '+' : ''}${impact.collectionRateAdjustment}%`,
      inverse: false,
      description: 'Collection probability adjustment',
    },
    {
      label: 'Macro Confidence',
      value: impact.macroMultiplier,
      display: formatMultiplier(impact.macroMultiplier),
      inverse: false,
      description: 'Economic conditions effect',
    },
  ];

  const hasAnyImpact = impacts.some(i => 
    i.isDelay ? i.value !== 0 : Math.abs(i.value - 1) > 0.001
  );

  if (!hasAnyImpact) {
    return null;
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          External Indicator Effects
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {impacts.map((item) => {
            const isActive = item.isDelay ? item.value !== 0 : Math.abs(item.value - 1) > 0.001;
            if (!isActive) return null;
            
            return (
              <div 
                key={item.label}
                className="p-3 bg-muted/50 rounded-lg text-center"
              >
                <div className="flex items-center justify-center gap-1 mb-1">
                  {item.isDelay ? (
                    item.value > 0 
                      ? <TrendingDown className="h-4 w-4 text-destructive" />
                      : <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    getImpactIcon(item.value, item.inverse)
                  )}
                  <span className={`text-sm font-semibold ${
                    item.isDelay 
                      ? (item.value > 0 ? 'text-destructive' : 'text-green-600')
                      : getImpactColor(item.value, item.inverse)
                  }`}>
                    {item.display}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Based on scenario adjustments configured in external indicators
        </p>
      </CardContent>
    </Card>
  );
}
