-- create-reports-db.sql

-- Note: Ensure PRAGMA foreign_keys = ON; is executed at runtime when connecting to the database.

-- Roles table for authorization
CREATE TABLE IF NOT EXISTS roles (
    role_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

-- Reports table storing the main metadata and SQL query
CREATE TABLE IF NOT EXISTS reports (
    report_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    connection TEXT NOT NULL,
    query_sql TEXT NOT NULL,
    created_at INTEGER DEFAULT (cast(strftime('%s','now') as integer)),
    updated_at INTEGER DEFAULT (cast(strftime('%s','now') as integer))
);

-- Mapping table for Reports and Roles (Many-to-Many)
CREATE TABLE IF NOT EXISTS role_reports (
    report_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    PRIMARY KEY (report_id, role_id),
    FOREIGN KEY (report_id) REFERENCES reports(report_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
);

-- Index for the child side of the foreign key to speed up joins/cascades
CREATE INDEX IF NOT EXISTS idx_role_reports_role_id ON role_reports(role_id);

-- Inputs table representing FormlyFieldConfig properties for SQL parameters
CREATE TABLE IF NOT EXISTS inputs (
    input_id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL, -- The parameter name in SQL (e.g., 'startDate')
    type TEXT NOT NULL DEFAULT 'input', -- The Formly type (e.g., 'input', 'select', 'checkbox')
    label TEXT, -- props.label
    placeholder TEXT, -- props.placeholder
    required INTEGER DEFAULT 0 CHECK (required IN (0, 1)), -- props.required (0 for false, 1 for true)
    options_json TEXT, -- JSON representation of props.options (for selects/radios)
    default_value TEXT -- helpful default for the parameter
);

-- Mapping table for Reports and Inputs (Many-to-Many)
CREATE TABLE IF NOT EXISTS report_inputs (
    report_id INTEGER NOT NULL,
    input_id INTEGER NOT NULL,
    sort_order INTEGER DEFAULT 0, -- Useful for rendering order in the UI
    PRIMARY KEY (report_id, input_id),
    FOREIGN KEY (report_id) REFERENCES reports(report_id) ON DELETE CASCADE,
    FOREIGN KEY (input_id) REFERENCES inputs(input_id) ON DELETE CASCADE
);

-- Index for the child side of the foreign key
CREATE INDEX IF NOT EXISTS idx_report_inputs_input_id ON report_inputs(input_id);

-- Log Events lookup table
CREATE TABLE IF NOT EXISTS log_events (
    event_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

-- Logs table for auditing and tracking
CREATE TABLE IF NOT EXISTS logs (
    log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    user_id TEXT NOT NULL, -- Storing the OIDC subject (sub) or similar identifier
    created_date_unix INTEGER DEFAULT (cast(strftime('%s','now') as integer)),
    message TEXT,
    FOREIGN KEY (event_id) REFERENCES log_events(event_id) ON DELETE RESTRICT
);

-- Index for the foreign key
CREATE INDEX IF NOT EXISTS idx_logs_event_id ON logs(event_id);
