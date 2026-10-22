# DemandIQ Pull Request Development Log (80+ Verified PR Boundaries)

This log documents the 84 architectural PR boundaries across the 7-member team structure.

---

### Member 1: Platform Foundation, Tenancy, RBAC & Security (PR #1 – #12)
- **PR #01**: `feat(auth): custom user model with email authentication and verification tokens`
- **PR #02**: `feat(business): multi-tenant business and multi-branch database schema`
- **PR #03**: `feat(tenancy): tenant context middleware extracting active store from headers and session`
- **PR #04**: `feat(rbac): role-based permissions matrix (Owner, Manager, Inventory, Analyst, Viewer)`
- **PR #05**: `feat(audit): immutable compliance audit event model and logging service`
- **PR #06**: `feat(auth): password reset and secure token expiration workflow`
- **PR #07**: `feat(tenancy): abstract TenantScopedModel with automated queryset scoping`
- **PR #08**: `feat(security): request rate limiting and session security configuration`
- **PR #09**: `feat(api): drf-spectacular OpenAPI 3.0 schema generation and Swagger endpoints`
- **PR #10**: `test(tenancy): automated integration tests verifying multi-tenant data isolation`
- **PR #11**: `feat(business): Indian retail business defaults (INR currency, GSTIN, IST timezone)`
- **PR #12**: `ci(workflows): GitHub Actions automated CI testing pipeline configuration`

---

### Member 2: Product Catalog & Real-Time Inventory (PR #13 – #24)
- **PR #13**: `feat(catalog): product categories and tax configuration schema`
- **PR #14**: `feat(catalog): product master model with SKU, barcode, unit cost, and MRP`
- **PR #15**: `feat(catalog): unit of measurement enumeration (kg, g, L, ml, pcs, pack, box, strip)`
- **PR #16**: `feat(inventory): branch-level inventory balance schema with reserved & incoming stock`
- **PR #17**: `feat(inventory): atomic transaction-safe stock adjustment with select_for_update locking`
- **PR #18**: `feat(inventory): inventory movement audit trail tracking purchases, sales, and scrap`
- **PR #19**: `feat(inventory): perishable batch tracking with manufacturing and expiry dates`
- **PR #20**: `feat(inventory): negative stock policy validation preventing overselling`
- **PR #21**: `feat(catalog): product search, category filtering, and status badge API endpoints`
- **PR #22**: `test(inventory): atomic concurrency locking unit tests for stock changes`
- **PR #23**: `feat(inventory): physical stock audit adjustment endpoint with reason codes`
- **PR #24**: `feat(inventory): inventory valuation calculations at cost and retail value`

---

### Member 3: Sales Data Pipeline, Ingestion & Analytics (PR #25 – #36)
- **PR #25**: `feat(sales): sales transaction and line item models with UPI/Cash/Card payments`
- **PR #26**: `feat(imports): file upload model supporting CSV and Excel spreadsheet files`
- **PR #27**: `feat(imports): heuristic column mapping engine detecting Date, Invoice, SKU, Qty, and Price`
- **PR #28**: `feat(imports): row-by-row data quality validation engine logging format discrepancies`
- **PR #29**: `feat(imports): sample preview generator displaying sample rows before commitment`
- **PR #30**: `feat(imports): idempotent batch sales processing and automatic product registration`
- **PR #31**: `feat(imports): authorized rollback mechanism reversing imported transaction batches`
- **PR #32**: `feat(analytics): daily, weekly, and monthly revenue time-series aggregation`
- **PR #33**: `feat(analytics): gross profit and margin percentage calculations`
- **PR #34**: `feat(analytics): day-of-week retail demand pattern extraction`
- **PR #35**: `feat(analytics): category revenue breakdown and top-selling product endpoints`
- **PR #36**: `test(imports): data ingestion parser and validation error logging tests`

---

### Member 4: Demand Forecasting & Machine Learning Engine (PR #37 – #48)
- **PR #37**: `feat(ml): independent time-series dataset builder with calendar expansion and zero filling`
- **PR #38**: `feat(ml): naive demand forecaster baseline`
- **PR #39**: `feat(ml): 7-day seasonal naive model capturing Indian weekly shopping cycles`
- **PR #40**: `feat(ml): moving average forecasting model with configurable window sizes`
- **PR #41**: `feat(ml): single exponential smoothing forecaster with alpha weighting`
- **PR #42**: `feat(ml): temporal feature engineering (lags, rolling means, rolling standard deviation)`
- **PR #43**: `feat(ml): supervised Random Forest regression forecaster with recursive multi-step prediction`
- **PR #44**: `feat(ml): Gradient Boosting regressor with past-only feature matrix`
- **PR #45**: `feat(ml): rolling-origin expanding-window time-series validation framework`
- **PR #46**: `feat(ml): evaluation metrics suite (MAE, RMSE, WAPE, Bias, MASE)`
- **PR #47**: `feat(ml): residual-based 80% confidence interval band calculations`
- **PR #48**: `feat(forecasting): asynchronous forecast execution endpoint and result persistence`

---

### Member 5: Inventory Intelligence & Replenishment (PR #49 – #60)
- **PR #49**: `feat(replenishment): average daily demand (ADD) computation with 60-day lookback`
- **PR #50**: `feat(replenishment): supplier lead time demand (LTD) calculation`
- **PR #51**: `feat(replenishment): service-level safety stock formulation using demand variance`
- **PR #52**: `feat(replenishment): dynamic reorder point (ROP) calculation`
- **PR #53**: `feat(replenishment): order-up-to periodic review target stock calculation`
- **PR #54**: `feat(replenishment): suggested order quantity adjusted for MOQ and packaging multiples`
- **PR #55**: `feat(replenishment): urgency scoring (Critical Stockout vs Warning vs Optimal)`
- **PR #56**: `feat(dead-stock): sales velocity audit calculating days elapsed without sales`
- **PR #57**: `feat(dead-stock): inventory turnover ratio calculations across catalog items`
- **PR #58**: `feat(dead-stock): capital at risk calculation for idle and non-moving inventory`
- **PR #59**: `feat(dead-stock): actionable recovery strategy recommendations (clearance, bundling)`
- **PR #60**: `test(replenishment): unit tests for ROP, MOQ rounding, and dead-stock rules`

---

### Member 6: Frontend Architecture, Design System & UX (PR #61 – #72)
- **PR #61**: `feat(frontend): Vite React TypeScript project scaffolding and path aliases`
- **PR #62**: `feat(design): bespoke humanized design system with strictly zero blue colors`
- **PR #63**: `feat(components): responsive navbar with business context and branch switcher`
- **PR #64**: `feat(components): operational sidebar with sectioned navigation and alert badges`
- **PR #65**: `feat(pages): executive dashboard with KPI cards, revenue charts, and action items`
- **PR #66**: `feat(pages): public landing page showcase with value propositions and testimonials`
- **PR #67**: `feat(pages): forecast explorer with Recharts actuals vs predicted curves and CI bands`
- **PR #68**: `feat(pages): model evaluation comparison scorecard showing MAE/RMSE/WAPE/MASE`
- **PR #69**: `feat(pages): reorder recommendations management view with priority filters`
- **PR #70**: `feat(pages): dead-stock analysis register with idle capital highlights`
- **PR #71**: `feat(pages): product catalog view with instant search and category filtering`
- **PR #72**: `feat(pages): branch inventory balances table with stock adjustment modal`

---

### Member 7: Procurement, Reporting & Quality Verification (PR #73 – #84)
- **PR #73**: `feat(suppliers): supplier and distributor directory management with lead times & ratings`
- **PR #74**: `feat(suppliers): supplier product contract mapping with contracted wholesale costs`
- **PR #75**: `feat(procurement): purchase order model and line items with tax calculations`
- **PR #76**: `feat(procurement): purchase order status lifecycle (Draft -> Approved -> Ordered -> Received)`
- **PR #77**: `feat(procurement): atomic Goods Receipt workflow updating inventory balances and audit logs`
- **PR #78**: `feat(scenarios): what-if business simulator service projecting demand and supply shocks`
- **PR #79**: `feat(scenarios): interactive simulator UI with sensitivity range sliders and metric cards`
- **PR #80**: `feat(reporting): humanized weekly stock review digest with actionable manager highlights`
- **PR #81**: `feat(reporting): printable weekly digest layout for store operations`
- **PR #82**: `feat(data): reproducible Indian retail demonstration seeder (Sri Lakshmi Supermarket)`
- **PR #83**: `feat(deploy): multi-container Docker Compose configuration with PostgreSQL 16 & Redis`
- **PR #84**: `docs: complete architecture, forecasting, and deployment documentation suite`
