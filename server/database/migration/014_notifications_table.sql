CREATE TABLE notifications(
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(15) NOT NULL,
    reference_type VARCHAR(20),
    reference_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notif_user ON notifications(user_id);
CREATE INDEX idx_notif_unread ON notifications(user_id) WHERE is_read = FALSE;
CREATE INDEX idx_notif_type ON notifications(type);
CREATE INDEX idx_notif_created_at ON notifications(user_id, created_at DESC);