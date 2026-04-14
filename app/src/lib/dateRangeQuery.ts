/** Construye query string para GET /transacciones con paginación y rango de fechas (YYYY-MM-DD). */
export function buildTransaccionesListUrl(
  page: number,
  limit: number,
  fechaDesde?: string,
  fechaHasta?: string,
): string {
  const p = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  const d = fechaDesde?.trim()
  const h = fechaHasta?.trim()
  if (d) p.set('fechaDesde', d)
  if (h) p.set('fechaHasta', h)
  return `/transacciones?${p.toString()}`
}
