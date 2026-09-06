-- ============================================================
-- EVENTO DASHBOARD - DATABASE SCHEMA (Supabase / PostgreSQL)
-- Run this in the Supabase SQL Editor.
-- Uses BIGSERIAL for auto-incrementing IDs.
-- Uses UUID for created_by (matches Supabase Auth).
-- Includes RLS Policies to secure company data.
-- ============================================================

-- 1. Ensure the tables exist (IF NOT EXISTS prevents errors on re-runs)
CREATE TABLE IF NOT EXISTS public.events (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    client TEXT NOT NULL,
    date TEXT NOT NULL,
    venue TEXT NOT NULL,
    status TEXT DEFAULT 'Upcoming',
    created_by UUID REFERENCES auth.users(id) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.vendors (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    contact TEXT NOT NULL,
    phone TEXT NOT NULL,
    price TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.tasks (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo',
    assigned_to TEXT,
    event_id BIGINT,
    created_by UUID REFERENCES auth.users(id) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.budgets (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT,
    category TEXT NOT NULL,
    estimated NUMERIC NOT NULL,
    actual NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'Not Paid',
    created_by UUID REFERENCES auth.users(id) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.run_sheets (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT,
    timeline TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id) NOT NULL
);

-- 2. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.run_sheets ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies for Events
DROP POLICY IF EXISTS "Users can view their own events" ON public.events;
DROP POLICY IF EXISTS "Users can insert their own events" ON public.events;
DROP POLICY IF EXISTS "Users can update their own events" ON public.events;
DROP POLICY IF EXISTS "Users can delete their own events" ON public.events;

CREATE POLICY "Users can view their own events" ON public.events FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Users can insert their own events" ON public.events FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own events" ON public.events FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own events" ON public.events FOR DELETE USING (auth.uid() = created_by);

-- 4. Create RLS Policies for Vendors
DROP POLICY IF EXISTS "Users can view their own vendors" ON public.vendors;
DROP POLICY IF EXISTS "Users can insert their own vendors" ON public.vendors;
DROP POLICY IF EXISTS "Users can update their own vendors" ON public.vendors;
DROP POLICY IF EXISTS "Users can delete their own vendors" ON public.vendors;

CREATE POLICY "Users can view their own vendors" ON public.vendors FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Users can insert their own vendors" ON public.vendors FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own vendors" ON public.vendors FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own vendors" ON public.vendors FOR DELETE USING (auth.uid() = created_by);

-- 5. Create RLS Policies for Tasks
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;

CREATE POLICY "Users can view their own tasks" ON public.tasks FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Users can insert their own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own tasks" ON public.tasks FOR DELETE USING (auth.uid() = created_by);

-- 6. Create RLS Policies for Budgets
DROP POLICY IF EXISTS "Users can view their own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can insert their own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can update their own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can delete their own budgets" ON public.budgets;

CREATE POLICY "Users can view their own budgets" ON public.budgets FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Users can insert their own budgets" ON public.budgets FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own budgets" ON public.budgets FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own budgets" ON public.budgets FOR DELETE USING (auth.uid() = created_by);

-- 7. Create RLS Policies for Run-Sheets
DROP POLICY IF EXISTS "Users can view their own run sheets" ON public.run_sheets;
DROP POLICY IF EXISTS "Users can insert their own run sheets" ON public.run_sheets;
DROP POLICY IF EXISTS "Users can update their own run sheets" ON public.run_sheets;
DROP POLICY IF EXISTS "Users can delete their own run sheets" ON public.run_sheets;

CREATE POLICY "Users can view their own run sheets" ON public.run_sheets FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Users can insert their own run sheets" ON public.run_sheets FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own run sheets" ON public.run_sheets FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own run sheets" ON public.run_sheets FOR DELETE USING (auth.uid() = created_by);