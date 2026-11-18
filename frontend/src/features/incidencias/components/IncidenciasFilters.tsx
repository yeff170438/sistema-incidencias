import type {
  IncidenciasFilters as Filtros,
} from '../types/incidencias.types';

interface Props {
  filtros: Filtros;
  estados: string[];
  categorias: string[];
  onChange: (filtros: Filtros) => void;
  onLimpiar: () => void;
}

export default function IncidenciasFilters({
  filtros,
  estados,
  categorias,
  onChange,
  onLimpiar,
}: Props) {
  const actualizar = (campo: keyof Filtros, valor: string) => {
    onChange({
      ...filtros,
      [campo]: valor,
    });
  };

  return (
    <section className="inc-filters" aria-label="Filtros de incidencias">
      <div className="inc-filter-search">
        <label htmlFor="inc-busqueda">
          Buscar incidencia
        </label>

        <div className="inc-search-input">
          <span aria-hidden="true">⌕</span>

          <input
            id="inc-busqueda"
            type="search"
            placeholder="Código, título, ciudadano o dirección..."
            value={filtros.busqueda}
            onChange={(event) =>
              actualizar('busqueda', event.target.value)
            }
          />
        </div>
      </div>

      <div className="inc-filter-field">
        <label htmlFor="inc-estado">
          Estado
        </label>

        <select
          id="inc-estado"
          value={filtros.estado}
          onChange={(event) =>
            actualizar('estado', event.target.value)
          }
        >
          <option value="">Todos los estados</option>

          {estados.map((estado) => (
            <option key={estado} value={estado}>
              {estado}
            </option>
          ))}
        </select>
      </div>

      <div className="inc-filter-field">
        <label htmlFor="inc-categoria">
          Categoría
        </label>

        <select
          id="inc-categoria"
          value={filtros.categoria}
          onChange={(event) =>
            actualizar('categoria', event.target.value)
          }
        >
          <option value="">Todas las categorías</option>

          {categorias.map((categoria) => (
            <option key={categoria} value={categoria}>
              {categoria}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        className="inc-button inc-button-secondary inc-clear-filters"
        onClick={onLimpiar}
      >
        Limpiar filtros
      </button>
    </section>
  );
}