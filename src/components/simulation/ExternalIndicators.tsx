import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, TrendingUp, DollarSign, Fuel, Globe } from "lucide-react";
import type { ExternalIndicator } from "@/types/simulation";
import { format } from "date-fns";

interface ExternalIndicatorsProps {
  indicators: ExternalIndicator[];
  onAdd: (indicator: Omit<ExternalIndicator, 'id'>) => void;
  onDelete: (id: string) => void;
  isTreasury: boolean;
}

const INDICATOR_TYPE_CONFIG = {
  payment: { label: 'Payment', icon: TrendingUp, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  oil: { label: 'Oil', icon: Fuel, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  fx: { label: 'FX', icon: DollarSign, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  macro: { label: 'Macro', icon: Globe, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
};

export function ExternalIndicators({ indicators, onAdd, onDelete, isTreasury }: ExternalIndicatorsProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    indicator_name: '',
    indicator_type: 'oil' as 'payment' | 'oil' | 'fx' | 'macro',
    base_value: '',
    scenario_adjustment: '0',
    effective_date: format(new Date(), 'yyyy-MM-dd'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.indicator_name || !formData.base_value) return;
    
    onAdd({
      indicator_name: formData.indicator_name,
      indicator_type: formData.indicator_type,
      base_value: parseFloat(formData.base_value),
      scenario_adjustment: parseFloat(formData.scenario_adjustment) || 0,
      effective_date: formData.effective_date,
    });
    
    setFormData({
      indicator_name: '',
      indicator_type: 'oil',
      base_value: '',
      scenario_adjustment: '0',
      effective_date: format(new Date(), 'yyyy-MM-dd'),
    });
    setShowForm(false);
  };

  const groupedIndicators = indicators.reduce((acc, ind) => {
    const type = ind.indicator_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(ind);
    return acc;
  }, {} as Record<string, ExternalIndicator[]>);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            External Indicators
          </CardTitle>
          {isTreasury && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowForm(!showForm)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="p-4 bg-muted/50 rounded-lg space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label htmlFor="name" className="text-sm">Indicator Name</Label>
                <Input
                  id="name"
                  value={formData.indicator_name}
                  onChange={(e) => setFormData({ ...formData, indicator_name: e.target.value })}
                  placeholder="e.g., WTI Crude Oil"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="type" className="text-sm">Type</Label>
                <Select 
                  value={formData.indicator_type} 
                  onValueChange={(v) => setFormData({ ...formData, indicator_type: v as 'payment' | 'oil' | 'fx' | 'macro' })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oil">Oil</SelectItem>
                    <SelectItem value="fx">FX</SelectItem>
                    <SelectItem value="payment">Payment</SelectItem>
                    <SelectItem value="macro">Macro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="base" className="text-sm">Base Value</Label>
                <Input
                  id="base"
                  type="number"
                  step="0.01"
                  value={formData.base_value}
                  onChange={(e) => setFormData({ ...formData, base_value: e.target.value })}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="adjustment" className="text-sm">Adjustment (%)</Label>
                <Input
                  id="adjustment"
                  type="number"
                  step="0.1"
                  value={formData.scenario_adjustment}
                  onChange={(e) => setFormData({ ...formData, scenario_adjustment: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="date" className="text-sm">Effective Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.effective_date}
                  onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm">Save Indicator</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Indicators List */}
        {Object.keys(groupedIndicators).length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>No external indicators configured.</p>
            <p className="text-sm mt-1">Add indicators to enhance simulation accuracy.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedIndicators).map(([type, items]) => {
              const config = INDICATOR_TYPE_CONFIG[type as keyof typeof INDICATOR_TYPE_CONFIG];
              const Icon = config?.icon || Globe;
              
              return (
                <div key={type}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{config?.label || type}</span>
                    <Badge variant="secondary" className="text-xs">{items.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {items.map((ind) => (
                      <div 
                        key={ind.id} 
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{ind.indicator_name}</span>
                            <Badge className={config?.color || 'bg-muted'}>
                              {config?.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span>Base: {ind.base_value}</span>
                            {ind.scenario_adjustment !== 0 && (
                              <span className={ind.scenario_adjustment > 0 ? 'text-green-600' : 'text-red-600'}>
                                Adj: {ind.scenario_adjustment > 0 ? '+' : ''}{ind.scenario_adjustment}%
                              </span>
                            )}
                            <span>{ind.effective_date}</span>
                          </div>
                        </div>
                        {isTreasury && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onDelete(ind.id!)}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
