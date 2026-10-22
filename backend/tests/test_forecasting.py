import numpy as np
import pandas as pd
import pytest
from ml.engine import (
    NaiveModel,
    SeasonalNaiveModel,
    MovingAverageModel,
    ExponentialSmoothingModel,
    ForecastingMetrics,
    TimeSeriesEngine
)

def test_naive_model():
    model = NaiveModel()
    history = pd.Series([10.0, 15.0, 20.0])
    model.fit(history)
    preds = model.predict(horizon=5)
    assert len(preds) == 5
    assert np.all(preds == 20.0)

def test_seasonal_naive_model():
    model = SeasonalNaiveModel(season_length=7)
    pattern = [10.0, 12.0, 8.0, 14.0, 16.0, 25.0, 30.0]  # weekly Indian grocery surge on weekend
    history = pd.Series(pattern * 3)
    model.fit(history)
    preds = model.predict(horizon=14)
    assert len(preds) == 14
    assert preds[5] == 25.0  # Saturday matches
    assert preds[6] == 30.0  # Sunday matches
    assert preds[12] == 25.0 # Following Saturday matches

def test_moving_average_model():
    model = MovingAverageModel(window=3)
    history = pd.Series([10.0, 20.0, 30.0])
    model.fit(history)
    preds = model.predict(horizon=4)
    assert len(preds) == 4
    assert np.allclose(preds, 20.0)

def test_exponential_smoothing_model():
    model = ExponentialSmoothingModel(alpha=0.5)
    history = pd.Series([10.0, 20.0])
    model.fit(history)
    preds = model.predict(horizon=3)
    # level = 0.5*20 + 0.5*10 = 15.0
    assert len(preds) == 3
    assert np.allclose(preds, 15.0)

def test_forecasting_metrics_division_by_zero():
    actual = np.array([0.0, 0.0, 0.0])
    predicted = np.array([0.0, 0.0, 0.0])
    metrics = ForecastingMetrics.calculate_all(actual, predicted, naive_insample_mae=0.0)
    assert metrics['mae'] == 0.0
    assert metrics['rmse'] == 0.0
    assert metrics['wape'] == 0.0

def test_timeseries_pipeline_end_to_end():
    dates = [f"2026-01-{i+1:02d}" for i in range(30)]
    demands = [float((i % 7) * 2 + 5) for i in range(30)]
    result = TimeSeriesEngine.run_forecast_pipeline(dates, demands, horizon_days=7)
    assert result['status'] == 'SUCCESS'
    assert len(result['forecasts']) == 7
    assert 'selected_model' in result
    assert 'metrics' in result
    assert result['metrics']['mae'] >= 0.0
