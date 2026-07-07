const ACTIVE_STATUSES = new Set(['Completed', 'At Scale']);

function monthDiff(target, forecast) {
  const [ty, tm] = target.split('-').map(Number);
  const [fy, fm] = forecast.split('-').map(Number);
  return (fy - ty) * 12 + (fm - tm);
}

function statusWeight(status) {
  switch (status) {
    case 'Completed':
    case 'At Scale':
      return 1.0;
    case 'Launched':
      return 0.85;
    case 'In Progress':
      return 0.7;
    case 'Consideration':
    default:
      return 0.35;
  }
}

function launchFactor(status, targetLaunch, forecastLaunch) {
  if (ACTIVE_STATUSES.has(status)) return { value: 1.0, label: 'Already live' };
  if (!targetLaunch) return { value: 0.6, label: 'No target launch date set' };
  if (!forecastLaunch) return { value: 0.9, label: `Target set (${targetLaunch}), no forecast yet` };

  const diff = monthDiff(targetLaunch, forecastLaunch);
  if (diff <= 0) return { value: 1.0, label: `Forecast (${forecastLaunch}) on or ahead of target (${targetLaunch})` };
  if (diff === 1) return { value: 0.85, label: `Forecast (${forecastLaunch}) 1 month late vs target (${targetLaunch})` };
  return { value: 0.65, label: `Forecast (${forecastLaunch}) ${diff} months late vs target (${targetLaunch})` };
}

function progressFactor(targetProgress, actualProgress) {
  if (!targetProgress || targetProgress <= 0) return { value: 0.9, label: 'No target progress set' };
  const value = Math.min(1.0, (actualProgress || 0) / targetProgress);
  return { value, label: `${actualProgress || 0}% actual / ${targetProgress}% target` };
}

function rampFactor(status, rampPct) {
  if (ACTIVE_STATUSES.has(status)) return { value: 1.0, label: 'Already at scale / completed' };
  if (rampPct && rampPct > 0) return { value: rampPct / 100, label: `${rampPct}% ramped` };
  return { value: 0.5, label: 'No ramp % entered' };
}

export function computeConfidence({ status, targetLaunch, forecastLaunch, targetProgress, actualProgress, rampPct }) {
  const sw = statusWeight(status);
  const lf = launchFactor(status, targetLaunch, forecastLaunch);
  const pf = progressFactor(targetProgress, actualProgress);
  const rf = rampFactor(status, rampPct);

  const score = Math.round(sw * lf.value * pf.value * rf.value * 100);

  return {
    score,
    factors: [
      { key: 'status_weight', name: 'Status weight', label: `${status} status`, score: Math.round(sw * 100) },
      { key: 'launch_factor', name: 'Launch factor', label: lf.label, score: Math.round(lf.value * 100) },
      { key: 'progress_factor', name: 'Progress factor', label: pf.label, score: Math.round(pf.value * 100) },
      { key: 'ramp_factor', name: 'Ramp factor', label: rf.label, score: Math.round(rf.value * 100) },
    ],
  };
}
