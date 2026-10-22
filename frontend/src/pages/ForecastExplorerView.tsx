import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Brain,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { ApiClient } from '../services/api';
import { Product } from '../types';

export const ForecastExplorerView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [horizon, setHorizon] = useState<number>(14);
  const [loading, setLoading] = useState<boolean>(false);
  const [forecastData, setForecastData] = useState<any>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await ApiClient.get<any>('/catalog/products/');
      const list = res.results || (Array.isArray(res) ? res : []);
      setProducts(list);
      if (list.length > 0) {
        setSelectedProductId(list[0].id);
        runForecast(list[0].id, horizon);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const runForecast = async (pId: string, hDays: number) => {
    if (!pId) return;
    setLoading(true);
    try {
      const res = await ApiClient.post<any>('/forecasting/runs/generate/', {
        product_id: pId,
        horizon_days: hDays
      });
      setForecastData(res.pipeline_result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedProductId(val);
    runForecast(val, horizon);
  };

  const handleHorizonChange = (h: number) => {
    setHorizon(h);
    runForecast(selectedProductId, h);
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  // Combine historical and forecast for seamless time-series chart
  const chartPoints = [];
  if (forecastData?.historical) {
    for (const h of forecastData.historical.slice(-30)) {
      chartPoints.push({
        date: h.date,
        actual: h.demand,
        forecast: null,
        lower: null,
        upper: null,
      });
    }
  }
  if (forecastData?.forecasts) {
    for (const f of forecastData.forecasts) {
      chartPoints.push({
        date: f.date,
        actual: null,
        forecast: f.predicted_demand,
        lower: f.lower_bound,
        upper: f.upper_bound,
      });
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Title */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-beige)',
        paddingBottom: '16px'
      }}>
        <div>
          <h1 className="editorial-title" style={{ fontSize: '28px', color: 'var(--text-charcoal)' }}>
            Demand Forecasting Engine
          </h1>
          <p style={{ color: 'var(--text-warm-gray)', fontSize: '14px', marginTop: '4px' }}>
            Multi-model Machine Learning with Expanding-Window Backtesting & Explainability
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => runForecast(selectedProductId, horizon)}
            disabled={loading}
            className="btn btn-primary"
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} color="var(--surface-cream)" />
            <span>{loading ? 'Evaluating Models...' : 'Re-Run Forecast'}</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Product Selector and Horizon Pills */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '320px' }}>
          <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-charcoal)' }}>
            Target SKU:
          </label>
          <select
            value={selectedProductId}
            onChange={handleProductChange}
            className="form-select"
            style={{ width: 'auto', minWidth: '280px' }}
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} [{p.sku}]
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-charcoal)', marginRight: '4px' }}>
            Horizon:
          </span>
          {[7, 14, 30, 60, 90].map((h) => (
            <button
              key={h}
              onClick={() => handleHorizonChange(h)}
              className={horizon === h ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
            >
              {h} Days
            </button>
          ))}
        </div>
      </div>

      {/* Selected Model Insight Banner */}
      {forecastData?.selected_model && (
        <div style={{
          backgroundColor: 'var(--primary-forest-soft)',
          border: '1px solid var(--accent-sage)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Brain size={24} color="var(--primary-forest)" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--primary-forest)' }}>
                Selected Model: {forecastData.selected_model}
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-charcoal-subtle)', marginTop: '2px' }}>
                {forecastData.explainability?.selection_reason || 'Evaluated best on historical backtesting.'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', textAlign: 'right' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-warm-gray)', fontWeight: 700 }}>VALIDATION WAPE</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--primary-forest)' }}>
                {forecastData.metrics?.wape || '0.0'}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-warm-gray)', fontWeight: 700 }}>MAE ERROR</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-charcoal)' }}>
                {forecastData.metrics?.mae || '0.0'} units
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-warm-gray)', fontWeight: 700 }}>MASE SCALED</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-charcoal)' }}>
                {forecastData.metrics?.mase || '1.0'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Time-Series Forecast Chart */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 700 }}>
              Demand Forecast for {selectedProduct?.name || 'Product'}
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-warm-gray)' }}>
              Solid Charcoal line indicates historical actuals. Solid Forest Green curve indicates forecast with upper/lower 80% confidence band.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="badge badge-neutral">Historical Sales (Past 30d)</span>
            <span className="badge badge-sage">Forecast Curve</span>
          </div>
        </div>

        <div style={{ height: '340px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartPoints} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5DED2" />
              <XAxis dataKey="date" tick={{ fill: '#817D74', fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fill: '#817D74', fontSize: 11 }} label={{ value: 'Units', angle: -90, position: 'insideLeft', fill: '#817D74', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFDF8', borderColor: '#E5DED2', borderRadius: '8px', color: '#302F2B' }}
              />
              <Legend />
              {/* Actuals Line */}
              <Line
                type="monotone"
                dataKey="actual"
                name="Historical Demand"
                stroke="#302F2B"
                strokeWidth={2}
                dot={{ r: 2, fill: '#302F2B' }}
                connectNulls={false}
              />
              {/* Forecast Prediction Line */}
              <Line
                type="monotone"
                dataKey="forecast"
                name="Forecast Demand"
                stroke="#355E3B"
                strokeWidth={3}
                dot={{ r: 3, fill: '#355E3B' }}
                connectNulls={false}
              />
              {/* Upper & Lower Confidence Area */}
              <Area
                type="monotone"
                dataKey="upper"
                name="80% Upper Bound"
                stroke="#D9874C"
                strokeDasharray="3 3"
                fill="none"
                connectNulls={false}
              />
              <Area
                type="monotone"
                dataKey="lower"
                name="80% Lower Bound"
                stroke="#D9874C"
                strokeDasharray="3 3"
                fill="none"
                connectNulls={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Model Backtesting Comparison Scorecard */}
      {forecastData?.all_candidate_evaluations && forecastData.all_candidate_evaluations.length > 0 && (
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700 }}>
              Model Candidate Evaluation & Backtesting Comparison
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-warm-gray)' }}>
              All models evaluated on identical rolling-origin holdout period. Lowest WAPE wins automatically.
            </p>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Model Architecture</th>
                  <th>WAPE (%)</th>
                  <th>MAE (Units)</th>
                  <th>RMSE</th>
                  <th>Bias</th>
                  <th>MASE</th>
                  <th>Selection Verdict</th>
                </tr>
              </thead>
              <tbody>
                {forecastData.all_candidate_evaluations.map((cand: any, idx: number) => {
                  const isWinner = cand.model_name === forecastData.selected_model;
                  return (
                    <tr key={idx} style={{ backgroundColor: isWinner ? 'var(--primary-forest-soft)' : 'transparent' }}>
                      <td style={{ fontWeight: isWinner ? 700 : 500 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {isWinner && <CheckCircle2 size={16} color="var(--primary-forest)" />}
                          <span>{cand.model_name}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: isWinner ? 'var(--primary-forest)' : 'var(--text-charcoal)' }}>
                          {cand.metrics?.wape}%
                        </span>
                      </td>
                      <td>{cand.metrics?.mae}</td>
                      <td>{cand.metrics?.rmse}</td>
                      <td>{cand.metrics?.bias}</td>
                      <td>{cand.metrics?.mase}</td>
                      <td>
                        {isWinner ? (
                          <span className="badge badge-success">Selected Winner</span>
                        ) : (
                          <span className="badge badge-neutral">Evaluated Baseline</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
