# DemandIQ System Architecture

## 1. Architectural Philosophy
DemandIQ is architected as an **explainable, domain-driven modular monolith** designed for operational reliability, zero external API costs, and robust multi-tenant data isolation.

```text
[ React 18 + TypeScript + Vite (Port 3000) ]
                      │
                      ▼  REST API (JSON / X-Business-ID)
[ Django 5.x REST Framework + drf-spectacular (Port 8000) ]
  ├── apps.accounts       (Auth, Users, Verification)
  ├── apps.businesses     (Tenants, Branches, RBAC, Middleware)
  ├── apps.catalog        (Product Master, Categories, Tax)
  ├── apps.inventory      (Atomic Stock, Balances, Movements, Batches)
  ├── apps.suppliers      (Distributor Directory, Contracts)
  ├── apps.sales          (POS Transactions, Item Lines)
  ├── apps.imports        (CSV / XLSX Ingestion, Validation, Rollback)
  ├── apps.analytics      (Daily/Weekly Aggregates, DOW, Margins)
  ├── apps.forecasting    (Forecast Runs, Pipelines, Confidence Intervals)
  ├── apps.replenishment  (Reorder Points, Safety Stock, Dead-Stock Velocity)
  ├── apps.procurement    (Purchase Orders, Goods Receipt Workflow)
  ├── apps.scenarios      (What-If Business Simulator)
  ├── apps.reporting      (Weekly Stock Review, Valuation Reports)
  ├── apps.notifications  (Stockout Alerts, Notifications)
  └── apps.audit          (Immutable Compliance Event Ledger)
                      │
                      ▼
[ Independent ML Engine (ml/engine.py) ]
  ├── TimeSeriesEngine (Calendar expansion, rolling-origin backtesting)
  ├── Baselines (Naive, Seasonal Naive 7d, Moving Avg, Exp Smoothing)
  └── Supervised Regressors (Random Forest, Gradient Boosting)
                      │
                      ▼
[ PostgreSQL 16 (or local SQLite for instant zero-dependency execution) ]
```

## 2. Multi-Tenant Isolation
Tenant isolation is enforced at the database and middleware layers:
1. `apps.businesses.middleware.TenantMiddleware`: Inspects `X-Business-ID` request header or authenticated user memberships, binding `request.business` and `request.branch`.
2. `TenantScopedModel`: Ensures business scoping on database tables.
3. Automated test verification (`tests/test_tenant_isolation.py`) validates cross-tenant query separation.

## 3. Seven-Member Division of Responsibility
| Member | Primary Ownership | Domain Deliverables |
|---|---|---|
| Member 1 | Platform Foundation & Security | Auth, Tenant isolation, RBAC, Audit, CI workflow |
| Member 2 | Catalog & Inventory | Product catalog, atomic adjustments, balances, movements |
| Member 3 | Sales Pipeline & Analytics | CSV/XLSX imports, validation, rollback, sales BI |
| Member 4 | Forecasting & ML Engine | Baselines, tree models, backtesting, WAPE evaluation |
| Member 5 | Inventory Intelligence | Reorder engine, safety stock, ROP, dead-stock detection |
| Member 6 | Frontend & UX Architecture | No-blue warm design system, charts, responsive layouts |
| Member 7 | Procurement & Quality | Suppliers, purchase orders, goods receipt, what-if simulator |
