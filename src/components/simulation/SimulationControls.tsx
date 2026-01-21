import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Save, RotateCcw } from "lucide-react";
import type { SimulationParams } from "@/types/simulation";
import { DEFAULT_SIMULATION_PARAMS } from "@/types/simulation";

interface SimulationControlsProps {
  params: SimulationParams;
  onChange: (params: SimulationParams) => void;
  onRunSimulation: () => void;
  onSaveScenario: (name: string) => void;
  isRunning: boolean;
}

export function SimulationControls({
  params,
  onChange,
  onRunSimulation,
  onSaveScenario,
  isRunning,
}: SimulationControlsProps) {
  const handleReset = () => {
    onChange(DEFAULT_SIMULATION_PARAMS);
  };

  const handleSave = () => {
    const name = prompt('Enter scenario name:');
    if (name) {
      onSaveScenario(name);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Play className="h-5 w-5 text-primary" />
          Simulation Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Customer Payment Delay */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium text-foreground">
              Customer Payment Delay
            </Label>
            <span className="text-sm font-semibold text-primary">
              {params.customerPaymentDelayDays} days
            </span>
          </div>
          <Slider
            value={[params.customerPaymentDelayDays]}
            onValueChange={([value]) => onChange({ ...params, customerPaymentDelayDays: value })}
            min={0}
            max={30}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0 days</span>
            <span>30 days</span>
          </div>
        </div>

        {/* Collection Efficiency */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium text-foreground">
              Collection Efficiency
            </Label>
            <span className="text-sm font-semibold text-primary">
              {params.collectionEfficiencyAdjustment}%
            </span>
          </div>
          <Slider
            value={[params.collectionEfficiencyAdjustment]}
            onValueChange={([value]) => onChange({ ...params, collectionEfficiencyAdjustment: value })}
            min={50}
            max={110}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>50% (Stress)</span>
            <span>110% (Optimistic)</span>
          </div>
        </div>

        {/* Oil Price Change */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium text-foreground">
              Oil Price Change
            </Label>
            <span className={`text-sm font-semibold ${params.oilPriceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {params.oilPriceChange >= 0 ? '+' : ''}{params.oilPriceChange}%
            </span>
          </div>
          <Slider
            value={[params.oilPriceChange]}
            onValueChange={([value]) => onChange({ ...params, oilPriceChange: value })}
            min={-30}
            max={30}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>-30%</span>
            <span>+30%</span>
          </div>
        </div>

        {/* FX Change */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium text-foreground">
              FX Rate Change
            </Label>
            <span className={`text-sm font-semibold ${params.fxChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {params.fxChange >= 0 ? '+' : ''}{params.fxChange}%
            </span>
          </div>
          <Slider
            value={[params.fxChange]}
            onValueChange={([value]) => onChange({ ...params, fxChange: value })}
            min={-10}
            max={10}
            step={0.5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>-10%</span>
            <span>+10%</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={onRunSimulation}
            disabled={isRunning}
            className="flex-1"
          >
            <Play className="h-4 w-4 mr-2" />
            {isRunning ? 'Running...' : 'Run Simulation'}
          </Button>
          <Button variant="outline" onClick={handleSave} disabled={isRunning}>
            <Save className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleReset} disabled={isRunning}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
