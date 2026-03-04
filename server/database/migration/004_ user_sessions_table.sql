CREATE TABLE user_sessions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),

    device_info VARCHAR(500),
    ip_address VARCHAR(45) NOT NULL,

    is_active BOOLEAN DEFAULT TRUE,
    last_active_at TIMESTAMPTZ,

    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_sessions ON user_sessions(user_id);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at); 