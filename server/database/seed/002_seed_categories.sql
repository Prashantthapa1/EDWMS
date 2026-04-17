
INSERT INTO categories (id, name, description, is_active, created_at, updated_at) VALUES
    ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Contracts', 'Legal contracts and agreements', true, NOW(), NOW()),
    ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Invoices', 'Financial invoices and bills', true, NOW(), NOW()),
    ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Reports', 'Business reports and analysis', true, NOW(), NOW()),
    ('d4e5f6a7-b8c9-0123-def1-234567890123', 'Policies', 'Company policies and procedures', true, NOW(), NOW()),
    ('e5f6a7b8-c9d0-1234-ef12-345678901234', 'HR Documents', 'Human resources related documents', true, NOW(), NOW()),
    ('f6a7b8c9-d0e1-2345-f123-456789012345', 'Technical Docs', 'Technical documentation and specifications', true, NOW(), NOW()),
    ('a7b8c9d0-e1f2-3456-0123-567890123456', 'Marketing', 'Marketing materials and campaigns', true, NOW(), NOW()),
    ('b8c9d0e1-f2a3-4567-1234-678901234567', 'Proposals', 'Business proposals and quotations', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
