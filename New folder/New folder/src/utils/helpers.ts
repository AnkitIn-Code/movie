export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatNumber(n: number): string {
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export function getRatingColor(rating: number): string {
  if (rating >= 8.5) return 'text-green-500';
  if (rating >= 7) return 'text-yellow-500';
  return 'text-red-500';
}

export function getAvailabilityLabel(available: number, total: number): { label: string; color: string } {
  const pct = (available / total) * 100;
  if (pct === 0) return { label: 'Housefull', color: 'text-red-500' };
  if (pct < 20) return { label: 'Filling Fast', color: 'text-orange-500' };
  return { label: 'Available', color: 'text-green-500' };
}
