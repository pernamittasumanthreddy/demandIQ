# Inventory Optimization & Replenishment Math

DemandIQ converts raw demand forecasts into capital-conscious purchase recommendations.

## 1. Replenishment Formulations

### 1.1 Average Daily Demand (ADD)
$$\text{ADD} = \frac{\sum_{t=1}^{T} \text{Quantity Sold}_t}{T}$$
where $T = 60$ days lookback.

### 1.2 Lead Time Demand (LTD)
$$\text{LTD} = \text{ADD} \times L$$
where $L$ is the supplier lead time in days.

### 1.3 Safety Stock ($SS$)
Buffers against demand surges and delivery delays:
$$SS = z \cdot \sigma_d \cdot \sqrt{L}$$
where $z = 1.65$ (95% service level) and $\sigma_d$ is the standard deviation of daily sales.
A minimum buffer of $1.5 \times \text{ADD}$ is enforced for volatile items.

### 1.4 Reorder Point (ROP)
$$\text{ROP} = \text{LTD} + SS$$

### 1.5 Target Stock Level (Order-Up-To Level $S$)
For a periodic review cycle of $R = 7$ days:
$$S = (L + R) \times \text{ADD} + SS$$

### 1.6 Suggested Purchase Quantity ($Q$)
$$\text{Inventory Position} = \text{On-Hand Stock} + \text{On-Order (Incoming POs)} - \text{Committed / Reserved}$$
$$\text{Net Need} = \max(0, S - \text{Inventory Position})$$

The final quantity is adjusted to satisfy:
1. Distributor **Minimum Order Quantity (MOQ)**: $Q \ge \text{MOQ}$
2. Packaging / Carton **Order Multiple**: $Q$ rounded up to the nearest multiple.

---

## 2. Dead-Stock Velocity Classification
Products are audited against velocity and idle capital thresholds:

| Classification | Trigger Rule | Actionable Advice |
|---|---|---|
| **DEAD_STOCK** | $\ge 60$ days without sales and positive on-hand stock | Run clearance promotion, bundle with fast-moving staples, or return to distributor |
| **SLOW_MOVING** | 90-day inventory turnover ratio $< 0.4\times$ | Relocate shelf positioning, reduce reorder ceiling |
| **POTENTIAL_EXCESS** | Current stock $> 1.5 \times$ target maximum threshold | Freeze purchase orders until inventory normalizes |
| **HEALTHY** | Regular sales movement within standard velocity bands | Maintain automated reorder schedule |
