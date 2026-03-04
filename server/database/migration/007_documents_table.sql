CREATE TABLE  documents(
    id UUID PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    priority VARCHAR(10) DEFAULT 'MEDIUM' CHECK (
        priority IN (
            'LOW', 'MEDIUM', 'HIGH'
        )
    ),

    created_by UUID REFERENCES users(id),
    department_id UUID REFERENCES departments(id),
    category_id UUID REFERENCES categories(id),

    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT' CHECK (
        status IN (
            'DRAFT' , 'SUBMITTED' , 'UNDER_REVIEW',
            'REVISION' , 'APPROVED' , 'REJECTED'
        )
    ),
    current_version INT DEFAULT 1,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_docs_created_by ON documents(created_by);
CREATE INDEX idx_docs_department ON documents(department_id);
CREATE INDEX idx_docs_category ON documents(category_id);
CREATE INDEX idx_docs_priority ON documents(priority);
CREATE INDEX idx_docs_created_at ON documents(created_at);