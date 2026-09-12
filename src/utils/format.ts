export function fmtCOP(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return 'COP ' + Math.round(n).toLocaleString('es-CO');
}

export function fmtPct(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return n.toFixed(1) + '%';
}
