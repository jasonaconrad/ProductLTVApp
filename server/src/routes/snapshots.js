import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db.js';

const router = Router();

const DIFF_FIELDS = [
  'status', 'fy26_target', 'fy27_target', 'progress_metric', 'target_launch',
  'forecast_launch', 'target_progress', 'actual_progress', 'ramp_pct', 'confidence_score', 'owner',
];

router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT snapshot_id, snapshot_label, snapshot_date, created_by, COUNT(*) AS initiative_count
    FROM snapshots
    GROUP BY snapshot_id
    ORDER BY snapshot_date DESC
  `).all();
  res.json(rows);
});

router.post('/', (req, res) => {
  const { label, created_by } = req.body || {};
  if (!label) return res.status(400).json({ error: 'label is required' });

  const snapshotId = uuidv4();

  const rows = db.prepare(`
    SELECT i.id AS initiative_id, i.name AS initiative_name, i.platform, i.segment, i.status, i.fy,
           i.rev_type, i.owner, i.fy26_target, i.fy27_target, i.pepm, i.progress_metric, i.notes,
           p.target_launch, p.forecast_launch, p.target_progress, p.actual_progress, p.ramp_pct, p.confidence_score
    FROM initiatives i
    LEFT JOIN pipeline_fields p ON p.initiative_id = i.id
  `).all();

  const insert = db.prepare(`
    INSERT INTO snapshots (
      snapshot_id, snapshot_label, snapshot_date, created_by,
      initiative_id, initiative_name, platform, segment, status, fy, rev_type, owner,
      fy26_target, fy27_target, pepm, progress_metric, notes,
      target_launch, forecast_launch, target_progress, actual_progress, ramp_pct, confidence_score
    ) VALUES (
      @snapshot_id, @snapshot_label, datetime('now'), @created_by,
      @initiative_id, @initiative_name, @platform, @segment, @status, @fy, @rev_type, @owner,
      @fy26_target, @fy27_target, @pepm, @progress_metric, @notes,
      @target_launch, @forecast_launch, @target_progress, @actual_progress, @ramp_pct, @confidence_score
    )
  `);

  const txn = db.transaction(() => {
    for (const row of rows) {
      insert.run({ ...row, snapshot_id: snapshotId, snapshot_label: label, created_by: created_by || null });
    }
  });
  txn();

  const meta = db.prepare(`
    SELECT snapshot_id, snapshot_label, snapshot_date, created_by, COUNT(*) AS initiative_count
    FROM snapshots WHERE snapshot_id = ? GROUP BY snapshot_id
  `).get(snapshotId);

  res.status(201).json(meta);
});

router.get('/compare', (req, res) => {
  const { a, b } = req.query;
  if (!a || !b) return res.status(400).json({ error: 'Query params a and b (snapshot ids) are required' });

  const metaA = db.prepare('SELECT snapshot_label, snapshot_date FROM snapshots WHERE snapshot_id = ? LIMIT 1').get(a);
  const metaB = db.prepare('SELECT snapshot_label, snapshot_date FROM snapshots WHERE snapshot_id = ? LIMIT 1').get(b);
  if (!metaA) return res.status(404).json({ error: `Snapshot ${a} not found` });
  if (!metaB) return res.status(404).json({ error: `Snapshot ${b} not found` });

  const rowsA = db.prepare('SELECT * FROM snapshots WHERE snapshot_id = ?').all(a);
  const rowsB = db.prepare('SELECT * FROM snapshots WHERE snapshot_id = ?').all(b);

  const mapA = new Map(rowsA.map((r) => [r.initiative_id, r]));
  const mapB = new Map(rowsB.map((r) => [r.initiative_id, r]));

  const newInitiatives = [];
  const removedInitiatives = [];
  const changed = [];
  const unchanged = [];

  for (const [id, rowB] of mapB) {
    const rowA = mapA.get(id);
    if (!rowA) {
      newInitiatives.push({ initiative_id: id, name: rowB.initiative_name });
      continue;
    }

    const changes = [];
    for (const field of DIFF_FIELDS) {
      if (rowA[field] !== rowB[field]) {
        changes.push({ field, from: rowA[field], to: rowB[field] });
      }
    }

    if (changes.length > 0) {
      changed.push({ initiative_id: id, name: rowB.initiative_name, changes });
    } else {
      unchanged.push({ initiative_id: id, name: rowB.initiative_name });
    }
  }

  for (const [id, rowA] of mapA) {
    if (!mapB.has(id)) {
      removedInitiatives.push({ initiative_id: id, name: rowA.initiative_name });
    }
  }

  res.json({
    snapshotA: { label: metaA.snapshot_label, date: metaA.snapshot_date },
    snapshotB: { label: metaB.snapshot_label, date: metaB.snapshot_date },
    new_initiatives: newInitiatives,
    removed_initiatives: removedInitiatives,
    changed,
    unchanged,
  });
});

router.get('/:snapshotId', (req, res) => {
  const rows = db.prepare('SELECT * FROM snapshots WHERE snapshot_id = ? ORDER BY initiative_id').all(req.params.snapshotId);
  if (rows.length === 0) return res.status(404).json({ error: 'Snapshot not found' });
  res.json(rows);
});

router.delete('/:snapshotId', (req, res) => {
  const result = db.prepare('DELETE FROM snapshots WHERE snapshot_id = ?').run(req.params.snapshotId);
  if (result.changes === 0) return res.status(404).json({ error: 'Snapshot not found' });
  res.status(204).end();
});

export default router;
