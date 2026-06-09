-- Add tracking_data JSONB column to quote_requests table to store order tracking workflow state
ALTER TABLE quote_requests ADD COLUMN tracking_data JSONB DEFAULT '{}'::jsonb;
