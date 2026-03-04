CREATE TABLE workflow_comments(
    id UUID PRIMARY KEY,
    workflow_id UUID REFERENCES workflows(id) NOT NULL,
    workflow_step_id UUID REFERENCES workflow_steps(id),

    user_id UUID REFERENCES users(id),
    comment TEXT NOT NULL,

    action VARCHAR(30) NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE INDEX idx_wc_workflow ON workflow_comments(workflow_id);
CREATE INDEX idx_wc_step ON workflow_comments(workflow_step_id);
CREATE INDEX idx_wc_user ON workflow_comments(user_id);
CREATE INDEX idx_wc_created_at ON workflow_comments(created_at);