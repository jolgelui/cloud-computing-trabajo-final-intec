import './DateRangeFilter.css'

type Props = {
  fechaDesde: string
  fechaHasta: string
  onDesdeChange: (v: string) => void
  onHastaChange: (v: string) => void
  onClear?: () => void
  disabled?: boolean
}

export function DateRangeFilter({
  fechaDesde,
  fechaHasta,
  onDesdeChange,
  onHastaChange,
  onClear,
  disabled,
}: Props) {
  return (
    <div className="date-range" role="group" aria-label="Filtro por rango de fechas">
      <span className="date-range-label">Fechas</span>
      <label className="date-range-field">
        <span>Desde</span>
        <input
          type="date"
          value={fechaDesde}
          onChange={(e) => onDesdeChange(e.target.value)}
          disabled={disabled}
        />
      </label>
      <label className="date-range-field">
        <span>Hasta</span>
        <input
          type="date"
          value={fechaHasta}
          onChange={(e) => onHastaChange(e.target.value)}
          disabled={disabled}
        />
      </label>
      {onClear ? (
        <button type="button" className="date-range-clear" onClick={onClear} disabled={disabled}>
          Limpiar
        </button>
      ) : null}
    </div>
  )
}
