CREATE TABLE workflows (
    id UUID PRIMARY KEY,

    document_id UUID REFERENCES documents(id),
    submitted_by UUID REFERENCES users(id),
    reviewer_id UUID REFERENCES users(id),
    manager_id UUID REFERENCES users(id),
    
    current_step VARCHAR(25) DEFAULT 'SUBMITTED' NOT NULL CHECK (
        current_step IN (
            'SUBMITTED', 'UNDER_REVIEW',      
            'REVIEWED', 'APPROVED', 'REJECTED', 
            'REVISION_REQUESTED', 'WITHDRAWN'
        )
    ),

    priority VARCHAR(10) DEFAULT 'MEDIUM', 
    submission_note TEXT,

    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    decided_at TIMESTAMPTZ,

    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE INDEX idx_wf_document ON workflows(document_id);
CREATE INDEX idx_wf_submitted_by ON workflows(submitted_by);
CREATE INDEX idx_wf_reviewer ON workflows(reviewer_id);
CREATE INDEX idx_wf_manager ON workflows(manager_id);
CREATE INDEX idx_wf_submitted_at ON workflows(submitted_at DESC);