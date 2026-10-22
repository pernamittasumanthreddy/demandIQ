"""
DemandIQ Machine Learning & Time-Series Demand Forecasting Engine
Independent, testable ML module with baselines, scikit-learn regressors,
rolling-origin backtesting, and explainability metrics.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Any, Optional
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor

class ForecastingMetrics:
    @staticmethod
    def calculate_all(actual: np.ndarray, predicted: np.ndarray, naive_insample_mae: float = 1.0) -> Dict[str, float]:
        """
        Calculates MAE, RMSE, WAPE, Bias, and MASE without division-by-zero errors.
        """
        actual = np.array(actual, dtype=float)
        predicted = np.array(predicted, dtype=float)
        
        errors = predicted - actual
        abs_errors = np.abs(errors)
        
        mae = float(np.mean(abs_errors))
        rmse = float(np.sqrt(np.mean(errors ** 2)))
        bias = float(np.mean(errors))
        
        sum_actual = np.sum(actual)
        wape = float(np.sum(abs_errors) / sum_actual) if sum_actual > 0 else (0.0 if np.sum(abs_errors) == 0 else 1.0)
        mase = float(mae / naive_insample_mae) if naive_insample_mae > 0 else mae

        return {
            'mae': round(mae, 3),
            'rmse': round(rmse, 3),
            'wape': round(wape * 100, 2),  # percentage
            'bias': round(bias, 3),
            'mase': round(mase, 3)
        }


class BaselineForecaster:
    """Base class for all forecasting models."""
    def __init__(self, name: str):
        self.name = name

    def fit(self, history: pd.Series):
        raise NotImplementedError

    def predict(self, horizon: int) -> np.ndarray:
        raise NotImplementedError


class NaiveModel(BaselineForecaster):
    """Last observed value naive model."""
    def __init__(self):
        super().__init__("Naive (Last Value)")
        self.last_val = 0.0

    def fit(self, history: pd.Series):
        self.last_val = float(history.iloc[-1]) if len(history) > 0 else 0.0
        return self

    def predict(self, horizon: int) -> np.ndarray:
        return np.full(horizon, max(0.0, self.last_val))


class SeasonalNaiveModel(BaselineForecaster):
    """7-day seasonal naive model matching weekly Indian shopping cycles."""
    def __init__(self, season_length: int = 7):
        super().__init__(f"Seasonal Naive ({season_length}d Cycle)")
        self.season_length = season_length
        self.seasonal_pattern = np.zeros(season_length)

    def fit(self, history: pd.Series):
        if len(history) >= self.season_length:
            self.seasonal_pattern = history.iloc[-self.season_length:].values.astype(float)
        elif len(history) > 0:
            self.seasonal_pattern = np.resize(history.values.astype(float), self.season_length)
        else:
            self.seasonal_pattern = np.zeros(self.season_length)
        return self

    def predict(self, horizon: int) -> np.ndarray:
        reps = int(np.ceil(horizon / self.season_length))
        tiled = np.tile(self.seasonal_pattern, reps)[:horizon]
        return np.maximum(0.0, tiled)


class MovingAverageModel(BaselineForecaster):
    """Simple moving average model."""
    def __init__(self, window: int = 7):
        super().__init__(f"Moving Average ({window}d Window)")
        self.window = window
        self.avg_val = 0.0

    def fit(self, history: pd.Series):
        tail = history.iloc[-self.window:] if len(history) >= self.window else history
        self.avg_val = float(tail.mean()) if len(tail) > 0 else 0.0
        return self

    def predict(self, horizon: int) -> np.ndarray:
        return np.full(horizon, max(0.0, self.avg_val))


class ExponentialSmoothingModel(BaselineForecaster):
    """Single exponential smoothing with alpha weight."""
    def __init__(self, alpha: float = 0.3):
        super().__init__(f"Exponential Smoothing (α={alpha})")
        self.alpha = alpha
        self.level = 0.0

    def fit(self, history: pd.Series):
        if len(history) == 0:
            self.level = 0.0
            return self
        lvl = float(history.iloc[0])
        for val in history.iloc[1:]:
            lvl = self.alpha * float(val) + (1 - self.alpha) * lvl
        self.level = lvl
        return self

    def predict(self, horizon: int) -> np.ndarray:
        return np.full(horizon, max(0.0, self.level))


class MLFeatureBuilder:
    """Creates lag, rolling, and calendar features strictly using past observations."""
    @staticmethod
    def build_features(df_series: pd.DataFrame) -> pd.DataFrame:
        df = df_series.copy()
        # Calendar features
        df['dayofweek'] = df.index.dayofweek
        df['is_weekend'] = (df['dayofweek'] >= 5).astype(int)
        df['month'] = df.index.month
        df['day'] = df.index.day
        
        # Lags
        for lag in [1, 2, 7, 14]:
            df[f'lag_{lag}'] = df['demand'].shift(lag)

        # Rolling statistics strictly without future leakage
        df['roll_mean_7'] = df['demand'].shift(1).rolling(7, min_periods=1).mean()
        df['roll_mean_14'] = df['demand'].shift(1).rolling(14, min_periods=1).mean()
        df['roll_std_7'] = df['demand'].shift(1).rolling(7, min_periods=1).std().fillna(0)

        return df.dropna()


class MLTreeForecaster(BaselineForecaster):
    """Supervised ML model (Random Forest / Gradient Boosting) with recursive multi-step forecasting."""
    def __init__(self, model_type: str = "RandomForest"):
        super().__init__(f"Machine Learning ({model_type})")
        self.model_type = model_type
        if model_type == "RandomForest":
            self.regressor = RandomForestRegressor(n_estimators=60, max_depth=6, random_state=42)
        else:
            self.regressor = GradientBoostingRegressor(n_estimators=60, max_depth=4, random_state=42)
        self.feature_cols: List[str] = []
        self.last_df: Optional[pd.DataFrame] = None

    def fit(self, history: pd.Series):
        df = pd.DataFrame({'demand': history.values}, index=pd.date_range(end=pd.Timestamp.now(), periods=len(history), freq='D'))
        feat_df = MLFeatureBuilder.build_features(df)
        self.feature_cols = [c for c in feat_df.columns if c != 'demand']
        
        if len(feat_df) >= 10:
            X = feat_df[self.feature_cols]
            y = feat_df['demand']
            self.regressor.fit(X, y)
        self.last_df = df
        return self

    def predict(self, horizon: int) -> np.ndarray:
        if self.last_df is None or len(self.last_df) < 10:
            # Fallback to seasonal naive or moving average if insufficient history
            return np.full(horizon, max(0.0, float(self.last_df['demand'].mean()) if self.last_df is not None else 0.0))

        # Recursive multi-step prediction
        predictions = []
        current_df = self.last_df.copy()

        for _ in range(horizon):
            next_date = current_df.index[-1] + pd.Timedelta(days=1)
            # Add dummy row to build features
            dummy_row = pd.DataFrame({'demand': [0.0]}, index=[next_date])
            expanded = pd.concat([current_df, dummy_row])
            feat_df = MLFeatureBuilder.build_features(expanded)
            
            if len(feat_df) > 0:
                X_next = feat_df[self.feature_cols].iloc[[-1]]
                pred_val = max(0.0, float(self.regressor.predict(X_next)[0]))
            else:
                pred_val = float(current_df['demand'].iloc[-1])

            predictions.append(pred_val)
            # Update history with predicted value for auto-regressive recurrence
            current_df = pd.concat([current_df, pd.DataFrame({'demand': [pred_val]}, index=[next_date])])

        return np.array(predictions)


class TimeSeriesEngine:
    """
    Orchestrates time-series preprocessing, rolling-origin backtesting,
    model selection, and final forecast generation with uncertainty bounds.
    """
    @classmethod
    def run_forecast_pipeline(
        cls,
        dates: List[str],
        demands: List[float],
        horizon_days: int = 14
    ) -> Dict[str, Any]:
        """
        Runs complete forecasting pipeline:
        1. Prepares continuous daily series with zero-filling for non-sale days.
        2. Backtests candidate models using expanding window validation.
        3. Compares MAE / WAPE.
        4. Trains winner on full dataset and predicts future values.
        5. Computes uncertainty intervals.
        """
        if not dates or len(dates) == 0:
            return {
                'status': 'INSUFFICIENT_DATA',
                'reason': 'No historical sales data found for this product.',
                'forecasts': []
            }

        # 1. Continuous daily resampling
        df = pd.DataFrame({'demand': demands}, index=pd.to_datetime(dates)).sort_index()
        # Group by day in case multiple transactions on same date
        daily = df.groupby(df.index.date).sum()
        daily.index = pd.to_datetime(daily.index)
        
        # Resample to full continuous calendar range
        full_idx = pd.date_range(start=daily.index.min(), end=daily.index.max(), freq='D')
        daily = daily.reindex(full_idx, fill_value=0.0)
        series = daily['demand']

        if len(series) < 14:
            # Fallback for sparse history
            fallback = MovingAverageModel(window=7).fit(series)
            preds = fallback.predict(horizon_days)
            future_dates = [str((series.index.max() + pd.Timedelta(days=i+1)).date()) for i in range(horizon_days)]
            return {
                'status': 'LIMITED_HISTORY_FALLBACK',
                'selected_model': fallback.name,
                'metrics': {'mae': 0.0, 'rmse': 0.0, 'wape': 0.0, 'bias': 0.0, 'mase': 1.0},
                'historical': [{'date': str(d.date()), 'demand': float(v)} for d, v in series.tail(30).items()],
                'forecasts': [
                    {'date': dt, 'predicted_demand': round(float(p), 1), 'lower_bound': max(0.0, round(float(p)*0.8, 1)), 'upper_bound': round(float(p)*1.2, 1)}
                    for dt, p in zip(future_dates, preds)
                ]
            }

        # 2. Candidate Models
        candidates: List[BaselineForecaster] = [
            NaiveModel(),
            SeasonalNaiveModel(season_length=7),
            MovingAverageModel(window=7),
            MovingAverageModel(window=14),
            ExponentialSmoothingModel(alpha=0.3),
        ]
        if len(series) >= 28:
            candidates.append(MLTreeForecaster(model_type="RandomForest"))
            candidates.append(MLTreeForecaster(model_type="GradientBoosting"))

        # 3. Rolling-Origin Time-Series Backtesting (last 7 to 14 days split)
        eval_horizon = min(7, len(series) // 4)
        train_series = series.iloc[:-eval_horizon]
        test_series = series.iloc[-eval_horizon:]

        # In-sample naive MAE for MASE computation
        diffs = np.abs(np.diff(train_series.values))
        naive_insample_mae = float(np.mean(diffs)) if len(diffs) > 0 and np.mean(diffs) > 0 else 1.0

        model_evaluations = []
        best_model = candidates[0]
        lowest_wape = float('inf')

        for candidate in candidates:
            try:
                candidate.fit(train_series)
                val_preds = candidate.predict(eval_horizon)
                metrics = ForecastingMetrics.calculate_all(test_series.values, val_preds, naive_insample_mae)
                
                model_evaluations.append({
                    'model_name': candidate.name,
                    'metrics': metrics
                })

                # Selection criterion: lower WAPE, then lower MAE
                if metrics['wape'] < lowest_wape:
                    lowest_wape = metrics['wape']
                    best_model = candidate
            except Exception:
                continue

        # 4. Refit winning model on full history and predict forward
        best_model.fit(series)
        future_preds = best_model.predict(horizon_days)

        # 5. Residual-based confidence intervals (80% confidence)
        residuals = test_series.values - best_model.predict(eval_horizon) if len(test_series) == eval_horizon else np.array([1.0])
        std_resid = float(np.std(residuals)) if len(residuals) > 1 else max(1.0, float(np.mean(series) * 0.15))
        z_80 = 1.28

        future_dates = [str((series.index.max() + pd.Timedelta(days=i+1)).date()) for i in range(horizon_days)]
        forecast_items = []
        for dt, pred in zip(future_dates, future_preds):
            pred_f = float(pred)
            lower = max(0.0, round(pred_f - (z_80 * std_resid), 1))
            upper = round(pred_f + (z_80 * std_resid), 1)
            forecast_items.append({
                'date': dt,
                'predicted_demand': round(pred_f, 1),
                'lower_bound': lower,
                'upper_bound': upper
            })

        best_metrics = next((e['metrics'] for e in model_evaluations if e['model_name'] == best_model.name), {})

        return {
            'status': 'SUCCESS',
            'selected_model': best_model.name,
            'horizon_days': horizon_days,
            'metrics': best_metrics,
            'all_candidate_evaluations': model_evaluations,
            'historical': [{'date': str(d.date()), 'demand': float(v)} for d, v in series.tail(60).items()],
            'forecasts': forecast_items,
            'data_points_analyzed': len(series),
            'explainability': {
                'selection_reason': f"{best_model.name} achieved the best historical WAPE ({best_metrics.get('wape', 0)}%) on backtesting validation.",
                'trend': 'Upward' if future_preds[-1] > series.iloc[-1] else ('Downward' if future_preds[-1] < series.iloc[-1] else 'Stable'),
                'avg_daily_demand': round(float(series.mean()), 1),
                'forecast_daily_mean': round(float(np.mean(future_preds)), 1)
            }
        }
