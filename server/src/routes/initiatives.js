import { Router } from 'express';
import { db } from '../db.js';
import { computeConfidence } from '../confidence.js';

const router = Router();

const INITIATIVE_FIELDS = ['name', 'platform', 'segment', 'status', 'fy', 'rev_type', 'owner', 'fy26_target', 'fy27_target', 'fy28_target', 'pepm', 'progress_metric', 'notes', 'corporate_blue_chip', 'product_initiative', 'commercialization_owner', 'product_ops_owner', 'market_team', 'related_links', 'expected_launch_quarter'];
const PIPELINE_FIELDS = ['target_launch', 'forecast_launch', 'target_progress', 'actual_progress', 'ramp_pct'];

function getJoined(id) {
  return db.prepare(`
    SELECT i.*, p.target_launch, p.forecast_launch, p.target_progress, p.actual_progress,
           p.ramp_pct, p.confidence_score, p.updated_by AS pipeline_updated_by, p.updated_at AS pipeline_updated_at
    FROM initiatives i
    LEFT JOIN pipeline_fields p ON p.initiative_id = i.id
    WHERE i.id = ?
  `).get(id);
}

router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT i.*, p.target_launch, p.forecast_launch, p.target_progress, p.actual_progress,
           p.ramp_pct, p.confidence_score, p.updated_by AS pipeline_updated_by, p.updated_at AS pipeline_updated_at
    FROM initiatives i
    LEFT JOIN pipeline_fields p ON p.initiative_id = i.id
    ORDER BY i.id
  `).all();
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const initiative = getJoined(req.params.id);
  if (!initiative) return res.status(404).json({ error: 'Initiative not found' });
  const actuals = db.prepare('SELECT * FROM actuals_log WHERE initiative_id = ? ORDER BY period').all(req.params.id);
  res.json({ ...initiative, actuals });
});

router.post('/', (req, res) => {
  const body = req.body || {};
  if (!body.name || !body.platform || !body.fy) {
    return res.status(400).json({ error: 'name, platform, and fy are required' });
  }

  const insertTxn = db.transaction(() => {
    const result = db.prepare(`
      INSERT INTO initiatives (name, platform, segment, status, fy, rev_type, owner, fy26_target, fy27_target, fy28_target, pepm, progress_metric, notes, corporate_blue_chip, product_initiative, commercialization_owner, product_ops_owner, market_team, related_links, expected_launch_quarter)
      VALUES (@name, @platform, @segment, @status, @fy, @rev_type, @owner, @fy26_target, @fy27_target, @fy28_target, @pepm, @progress_metric, @notes, @corporate_blue_chip, @product_initiative, @commercialization_owner, @product_ops_owner, @market_team, @related_links, @expected_launch_quarter)
    `).run({
      name: body.name,
      platform: body.platform,
      segment: body.segment || null,
      status: body.status || 'Consideration',
      fy: body.fy,
      rev_type: body.rev_type || null,
      owner: body.owner || null,
      fy26_target: body.fy26_target || 0,
      fy27_target: body.fy27_target || 0,
      fy28_target: body.fy28_target || 0,
      pepm: body.pepm || 0,
      progress_metric: body.progress_metric || 'enablement',
      notes: body.notes || null,
      corporate_blue_chip: body.corporate_blue_chip || null,
      product_initiative: body.product_initiative || null,
      commercialization_owner: body.commercialization_owner || null,
      product_ops_owner: body.product_ops_owner || null,
      market_team: body.market_team || null,
      related_links: body.related_links || null,
      expected_launch_quarter: body.expected_launch_quarter || null,
    });

    const id = result.lastInsertRowid;
    const { score } = computeConfidence({
      status: body.status || 'Consideration',
      targetLaunch: null,
      forecastLaunch: null,
      targetProgress: 0,
      actualProgress: 0,
      rampPct: 0,
    });

    db.prepare(`
      INSERT INTO pipeline_fields (initiative_id, confidence_score, updated_by)
      VALUES (?, ?, ?)
    `).run(id, score, body.owner || null);

    return id;
  });

  const id = insertTxn();
  res.status(201).json(getJoined(id));
});

router.post('/:id/clone', (req, res) => {
  const source = db.prepare('SELECT * FROM initiatives WHERE id = ?').get(req.params.id);
  if (!source) return res.status(404).json({ error: 'Initiative not found' });

  const cloneTxn = db.transaction(() => {
    const result = db.prepare(`
      INSERT INTO initiatives (name, platform, segment, status, fy, rev_type, owner, fy26_target, fy27_target, fy28_target, pepm, progress_metric, notes, corporate_blue_chip, product_initiative, commercialization_owner, product_ops_owner, market_team, related_links, expected_launch_quarter)
      VALUES (@name, @platform, @segment, 'Consideration', @fy, @rev_type, @owner, @fy26_target, @fy27_target, @fy28_target, @pepm, @progress_metric, @notes, @corporate_blue_chip, @product_initiative, @commercialization_owner, @product_ops_owner, @market_team, @related_links, @expected_launch_quarter)
    `).run({
      name: `${source.name} (Copy)`,
      platform: source.platform,
      segment: source.segment,
      fy: source.fy,
      rev_type: source.rev_type,
      owner: source.owner,
      fy26_target: source.fy26_target,
      fy27_target: source.fy27_target,
      fy28_target: source.fy28_target,
      pepm: source.pepm,
      progress_metric: source.progress_metric,
      notes: source.notes,
      corporate_blue_chip: source.corporate_blue_chip,
      product_initiative: source.product_initiative,
      commercialization_owner: source.commercialization_owner,
      product_ops_owner: source.product_ops_owner,
      market_team: source.market_team,
      related_links: source.related_links,
      expected_launch_quarter: source.expected_launch_quarter,
    });

    const id = result.lastInsertRowid;
    const { score } = computeConfidence({
      status: 'Consideration',
      targetLaunch: null,
      forecastLaunch: null,
      targetProgress: 0,
      actualProgress: 0,
      rampPct: 0,
    });

    db.prepare(`
      INSERT INTO pipeline_fields (initiative_id, confidence_score, updated_by)
      VALUES (?, ?, ?)
    `).run(id, score, null);

    return id;
  });

  const id = cloneTxn();
  res.status(201).json(getJoined(id));
});

router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT id FROM initiatives WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Initiative not found' });

  const deleteTxn = db.transaction(() => {
    db.prepare('DELETE FROM actuals_log WHERE initiative_id = ?').run(req.params.id);
    db.prepare('DELETE FROM pipeline_fields WHERE initiative_id = ?').run(req.params.id);
    db.prepare('DELETE FROM initiatives WHERE id = ?').run(req.params.id);
  });
  deleteTxn();

  res.status(204).end();
});

router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM initiatives WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Initiative not found' });

  const body = req.body || {};
  const merged = { ...existing, ...Object.fromEntries(INITIATIVE_FIELDS.filter((f) => f in body).map((f) => [f, body[f]])) };

  db.prepare(`
    UPDATE initiatives SET
      name = @name, platform = @platform, segment = @segment, status = @status, fy = @fy,
      rev_type = @rev_type, owner = @owner, fy26_target = @fy26_target, fy27_target = @fy27_target,
      fy28_target = @fy28_target, pepm = @pepm, progress_metric = @progress_metric, notes = @notes,
      corporate_blue_chip = @corporate_blue_chip, product_initiative = @product_initiative,
      commercialization_owner = @commercialization_owner, product_ops_owner = @product_ops_owner,
      market_team = @market_team, related_links = @related_links, expected_launch_quarter = @expected_launch_quarter,
      updated_at = datetime('now')
    WHERE id = @id
  `).run({ ...merged, id: req.params.id });

  res.json(getJoined(req.params.id));
});

router.put('/:id/pipeline', (req, res) => {
  const initiative = db.prepare('SELECT * FROM initiatives WHERE id = ?').get(req.params.id);
  if (!initiative) return res.status(404).json({ error: 'Initiative not found' });

  const existingPipeline = db.prepare('SELECT * FROM pipeline_fields WHERE initiative_id = ?').get(req.params.id) || {};
  const body = req.body || {};

  const status = body.status !== undefined ? body.status : initiative.status;
  if (body.status !== undefined && body.status !== initiative.status) {
    db.prepare(`UPDATE initiatives SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(body.status, req.params.id);
  }

  const merged = { ...existingPipeline, ...Object.fromEntries(PIPELINE_FIELDS.filter((f) => f in body).map((f) => [f, body[f]])) };

  const { score } = computeConfidence({
    status,
    targetLaunch: merged.target_launch || null,
    forecastLaunch: merged.forecast_launch || null,
    targetProgress: merged.target_progress,
    actualProgress: merged.actual_progress,
    rampPct: merged.ramp_pct,
  });

  db.prepare(`
    INSERT INTO pipeline_fields (initiative_id, target_launch, forecast_launch, target_progress, actual_progress, ramp_pct, confidence_score, updated_by, updated_at)
    VALUES (@initiative_id, @target_launch, @forecast_launch, @target_progress, @actual_progress, @ramp_pct, @confidence_score, @updated_by, datetime('now'))
    ON CONFLICT(initiative_id) DO UPDATE SET
      target_launch = excluded.target_launch,
      forecast_launch = excluded.forecast_launch,
      target_progress = excluded.target_progress,
      actual_progress = excluded.actual_progress,
      ramp_pct = excluded.ramp_pct,
      confidence_score = excluded.confidence_score,
      updated_by = excluded.updated_by,
      updated_at = datetime('now')
  `).run({
    initiative_id: req.params.id,
    target_launch: merged.target_launch || null,
    forecast_launch: merged.forecast_launch || null,
    target_progress: merged.target_progress || 0,
    actual_progress: merged.actual_progress || 0,
    ramp_pct: merged.ramp_pct || 0,
    confidence_score: score,
    updated_by: body.updated_by || null,
  });

  res.json(getJoined(req.params.id));
});

router.get('/:id/actuals', (req, res) => {
  const rows = db.prepare('SELECT * FROM actuals_log WHERE initiative_id = ? ORDER BY period').all(req.params.id);
  res.json(rows);
});

router.put('/:id/actuals', (req, res) => {
  const initiative = db.prepare('SELECT id FROM initiatives WHERE id = ?').get(req.params.id);
  if (!initiative) return res.status(404).json({ error: 'Initiative not found' });

  const { period, target_rev = 0, actual_rev = 0, progress_actual = 0, entered_by = null } = req.body || {};
  if (!period) return res.status(400).json({ error: 'period is required' });

  db.prepare(`
    INSERT INTO actuals_log (initiative_id, period, target_rev, actual_rev, progress_actual, entered_by)
    VALUES (@initiative_id, @period, @target_rev, @actual_rev, @progress_actual, @entered_by)
    ON CONFLICT(initiative_id, period) DO UPDATE SET
      target_rev = excluded.target_rev,
      actual_rev = excluded.actual_rev,
      progress_actual = excluded.progress_actual,
      entered_by = excluded.entered_by,
      entered_at = datetime('now')
  `).run({ initiative_id: req.params.id, period, target_rev, actual_rev, progress_actual, entered_by });

  const rows = db.prepare('SELECT * FROM actuals_log WHERE initiative_id = ? ORDER BY period').all(req.params.id);
  res.json(rows);
});

export default router;
