import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts'
import { apiFetch } from '../api/client'
import { DateRangeFilter } from '../components/DateRangeFilter'
import { MarcaFilter } from '../components/MarcaFilter'
import { buildTransaccionesListUrl } from '../lib/dateRangeQuery'
import type { Transaccion, TransaccionListResponse } from '../types/transaccion'
import './Dashboard.css'

const COLORS = ['#6366f1', '#22c55e', '#f97316', '#ec4899', '#14b8a6', '#eab308', '#94a3b8']

function parseMonto(value: string | null | undefined): number {
  if (!value) return 0
  const n = Number.parseFloat(value.replace(/,/g, ''))
  return Number.isFinite(n) ? n : 0
}

function aggregateBy(rows: Transaccion[], keyFn: (r: Transaccion) => string, limit = 8) {
  const map = new Map<string, number>()
  for (const r of rows) {
    const k = keyFn(r) || '(vacío)'
    map.set(k, (map.get(k) ?? 0) + 1)
  }
  return [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
}

export function Dashboard() {
  const [rows, setRows] = useState<Transaccion[]>([])
  const [total, setTotal] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [selectedMarcas, setSelectedMarcas] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const url = buildTransaccionesListUrl(1, 200, fechaDesde, fechaHasta)
        const res = await apiFetch<TransaccionListResponse>(url)
        if (cancelled) return
        setRows(res.data)
        setTotal(res.total)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error al cargar')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [fechaDesde, fechaHasta])

  const allMarcas = useMemo(() => {
    const marcas = new Set<string>()
    for (const r of rows) {
      const marca = (r.marca ?? '').trim()
      if (marca) marcas.add(marca)
    }
    return Array.from(marcas).sort()
  }, [rows])

  useEffect(() => {
    if (selectedMarcas.length === 0 && allMarcas.length > 0) {
      setSelectedMarcas(allMarcas)
    }
  }, [allMarcas])

  const filteredRows = useMemo(() => {
    if (selectedMarcas.length === 0) return rows
    return rows.filter((r) => selectedMarcas.includes((r.marca ?? '').trim()))
  }, [rows, selectedMarcas])

  const approved = useMemo(
    () => filteredRows.filter((r) => (r.respuesta ?? '').trim() === '00').length,
    [filteredRows],
  )
  const declined = useMemo(() => Math.max(0, filteredRows.length - approved), [filteredRows, approved])
  const volumeSample = useMemo(
    () => filteredRows.reduce((sum, r) => sum + parseMonto(r.monto), 0),
    [filteredRows],
  )

  const byRespuesta = useMemo(
    () => aggregateBy(filteredRows, (r) => (r.respuesta ?? '').trim() || '(vacío)'),
    [filteredRows],
  )
  const byMarca = useMemo(
    () => aggregateBy(filteredRows, (r) => (r.marca ?? '').trim() || '(sin marca)'),
    [filteredRows],
  )
  const byFecha = useMemo(() => {
    const map = new Map<string, number>()
    for (const r of filteredRows) {
      const f = (r.fecha ?? '').trim() || '(sin fecha)'
      map.set(f, (map.get(f) ?? 0) + parseMonto(r.monto))
    }
    return [...map.entries()]
      .map(([fecha, monto]) => ({ fecha, monto }))
      .sort((a, b) => b.monto - a.monto)
      .slice(0, 10)
  }, [filteredRows])

  if (loading) {
    return <div className="panel muted">Cargando métricas…</div>
  }
  if (error) {
    return (
      <div className="panel error" role="alert">
        {error}
      </div>
    )
  }

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard</h1>
      <p className="page-sub">
        Vista rápida basada en las últimas {filteredRows.length} filas filtradas
        {total != null ? ` de ${total} en total.` : '.'}
      </p>

      <DateRangeFilter
        fechaDesde={fechaDesde}
        fechaHasta={fechaHasta}
        onDesdeChange={setFechaDesde}
        onHastaChange={setFechaHasta}
        onClear={() => {
          setFechaDesde('')
          setFechaHasta('')
        }}
        disabled={loading}
      />

      <MarcaFilter rows={rows} selectedMarcas={selectedMarcas} onChange={setSelectedMarcas} />

      <section className="widgets">
        <article className="widget stat">
          <div className="widget-label">Total (API)</div>
          <div className="widget-value">{total ?? '—'}</div>
        </article>
        <article className="widget stat ok">
          <div className="widget-label">Aprobaciones (resp. 00)</div>
          <div className="widget-value">{approved}</div>
          <div className="widget-hint">en muestra actual</div>
        </article>
        <article className="widget stat warn">
          <div className="widget-label">Otras respuestas</div>
          <div className="widget-value">{declined}</div>
          <div className="widget-hint">en muestra actual</div>
        </article>
        <article className="widget stat">
          <div className="widget-label">Monto (muestra)</div>
          <div className="widget-value mono">
            {volumeSample.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="widget-hint">suma parseada de Monto</div>
        </article>
      </section>

      <section className="charts">
        <article className="widget chart">
          <h2 className="widget-title">Por código de respuesta</h2>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={byRespuesta} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="value" name="Cantidad" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="widget chart">
          <h2 className="widget-title">Por marca</h2>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={byMarca}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) =>
                    `${name} (${(((percent ?? 0) as number) * 100).toFixed(0)}%)`
                  }
                >
                  {byMarca.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="widget chart wide">
          <h2 className="widget-title">Monto por fecha (top 10 fechas en muestra)</h2>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byFecha} margin={{ top: 8, right: 8, left: 8, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis
                  dataKey="fecha"
                  tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip
                  formatter={(v) =>
                    typeof v === 'number' ? v.toLocaleString() : String(v ?? '')
                  }
                  contentStyle={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="monto" name="Monto" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>
    </div>
  )
}
