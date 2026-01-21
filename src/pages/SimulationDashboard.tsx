import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { SimulationControls } from "@/components/simulation/SimulationControls";
import { SimulationResults } from "@/components/simulation/SimulationResults";
import { ScenarioComparison } from "@/components/simulation/ScenarioComparison";
import { WaterfallChart } from "@/components/simulation/WaterfallChart";
import { BusinessUnitSensitivity } from "@/components/simulation/BusinessUnitSensitivity";
import { ExternalIndicators } from "@/components/simulation/ExternalIndicators";
import { DEFAULT_SIMULATION_PARAMS, type SimulationParams, type ScenarioResult, type ExternalIndicator } from "@/types/simulation";
import { runSimulation, saveScenario, getSavedScenarios, deleteScenario, getExternalIndicators, saveExternalIndicator } from "@/services/simulationService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function SimulationDashboard() {
  const { toast } = useToast();
  const { isTreasury } = useAuth();
  const [params, setParams] = useState<SimulationParams>(DEFAULT_SIMULATION_PARAMS);
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  
  // External indicators
  const [indicators, setIndicators] = useState<ExternalIndicator[]>([]);
  
  // Base results (no adjustments)
  const [baseResults, setBaseResults] = useState({
    inflows: 0,
    outflows: 0,
    netCash: 0,
    liquidityRiskLevel: 'Low',
    byBusinessUnit: {} as Record<string, { inflows: number; outflows: number; netCash: number }>,
  });
  
  // Simulated results
  const [results, setResults] = useState({
    inflows: 0,
    outflows: 0,
    netCash: 0,
    liquidityRiskLevel: 'Low',
    byBusinessUnit: {} as Record<string, { inflows: number; outflows: number; netCash: number }>,
  });
  
  const [scenarios, setScenarios] = useState<ScenarioResult[]>([]);
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);

  // Load saved scenarios and indicators
  useEffect(() => {
    loadScenarios();
    loadIndicators();
    runBaseSimulation();
  }, []);

  const loadScenarios = async () => {
    try {
      const data = await getSavedScenarios();
      setScenarios(data);
    } catch (error) {
      console.error('Failed to load scenarios:', error);
    }
  };

  const loadIndicators = async () => {
    try {
      const data = await getExternalIndicators();
      setIndicators(data);
    } catch (error) {
      console.error('Failed to load indicators:', error);
    }
  };

  const runBaseSimulation = async () => {
    try {
      const baseData = await runSimulation(DEFAULT_SIMULATION_PARAMS);
      setBaseResults(baseData);
    } catch (error) {
      console.error('Failed to run base simulation:', error);
    }
  };

  const handleRunSimulation = async () => {
    setIsRunning(true);
    try {
      const data = await runSimulation(params);
      setResults(data);
      setHasRun(true);
      toast({
        title: "Simulation Complete",
        description: `Net cash: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(data.netCash)}`,
      });
    } catch (error) {
      toast({
        title: "Simulation Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSaveScenario = async (name: string) => {
    try {
      await saveScenario(name, params, results);
      await loadScenarios();
      toast({
        title: "Scenario Saved",
        description: `"${name}" has been saved successfully.`,
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  const handleDeleteScenario = async (id: string) => {
    try {
      await deleteScenario(id);
      await loadScenarios();
      setSelectedScenarios(prev => prev.filter(s => s !== id));
      toast({
        title: "Scenario Deleted",
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  const handleSelectScenario = (id: string) => {
    setSelectedScenarios(prev => 
      prev.includes(id) 
        ? prev.filter(s => s !== id)
        : [...prev, id]
    );
  };

  const handleAddIndicator = async (indicator: Omit<ExternalIndicator, 'id'>) => {
    try {
      await saveExternalIndicator(indicator);
      await loadIndicators();
      toast({
        title: "Indicator Added",
        description: `"${indicator.indicator_name}" has been added.`,
      });
    } catch (error) {
      toast({
        title: "Failed to Add",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  const handleDeleteIndicator = async (id: string) => {
    try {
      const { error } = await supabase.from('external_indicators').delete().eq('id', id);
      if (error) throw error;
      await loadIndicators();
      toast({ title: "Indicator Deleted" });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Simulation & Scenario Planning</h1>
          <p className="text-muted-foreground mt-1">
            Adjust parameters to simulate different cash flow scenarios
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            <SimulationControls
              params={params}
              onChange={setParams}
              onRunSimulation={handleRunSimulation}
              onSaveScenario={handleSaveScenario}
              isRunning={isRunning}
            />
            <ScenarioComparison
              scenarios={scenarios}
              selectedScenarios={selectedScenarios}
              onSelectScenario={handleSelectScenario}
              onDeleteScenario={handleDeleteScenario}
            />
            <ExternalIndicators
              indicators={indicators}
              onAdd={handleAddIndicator}
              onDelete={handleDeleteIndicator}
              isTreasury={isTreasury}
            />
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2 space-y-6">
            {isRunning ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : hasRun ? (
              <>
                <SimulationResults
                  inflows={results.inflows}
                  outflows={results.outflows}
                  netCash={results.netCash}
                  liquidityRiskLevel={results.liquidityRiskLevel}
                />
                <WaterfallChart
                  baseInflows={baseResults.inflows}
                  baseOutflows={baseResults.outflows}
                  simulatedInflows={results.inflows}
                  simulatedOutflows={results.outflows}
                />
                <BusinessUnitSensitivity byBusinessUnit={results.byBusinessUnit} />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-muted-foreground">
                  Adjust the simulation parameters and click "Run Simulation" to see results.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
