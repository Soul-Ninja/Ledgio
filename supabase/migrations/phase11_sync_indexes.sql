-- ==============================================================================
-- Ledgio — Phase 11: Sync Query & Index Optimization (PERF-01)
-- ==============================================================================
-- Idempotent index migration ensuring all synced tables have composite indexes
-- covering user_id + updated_at and user_id + ordering columns.
-- ==============================================================================

-- 1. Budgets: composite index for user sync and updated_at tracking
CREATE INDEX IF NOT EXISTS idx_budgets_user_updated ON public.budgets (user_id, updated_at DESC);

-- 2. Expenses: composite index for initial sync ordering by date
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON public.expenses (user_id, date DESC);

-- 3. Loans: composite index for initial sync ordering by loan_date
CREATE INDEX IF NOT EXISTS idx_loans_user_date ON public.loans (user_id, loan_date DESC);
