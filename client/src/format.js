export function formatCurrency(value) {
  const n = Number(value) || 0;
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

export function formatCurrencyFull(value) {
  const n = Number(value) || 0;
  return `$${n.toLocaleString()}`;
}

export function formatPercent(value) {
  const n = Number(value) || 0;
  return `${Math.round(n)}%`;
}

export function formatMonth(yyyyMm) {
  if (!yyyyMm) return '—';
  const [y, m] = yyyyMm.split('-').map(Number);
  if (!y || !m) return yyyyMm;
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}
