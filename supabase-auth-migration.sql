-- Migration to link quote_requests to authenticated users

-- 1. Add user_id column to quote_requests table
ALTER TABLE quote_requests 
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- 2. Update Row Level Security (RLS) policies for quote_requests

-- Drop the existing permissive insert policy if it exists (from supabase-schema.sql)
-- We originally had: CREATE POLICY "Anyone can insert quote requests." ON quote_requests FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone can insert quote requests." ON quote_requests;

-- Allow authenticated users to insert their own quote requests
CREATE POLICY "Users can insert their own quote requests" 
ON quote_requests FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- If you want to keep allowing unauthenticated (guest) requests, you can add this:
-- CREATE POLICY "Guests can insert quote requests" ON quote_requests FOR INSERT WITH CHECK (user_id IS NULL);

-- Allow users to view their own quote requests
CREATE POLICY "Users can view their own quote requests" 
ON quote_requests FOR SELECT 
USING (auth.uid() = user_id);

-- The admin policy for viewing all requests (from supabase-schema.sql) should still be in effect if it's based on admin roles, 
-- but if we want to be safe and ensure admins or the service role can still read all:
-- Note: Service role always bypasses RLS, so Next.js server actions using service_role key will still work.
