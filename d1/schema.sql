CREATE TABLE IF NOT EXISTS initiatives (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  platform TEXT NOT NULL CHECK(platform IN ('Flex','Paycor','Both')),
  segment TEXT,
  status TEXT NOT NULL DEFAULT 'Consideration'
    CHECK(status IN ('Consideration','In Progress','Launched','At Scale','Completed')),
  fy TEXT NOT NULL CHECK(fy IN ('FY26','FY27','FY28')),
  rev_type TEXT,
  owner TEXT,
  fy26_target INTEGER DEFAULT 0,
  fy27_target INTEGER DEFAULT 0,
  fy28_target INTEGER DEFAULT 0,
  pepm REAL DEFAULT 0,
  progress_metric TEXT NOT NULL DEFAULT 'enablement'
    CHECK(progress_metric IN ('attach','enablement')),
  notes TEXT,
  corporate_blue_chip TEXT,
  product_initiative TEXT,
  commercialization_owner TEXT,
  product_ops_owner TEXT,
  market_team TEXT,
  related_links TEXT,
  expected_launch_quarter TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pipeline_fields (
  initiative_id INTEGER PRIMARY KEY REFERENCES initiatives(id),
  target_launch TEXT,
  forecast_launch TEXT,
  target_progress REAL DEFAULT 0,
  actual_progress REAL DEFAULT 0,
  ramp_pct REAL DEFAULT 0,
  confidence_score REAL DEFAULT 0,
  updated_by TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS actuals_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  initiative_id INTEGER REFERENCES initiatives(id),
  period TEXT NOT NULL,
  target_rev INTEGER DEFAULT 0,
  actual_rev INTEGER DEFAULT 0,
  progress_actual REAL DEFAULT 0,
  entered_by TEXT,
  entered_at TEXT DEFAULT (datetime('now')),
  UNIQUE(initiative_id, period)
);

CREATE TABLE IF NOT EXISTS snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  snapshot_id TEXT NOT NULL,
  snapshot_label TEXT NOT NULL,
  snapshot_date TEXT NOT NULL,
  created_by TEXT,

  initiative_id INTEGER,
  initiative_name TEXT,
  platform TEXT,
  segment TEXT,
  status TEXT,
  fy TEXT,
  rev_type TEXT,
  owner TEXT,
  fy26_target INTEGER,
  fy27_target INTEGER,
  fy28_target INTEGER,
  pepm REAL,
  progress_metric TEXT,
  notes TEXT,
  corporate_blue_chip TEXT,
  product_initiative TEXT,
  commercialization_owner TEXT,
  product_ops_owner TEXT,
  market_team TEXT,
  related_links TEXT,
  expected_launch_quarter TEXT,

  target_launch TEXT,
  forecast_launch TEXT,
  target_progress REAL,
  actual_progress REAL,
  ramp_pct REAL,
  confidence_score REAL
);
