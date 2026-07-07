const ACTIVE_STATUSES = new Set(['Completed', 'At Scale']);

function monthDiff(target, forecast) {
  const [ty, tm] = target.split('-').map(Number);
  const [fy, fm] = forecast.split('-').map(Number);
  return (fy - ty) * 12 + (fm - tm);
}

export function statusWeight(status) {
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

export function launchFactor(status, targetLaunch, forecastLaunch) {
  if (ACTIVE_STATUSES.has(status)) return 1.0;
  if (!targetLaunch) return 0.6;
  if (!forecastLaunch) return 0.9;

  const diff = monthDiff(targetLaunch, forecastLaunch);
  if (diff <= 0) return 1.0;
  if (diff === 1) return 0.85;
  return 0.65;
}

export function progressFactor(targetProgress, actualProgress) {
  if (!targetProgress || targetProgress <= 0) return 0.9;
  return Math.min(1.0, (actualProgress || 0) / targetProgress);
}

export function rampFactor(status, rampPct) {
  if (ACTIVE_STATUSES.has(status)) return 1.0;
  if (rampPct && rampPct > 0) return rampPct / 100;
  return 0.5;
}

export function computeConfidence({ status, targetLaunch, forecastLaunch, targetProgress, actualProgress, rampPct }) {
  const sw = statusWeight(status);
  const lf = launchFactor(status, targetLaunch, forecastLaunch);
  const pf = progressFactor(targetProgress, actualProgress);
  const rf = rampFactor(status, rampPct);

  const score = sw * lf * pf * rf * 100;

  return {
    score: Math.round(score),
    factors: {
      status_weight: { value: sw, score: Math.round(sw * 100), label: `${status} status` },
      launch_factor: { value: lf, score: Math.round(lf * 100), label: launchFactorLabel(status, targetLaunch, forecastLaunch) },
      progress_factor: { value: pf, score: Math.round(pf * 100), label: progressFactorLabel(targetProgress, actualProgress) },
      ramp_factor: { value: rf, score: Math.round(rf * 100), label: rampFactorLabel(status, rampPct) },
    },
  };
}

function launchFactorLabel(status, targetLaunch, forecastLaunch) {
  if (ACTIVE_STATUSES.has(status)) return 'Already live';
  if (!targetLaunch) return 'No target launch date set';
  if (!forecastLaunch) return `Target set (${targetLaunch}), no forecast yet`;
  const diff = monthDiff(targetLaunch, forecastLaunch);
  if (diff <= 0) return `Forecast (${forecastLaunch}) on or ahead of target (${targetLaunch})`;
  if (diff === 1) return `Forecast (${forecastLaunch}) 1 month late vs target (${targetLaunch})`;
  return `Forecast (${forecastLaunch}) ${diff} months late vs target (${targetLaunch})`;
}

function progressFactorLabel(targetProgress, actualProgress) {
  if (!targetProgress || targetProgress <= 0) return 'No target progress set';
  return `${actualProgress || 0}% actual / ${targetProgress}% target`;
}

function rampFactorLabel(status, rampPct) {
  if (ACTIVE_STATUSES.has(status)) return 'Already at scale / completed';
  if (rampPct && rampPct > 0) return `${rampPct}% ramped`;
  return 'No ramp % entered';
}
