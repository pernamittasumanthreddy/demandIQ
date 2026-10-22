import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Play,
  Save,
  TrendingUp,
  AlertTriangle,
  IndianRupee,
  RefreshCw,
  CheckCircle
} from 'lucide-react';
import { ApiClient } from '../services/api';
import { Scenario } from '../types';

export const SimulatorView: React.FC = () => {
  const [demandGrowth, setDemandGrowth] = useState<number>(15);
  const [leadTimeShift, setLeadTimeShift] = useState<number>(2);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [costChange, setCostChange] = useState<number>(5);
  const [safetyDays, setSafetyDays] = useState<number>(7);
  const [budgetCapping, setBudgetCapping] = useState<number>(150000);

  const [simulating, setSimulating] = useState<boolean>(false);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [scenarioName, setScenarioName] = useState('Diwali Peak + Supply Delay (+15% Demand, +2d Lead Time)');

  // Local calculation model for instant interactive feedback
  const baselineRevenue = 284000;
  const baselineCost = 223000;

  const demandFactor = 1 + demandGrowth / 100;
  const priceFactor = 1 + priceChange / 100;
  const costFactor = 1 + costChange / 100;

  const projectedRevenue = Math.round(baselineRevenue * demandFactor * priceFactor);
  const projectedCost = Math.round(baselineCost * demandFactor * costFactor);
  const grossProfit = projectedRevenue - projectedCost;
  const marginPct = projectedRevenue > 0 ? ((grossProfit / projectedRevenue) * 100).toFixed(1) : '0';

  // Cash required scales with demand, safety buffer, and cost
  const requiredCash = Math.round(45000 * demandFactor * (safetyDays / 7) * costFactor);
  const stockoutRiskCount = Math.max(0, Math.round(leadTimeShift * 1.5 + (demandGrowth > 10 ? 3 : 0)));
  const lostSales = Math.round(stockoutRiskCount * 4200 * priceFactor);

  useEffect(() => {
    loadSavedScenarios();
  }, []);

  const loadSavedScenarios = async () => {
    try {
      const res = await ApiClient.get<any>('/scenarios/');
      setScenarios(res.results || (Array.isArray(res) ? res : []));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveScenario = async () => {
    setSimulating(true);
    try {
      await ApiClient.post('/scenarios/', {
        name: scenarioName,
        demand_growth_pct: demandGrowth,
        lead_time_delta_days: leadTimeShift,
        price_change_pct: priceChange,
        cost_change_pct: costChange,
        safety_buffer_days: safetyDays,
        procurement_budget_limit: budgetCapping,
      });
      alert('Scenario simulated and saved to records.');
      await loadSavedScenarios();
    } catch (err: any) {
      alert(`Simulation failed: ${err.message}`);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-beige)',
        paddingBottom: '16px'
      }}>
        <div>
          <h1 className="editorial-title" style={{ fontSize: '28px', color: 'var(--text-charcoal)' }}>
            What-If Business Scenario Simulator
          </h1>
          <p style={{ color: 'var(--text-warm-gray)', fontSize: '14px', marginTop: '4px' }}>
            Simulate business shocks, festive surges, supplier delays, and budget caps before committing capital
          </p>
        </div>
        <button
          onClick={handleSaveScenario}
          disabled={simulating}
          className="btn btn-primary"
        >
          <Save size={15} color="var(--surface-cream)" />
          <span>{simulating ? 'Simulating...' : 'Save Scenario'}</span>
        </button>
      </div>

      {/* Main Simulation Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        {/* Sliders Input Panel */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 700 }}>Adjust Working Assumptions</h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-warm-gray)' }}>
              Move sliders to evaluate sensitivity on revenue, margins, and stockout vulnerability
            </p>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Scenario Name</label>
            <input
              type="text"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Slider 1: Demand Growth */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ fontWeight: 600 }}>Expected Demand Shift</span>
              <strong style={{ color: demandGrowth >= 0 ? 'var(--primary-forest)' : 'var(--status-error)' }}>
                {demandGrowth > 0 ? `+${demandGrowth}%` : `${demandGrowth}%`}
              </strong>
            </div>
            <input
              type="range"
              min="-30"
              max="60"
              step="5"
              value={demandGrowth}
              onChange={(e) => setDemandGrowth(parseInt(e.target.value))}
              style={{ accentColor: 'var(--primary-forest)' }}
            />
            <span style={{ fontSize: '11px', color: 'var(--text-warm-gray)' }}>
              Simulates festive demand (+30% Diwali/Holi) or monsoon seasonal slowdown (-15%).
            </span>
          </div>

          {/* Slider 2: Lead Time Delta */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ fontWeight: 600 }}>Supplier Lead Time Delay</span>
              <strong style={{ color: leadTimeShift > 0 ? 'var(--accent-orange)' : 'var(--text-charcoal)' }}>
                {leadTimeShift > 0 ? `+${leadTimeShift} Days` : `${leadTimeShift} Days`}
              </strong>
            </div>
            <input
              type="range"
              min="-2"
              max="10"
              step="1"
              value={leadTimeShift}
              onChange={(e) => setLeadTimeShift(parseInt(e.target.value))}
              style={{ accentColor: 'var(--accent-orange)' }}
            />
            <span style={{ fontSize: '11px', color: 'var(--text-warm-gray)' }}>
              Simulates distributor stockouts, logistics delays, or transport strikes.
            </span>
          </div>

          {/* Slider 3: Wholesale Cost Hike */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ fontWeight: 600 }}>Wholesale Purchase Cost Shift</span>
              <strong style={{ color: costChange > 0 ? 'var(--status-error)' : 'var(--primary-forest)' }}>
                {costChange > 0 ? `+${costChange}%` : `${costChange}%`}
              </strong>
            </div>
            <input
              type="range"
              min="-10"
              max="25"
              step="1"
              value={costChange}
              onChange={(e) => setCostChange(parseInt(e.target.value))}
              style={{ accentColor: 'var(--accent-terracotta)' }}
            />
            <span style={{ fontSize: '11px', color: 'var(--text-warm-gray)' }}>
              Wholesale FMCG manufacturer price increases (edible oil, dairy, grains).
            </span>
          </div>

          {/* Slider 4: Safety Stock Buffer */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ fontWeight: 600 }}>Safety Stock Buffer Target</span>
              <strong style={{ color: 'var(--primary-forest)' }}>{safetyDays} Days of Demand</strong>
            </div>
            <input
              type="range"
              min="3"
              max="21"
              step="1"
              value={safetyDays}
              onChange={(e) => setSafetyDays(parseInt(e.target.value))}
              style={{ accentColor: 'var(--primary-forest)' }}
            />
            <span style={{ fontSize: '11px', color: 'var(--text-warm-gray)' }}>
              Higher buffer reduces stockout risk but ties up more working capital.
            </span>
          </div>
        </div>

        {/* Live Simulation Projection Dashboard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '24px', backgroundColor: 'var(--surface-cream)', border: '2px solid var(--accent-sage)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span className="badge badge-sage">REAL-TIME SIMULATION PROJECTION</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-warm-gray)', fontWeight: 700 }}>PROJECTED 30D REVENUE</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary-forest)' }}>
                  ₹{projectedRevenue.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-warm-gray)', marginTop: '2px' }}>
                  Vs Baseline: ₹{baselineRevenue.toLocaleString('en-IN')}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-warm-gray)', fontWeight: 700 }}>PROJECTED GROSS MARGIN</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-charcoal)' }}>
                  {marginPct}%
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-warm-gray)', marginTop: '2px' }}>
                  Gross Profit: ₹{grossProfit.toLocaleString('en-IN')}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-warm-gray)', fontWeight: 700 }}>REPLENISHMENT CASH REQUIRED</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-orange)' }}>
                  ₹{requiredCash.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-warm-gray)', marginTop: '2px' }}>
                  Required procurement budget
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-warm-gray)', fontWeight: 700 }}>STOCKOUT RISK EXPOSURE</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: stockoutRiskCount > 0 ? 'var(--status-error)' : 'var(--status-success)' }}>
                  {stockoutRiskCount} SKUs
                </div>
                <div style={{ fontSize: '11px', color: 'var(--status-error)', marginTop: '2px' }}>
                  Lost Sales: ~₹{lostSales.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          {/* Saved Scenarios Comparison */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>Saved Historical Scenarios</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
              {scenarios.length === 0 ? (
                <div style={{ color: 'var(--text-warm-gray)', fontSize: '12.5px', textAlign: 'center', padding: '16px 0' }}>
                  No saved scenarios yet. Click "Save Scenario" above to record this simulation.
                </div>
              ) : (
                scenarios.map((s) => (
                  <div key={s.id} style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--surface-tint)', border: '1px solid var(--border-beige)', fontSize: '12.5px' }}>
                    <div style={{ fontWeight: 600 }}>{s.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', color: 'var(--text-charcoal-subtle)', fontSize: '11.5px' }}>
                      <span>Growth: {s.demand_growth_pct}%</span>
                      <span>Margin: {s.projected_margin_pct}%</span>
                      <span>Cash Needed: ₹{Number(s.required_cash).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
