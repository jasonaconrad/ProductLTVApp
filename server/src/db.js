import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { computeConfidence } from './confidence.js';
import { SEED_INITIATIVES, SEED_ACTUALS } from './seed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'pipeline.db');

export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
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

  target_launch TEXT,
  forecast_launch TEXT,
  target_progress REAL,
  actual_progress REAL,
  ramp_pct REAL,
  confidence_score REAL
);
`);

function migrateSchema() {
  const initiativeColumns = db.prepare("PRAGMA table_info(initiatives)").all();
  const needsFy28 = !initiativeColumns.some((c) => c.name === 'fy28_target');

  if (needsFy28) {
    db.pragma('foreign_keys = OFF');
    const migrateInitiatives = db.transaction(() => {
      db.exec(`
        CREATE TABLE initiatives_new (
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
          created_at TEXT DEFAULT (datetime('now')),
          updated_at TEXT DEFAULT (datetime('now'))
        );
      `);
      db.exec(`
        INSERT INTO initiatives_new
          (id, name, platform, segment, status, fy, rev_type, owner, fy26_target, fy27_target, fy28_target, pepm, progress_metric, notes, created_at, updated_at)
        SELECT id, name, platform, segment, status, fy, rev_type, owner, fy26_target, fy27_target, 0, pepm, progress_metric, notes, created_at, updated_at
        FROM initiatives;
      `);
      db.exec('DROP TABLE initiatives;');
      db.exec('ALTER TABLE initiatives_new RENAME TO initiatives;');
    });
    migrateInitiatives();
    db.pragma('foreign_keys = ON');
    console.log('Migrated initiatives table: added fy28_target, widened fy to include FY28.');
  }

  const snapshotColumns = db.prepare("PRAGMA table_info(snapshots)").all();
  if (!snapshotColumns.some((c) => c.name === 'fy28_target')) {
    db.exec('ALTER TABLE snapshots ADD COLUMN fy28_target INTEGER;');
    console.log('Migrated snapshots table: added fy28_target.');
  }

  const alignmentColumns = ['corporate_blue_chip', 'product_initiative', 'commercialization_owner', 'product_ops_owner'];

  const currentInitiativeColumns = db.prepare("PRAGMA table_info(initiatives)").all().map((c) => c.name);
  for (const col of alignmentColumns) {
    if (!currentInitiativeColumns.includes(col)) {
      db.exec(`ALTER TABLE initiatives ADD COLUMN ${col} TEXT;`);
      console.log(`Migrated initiatives table: added ${col}.`);
    }
  }

  const currentSnapshotColumns = db.prepare("PRAGMA table_info(snapshots)").all().map((c) => c.name);
  for (const col of alignmentColumns) {
    if (!currentSnapshotColumns.includes(col)) {
      db.exec(`ALTER TABLE snapshots ADD COLUMN ${col} TEXT;`);
      console.log(`Migrated snapshots table: added ${col}.`);
    }
  }
}

function seedIfEmpty() {
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM initiatives').get();
  if (count > 0) return;

  const insertInitiative = db.prepare(`
    INSERT INTO initiatives
      (id, name, platform, segment, status, fy, rev_type, owner, fy26_target, fy27_target, pepm, progress_metric, notes)
    VALUES (@id, @name, @platform, @segment, @status, @fy, @rev_type, @owner, @fy26_target, @fy27_target, @pepm, @progress_metric, @notes)
  `);

  const insertPipeline = db.prepare(`
    INSERT INTO pipeline_fields
      (initiative_id, target_launch, forecast_launch, target_progress, actual_progress, ramp_pct, confidence_score, updated_by)
    VALUES (@initiative_id, @target_launch, @forecast_launch, @target_progress, @actual_progress, @ramp_pct, @confidence_score, @updated_by)
  `);

  const insertActual = db.prepare(`
    INSERT INTO actuals_log (initiative_id, period, target_rev, actual_rev, progress_actual, entered_by)
    VALUES (@initiative_id, @period, @target_rev, @actual_rev, @progress_actual, @entered_by)
  `);

  const seedTxn = db.transaction(() => {
    for (const row of SEED_INITIATIVES) {
      const [id, name, platform, segment, status, fy, rev_type, owner,
        fy26_target, fy27_target, pepm, progress_metric, notes,
        target_launch, forecast_launch, target_progress, actual_progress, ramp_pct] = row;

      insertInitiative.run({ id, name, platform, segment, status, fy, rev_type, owner, fy26_target, fy27_target, pepm, progress_metric, notes });

      const { score } = computeConfidence({
        status,
        targetLaunch: target_launch || null,
        forecastLaunch: forecast_launch || null,
        targetProgress: target_progress,
        actualProgress: actual_progress,
        rampPct: ramp_pct,
      });

      insertPipeline.run({
        initiative_id: id,
        target_launch: target_launch || null,
        forecast_launch: forecast_launch || null,
        target_progress,
        actual_progress,
        ramp_pct,
        confidence_score: score,
        updated_by: 'seed',
      });
    }

    for (const [initiative_id, period, target_rev, actual_rev] of SEED_ACTUALS) {
      const target = Number(target_rev) || 0;
      const actual = Number(actual_rev) || 0;
      insertActual.run({
        initiative_id,
        period,
        target_rev: target,
        actual_rev: actual,
        progress_actual: target > 0 ? Math.round((actual / target) * 1000) / 10 : 0,
        entered_by: 'seed',
      });
    }
  });

  seedTxn();
  console.log(`Seeded ${SEED_INITIATIVES.length} initiatives and ${SEED_ACTUALS.length} actuals rows.`);
}

migrateSchema();
seedIfEmpty();
