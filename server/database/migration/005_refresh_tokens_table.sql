CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,

    token_hash VARCHAR(255) NOT NULL,
    session_id UUID REFERENCES user_sessions(id),

    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    is_revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rt_users ON refresh_tokens(user_id);
CREATE INDEX idx_rt_tokens ON refresh_tokens(token_hash);
CREATE INDEX idx_rt_expires ON refresh_tokens(expires_at);