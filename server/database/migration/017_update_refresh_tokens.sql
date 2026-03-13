ALTER TABLE refresh_tokens 
    ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();