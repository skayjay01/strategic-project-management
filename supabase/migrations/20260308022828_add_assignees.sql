ALTER TABLE project_cards ADD COLUMN IF NOT EXISTS assignees text[] DEFAULT '{}';
