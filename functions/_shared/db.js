import { computeConfidence } from './confidence.js';

const INITIATIVE_FIELDS = ['name', 'platform', 'segment', 'status', 'fy', 'rev_type', 'owner', 'fy26_target', 'fy27_target', 'fy28_target', 'pepm', 'progress_metric', 'notes'];
const PIPELINE_FIELDS = ['target_launch', 'forecast_launch', 'target_progress', 'actual_progress', 'ramp_pct'];

const JOINED_SELECT = `
  SELECT i.*, p.target_launch, p.forecast_launch, p.target_progress, p.actual_progress,
         p.ramp_pct, p.confidence_score, p.updated_by AS pipeline_updated_by, p.updated_at AS pipeline_updated_at
  FROM initiatives i
  LEFT JOIN pipeline_fields p ON p.initiative_id = i.id
`;

export async function getJoined(env, id) {
  return env.DB.prepare(`${JOINED_SELECT} WHERE i.id = ?`).bind(id).first();
}

export async function listInitiatives(env) {
  const { results } = await env.DB.prepare(`${JOINED_SELECT} ORDER BY i.id`).all();
  return results;
}

export async function getActuals(env, id) {
  const { results } = await env.DB.prepare('SELECT * FROM actuals_log WHERE initiative_id = ? ORDER BY period').bind(id).all();
  return results;
}

export async function createInitiative(env, body) {
  const values = {
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
  };

  const insert = await env.DB.prepare(`
    INSERT INTO initiatives (name, platform, segment, status, fy, rev_type, owner, fy26_target, fy27_target, fy28_target, pepm, progress_metric, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    values.name, values.platform, values.segment, values.status, values.fy, values.rev_type, values.owner,
    values.fy26_target, values.fy27_target, values.fy28_target, values.pepm, values.progress_metric, values.notes
  ).run();

  const id = insert.meta.last_row_id;
  const { score } = computeConfidence({
    status: values.status,
    targetLaunch: null,
    forecastLaunch: null,
    targetProgress: 0,
    actualProgress: 0,
    rampPct: 0,
  });

  await env.DB.prepare('INSERT INTO pipeline_fields (initiative_id, confidence_score, updated_by) VALUES (?, ?, ?)')
    .bind(id, score, values.owner || null)
    .run();

  return id;
}

export async function cloneInitiative(env, id) {
  const source = await env.DB.prepare('SELECT * FROM initiatives WHERE id = ?').bind(id).first();
  if (!source) return null;

  const insert = await env.DB.prepare(`
    INSERT INTO initiatives (name, platform, segment, status, fy, rev_type, owner, fy26_target, fy27_target, fy28_target, pepm, progress_metric, notes)
    VALUES (?, ?, ?, 'Consideration', ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    `${source.name} (Copy)`, source.platform, source.segment, source.fy, source.rev_type, source.owner,
    source.fy26_target, source.fy27_target, source.fy28_target, source.pepm, source.progress_metric, source.notes
  ).run();

  const newId = insert.meta.last_row_id;
  const { score } = computeConfidence({
    status: 'Consideration',
    targetLaunch: null,
    forecastLaunch: null,
    targetProgress: 0,
    actualProgress: 0,
    rampPct: 0,
  });

  await env.DB.prepare('INSERT INTO pipeline_fields (initiative_id, confidence_score, updated_by) VALUES (?, ?, ?)')
    .bind(newId, score, null)
    .run();

  return newId;
}

export async function deleteInitiative(env, id) {
  const existing = await env.DB.prepare('SELECT id FROM initiatives WHERE id = ?').bind(id).first();
  if (!existing) return false;

  await env.DB.batch([
    env.DB.prepare('DELETE FROM actuals_log WHERE initiative_id = ?').bind(id),
    env.DB.prepare('DELETE FROM pipeline_fields WHERE initiative_id = ?').bind(id),
    env.DB.prepare('DELETE FROM initiatives WHERE id = ?').bind(id),
  ]);

  return true;
}

export async function updateInitiative(env, id, body) {
  const existing = await env.DB.prepare('SELECT * FROM initiatives WHERE id = ?').bind(id).first();
  if (!existing) return null;

  const merged = { ...existing, ...Object.fromEntries(INITIATIVE_FIELDS.filter((f) => f in body).map((f) => [f, body[f]])) };

  await env.DB.prepare(`
    UPDATE initiatives SET
      name = ?, platform = ?, segment = ?, status = ?, fy = ?,
      rev_type = ?, owner = ?, fy26_target = ?, fy27_target = ?,
      fy28_target = ?, pepm = ?, progress_metric = ?, notes = ?,
      updated_at = datetime('now')
    WHERE id = ?
  `).bind(
    merged.name, merged.platform, merged.segment, merged.status, merged.fy,
    merged.rev_type, merged.owner, merged.fy26_target, merged.fy27_target,
    merged.fy28_target, merged.pepm, merged.progress_metric, merged.notes, id
  ).run();

  return getJoined(env, id);
}

export async function updatePipeline(env, id, body) {
  const initiative = await env.DB.prepare('SELECT * FROM initiatives WHERE id = ?').bind(id).first();
  if (!initiative) return null;

  const existingPipeline = (await env.DB.prepare('SELECT * FROM pipeline_fields WHERE initiative_id = ?').bind(id).first()) || {};

  const status = body.status !== undefined ? body.status : initiative.status;
  if (body.status !== undefined && body.status !== initiative.status) {
    await env.DB.prepare(`UPDATE initiatives SET status = ?, updated_at = datetime('now') WHERE id = ?`).bind(body.status, id).run();
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

  await env.DB.prepare(`
    INSERT INTO pipeline_fields (initiative_id, target_launch, forecast_launch, target_progress, actual_progress, ramp_pct, confidence_score, updated_by, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(initiative_id) DO UPDATE SET
      target_launch = excluded.target_launch,
      forecast_launch = excluded.forecast_launch,
      target_progress = excluded.target_progress,
      actual_progress = excluded.actual_progress,
      ramp_pct = excluded.ramp_pct,
      confidence_score = excluded.confidence_score,
      updated_by = excluded.updated_by,
      updated_at = datetime('now')
  `).bind(
    id, merged.target_launch || null, merged.forecast_launch || null,
    merged.target_progress || 0, merged.actual_progress || 0, merged.ramp_pct || 0,
    score, body.updated_by || null
  ).run();

  return getJoined(env, id);
}

export async function upsertActual(env, id, { period, target_rev = 0, actual_rev = 0, progress_actual = 0, entered_by = null }) {
  const initiative = await env.DB.prepare('SELECT id FROM initiatives WHERE id = ?').bind(id).first();
  if (!initiative) return null;

  await env.DB.prepare(`
    INSERT INTO actuals_log (initiative_id, period, target_rev, actual_rev, progress_actual, entered_by)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(initiative_id, period) DO UPDATE SET
      target_rev = excluded.target_rev,
      actual_rev = excluded.actual_rev,
      progress_actual = excluded.progress_actual,
      entered_by = excluded.entered_by,
      entered_at = datetime('now')
  `).bind(id, period, target_rev, actual_rev, progress_actual, entered_by).run();

  return getActuals(env, id);
}

export async function listSnapshotsMeta(env) {
  const { results } = await env.DB.prepare(`
    SELECT snapshot_id, snapshot_label, snapshot_date, created_by, COUNT(*) AS initiative_count
    FROM snapshots
    GROUP BY snapshot_id
    ORDER BY snapshot_date DESC
  `).all();
  return results;
}

export async function takeSnapshot(env, snapshotId, label, createdBy) {
  const { results: rows } = await env.DB.prepare(`
    SELECT i.id AS initiative_id, i.name AS initiative_name, i.platform, i.segment, i.status, i.fy,
           i.rev_type, i.owner, i.fy26_target, i.fy27_target, i.fy28_target, i.pepm, i.progress_metric, i.notes,
           p.target_launch, p.forecast_launch, p.target_progress, p.actual_progress, p.ramp_pct, p.confidence_score
    FROM initiatives i
    LEFT JOIN pipeline_fields p ON p.initiative_id = i.id
  `).all();

  const stmt = env.DB.prepare(`
    INSERT INTO snapshots (
      snapshot_id, snapshot_label, snapshot_date, created_by,
      initiative_id, initiative_name, platform, segment, status, fy, rev_type, owner,
      fy26_target, fy27_target, fy28_target, pepm, progress_metric, notes,
      target_launch, forecast_launch, target_progress, actual_progress, ramp_pct, confidence_score
    ) VALUES (
      ?, ?, datetime('now'), ?,
      ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?
    )
  `);

  const batchStatements = rows.map((row) => stmt.bind(
    snapshotId, label, createdBy || null,
    row.initiative_id, row.initiative_name, row.platform, row.segment, row.status, row.fy, row.rev_type, row.owner,
    row.fy26_target, row.fy27_target, row.fy28_target, row.pepm, row.progress_metric, row.notes,
    row.target_launch, row.forecast_launch, row.target_progress, row.actual_progress, row.ramp_pct, row.confidence_score
  ));

  if (batchStatements.length > 0) {
    await env.DB.batch(batchStatements);
  }

  return env.DB.prepare(`
    SELECT snapshot_id, snapshot_label, snapshot_date, created_by, COUNT(*) AS initiative_count
    FROM snapshots WHERE snapshot_id = ? GROUP BY snapshot_id
  `).bind(snapshotId).first();
}

export async function getSnapshotRows(env, snapshotId) {
  const { results } = await env.DB.prepare('SELECT * FROM snapshots WHERE snapshot_id = ? ORDER BY initiative_id').bind(snapshotId).all();
  return results;
}

export async function deleteSnapshot(env, snapshotId) {
  const result = await env.DB.prepare('DELETE FROM snapshots WHERE snapshot_id = ?').bind(snapshotId).run();
  return result.meta.changes > 0;
}

export async function getFlags(env) {
  const { results: rows } = await env.DB.prepare(`
    SELECT i.*, p.target_launch, p.forecast_launch, p.target_progress, p.actual_progress,
           p.ramp_pct, p.confidence_score
    FROM initiatives i
    LEFT JOIN pipeline_fields p ON p.initiative_id = i.id
  `).all();

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const flags = [];

  for (const row of rows) {
    const revenueTarget = (row.fy26_target || 0) + (row.fy27_target || 0) + (row.fy28_target || 0);
    const launchPassed = !!row.target_launch && monthDiff(row.target_launch, today) >= 0;

    if (row.status === 'In Progress' && !row.forecast_launch) {
      flags.push({ initiative_id: row.id, name: row.name, flag: 'no_forecast_launch', description: 'In Progress with no forecasted launch date' });
    }

    if (row.target_launch && row.forecast_launch && monthDiff(row.target_launch, row.forecast_launch) > 0) {
      flags.push({ initiative_id: row.id, name: row.name, flag: 'launch_past_target', description: `Forecasted launch (${row.forecast_launch}) is past target (${row.target_launch})` });
    }

    if (row.target_progress > 0 && (row.actual_progress || 0) < row.target_progress * 0.5 && launchPassed) {
      flags.push({ initiative_id: row.id, name: row.name, flag: 'progress_behind', description: `Actual progress (${row.actual_progress || 0}%) is under 50% of target (${row.target_progress}%) and launch date has passed` });
    }

    if (revenueTarget > 500000 && (row.ramp_pct || 0) < 20 && row.status !== 'Completed' && row.status !== 'At Scale') {
      flags.push({ initiative_id: row.id, name: row.name, flag: 'low_ramp', description: `Ramp is ${row.ramp_pct || 0}% on an initiative with $${revenueTarget.toLocaleString()} target revenue` });
    }

    if (row.status === 'Consideration' && revenueTarget > 0 && !row.target_launch) {
      flags.push({ initiative_id: row.id, name: row.name, flag: 'no_target_launch', description: 'Consideration status with revenue target set but no target launch date' });
    }
  }

  return flags;
}

export const DIFF_FIELDS = [
  'status', 'fy26_target', 'fy27_target', 'fy28_target', 'progress_metric', 'target_launch',
  'forecast_launch', 'target_progress', 'actual_progress', 'ramp_pct', 'confidence_score', 'owner',
];

function revenueTotal(row) {
  return (row.fy26_target || 0) + (row.fy27_target || 0) + (row.fy28_target || 0);
}

export async function compareSnapshots(env, a, b) {
  const metaA = await env.DB.prepare('SELECT snapshot_label, snapshot_date FROM snapshots WHERE snapshot_id = ? LIMIT 1').bind(a).first();
  const metaB = await env.DB.prepare('SELECT snapshot_label, snapshot_date FROM snapshots WHERE snapshot_id = ? LIMIT 1').bind(b).first();
  if (!metaA || !metaB) return { error: !metaA ? `Snapshot ${a} not found` : `Snapshot ${b} not found` };

  const rowsA = await getSnapshotRows(env, a);
  const rowsB = await getSnapshotRows(env, b);

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

  const baselineTotal = rowsA.reduce((sum, r) => sum + revenueTotal(r), 0);
  const compareTotal = rowsB.reduce((sum, r) => sum + revenueTotal(r), 0);

  return {
    snapshotA: { label: metaA.snapshot_label, date: metaA.snapshot_date },
    snapshotB: { label: metaB.snapshot_label, date: metaB.snapshot_date },
    new_initiatives: newInitiatives,
    removed_initiatives: removedInitiatives,
    changed,
    unchanged,
    revenue_summary: {
      baseline_total: baselineTotal,
      compare_total: compareTotal,
      incremental_impact: compareTotal - baselineTotal,
    },
  };
}

function monthDiff(target, forecast) {
  const [ty, tm] = target.split('-').map(Number);
  const [fy, fm] = forecast.split('-').map(Number);
  return (fy - ty) * 12 + (fm - tm);
}
