-- Database Migration: Add current_owner_address to nft_mints table
-- Run this script to update existing databases

-- Step 1: Add the new column
ALTER TABLE nft_mints ADD COLUMN current_owner_address VARCHAR(42);

-- Step 2: Update existing records to set current owner as the original creator
UPDATE nft_mints 
SET current_owner_address = (
  SELECT creator_address 
  FROM submissions 
  WHERE submissions.id = nft_mints.submission_id
);

-- Step 3: Make the column NOT NULL after populating it
ALTER TABLE nft_mints ALTER COLUMN current_owner_address SET NOT NULL;

-- Step 4: Add an index for better query performance
CREATE INDEX idx_nft_mints_current_owner ON nft_mints(current_owner_address);

-- Verify the migration
SELECT 
  COUNT(*) as total_nfts,
  COUNT(current_owner_address) as nfts_with_owner
FROM nft_mints; 