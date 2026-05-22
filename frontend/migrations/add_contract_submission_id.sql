-- Migration: Add contract_submission_id column to submissions table
-- This allows us to store the smart contract's submission ID separately from the database primary key

ALTER TABLE submissions 
ADD COLUMN contract_submission_id INTEGER;

-- Add a comment to explain the column
COMMENT ON COLUMN submissions.contract_submission_id IS 'ID from smart contract - separate from database primary key to avoid conflicts across pools'; 