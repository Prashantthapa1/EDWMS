CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),

    action VARCHAR(50) NOT NULL CHECK (
        action IN (
            'LOGIN','LOGIN_FAILED','LOGOUT',
            'REGISTER','PASSWORD_CHANGE',
            'DOC_CREATE','DOC_VIEW','DOC_EDIT','DOC_DELETE',
            'DOC_DOWNLOAD','DOC_SUBMIT',
            'WORKFLOW_REVIEW','WORKFLOW_APPROVE','WORKFLOW_REJECT',
            'USER_CREATE','USER_EDIT','USER_DEACTIVATE','ROLE_CHANGE'
        )
    ),

    entity_type VARCHAR(30) NOT NULL CHECK (
        entity_type IN (
            'USER','DOCUMENT','WORKFLOW',
            'DEPARTMENT','CATEGORY','SYSTEM'
        )
    ),

    entity_id UUID,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created_at ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_metadata ON audit_logs USING GIN(metadata);