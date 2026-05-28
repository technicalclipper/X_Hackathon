-- Migration: Add chain_id to all on-chain-linked tables for X Layer migration
-- Existing Chiliz Spicy data tagged with 88882; new X Layer Testnet data tagged with 1952

BEGIN;

-- pools table
ALTER TABLE pools ADD COLUMN IF NOT EXISTS chain_id INTEGER NOT NULL DEFAULT 88882;
ALTER TABLE pools ALTER COLUMN chain_id DROP DEFAULT;
CREATE INDEX IF NOT EXISTS idx_pools_chain_id ON pools(chain_id);

-- submissions table
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS chain_id INTEGER NOT NULL DEFAULT 88882;
ALTER TABLE submissions ALTER COLUMN chain_id DROP DEFAULT;
CREATE INDEX IF NOT EXISTS idx_submissions_chain_id ON submissions(chain_id);

-- votes table
ALTER TABLE votes ADD COLUMN IF NOT EXISTS chain_id INTEGER NOT NULL DEFAULT 88882;
ALTER TABLE votes ALTER COLUMN chain_id DROP DEFAULT;
CREATE INDEX IF NOT EXISTS idx_votes_chain_id ON votes(chain_id);

-- nft_mints table
ALTER TABLE nft_mints ADD COLUMN IF NOT EXISTS chain_id INTEGER NOT NULL DEFAULT 88882;
ALTER TABLE nft_mints ALTER COLUMN chain_id DROP DEFAULT;
CREATE INDEX IF NOT EXISTS idx_nft_mints_chain_id ON nft_mints(chain_id);

-- auctions table
ALTER TABLE auctions ADD COLUMN IF NOT EXISTS chain_id INTEGER NOT NULL DEFAULT 88882;
ALTER TABLE auctions ALTER COLUMN chain_id DROP DEFAULT;
CREATE INDEX IF NOT EXISTS idx_auctions_chain_id ON auctions(chain_id);

-- bids table
ALTER TABLE bids ADD COLUMN IF NOT EXISTS chain_id INTEGER NOT NULL DEFAULT 88882;
ALTER TABLE bids ALTER COLUMN chain_id DROP DEFAULT;
CREATE INDEX IF NOT EXISTS idx_bids_chain_id ON bids(chain_id);

-- Verify
SELECT 'pools' AS t, COUNT(*) FROM pools
UNION ALL SELECT 'submissions', COUNT(*) FROM submissions
UNION ALL SELECT 'auctions', COUNT(*) FROM auctions;

COMMIT;
