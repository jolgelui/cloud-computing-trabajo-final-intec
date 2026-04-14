import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../api/client'
import { DateRangeFilter } from '../components/DateRangeFilter'
import { buildTransaccionesListUrl } from '../lib/dateRangeQuery'
import type { Transaccion, TransaccionInput, TransaccionListResponse } from '../types/transaccion'
import './Manage.css'

const FORM_FIELDS: { key: keyof TransaccionInput; label: string }[] = [
  { key: 'canal', label: 'Canal' },
  { key: 'fecha', label: 'Fecha' },
  { key: 'hora', label: 'Hora' },
  { key: 'marca', label: 'Marca' },
  { key: 'tipoTransaccion', label: 'Tipo transacción' },
  { key: 'noTarjeta', label: 'No. tarjeta' },
  { key: 'noAfiliado', label: 'No. afiliado' },
  { key: 'respuesta', label: 'Respuesta' },
  { key: 'error', label: 'Error' },
  { key: 'noAutorizacion', label: 'No. autorización' },
  { key: 'referencia', label: 'Referencia' },
  { key: 'moneda', label: 'Moneda' },
  { key: 'monto', label: 'Monto' },
  { key: 'itbis', label: 'ITBIS' },
  { key: 'dcc', label: 'DCC' },
  { key: 'tarifaDcc', label: 'Tarifa DCC' },
  { key: 'monedaDcc', label: 'Moneda DCC' },
  { key: 'monedaDccAlfanumerica', label: 'Moneda DCC alfanum.' },
  { key: 'montoDcc', label: 'Monto DCC' },
  { key: 'tasaCambioDcc', label: 'Tasa cambio DCC' },
  { key: 'margenDcc', label: 'Margen DCC' },
]

function emptyForm(): TransaccionInput {
  return Object.fromEntries(FORM_FIELDS.map(({ key }) => [key, ''])) as TransaccionInput
}

function rowToForm(row: Transaccion): TransaccionInput {
  const o: TransaccionInput = {}
  for (const { key } of FORM_FIELDS) {
    const v = row[key as keyof Transaccion]
    o[key] = v == null ? '' : String(v)
  }
  return o
}

function formToPayload(form: TransaccionInput): TransaccionInput {
  const out: TransaccionInput = {}
  for (const { key } of FORM_FIELDS) {
    const v = form[key]
    out[key] = v === '' ? null : v ?? null
  }
  return out
}

export function Manage() {
  const [page, setPage] = useState(1)
  const limit = 15
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [list, setList] = useState<Transaccion[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<TransaccionInput>(() => emptyForm())
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const url = buildTransaccionesListUrl(page, limit, fechaDesde, fechaHasta)
      const res = await apiFetch<TransaccionListResponse>(url)
      setList(res.data)
      setTotal(res.total)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar')
    } finally {
      setLoading(false)
    }
  }, [page, fechaDesde, fechaHasta])

  useEffect(() => {
    void load()
  }, [load])

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / limit)),
    [total, limit],
  )

  function openCreate() {
    setForm(emptyForm())
    setEditingId(null)
    setModal('create')
  }

  function openEdit(row: Transaccion) {
    setForm(rowToForm(row))
    setEditingId(row.id)
    setModal('edit')
  }

  function closeModal() {
    setModal(null)
    setEditingId(null)
  }

  async function submitForm() {
    setSaving(true)
    setError(null)
    try {
      const payload = formToPayload(form)
      if (modal === 'create') {
        await apiFetch<Transaccion>('/transacciones', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
      } else if (modal === 'edit' && editingId != null) {
        await apiFetch<Transaccion>(`/transacciones/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
      }
      closeModal()
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function removeRow(id: number) {
    if (!window.confirm(`¿Eliminar transacción #${id}?`)) return
    setError(null)
    try {
      await apiFetch(`/transacciones/${id}`, { method: 'DELETE' })
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al eliminar')
    }
  }

  return (
    <div className="manage">
      <div className="manage-head">
        <div>
          <h1 className="page-title">Manage</h1>
          <p className="page-sub">CRUD vía API REST</p>
        </div>
        <button type="button" className="btn primary" onClick={openCreate}>
          Nueva transacción
        </button>
      </div>

      {error ? (
        <div className="banner error" role="alert">
          {error}
        </div>
      ) : null}

      <DateRangeFilter
        fechaDesde={fechaDesde}
        fechaHasta={fechaHasta}
        onDesdeChange={(v) => {
          setFechaDesde(v)
          setPage(1)
        }}
        onHastaChange={(v) => {
          setFechaHasta(v)
          setPage(1)
        }}
        onClear={() => {
          setFechaDesde('')
          setFechaHasta('')
          setPage(1)
        }}
        disabled={loading}
      />

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Marca</th>
              <th>Monto</th>
              <th>Resp.</th>
              <th>Referencia</th>
              <th className="col-actions">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="cell-muted">
                  Cargando…
                </td>
              </tr>
            ) : list.length === 0 ? (
              <tr>
                <td colSpan={7} className="cell-muted">
                  Sin filas
                </td>
              </tr>
            ) : (
              list.map((r) => (
                <tr key={r.id}>
                  <td className="mono">{r.id}</td>
                  <td>{r.fecha ?? '—'}</td>
                  <td>{r.marca ?? '—'}</td>
                  <td className="mono">{r.monto ?? '—'}</td>
                  <td>
                    <span className="pill">{r.respuesta ?? '—'}</span>
                  </td>
                  <td className="ellipsis" title={r.referencia ?? ''}>
                    {r.referencia ?? '—'}
                  </td>
                  <td className="col-actions">
                    <button type="button" className="btn sm" onClick={() => openEdit(r)}>
                      Editar
                    </button>{' '}
                    <button type="button" className="btn sm danger" onClick={() => removeRow(r.id)}>
                      Borrar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="pager">
        <button
          type="button"
          className="btn"
          disabled={page <= 1 || loading}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Anterior
        </button>
        <span className="pager-info">
          Página {page} / {totalPages} — {total} registros
        </span>
        <button
          type="button"
          className="btn"
          disabled={page >= totalPages || loading}
          onClick={() => setPage((p) => p + 1)}
        >
          Siguiente
        </button>
      </div>

      {modal ? (
        <div className="modal-backdrop" role="presentation" onClick={closeModal}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              <h2 id="modal-title">{modal === 'create' ? 'Nueva' : 'Editar'} transacción</h2>
              <button type="button" className="btn icon" onClick={closeModal} aria-label="Cerrar">
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                {FORM_FIELDS.map(({ key, label }) => (
                  <label key={key} className="field">
                    <span>{label}</span>
                    <input
                      value={(form[key] as string | null | undefined) ?? ''}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    />
                  </label>
                ))}
              </div>
            </div>
            <div className="modal-foot">
              <button type="button" className="btn" onClick={closeModal} disabled={saving}>
                Cancelar
              </button>
              <button type="button" className="btn primary" onClick={() => void submitForm()} disabled={saving}>
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
