// =====================================================
// TERRITORIO
// =====================================================

export interface AdminTerritoryDistrict {
    id_distrito: number;
    ubigeo: string;
    nombre: string;
    descripcion?: string | null;
    geometria: GeoJSON.GeoJsonObject;
}

export interface AdminTerritorySector {
    id_sector: number;
    nombre: string;
    descripcion?: string | null;
    geometria: GeoJSON.GeoJsonObject;
}

export interface AdminTerritoryPoint {
    id_incidencia: number;
    codigo_incidencia?: string | null;
    titulo?: string | null;
    descripcion?: string | null;
    direccion_texto?: string | null;

    id_sector?: number | null;
    id_sector_real?: number | null;
    sector?: string | null;

    categoria?: string | null;
    prioridad?: string | null;
    estado?: string | null;

    id_ticket?: number | null;
    codigo_ticket?: string | null;

    oficina?: string | null;

    latitud: number;
    longitud: number;

    fecha_reporte?: string | null;
}

export interface AdminTerritory {
    distrito: AdminTerritoryDistrict | null;
    sectores: AdminTerritorySector[];
    puntos: AdminTerritoryPoint[];
}


// =====================================================
// DASHBOARD - RESUMEN
// =====================================================

export interface AdminSummary {
    incidencias: number | string;
    tickets: number | string;
    tickets_abiertos: number | string;
    tickets_en_atencion: number | string;
    tickets_resueltos: number | string;
    casos_retrasados: number | string;
    casos_criticos: number | string;

    usuarios_activos: number | string;
    ciudadanos: number | string;
    oficinas_activas: number | string;

    saiu_pendientes: number | string;

    atencionesFinalizadas: number | string;
    tiempoPromedioAtencion: number | string;
}


// =====================================================
// ANALISIS
// =====================================================

export interface AdminCategoryMetric {
    id_categoria: number;
    nombre: string;
    cantidad: number | string;
}

export interface AdminStateMetric {
    id_estado: number;
    tipo_estado: string;
    nombre: string;
    cantidad: number | string;
}

export interface AdminPriorityMetric {
    id_prioridad: number;
    nombre: string;
    tiempo_maximo_horas: number | string;
    cantidad: number | string;
}

export interface AdminModalityMetric {
    modalidad: string;
    cantidad: number | string;
}

export interface AdminSectorMetric {
    id_sector: number;
    nombre: string;
    cantidad: number | string;
}

export interface AdminMonthlyMetric {
    mes: string;
    cantidad: number | string;
}


// =====================================================
// OFICINAS
// =====================================================

export interface AdminOfficePerformance {
    id_oficina: number;
    nombre: string;

    tickets: number | string;
    tickets_resueltos: number | string;
    tickets_abiertos: number | string;
    tickets_retrasados: number | string;

    porcentaje_resolucion: number | string;
}


// =====================================================
// ACTIVIDAD
// =====================================================

export interface AdminActivity {
    tipo: string;
    referencia: string;
    codigo?: string | null;
    descripcion?: string | null;
    fecha: string;
}


// =====================================================
// SEGUIMIENTO
// =====================================================

export interface AdminFollowUpCase {
    id_incidencia: number;
    codigo_incidencia: string;
    titulo: string;
    descripcion?: string | null;
    direccion_texto?: string | null;
    fecha_reporte: string;

    categoria?: string | null;
    prioridad?: string | null;
    estado?: string | null;

    id_ticket?: number | null;
    codigo_ticket?: string | null;

    fecha_creacion?: string | null;
    fecha_limite?: string | null;
    fecha_resolucion?: string | null;

    modalidad_atencion?: string | null;
    oficina?: string | null;

    cantidad_derivaciones: number | string;

    motivo_supervision: string;
    horas_transcurridas: number | string;
}


// =====================================================
// ANALISIS COMPLETO
// =====================================================

export interface AdminDashboardAnalysis {
    incidenciasPorCategoria: AdminCategoryMetric[];
    incidenciasPorEstado: AdminStateMetric[];

    ticketsPorPrioridad: AdminPriorityMetric[];
    ticketsPorModalidad: AdminModalityMetric[];

    incidenciasPorSector: AdminSectorMetric[];

    tendenciaMensual: AdminMonthlyMetric[];
}


// =====================================================
// RESPUESTA COMPLETA
// =====================================================

export interface AdminDashboardData {
    resumen: AdminSummary;

    seguimiento: AdminFollowUpCase[];

    oficinas: AdminOfficePerformance[];

    actividad: AdminActivity[];

    analisis: AdminDashboardAnalysis;

    territorio: AdminTerritory;
}


// =====================================================
// RESPUESTA HTTP
// =====================================================

export interface AdminDashboardResponse {
    ok: boolean;
    data: AdminDashboardData;
}