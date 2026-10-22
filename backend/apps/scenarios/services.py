from decimal import Decimal
from .models import Scenario
from apps.catalog.models import Product

class ScenarioSimulationEngine:
    @classmethod
    def simulate(cls, scenario: Scenario) -> Scenario:
        """
        Calculates projected impact of parameter shifts across all catalog products.
        """
        products = Product.objects.filter(business=scenario.business, is_active=True)
        
        demand_factor = Decimal('1.00') + (scenario.demand_growth_pct / Decimal('100.00'))
        price_factor = Decimal('1.00') + (scenario.price_change_pct / Decimal('100.00'))
        cost_factor = Decimal('1.00') + (scenario.cost_change_pct / Decimal('100.00'))

        total_projected_rev = Decimal('0.00')
        total_projected_cost = Decimal('0.00')
        total_cash_needed = Decimal('0.00')
        stockout_items = 0
        potential_lost_rev = Decimal('0.00')

        item_breakdowns = []

        for p in products:
            # Baseline daily demand approximated from current stock & reorder
            base_daily = max(Decimal('0.5'), p.min_threshold / Decimal('5.0'))
            sim_daily = base_daily * demand_factor
            
            sim_price = round(p.selling_price * price_factor, 2)
            sim_cost = round(p.cost_price * cost_factor, 2)
            sim_lead_time = max(1, p.lead_time_days + scenario.lead_time_delta_days)

            # 30-day projected sales
            proj_units_30 = sim_daily * Decimal('30')
            line_rev = proj_units_30 * sim_price
            line_cost = proj_units_30 * sim_cost

            # Lead time demand under scenario
            sim_ltd = sim_daily * Decimal(str(sim_lead_time))
            safety_target = sim_daily * Decimal(str(scenario.safety_buffer_days))
            required_rop = sim_ltd + safety_target

            # Stockout risk check
            if p.current_stock < sim_ltd:
                stockout_items += 1
                shortfall = sim_ltd - p.current_stock
                potential_lost_rev += (shortfall * sim_price)

            # Replenishment cash requirement
            reorder_need = max(Decimal('0.00'), required_rop - p.current_stock)
            cash_for_item = reorder_need * sim_cost
            total_cash_needed += cash_for_item

            total_projected_rev += line_rev
            total_projected_cost += line_cost

            if len(item_breakdowns) < 15:
                item_breakdowns.append({
                    'product_name': p.name,
                    'sku': p.sku,
                    'baseline_stock': float(p.current_stock),
                    'simulated_lead_time': sim_lead_time,
                    'projected_30d_demand': float(round(proj_units_30, 1)),
                    'stockout_risk': p.current_stock < sim_ltd,
                    'suggested_reorder_cash': float(round(cash_for_item, 2))
                })

        # Apply budget limit cap if set
        if scenario.procurement_budget_limit and scenario.procurement_budget_limit > 0:
            if total_cash_needed > scenario.procurement_budget_limit:
                budget_shortfall = total_cash_needed - scenario.procurement_budget_limit
                # Additional potential lost revenue due to budget constraints
                potential_lost_rev += (budget_shortfall * Decimal('1.3'))

        gross_profit = total_projected_rev - total_projected_cost
        margin_pct = round((gross_profit / total_projected_rev * 100), 2) if total_projected_rev > 0 else Decimal('0.00')

        scenario.projected_revenue = round(total_projected_rev, 2)
        scenario.projected_margin_pct = margin_pct
        scenario.required_cash = round(total_cash_needed, 2)
        scenario.stockout_risk_count = stockout_items
        scenario.potential_lost_sales = round(potential_lost_rev, 2)
        scenario.simulation_breakdown = {
            'product_sample': item_breakdowns,
            'products_evaluated': products.count(),
            'budget_capped': bool(scenario.procurement_budget_limit and total_cash_needed > scenario.procurement_budget_limit)
        }
        scenario.save()
        return scenario
