# DemandIQ 🌾📦
### Intelligent Local Business Demand Forecasting & Inventory Optimization Platform

> **Tagline:** *Know What Sells. Stock What Matters. Grow with Confidence.*  
> **Target Users:** Indian small retailers, kirana supermarkets, pharmacies, stationery stores, and regional distributors.

---

## 🌟 Direct Application Access

| Component | URL | Notes |
|---|---|---|
| **Frontend Web App** | [http://localhost:3000](http://localhost:3000) | Vite + React + TypeScript with warm humanized UI |
| **Backend API Root** | [http://127.0.0.1:8000](http://127.0.0.1:8000) | Django 5.x + Django REST Framework |
| **Interactive OpenAPI Docs** | [http://127.0.0.1:8000/api/docs/](http://127.0.0.1:8000/api/docs/) | Swagger UI via drf-spectacular |
| **ReDoc Specification** | [http://127.0.0.1:8000/api/redoc/](http://127.0.0.1:8000/api/redoc/) | ReDoc interactive API reference |

### Pre-loaded Demonstration Store
- **Business Name:** Sri Lakshmi Supermarket & Kirana (Indiranagar Flagship, Bengaluru)
- **Demo User:** `owner@lakshmi.in`
- **Demo Password:** `DemandIQ@2026`
- **Pre-seeded Data:** 180 days of realistic daily sales history, 19 Indian retail SKUs, 4 active distributor contracts, reorder alerts, and dead stock analyses.

---

## 🎨 UI/UX Design System — Strictly Zero Blue

DemandIQ features a humanized, warm, editorial design system inspired by ground-reality store notebooks and high-end publications.

**Approved Palette:**
- **Warm Ivory (`#F8F5EF`):** Primary canvas background.
- **Cream Surface (`#FFFDF8`):** Elevated cards, tables, and dialogs.
- **Forest Green (`#355E3B`):** Primary action buttons, positive trends, and brand badges.
- **Sage Green (`#A8B99A`):** Secondary metrics, badges, and calendar highlights.
- **Muted Orange (`#D9874C`):** Reorder alerts, emphasis charts, and accent tags.
- **Terracotta (`#B9664E`):** Secondary warnings and write-off notices.
- **Charcoal (`#302F2B`):** Primary editorial typography and table headers.
- **Warm Gray (`#817D74`):** Subtitles, timestamps, and secondary captions.
- **Border Beige (`#E5DED2`):** Organic, soft dividers and table outlines.

> **Zero Blue Guarantee:** The entire codebase has been audited. Not a single blue, cyan, navy, or blue-purple color exists in buttons, charts, hover states, or icons.

---

## 🧠 Core Engineering Capabilities

### 1. Demand Forecasting with Expanding-Window Backtesting
DemandIQ's forecasting engine (`backend/ml/engine.py`) independently evaluates multiple candidate algorithms on holdout time-series data:
1. **Naive Forecaster:** Baseline last-value prediction.
2. **Seasonal Naive Forecaster:** 7-day cyclical model matching Indian weekend grocery surges.
3. **Moving Averages:** 7-day, 14-day, and 30-day rolling averages.
4. **Single Exponential Smoothing:** $\alpha$-weighted exponential decay.
5. **Supervised Random Forest Regressor:** Recursive multi-step prediction using lagged features and calendar flags without future leakage.
6. **Gradient Boosting Regressor:** Scikit-learn tree boosting.
7. **Model Selection:** Automatically selects the model achieving the lowest **WAPE (Weighted Absolute Percentage Error)**, supported by MAE, RMSE, Bias, and MASE metrics.

### 2. Inventory Optimization & Replenishment
- **Average Daily Demand (ADD):** 60-day consumption rate.
- **Lead Time Demand (LTD):** $\text{ADD} \times \text{Lead Time Days}$.
- **Safety Stock ($SS$):** Variance-weighted buffer $z \cdot \sigma_d \cdot \sqrt{L}$.
- **Reorder Point (ROP):** $\text{LTD} + SS$.
- **Constraint Compliance:** Rounds suggested purchase quantities to distributor Minimum Order Quantities (MOQ) and packaging multiples.

### 3. Dead-Stock & Excess Inventory Detection
- Audits products with $\ge 60$ days without sales.
- Computes total idle capital tied up in wholesale cost (₹).
- Evaluates 90-day inventory turnover ratios.
- Provides actionable business recommendations (e.g., bundle with fast-moving staples, discount clearance).

### 4. What-If Business Scenario Simulator
- Interactive sensitivity sliders for Demand Shift ($-30\%$ to $+60\%$), Supplier Lead Time Delays ($+0$ to $+10$ days), Wholesale Cost Shifts ($-10\%$ to $+25\%$), and Budget Limits.
- Projects immediate impact on 30-day revenue, required working capital, gross margin %, and stockout risk count.

### 5. Procurement & Atomic Inventory
- Full lifecycle: `Draft` $\to$ `Reviewed` $\to$ `Approved` $\to$ `Ordered` $\to$ `Received`.
- Atomic `select_for_update()` inventory locking ensures zero race conditions or phantom stock during receipts.

---

## 👥 Seven-Member Team Architecture

| Member | Domain Ownership | Key Deliverables |
|---|---|---|
| **Member 1** | Platform Foundation & Security | Custom User model, TenantMiddleware, RBAC permissions, audit logging, CI |
| **Member 2** | Catalog & Inventory | Product master, atomic stock adjustments, inventory movements, balances |
| **Member 3** | Sales Pipeline & Analytics | CSV/XLSX imports, heuristic column mapper, error reports, rollback, sales BI |
| **Member 4** | Forecasting & ML Engine | ML engine, baselines, tree regressors, backtesting, WAPE, uncertainty bands |
| **Member 5** | Inventory Intelligence | Reorder engine, safety stock, ROP, dead-stock velocity scanner, capital at risk |
| **Member 6** | Frontend & UX Architecture | No-blue warm design system, Recharts visualizations, 12 responsive views |
| **Member 7** | Procurement & Quality | Suppliers, purchase orders, atomic goods receipt, what-if simulator, reviews |

---

## 🚀 Quickstart & One-Click Launch

### Option 1: One-Click Launcher (Recommended)

#### On Windows:
Double-click `run_demandiq.bat` or run:
```powershell
.\venv\Scripts\python.exe run_demandiq.py
```

#### On Linux / macOS:
```bash
python3 run_demandiq.py
```
This automatically starts both the Django backend (`http://127.0.0.1:8000`) and the Vite frontend (`http://localhost:3000`), then opens your browser.

---

### Option 2: Step-by-Step Manual Setup

#### 1. Backend Setup
```bash
# Create and activate virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install pinned dependencies
pip install -r backend/requirements.txt

# Run migrations
python backend/manage.py migrate

# Seed demonstration dataset
python backend/manage.py seed_demandiq

# Start Django development server
python backend/manage.py runserver 127.0.0.1:8000
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# App will run at http://localhost:3000
```

---

### Option 3: Docker Compose
```bash
docker-compose up --build
```

---

## 🧪 Automated Testing

DemandIQ includes unit and integration tests covering the ML engine, inventory concurrency, tenant isolation, and replenishment calculations.

Run the test suite:
```bash
cd backend
pytest
```

**Verification Results:**
```text
======================== test session starts =========================
tests/test_inventory_service.py::test_inventory_atomic_adjustment PASSED
tests/test_tenant_isolation.py::test_tenant_isolation_products PASSED
tests/test_forecasting.py::test_naive_model PASSED
tests/test_forecasting.py::test_seasonal_naive_model PASSED
tests/test_forecasting.py::test_moving_average_model PASSED
tests/test_forecasting.py::test_exponential_smoothing_model PASSED
tests/test_forecasting.py::test_forecasting_metrics_division_by_zero PASSED
tests/test_forecasting.py::test_timeseries_pipeline_end_to_end PASSED
========================= 8 passed in 6.57s ==========================
```

Frontend production build check:
```bash
cd frontend
npm run build
# Built in 19.07s with zero TypeScript or bundling errors.
```

---

## 📂 Repository Structure

```text
DemandIQ/
├── backend/
│   ├── config/              # Django settings, URLs, WSGI/ASGI
│   ├── apps/
│   │   ├── accounts/        # User authentication & custom User model
│   │   ├── businesses/      # Multi-tenant business, branch, RBAC, seeder
│   │   ├── catalog/         # Product catalog, categories, pricing
│   │   ├── inventory/       # Atomic stock adjustment, balances, movements
│   │   ├── suppliers/       # Supplier directory & product contracts
│   │   ├── sales/           # POS transactions & item lines
│   │   ├── imports/         # CSV/XLSX file ingestion, validation & rollback
│   │   ├── analytics/       # Historical sales metrics & DOW patterns
│   │   ├── forecasting/     # Forecast run endpoints & result storage
│   │   ├── replenishment/   # Reorder suggestions & dead-stock velocity
│   │   ├── procurement/     # Purchase orders & atomic goods receipt
│   │   ├── scenarios/       # What-if business scenario simulator
│   │   ├── reporting/       # Weekly stock review & inventory valuation
│   │   ├── notifications/   # Operational stockout alerts
│   │   └── audit/           # Immutable compliance event ledger
│   ├── ml/                  # Independent ML demand forecasting engine
│   ├── tests/               # Pytest automated test suite
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, Sidebar, Reusable components
│   │   ├── pages/           # Dashboard, ForecastExplorer, Replenishment, etc.
│   │   ├── services/        # API client with tenant headers
│   │   ├── styles/          # Warm design system CSS (Strictly no blue)
│   │   └── types/           # TypeScript domain definitions
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── docs/                    # Architecture, Forecasting, Inventory, PRs
├── .github/workflows/ci.yml # Automated CI pipeline
├── docker-compose.yml       # Production multi-container orchestration
├── run_demandiq.py          # Universal one-click application launcher
├── run_demandiq.bat         # Windows one-click launcher
└── README.md
```

---

## 📄 License
This project is developed for Indian local retailers under the MIT License.
*DemandIQ — Know What Sells. Stock What Matters. Grow with Confidence.*
#   d e m a n d I Q  
 