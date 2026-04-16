import { useMemo } from 'react'
import type { Transaccion } from '../types/transaccion'
import './MarcaFilter.css'

export interface MarcaFilterProps {
  rows: Transaccion[]
  selectedMarcas: string[]
  onChange: (marcas: string[]) => void
}

export function MarcaFilter({ rows, selectedMarcas, onChange }: MarcaFilterProps) {
  const marcaOptions = useMemo(() => {
    const marcas = new Set<string>()
    for (const r of rows) {
      const marca = (r.marca ?? '').trim()
      if (marca) marcas.add(marca)
    }
    return Array.from(marcas).sort()
  }, [rows])

  const handleSelectAll = () => {
    onChange(marcaOptions)
  }

  const handleClearAll = () => {
    onChange([])
  }

  const handleToggle = (marca: string) => {
    if (selectedMarcas.includes(marca)) {
      onChange(selectedMarcas.filter((m) => m !== marca))
    } else {
      onChange([...selectedMarcas, marca])
    }
  }

  return (
    <div className="marca-filter">
      <div className="filter-header">
        <label htmlFor="marca-select">Filtrar por Marca:</label>
        <div className="filter-buttons">
          <button
            onClick={handleSelectAll}
            className="filter-button"
            disabled={selectedMarcas.length === marcaOptions.length}
          >
            Todas
          </button>
          <button onClick={handleClearAll} className="filter-button" disabled={selectedMarcas.length === 0}>
            Ninguna
          </button>
        </div>
      </div>

      <div className="marca-options">
        {marcaOptions.map((marca) => (
          <label key={marca} className="marca-option">
            <input
              type="checkbox"
              checked={selectedMarcas.includes(marca)}
              onChange={() => handleToggle(marca)}
              className="marca-checkbox"
            />
            <span>{marca}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
