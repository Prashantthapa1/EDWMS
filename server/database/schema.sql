-- ============================================================
-- EDWMS – Electronic Document & Workflow Management System
-- Full database schema  (single-file, run-once)
-- All UUIDs are generated in the application service layer.
-- ============================================================

-- ────────────────────────────────────────────────
-- 1. ROLES
-- ────────────────────────────────────────────────
CREATE TABLE roles (
    id          UUID        PRIMARY KEY,
    name        VARCHAR(20) UNIQUE NOT NULL
                            DEFAULT 'EMPLOYEE'          -- fixed: was lowercase, must match CHECK
                            CHECK (name IN ('EMPLOYEE','REVIEWER','MANAGER','ADMIN')),
    description TEXT,
    is_active   BOOLEAN     DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────
-- 2. DEPARTMENTS  (manager_id added later via ALTER TABLE)
-- ────────────────────────────────────────────────
CREATE TABLE departments (
    id          UUID        PRIMARY KEY,
    name        VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_active   BOOLEAN     DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
    -- manager_id intentionally omitted here:
    -- departments → users is a circular reference.
    -- Added below via ALTER TABLE after users is created.
);

-- ────────────────────────────────────────────────
-- 3. USERS
-- ────────────────────────────────────────────────
CREATE TABLE users (
    id                   UUID        PRIMARY KEY,
    name                 VARCHAR(100),
    email                VARCHAR(255) UNIQUE NOT NULL,
    password             TEXT        NOT NULL,

    is_active            BOOLEAN     DEFAULT FALSE,

    address              VARCHAR(100),
    phone_number         VARCHAR(15),
    avatar_url           VARCHAR(255),

    role_id              UUID        NOT NULL REFERENCES roles(id),
    dep_id               UUID        REFERENCES departments(id),

    email_verified       BOOLEAN     DEFAULT FALSE,
    email_verified_at    TIMESTAMPTZ,

    password_reset_at    TIMESTAMPTZ,
    failed_login_attempts INT        DEFAULT 0,
    locked_until         TIMESTAMPTZ,

    auth_provider        VARCHAR(20) NOT NULL DEFAULT 'local'
                            CHECK (auth_provider IN ('local','GOOGLE')),  -- fixed: was 'auth_provdier' (typo)
    google_id            VARCHAR(255) UNIQUE,

    created_at           TIMESTAMPTZ DEFAULT NOW(),
    updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for users
CREATE INDEX idx_users_role_id   ON users(role_id);
CREATE INDEX idx_users_dep_id    ON users(dep_id);
CREATE INDEX idx_users_created_at ON users(created_at);

-- ────────────────────────────────────────────────
-- 3b. Add circular FK now that users exists
-- ────────────────────────────────────────────────
ALTER TABLE departments
    ADD COLUMN  manager_id UUID REFERENCES users(id);

-- ────────────────────────────────────────────────
-- 4. USER SESSIONS
-- ────────────────────────────────────────────────
CREATE TABLE user_sessions (
    id            UUID        PRIMARY KEY,
    user_id       UUID        REFERENCES users(id),
    device_info   VARCHAR(500),
    ip_address    VARCHAR(45) NOT NULL,
    is_active     BOOLEAN     DEFAULT TRUE,
    last_active_at TIMESTAMPTZ,
    expires_at    TIMESTAMPTZ,
    created_at    TIMESTAMPTZ DEFAULT NOW()   -- fixed: removed trailing comma
);

CREATE INDEX idx_user_sessions    ON user_sessions(user_id);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);

-- ────────────────────────────────────────────────
-- 5. REFRESH TOKENS
-- ────────────────────────────────────────────────
CREATE TABLE refresh_tokens (
    id          UUID        PRIMARY KEY,
    user_id     UUID        NOT NULL REFERENCES users(id),
    token_hash  VARCHAR(255) NOT NULL,
    session_id  UUID        REFERENCES user_sessions(id),
    ip_address  VARCHAR(45),
    user_agent  VARCHAR(500),
    is_revoked  BOOLEAN     DEFAULT FALSE,
    revoked_at  TIMESTAMPTZ,
    expires_at  TIMESTAMPTZ NOT NULL,
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rt_users   ON refresh_tokens(user_id);
CREATE INDEX idx_rt_tokens  ON refresh_tokens(token_hash);
CREATE INDEX idx_rt_expires ON refresh_tokens(expires_at);

-- ────────────────────────────────────────────────
-- 6. CATEGORIES
-- ────────────────────────────────────────────────
CREATE TABLE categories (
    id          UUID        PRIMARY KEY,
    name        VARCHAR(50) NOT NULL,
    description TEXT,
    is_active   BOOLEAN     DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ             -- fixed: removed trailing comma
);

-- ────────────────────────────────────────────────
-- 7. DOCUMENTS
-- ────────────────────────────────────────────────
CREATE TABLE documents (
    id              UUID        PRIMARY KEY,
    title           VARCHAR(100) NOT NULL,
    description     TEXT,
    priority        VARCHAR(10) DEFAULT 'MEDIUM'
                        CHECK (priority IN ('LOW','MEDIUM','HIGH')),

    created_by      UUID        REFERENCES users(id),       -- fixed: was missing UUID type
    department_id   UUID        REFERENCES departments(id), -- fixed: was missing UUID type
    category_id     UUID        REFERENCES categories(id),  -- fixed: was missing UUID type

    status          VARCHAR(30) NOT NULL DEFAULT 'DRAFT'
                        CHECK (status IN (
                            'DRAFT','SUBMITTED','UNDER_REVIEW',
                            'REVISION','APPROVED','REJECTED'
                        )),
    current_version INT         DEFAULT 1,

    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ,
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_docs_created_by  ON documents(created_by);
CREATE INDEX idx_docs_department  ON documents(department_id);
CREATE INDEX idx_docs_category    ON documents(category_id);
CREATE INDEX idx_docs_priority    ON documents(priority);
CREATE INDEX idx_docs_created_at  ON documents(created_at);

-- ────────────────────────────────────────────────
-- 8. DOCUMENT FILES
-- ────────────────────────────────────────────────
CREATE TABLE document_files (
    id                    UUID        PRIMARY KEY,
    document_id           UUID        REFERENCES documents(id),
    file_name             VARCHAR(255) NOT NULL,
    file_type             VARCHAR(50)  NOT NULL,
    file_size             BIGINT       NOT NULL,
    file_url              VARCHAR(500) NOT NULL,
    cloudinary_public_id  VARCHAR(255) NOT NULL,
    file_extension        VARCHAR(10)  NOT NULL,
    is_primary            BOOLEAN      DEFAULT TRUE,
    created_by            UUID         REFERENCES users(id),
    created_at            TIMESTAMPTZ  DEFAULT NOW()   -- fixed: removed trailing comma
);

CREATE INDEX idx_df_created_by ON document_files(created_by);
CREATE INDEX idx_df_document   ON document_files(document_id);  -- fixed: was missing ON keyword

-- ────────────────────────────────────────────────
-- 9. FILE VERSIONS
-- ────────────────────────────────────────────────
CREATE TABLE file_versions (
    id                   UUID        PRIMARY KEY,
    document_id          UUID        REFERENCES documents(id),
    document_file_id     UUID        REFERENCES document_files(id),
    file_url             VARCHAR(500) NOT NULL,
    cloudinary_public_id VARCHAR(255) NOT NULL,
    file_size            BIGINT       NOT NULL,
    version_number       INT          DEFAULT 1,
    change_summary       VARCHAR(500) NOT NULL,
    is_current           BOOLEAN      DEFAULT TRUE,
    created_at           TIMESTAMPTZ  DEFAULT NOW(),
    updated_at           TIMESTAMPTZ
);

CREATE INDEX idx_fv_document      ON file_versions(document_id);
CREATE INDEX idx_fv_document_file ON file_versions(document_file_id);
CREATE INDEX idx_fv_created_at    ON file_versions(created_at);

-- ────────────────────────────────────────────────
-- 10. WORKFLOWS
-- ────────────────────────────────────────────────
CREATE TABLE workflows (
    id              UUID        PRIMARY KEY,
    document_id     UUID        REFERENCES documents(id),
    submitted_by    UUID        REFERENCES users(id),
    reviewer_id     UUID        REFERENCES users(id),
    manager_id      UUID        REFERENCES users(id),

    current_step    VARCHAR(25) NOT NULL DEFAULT 'SUBMITTED'
                        CHECK (current_step IN (
                            'SUBMITTED','UNDER_REVIEW',
                            'REVIEWED','APPROVED','REJECTED',  -- fixed: was missing comma before REVISION_REQUESTED
                            'REVISION_REQUESTED','WITHDRAWN'
                        )),

    priority        VARCHAR(10) DEFAULT 'MEDIUM',
    submission_note TEXT,

    submitted_at    TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at     TIMESTAMPTZ,
    decided_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),   -- fixed: was missing comma after this line
    updated_at      TIMESTAMPTZ
);

CREATE INDEX idx_wf_document     ON workflows(document_id);
CREATE INDEX idx_wf_submitted_by ON workflows(submitted_by);
CREATE INDEX idx_wf_reviewer     ON workflows(reviewer_id);
CREATE INDEX idx_wf_manager      ON workflows(manager_id);
CREATE INDEX idx_wf_submitted_at ON workflows(submitted_at DESC);  -- fixed: was (submitted_at, DESC)

-- ────────────────────────────────────────────────
-- 11. WORKFLOW STEPS
-- ────────────────────────────────────────────────
CREATE TABLE workflow_steps (
    id           UUID        PRIMARY KEY,
    workflow_id  UUID        REFERENCES workflows(id),
    assigned_to  UUID        REFERENCES users(id),
    acted_by     UUID        REFERENCES users(id),
    step_order   INT         NOT NULL,

    action_taken VARCHAR(30)
                    CHECK (action_taken IN (
                        'APPROVED','REJECTED',
                        'REVISION_REQUESTED','RESUBMITTED'
                    )),

    step_type    VARCHAR(50) NOT NULL
                    CHECK (step_type IN (
                        'SUBMISSION','REVIEW','REVISION',
                        'RESUBMISSION','APPROVAL',
                        'REJECTION','WITHDRAWAL'
                    )),

    status       VARCHAR(20) DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING','COMPLETED','SKIPPED')),

    created_at   TIMESTAMPTZ DEFAULT NOW(),
    started_at   TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_ws_workflow  ON workflow_steps(workflow_id);
CREATE INDEX idx_ws_assigned  ON workflow_steps(assigned_to, status);
CREATE INDEX idx_ws_order     ON workflow_steps(workflow_id, step_order);

-- ────────────────────────────────────────────────
-- 12. WORKFLOW COMMENTS
-- ────────────────────────────────────────────────
CREATE TABLE workflow_comments (
    id               UUID        PRIMARY KEY,
    workflow_id      UUID        NOT NULL REFERENCES workflows(id),
    workflow_step_id UUID        REFERENCES workflow_steps(id),
    user_id          UUID        REFERENCES users(id),
    comment          TEXT        NOT NULL,
    action           VARCHAR(30) NOT NULL,
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    updated_at       TIMESTAMPTZ    -- fixed: removed trailing comma
);

CREATE INDEX idx_wc_workflow   ON workflow_comments(workflow_id);
CREATE INDEX idx_wc_step       ON workflow_comments(workflow_step_id);
CREATE INDEX idx_wc_user       ON workflow_comments(user_id);
CREATE INDEX idx_wc_created_at ON workflow_comments(created_at);

-- ────────────────────────────────────────────────
-- 13. BOOKMARKS
-- ────────────────────────────────────────────────
CREATE TABLE bookmarks (
    id          UUID        PRIMARY KEY,
    user_id     UUID        REFERENCES users(id),
    document_id UUID        REFERENCES documents(id),
    created_at  TIMESTAMPTZ DEFAULT NOW()   -- fixed: was TIMESTAMPTZ NOW() (missing DEFAULT) + trailing comma
);

-- ────────────────────────────────────────────────
-- 14. NOTIFICATIONS
-- ────────────────────────────────────────────────
CREATE TABLE notifications (
    id             UUID        PRIMARY KEY,
    user_id        UUID        REFERENCES users(id),
    title          VARCHAR(255) NOT NULL,
    message        TEXT        NOT NULL,
    type           VARCHAR(15) NOT NULL,
    reference_type VARCHAR(20),
    reference_id   UUID,
    is_read        BOOLEAN     DEFAULT FALSE,
    read_at        TIMESTAMPTZ,
    created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notif_user       ON notifications(user_id);
CREATE INDEX idx_notif_unread     ON notifications(user_id) WHERE is_read = FALSE;
CREATE INDEX idx_notif_type       ON notifications(type);
CREATE INDEX idx_notif_created_at ON notifications(user_id, created_at DESC);

-- ────────────────────────────────────────────────
-- 15. DOCUMENT ACCESS
-- ────────────────────────────────────────────────
CREATE TABLE document_access (
    id          UUID        PRIMARY KEY,
    user_id     UUID        REFERENCES users(id),
    granted_by  UUID        REFERENCES users(id),
    document_id UUID        REFERENCES documents(id),
    permissions VARCHAR(30) NOT NULL DEFAULT 'VIEW',
    expires_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ DEFAULT NOW()   -- fixed: was TIMESTAMPTZ NOW() (missing DEFAULT)
);

CREATE INDEX idx_da_user       ON document_access(user_id);
CREATE INDEX idx_da_granted_by ON document_access(granted_by);
CREATE INDEX idx_da_document   ON document_access(document_id);
CREATE INDEX idx_da_expires_at ON document_access(expires_at);

-- ────────────────────────────────────────────────
-- 16. AUDIT LOGS
-- ────────────────────────────────────────────────
CREATE TABLE audit_logs (
    id          UUID        PRIMARY KEY,
    user_id     UUID        REFERENCES users(id),

    action      VARCHAR(50) NOT NULL
                    CHECK (action IN (
                        'LOGIN','LOGIN_FAILED','LOGOUT',
                        'REGISTER','PASSWORD_CHANGE',
                        'DOC_CREATE','DOC_VIEW','DOC_EDIT','DOC_DELETE',
                        'DOC_DOWNLOAD','DOC_SUBMIT',
                        'WORKFLOW_REVIEW','WORKFLOW_APPROVE','WORKFLOW_REJECT',
                        'USER_CREATE','USER_EDIT','USER_DEACTIVATE','ROLE_CHANGE'
                    )),

    entity_type VARCHAR(30) NOT NULL
                    CHECK (entity_type IN (
                        'USER','DOCUMENT','WORKFLOW',
                        'DEPARTMENT','CATEGORY','SYSTEM'
                    )),

    entity_id   UUID,
    description TEXT,
    ip_address  VARCHAR(45),
    user_agent  VARCHAR(500),
    metadata    JSONB       DEFAULT '{}'::jsonb,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_user       ON audit_logs(user_id);
CREATE INDEX idx_audit_action     ON audit_logs(action);
CREATE INDEX idx_audit_entity     ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created_at ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_metadata   ON audit_logs USING GIN(metadata);  -- fixed: wrong GIN syntax
