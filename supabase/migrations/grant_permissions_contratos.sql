-- Grant permissions for contratos table
GRANT ALL PRIVILEGES ON contratos TO authenticated;
GRANT SELECT ON contratos TO anon;

-- Grant permissions for related tables
GRANT ALL PRIVILEGES ON unidades TO authenticated;
GRANT SELECT ON unidades TO anon;

GRANT ALL PRIVILEGES ON projetos TO authenticated;
GRANT SELECT ON projetos TO anon;

-- Grant permissions for sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;