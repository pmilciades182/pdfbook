-- PDF Book Editor Database Schema v1.0.0
-- SQLite database schema for local desktop application

-- Application configuration and settings
CREATE TABLE app_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Projects (books) - main workspace entities
CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    file_path TEXT, -- path to .pdfbook file
    page_format TEXT DEFAULT 'A4',
    page_orientation TEXT DEFAULT 'portrait',
    margins TEXT DEFAULT '{"top":20,"bottom":20,"left":20,"right":20}',
    color_palette_id INTEGER,
    word_count INTEGER DEFAULT 0,
    page_count INTEGER DEFAULT 0,
    last_export_path TEXT, -- last export location
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (color_palette_id) REFERENCES color_palettes(id)
);

-- Document pages with HTML/CSS content
CREATE TABLE pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    page_number INTEGER NOT NULL,
    name TEXT DEFAULT 'Page',
    html_content TEXT DEFAULT '',
    css_styles TEXT DEFAULT '',
    template_id INTEGER,
    page_config TEXT DEFAULT '{}', -- JSON configuration
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES templates(id)
);

-- Binary assets (images, fonts, etc.) stored as BLOB
CREATE TABLE assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size INTEGER,
    file_data BLOB NOT NULL,
    width INTEGER,
    height INTEGER,
    thumbnail BLOB, -- small preview image
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Template system for reusable page layouts
CREATE TABLE templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    html_template TEXT NOT NULL,
    css_template TEXT NOT NULL,
    preview_image BLOB,
    is_builtin BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Color palettes for consistent theming
CREATE TABLE color_palettes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    colors TEXT NOT NULL, -- JSON array of colors
    theme_type TEXT DEFAULT 'custom',
    is_default BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Project version history for backup/restore
CREATE TABLE project_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    version_number INTEGER NOT NULL,
    description TEXT DEFAULT 'Auto-save',
    data_snapshot TEXT, -- JSON snapshot of project data
    file_size INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Performance indexes
CREATE INDEX idx_projects_last_accessed ON projects(last_accessed DESC);
CREATE INDEX idx_projects_updated_at ON projects(updated_at DESC);
CREATE INDEX idx_pages_project_id ON pages(project_id);
CREATE INDEX idx_pages_page_number ON pages(project_id, page_number);
CREATE INDEX idx_assets_project_id ON assets(project_id);
CREATE INDEX idx_assets_mime_type ON assets(mime_type);
CREATE INDEX idx_versions_project_id ON project_versions(project_id, created_at DESC);
CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_builtin ON templates(is_builtin);

-- Insert default application settings
INSERT INTO app_settings (key, value) VALUES 
    ('schema_version', '1.0.0'),
    ('auto_save_interval', '30000'),
    ('max_backup_versions', '10'),
    ('default_page_format', 'A4'),
    ('default_page_orientation', 'portrait'),
    ('app_first_run', 'true');

-- Insert default color palettes
INSERT INTO color_palettes (name, description, colors, theme_type, is_default) VALUES 
    ('Classic', 'Traditional black and white palette', '["#000000", "#FFFFFF", "#666666", "#CCCCCC"]', 'classic', TRUE),
    ('Modern', 'Contemporary design palette', '["#2563EB", "#1E40AF", "#F8FAFC", "#E2E8F0", "#64748B"]', 'modern', FALSE),
    ('Vintage', 'Retro book styling', '["#8B4513", "#DEB887", "#F5F5DC", "#D2B48C", "#A0522D"]', 'vintage', FALSE),
    ('Nature', 'Earth-inspired colors', '["#22C55E", "#16A34A", "#FEF3C7", "#84CC16", "#365314"]', 'nature', FALSE);

-- Insert default templates
INSERT INTO templates (name, category, html_template, css_template, is_builtin, description) VALUES 
    ('Blank Page', 'general', '<div class="page-content"></div>', '.page-content { padding: 2rem; min-height: 100%; }', TRUE, 'Empty page for custom content'),
    ('Title Page', 'cover', '<div class="title-page"><h1 class="book-title">Book Title</h1><h2 class="book-author">Author Name</h2></div>', '.title-page { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; text-align: center; } .book-title { font-size: 3rem; margin-bottom: 2rem; } .book-author { font-size: 1.5rem; color: #666; }', TRUE, 'Standard book title page'),
    ('Chapter Header', 'content', '<div class="chapter"><h1 class="chapter-title">Chapter Title</h1><div class="chapter-content"></div></div>', '.chapter { padding: 3rem 2rem; } .chapter-title { font-size: 2.5rem; margin-bottom: 2rem; border-bottom: 2px solid #000; padding-bottom: 1rem; } .chapter-content { line-height: 1.6; }', TRUE, 'Chapter beginning with title'),
    ('Two Column', 'content', '<div class="two-column"><div class="column-left"></div><div class="column-right"></div></div>', '.two-column { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; padding: 2rem; height: 100%; } .column-left, .column-right { overflow: hidden; }', TRUE, 'Two-column layout for text and images');