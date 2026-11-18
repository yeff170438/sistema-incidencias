export interface Incidencia {
  id_incidencia: number;
  codigo_incidencia: string;

  id_ciudadano?: number | null;
  id_categoria?: number | null;
  id_sector?: number | null;
  id_estado?: number | null;

  titulo: string;
  descripcion: string;

  direccion_texto?: string | null;
  referencia?: string | null;
  fecha_reporte?: string | null;

  longitud?: number | null;
  latitud?: number | null;

  categoria?: string | null;
  id_oficina_predeterminada?: number | null;
  sector?: string | null;

  estado?: string | null;
  tipo_estado?: string | null;

  ciudadano_nombres?: string | null;
  apellido_paterno?: string | null;
  apellido_materno?: string | null;

  // Se completará al consultar el ticket asociado.
  prioridad?: string | null;
}

export interface IncidenciasResponse {
  incidencias: Incidencia[];
  total: number;
}

export interface IncidenciasFilters {
  busqueda: string;
  estado: string;
  categoria: string;
}

export interface ObservacionIncidenciaData {
  id_motivo: number;
  comentario: string;
}

export interface CorreccionIncidenciaData {
  id_categoria: number;
  id_sector: number | null;
  titulo: string;
  descripcion: string;
  direccion_texto: string;
  referencia: string;
  longitud: number | null;
  latitud: number | null;
}