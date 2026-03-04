CREATE TABLE file_versions(
    id UUID PRIMARY KEY,

    document_id UUID REFERENCES documents(id),
    document_file_id UUID REFERENCES document_files(id),

    file_url VARCHAR(500) NOT NULL,
    cloudinary_public_id VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,

    version_number INT DEFAULT 1,
    change_summary VARCHAR(500) NOT NULL,

    is_current BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE INDEX idx_fv_document ON file_versions(document_id);
CREATE INDEX idx_fv_document_file ON file_versions(document_file_id);
CREATE INDEX idx_fv_created_at ON file_versions(created_at);