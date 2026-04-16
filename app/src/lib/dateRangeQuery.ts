/** Construye query string para GET /transacciones con paginación y rango de fechas (YYYY-MM-DD). */
export function buildTransaccionesListUrl(
  page: number,
  limit: number,
  fechaDesde?: string,
  fechaHasta?: string,
  marcas?: string[],
): string {
  const p = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  const d = fechaDesde?.trim()
  const h = fechaHasta?.trim()
  if (d) p.set('fechaDesde', d)
  if (h) p.set('fechaHasta', h)
  if (marcas && marcas.length > 0) {
    for (const marca of marcas) {
      p.append('marca', marca)
    }
  }
  return `/transacciones?${p.toString()}`
}
