# Demand Forecasting & Machine Learning Methodology

DemandIQ integrates an explainable forecasting service located in `backend/ml/engine.py`.

## 1. Candidate Models Evaluated

### 1.1 Naive Model
Assumes demand in period $t+h$ equals the last observed demand value:
$$\hat{y}_{t+h} = y_t$$

### 1.2 Seasonal Naive Model ($m=7$)
Captures the standard weekly demand rhythm of Indian retail (heavy Saturday-Sunday grocery surges vs Tuesday vegetarian lulls):
$$\hat{y}_{t+h} = y_{t+h - m(k+1)}$$
where $m = 7$ days.

### 1.3 Moving Average ($k=7, 14, 30$)
Smooths short-term fluctuations:
$$\hat{y}_{t+h} = \frac{1}{k} \sum_{i=0}^{k-1} y_{t-i}$$

### 1.4 Single Exponential Smoothing ($\alpha=0.3$)
Weights recent demand exponentially:
$$l_t = \alpha y_t + (1 - \alpha) l_{t-1}$$
$$\hat{y}_{t+h} = l_t$$

### 1.5 Supervised Machine Learning (Random Forest & Gradient Boosting)
Uses `scikit-learn` regressors trained on past temporal features without future leakage:
- Lags: $y_{t-1}, y_{t-2}, y_{t-7}, y_{t-14}$
- Rolling statistics: 7-day rolling mean, 14-day rolling mean, 7-day rolling standard deviation
- Calendar features: Day of week, weekend indicator, month, day of month

## 2. Rolling-Origin Time-Series Backtesting
To prevent future-to-past data leakage:
- The last $H = \min(7, N/4)$ days of historical sales are held out as an out-of-sample test split.
- All candidate models are fitted exclusively on $y_1, \dots, y_{T-H}$ and evaluated on $y_{T-H+1}, \dots, y_T$.
- Model selection is decided by the lowest **WAPE (Weighted Absolute Percentage Error)**:
$$\text{WAPE} = \frac{\sum |y_t - \hat{y}_t|}{\sum y_t} \times 100\%$$
- Additionally, MAE, RMSE, Bias, and MASE are computed for full model explainability.
- The winning model is refit on all available history $y_1, \dots, y_T$ to project future horizons (7, 14, 30, 60, 90 days).

## 3. Prediction Uncertainty Bounds (80% Confidence Interval)
Forecast intervals are calculated from historical residual dispersion:
$$\hat{y}_t \pm z_{0.80} \cdot \sigma_e$$
where $z_{0.80} \approx 1.28$ and $\sigma_e$ is the standard deviation of validation residuals.
Lower bounds are truncated at zero to guarantee non-negative demand projections.
