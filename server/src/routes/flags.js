import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

function monthDiff(a, b) {
  const [ay, am] = a.split('-').map(Number);
  const [by, bm] = b.split('-').map(Number);
  return (by - ay) * 12 + (bm - am);
}

function currentYYYYMM() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT i.*, p.target_launch, p.forecast_launch, p.target_progress, p.actual_progress,
           p.ramp_pct, p.confidence_score
    FROM initiatives i
    LEFT JOIN pipeline_fields p ON p.initiative_id = i.id
  `).all();

  const today = currentYYYYMM();
  const flags = [];

  for (const row of rows) {
    const revenueTarget = (row.fy26_target || 0) + (row.fy27_target || 0) + (row.fy28_target || 0);
    const launchPassed = !!row.target_launch && monthDiff(row.target_launch, today) >= 0;

    if (row.status === 'In Progress' && !row.forecast_launch) {
      flags.push({
        initiative_id: row.id,
        name: row.name,
        flag: 'no_forecast_launch',
        description: 'In Progress with no forecasted launch date',
      });
    }

    if (row.target_launch && row.forecast_launch && monthDiff(row.target_launch, row.forecast_launch) > 0) {
      flags.push({
        initiative_id: row.id,
        name: row.name,
        flag: 'launch_past_target',
        description: `Forecasted launch (${row.forecast_launch}) is past target (${row.target_launch})`,
      });
    }

    if (row.target_progress > 0 && (row.actual_progress || 0) < row.target_progress * 0.5 && launchPassed) {
      flags.push({
        initiative_id: row.id,
        name: row.name,
        flag: 'progress_behind',
        description: `Actual progress (${row.actual_progress || 0}%) is under 50% of target (${row.target_progress}%) and launch date has passed`,
      });
    }

    if (revenueTarget > 500000 && (row.ramp_pct || 0) < 20 && row.status !== 'Completed' && row.status !== 'At Scale') {
      flags.push({
        initiative_id: row.id,
        name: row.name,
        flag: 'low_ramp',
        description: `Ramp is ${row.ramp_pct || 0}% on an initiative with $${revenueTarget.toLocaleString()} target revenue`,
      });
    }

    if (row.status === 'Consideration' && revenueTarget > 0 && !row.target_launch) {
      flags.push({
        initiative_id: row.id,
        name: row.name,
        flag: 'no_target_launch',
        description: 'Consideration status with revenue target set but no target launch date',
      });
    }
  }

  res.json(flags);
});

export default router;
