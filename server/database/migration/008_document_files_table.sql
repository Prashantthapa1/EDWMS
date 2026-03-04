CREATE TABLE  document_files(
    id UUID PRIMARY KEY, 

    document_id UUID REFERENCES documents(id),

    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size BIGINT NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    cloudinary_public_id VARCHAR(255) NOT NULL,
    file_extension VARCHAR(10) NOT NULL,

    is_primary BOOLEAN DEFAULT TRUE,

    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_df_created_by ON document_files(created_by);
CREATE INDEX idx_df_document ON document_files(document_id);