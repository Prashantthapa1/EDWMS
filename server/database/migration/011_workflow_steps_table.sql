CREATE TABLE workflow_steps (
    id UUID PRIMARY KEY,
    workflow_id UUID REFERENCES workflows(id),

    assigned_to UUID REFERENCES users(id),
    acted_by UUID REFERENCES users(id),
    step_order INT NOT NULL,

    action_taken VARCHAR(30) CHECK (
        action_taken IN (
            'APPROVED', 'REJECTED',
            'REVISION_REQUESTED', 'RESUBMITTED'
        )
    ),

    step_type VARCHAR(50) NOT NULL CHECK (
        step_type IN (
            'SUBMISSION','REVIEW','REVISION',
            'RESUBMISSION','APPROVAL',
            'REJECTION','WITHDRAWAL'
        )
    ),

    status VARCHAR(20) DEFAULT 'PENDING' CHECK (
        status IN ('PENDING','COMPLETED','SKIPPED')
    ),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_ws_workflow ON workflow_steps(workflow_id);
CREATE INDEX idx_ws_assigned ON workflow_steps(assigned_to, status);
CREATE INDEX idx_ws_order ON workflow_steps(workflow_id, step_order);