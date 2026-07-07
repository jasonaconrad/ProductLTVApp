export const STATUSES = ['Consideration', 'In Progress', 'Launched', 'At Scale', 'Completed'];

export const QUARTERS = [
  'FY26-Q1', 'FY26-Q2', 'FY26-Q3', 'FY26-Q4',
  'FY27-Q1', 'FY27-Q2', 'FY27-Q3', 'FY27-Q4',
];

export const PLATFORM_STYLES = {
  Flex: 'bg-blue-100 text-blue-700 border border-blue-200',
  Paycor: 'bg-amber-100 text-amber-700 border border-amber-200',
  Both: 'bg-purple-100 text-purple-700 border border-purple-200',
};

export const STATUS_STYLES = {
  Consideration: 'bg-amber-100 text-amber-800 border border-amber-200',
  'In Progress': 'bg-blue-100 text-blue-800 border border-blue-200',
  Launched: 'bg-teal-100 text-teal-800 border border-teal-200',
  'At Scale': 'bg-green-100 text-green-800 border border-green-200',
  Completed: 'bg-green-200 text-green-900 border border-green-300',
};

export const METRIC_STYLES = {
  attach: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
  enablement: 'bg-slate-100 text-slate-700 border border-slate-200',
};

export const METRIC_LABELS = {
  attach: 'Attach',
  enablement: 'Enablement',
};

export function confidenceTier(score) {
  if (score >= 70) return 'green';
  if (score >= 40) return 'amber';
  return 'red';
}

export const CONFIDENCE_STYLES = {
  green: 'bg-green-100 text-green-800 border border-green-300',
  amber: 'bg-amber-100 text-amber-800 border border-amber-300',
  red: 'bg-red-100 text-red-800 border border-red-300',
};

export const CONFIDENCE_BAR_STYLES = {
  green: 'bg-green-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
};
