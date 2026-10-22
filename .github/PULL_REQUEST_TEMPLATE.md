# DemandIQ Pull Request Template

## 1. PR Title
<!-- Format: feat(scope): title or fix(scope): title -->

## 2. Problem Being Solved
<!-- Describe the specific business requirement, inventory challenge, or bug being addressed. -->

## 3. Team Member Ownership
- [ ] Member 1: Platform Foundation, Tenancy, RBAC & Security
- [ ] Member 2: Catalog & Real-time Inventory Management
- [ ] Member 3: Sales Pipeline, Validation & Analytics
- [ ] Member 4: Demand Forecasting & Machine Learning Engine
- [ ] Member 5: Replenishment & Dead-Stock Optimization
- [ ] Member 6: Frontend Design System & Responsive UI
- [ ] Member 7: Procurement, Reporting & Quality Verification

## 4. Architectural & Implementation Summary
<!-- Outline key code changes, models added, or algorithm improvements. -->

## 5. UI / UX Design System Verification
- [ ] Strictly ZERO blue, cyan, navy, or blue-purple colors used.
- [ ] Warm humanized palette honored: Warm Ivory (`#F8F5EF`), Cream (`#FFFDF8`), Forest Green (`#355E3B`), Sage (`#A8B99A`), Muted Orange (`#D9874C`).
- [ ] Responsive at desktop and mobile widths.

## 6. Testing & Quality Verification
- [ ] Automated tests added or updated.
- [ ] `pytest` passes with 100% success.
- [ ] Frontend `npm run build` passes with zero type errors.
- [ ] Tenant data isolation verified.

## 7. Database Migration Impact
- [ ] No migrations required
- [ ] Backward-compatible migrations included
