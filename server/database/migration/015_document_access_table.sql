CREATE TABLE document_access(
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    granted_by UUID REFERENCES users(id),
    document_id UUID REFERENCES documents(id),
    permissions VARCHAR(30) DEFAULT 'VIEW' NOT NULL,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_da_user ON document_access(user_id);
CREATE INDEX idx_da_granted_by ON document_access(granted_by);
CREATE INDEX idx_da_document ON document_access(document_id);
CREATE INDEX idx_da_expires_at ON document_access(expires_at);