
import { useMemo, useState } from 'react';

import SantiagoMap from '../components/SantiagoMap';
import { useAdminDashboard } from '../hooks/useAdminDashboard';

import '../styles/admin-dashboard.css';

// =====================================================
// HELPERS
// =====================================================

const toNumber = (
    value: number | string | null | undefined
): number => {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
};

const normalizarTexto = (
    value: string | null | undefined
): string => (value ?? '').trim().toLowerCase();

const formatMonth = (value: string): string => {
    if (!value) return '';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('es-PE', {
        month: 'short',
        year: '2-digit',
        timeZone: 'UTC',
    }).format(date).replace('.', '');
};

const formatDateTimeCompleto = (fecha: string): string => {
    const date = new Date(fecha);

    if (Number.isNaN(date.getTime())) return 'Fecha no disponible';

    return new Intl.DateTimeFormat('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    }).format(date);
};

const formatearTextoActividad = (valor?: string): string => {
    if (!valor) return 'Evento registrado';

    return valor
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, letra => letra.toUpperCase());
};

const formatearTipoActividad = (tipo: string): string => {
    const tipos: Record<string, string> = {
        SEGUIMIENTO: 'Seguimiento',
        ATENCION: 'Atención',
        ASIGNACION: 'Asignación',
        INICIO_ATENCION: 'Inicio de atención',
        RECEPCION_ASIGNACION: 'Recepción de asignación',
        ASIGNACION_OFICINA: 'Asignación de oficina',
    };

    return tipos[tipo] ?? formatearTextoActividad(tipo);
};

const formatearCodigoActividad = (
    codigo: string | null | undefined
): string => {
    if (!codigo) return 'Evento registrado';

    const codigos: Record<string, string> = {
        INICIO_ATENCION: 'Inicio de atención',
        RECEPCION_ASIGNACION: 'Recepción de asignación',
        ASIGNACION_OFICINA: 'Asignación de oficina',
        ASIGNACION: 'Asignación registrada',
    };

    return codigos[codigo] ?? formatearTextoActividad(codigo);
};

const obtenerIconoActividad = (tipo: string): string => {
    const valor = normalizarTexto(tipo);

    if (valor.includes('incidencia')) return 'bi bi-geo-alt-fill';
    if (valor.includes('ticket')) return 'bi bi-ticket-perforated-fill';
    if (valor.includes('atencion')) return 'bi bi-tools';
    if (valor.includes('deriv')) return 'bi bi-arrow-left-right';
    if (valor.includes('saiu') || valor.includes('document')) {
        return 'bi bi-file-earmark-text-fill';
    }
    if (valor.includes('notific')) return 'bi bi-bell-fill';

    return 'bi bi-clock-history';
};

// =====================================================
// TIPOS
// =====================================================

type ColorKpi =
    | 'blue'
    | 'purple'
    | 'red'
    | 'green'
    | 'orange'
    | 'cyan';

interface KpiMiniProps {
    icon: string;
    color: ColorKpi;
    label: string;
    value: number;
    helper?: string;
}

interface MetricBarProps {
    label: string;
    value: number;
    total: number;
    color?: string;
}

interface AdminTrendChartProps {
    tendencia: {
        mes: string;
        cantidad: number | string;
    }[];
    maxTendencia: number;
}

// =====================================================
// DASHBOARD ADMINISTRATIVO
// =====================================================

const AdminDashboard = () => {
    const { data, loading, error, reload } = useAdminDashboard();

    const [estadoFiltro, setEstadoFiltro] = useState('TODOS');
    const [prioridadFiltro, setPrioridadFiltro] = useState('TODAS');
    const [sectorFiltro, setSectorFiltro] = useState('TODOS');

    // -------------------------------------------------
    // FILTROS DEL MAPA
    // -------------------------------------------------

    const estados = useMemo(() => {
        if (!data) return [];

        return Array.from(
            new Set(
                data.territorio.puntos
                    .map(punto => punto.estado)
                    .filter(
                        (estado): estado is string => Boolean(estado)
                    )
            )
        );
    }, [data]);

    const prioridadesMapa = useMemo(() => {
        if (!data) return [];

        return Array.from(
            new Set(
                data.territorio.puntos
                    .map(punto => punto.prioridad)
                    .filter(
                        (prioridad): prioridad is string =>
                            Boolean(prioridad)
                    )
            )
        );
    }, [data]);

    const puntosFiltrados = useMemo(() => {
        if (!data) return [];

        return data.territorio.puntos
            .filter(
                punto =>
                    estadoFiltro === 'TODOS' ||
                    punto.estado === estadoFiltro
            )
            .filter(
                punto =>
                    prioridadFiltro === 'TODAS' ||
                    punto.prioridad === prioridadFiltro
            )
            .filter(
                punto =>
                    sectorFiltro === 'TODOS' ||
                    String(
                        punto.id_sector_real ??
                        punto.id_sector ??
                        ''
                    ) === sectorFiltro
            );
    }, [data, estadoFiltro, prioridadFiltro, sectorFiltro]);

    // -------------------------------------------------
    // CARGA Y ERROR
    // -------------------------------------------------

    if (loading) {
        return (
            <div className="admin-dashboard-new">
                <div className="admin-dashboard-loading">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">
                            Cargando...
                        </span>
                    </div>

                    <h2>Preparando el centro de control</h2>
                    <p>
                        Consultando información de la gestión municipal...
                    </p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="admin-dashboard-new">
                <div className="admin-dashboard-new-error">
                    <div className="admin-error-content">
                        <i className="bi bi-exclamation-triangle-fill" />

                        <div>
                            <strong>
                                No se pudo cargar el dashboard
                            </strong>
                            <p>
                                {error ??
                                    'No hay información disponible en este momento.'}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="admin-button admin-button-danger"
                        onClick={reload}
                    >
                        <i className="bi bi-arrow-clockwise" />
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    // -------------------------------------------------
    // MÉTRICAS
    // -------------------------------------------------

    const resumen = data.resumen;
    const analisis = data.analisis;

    const totalTickets = toNumber(resumen.tickets);
    const ticketsResueltos = toNumber(resumen.tickets_resueltos);
    const ticketsPendientes = toNumber(resumen.tickets_abiertos);
    const ticketsEnAtencion = toNumber(resumen.tickets_en_atencion);
    const casosRetrasados = toNumber(resumen.casos_retrasados);
    const casosCriticos = toNumber(resumen.casos_criticos);

    const porcentajeResolucion =
        totalTickets > 0
            ? Math.min(100, (ticketsResueltos / totalTickets) * 100)
            : 0;

    const prioridadOrden = ['crítica', 'alta', 'media', 'baja'];

    const prioridadMap = new Map(
        analisis.ticketsPorPrioridad.map(item => [
            normalizarTexto(item.nombre),
            item,
        ])
    );

    const prioridadesDashboard = prioridadOrden.map(nombre => {
        const item = prioridadMap.get(nombre);

        return {
            nombre:
                nombre === 'crítica'
                    ? 'Crítica'
                    : nombre.charAt(0).toUpperCase() + nombre.slice(1),
            cantidad: toNumber(item?.cantidad),
            tiempoMaximo: toNumber(item?.tiempo_maximo_horas),
        };
    });

    const maxPrioridad = Math.max(
        ...prioridadesDashboard.map(item => item.cantidad),
        1
    );

    const oficinasTop = [...data.oficinas]
        .sort(
            (a, b) =>
                toNumber(b.tickets) - toNumber(a.tickets)
        )
        .slice(0, 5);

    const tendencia = analisis.tendenciaMensual.slice(-6);

    const maxTendencia = Math.max(
        ...tendencia.map(item => toNumber(item.cantidad)),
        1
    );

    const actividadReciente = data.actividad.slice(0, 6);

    // -------------------------------------------------
    // RENDER
    // -------------------------------------------------

    return (
        <div className="admin-dashboard-new">

            {/* CABECERA INSTITUCIONAL */}

            <header className="admin-dashboard-new-header">
                <div className="admin-dashboard-heading">
                    <span className="admin-dashboard-new-eyebrow">
                        <i className="bi bi-grid-1x2-fill" />
                        MUNICIPALIDAD DISTRITAL DE SANTIAGO
                    </span>

                    <h1>Centro de control municipal</h1>

                    <p>
                        Monitoreo territorial y supervisión de la
                        gestión de incidencias urbanas.
                    </p>
                </div>

                <div className="admin-dashboard-new-header-actions">
                    <div className="admin-dashboard-live">
                        <span className="admin-live-dot" />
                        Panel administrativo
                    </div>

                    <button
                        type="button"
                        className="admin-button admin-button-primary"
                        onClick={reload}
                    >
                        <i className="bi bi-arrow-clockwise" />
                        Actualizar datos
                    </button>
                </div>
            </header>

            {/* INDICADORES PRINCIPALES */}

            <section
                className="admin-dashboard-new-kpi-grid"
                aria-label="Indicadores principales"
            >
                <KpiMini
                    icon="bi-geo-alt-fill"
                    color="blue"
                    label="Incidencias"
                    value={toNumber(resumen.incidencias)}
                    helper="Total registrado"
                />

                <KpiMini
                    icon="bi-ticket-perforated-fill"
                    color="purple"
                    label="Tickets generados"
                    value={totalTickets}
                    helper="Casos formalizados"
                />

                <KpiMini
                    icon="bi-inboxes-fill"
                    color="orange"
                    label="Pendientes"
                    value={ticketsPendientes}
                    helper="Por gestionar"
                />

                <KpiMini
                    icon="bi-tools"
                    color="green"
                    label="En atención"
                    value={ticketsEnAtencion}
                    helper="En proceso"
                />

                <KpiMini
                    icon="bi-exclamation-triangle-fill"
                    color="red"
                    label="Retrasados"
                    value={casosRetrasados}
                    helper="Fuera de plazo"
                />

                <KpiMini
                    icon="bi-check-circle-fill"
                    color="cyan"
                    label="Resueltos"
                    value={ticketsResueltos}
                    helper="Atendidos"
                />
            </section>

            {/* SUPERVISIÓN TERRITORIAL */}

            <div className="admin-dashboard-main-grid">

                <section className="admin-panel admin-map-panel">
                    <div className="admin-panel-header admin-map-panel-header">
                        <div className="admin-section-title">
                            <span className="admin-section-icon blue">
                                <i className="bi bi-map-fill" />
                            </span>

                            <div>
                                <h2>Supervisión territorial</h2>
                                <p>
                                    Ubicación y distribución de incidencias
                                    dentro del distrito.
                                </p>
                            </div>
                        </div>

                        <span className="admin-panel-counter">
                            <i className="bi bi-geo-alt" />
                            {puntosFiltrados.length} ubicaciones
                        </span>
                    </div>

                    <div className="admin-map-toolbar">
                        <label className="admin-map-filter">
                            <span>Estado</span>

                            <select
                                value={estadoFiltro}
                                onChange={e =>
                                    setEstadoFiltro(e.target.value)
                                }
                                aria-label="Filtrar mapa por estado"
                            >
                                <option value="TODOS">
                                    Todos los estados
                                </option>

                                {estados.map(estado => (
                                    <option key={estado} value={estado}>
                                        {estado}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="admin-map-filter">
                            <span>Prioridad</span>

                            <select
                                value={prioridadFiltro}
                                onChange={e =>
                                    setPrioridadFiltro(e.target.value)
                                }
                                aria-label="Filtrar mapa por prioridad"
                            >
                                <option value="TODAS">
                                    Todas las prioridades
                                </option>

                                {prioridadesMapa.map(prioridad => (
                                    <option
                                        key={prioridad}
                                        value={prioridad}
                                    >
                                        {prioridad}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="admin-map-filter">
                            <span>Sector</span>

                            <select
                                value={sectorFiltro}
                                onChange={e =>
                                    setSectorFiltro(e.target.value)
                                }
                                aria-label="Filtrar mapa por sector"
                            >
                                <option value="TODOS">
                                    Todos los sectores
                                </option>

                                {data.territorio.sectores.map(sector => (
                                    <option
                                        key={sector.id_sector}
                                        value={String(sector.id_sector)}
                                    >
                                        {sector.nombre}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <button
                            type="button"
                            className="admin-map-reset"
                            onClick={() => {
                                setEstadoFiltro('TODOS');
                                setPrioridadFiltro('TODAS');
                                setSectorFiltro('TODOS');
                            }}
                            title="Limpiar filtros"
                            aria-label="Limpiar filtros del mapa"
                        >
                            <i className="bi bi-arrow-counterclockwise" />
                        </button>
                    </div>

                    <div className="admin-map-container">
                        <SantiagoMap
                            distrito={data.territorio.distrito}
                            sectores={data.territorio.sectores}
                            puntos={puntosFiltrados}
                        />
                    </div>

                    <div className="admin-map-footer">
                        <i className="bi bi-info-circle" />
                        Explora la distribución territorial utilizando
                        los filtros de estado, prioridad y sector.
                    </div>
                </section>

                {/* PANEL DE SUPERVISIÓN */}

                <aside className="admin-panel admin-supervision-panel">
                    <div className="admin-panel-header">
                        <div className="admin-section-title">
                            <span className="admin-section-icon green">
                                <i className="bi bi-radar" />
                            </span>

                            <div>
                                <h2>Control operativo</h2>
                                <p>
                                    Indicadores para supervisar la gestión.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="admin-supervision-content">

                        <div className="admin-supervision-alert">
                            <div className="admin-supervision-alert-icon">
                                <i className="bi bi-exclamation-octagon-fill" />
                            </div>

                            <div>
                                <span>Casos críticos</span>
                                <strong>
                                    {casosCriticos.toLocaleString('es-PE')}
                                </strong>
                                <small>
                                    Incidencias que requieren atención prioritaria
                                </small>
                            </div>
                        </div>

                        <div className="admin-supervision-stat">
                            <div className="admin-supervision-stat-icon orange">
                                <i className="bi bi-file-earmark-text-fill" />
                            </div>

                            <div>
                                <span>SAIU pendientes</span>
                                <strong>
                                    {toNumber(resumen.saiu_pendientes)}
                                </strong>
                            </div>
                        </div>

                        <div className="admin-supervision-stat">
                            <div className="admin-supervision-stat-icon blue">
                                <i className="bi bi-building-fill-gear" />
                            </div>

                            <div>
                                <span>Oficinas activas</span>
                                <strong>
                                    {toNumber(resumen.oficinas_activas)}
                                </strong>
                            </div>
                        </div>

                        <div className="admin-resolution-card">
                            <div className="admin-resolution-heading">
                                <div>
                                    <span>Resolución de tickets</span>
                                    <strong>
                                        {porcentajeResolucion.toFixed(1)}%
                                    </strong>
                                </div>

                                <span className="admin-resolution-icon">
                                    <i className="bi bi-graph-up-arrow" />
                                </span>
                            </div>

                            <div
                                className="admin-resolution-track"
                                role="progressbar"
                                aria-valuenow={Number(
                                    porcentajeResolucion.toFixed(0)
                                )}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-label="Porcentaje de tickets resueltos"
                            >
                                <div
                                    className="admin-resolution-fill"
                                    style={{
                                        width: `${porcentajeResolucion}%`,
                                    }}
                                />
                            </div>

                            <p>
                                {ticketsResueltos} de {totalTickets} tickets
                                registrados como resueltos.
                            </p>
                        </div>

                        <div className="admin-territory-info">
                            <div className="admin-territory-row">
                                <span>
                                    <i className="bi bi-geo-alt-fill" />
                                    Distrito
                                </span>

                                <strong>
                                    {data.territorio.distrito?.nombre ??
                                        'No disponible'}
                                </strong>
                            </div>

                            <div className="admin-territory-row">
                                <span>
                                    <i className="bi bi-map" />
                                    Sectores registrados
                                </span>

                                <strong>
                                    {data.territorio.sectores.length}
                                </strong>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {/* ESTADO GENERAL Y PRIORIDADES */}

            <div className="admin-analysis-grid">

                <section className="admin-panel">
                    <div className="admin-panel-header">
                        <div className="admin-section-title">
                            <span className="admin-section-icon cyan">
                                <i className="bi bi-bar-chart-fill" />
                            </span>

                            <div>
                                <h2>Estado del flujo de atención</h2>
                                <p>
                                    Distribución de los tickets según su estado.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="admin-panel-content">
                        <div className="admin-metric-list">
                            <MetricBar
                                label="Pendientes"
                                value={ticketsPendientes}
                                total={totalTickets}
                                color="orange"
                            />

                            <MetricBar
                                label="En atención"
                                value={ticketsEnAtencion}
                                total={totalTickets}
                                color="blue"
                            />

                            <MetricBar
                                label="Resueltos"
                                value={ticketsResueltos}
                                total={totalTickets}
                                color="green"
                            />

                            <MetricBar
                                label="Retrasados"
                                value={casosRetrasados}
                                total={totalTickets}
                                color="red"
                            />
                        </div>
                    </div>
                </section>

                <section className="admin-panel">
                    <div className="admin-panel-header">
                        <div className="admin-section-title">
                            <span className="admin-section-icon purple">
                                <i className="bi bi-flag-fill" />
                            </span>

                            <div>
                                <h2>Distribución por prioridad</h2>
                                <p>
                                    Tickets clasificados según su nivel de
                                    prioridad y plazo máximo.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="admin-panel-content">
                        <div className="admin-metric-list">
                            {prioridadesDashboard.map(prioridad => {
                                const porcentaje =
                                    (prioridad.cantidad / maxPrioridad) * 100;

                                const color =
                                    prioridad.nombre === 'Crítica'
                                        ? 'red'
                                        : prioridad.nombre === 'Alta'
                                          ? 'orange'
                                          : prioridad.nombre === 'Media'
                                            ? 'blue'
                                            : 'green';

                                return (
                                    <div
                                        className="admin-metric-item"
                                        key={prioridad.nombre}
                                    >
                                        <div className="admin-metric-header">
                                            <span className="admin-metric-name">
                                                <span
                                                    className={`admin-priority-dot ${color}`}
                                                />
                                                {prioridad.nombre}
                                            </span>

                                            <strong className="admin-metric-value">
                                                {prioridad.cantidad}
                                            </strong>
                                        </div>

                                        <div className="admin-metric-meta">
                                            <span>
                                                {prioridad.tiempoMaximo > 0
                                                    ? `Plazo máximo: ${prioridad.tiempoMaximo} h`
                                                    : 'Sin límite configurado'}
                                            </span>
                                        </div>

                                        <div className="admin-progress-track">
                                            <div
                                                className={`admin-progress-bar ${color}`}
                                                style={{
                                                    width: `${porcentaje}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </div>

            {/* RENDIMIENTO DE OFICINAS */}

            <section className="admin-panel admin-offices-panel">
                <div className="admin-panel-header">
                    <div className="admin-section-title">
                        <span className="admin-section-icon purple">
                            <i className="bi bi-building-fill-gear" />
                        </span>

                        <div>
                            <h2>Rendimiento de oficinas</h2>
                            <p>
                                Comparación del volumen de tickets y el
                                porcentaje de resolución por oficina.
                            </p>
                        </div>
                    </div>

                    <span className="admin-panel-counter">
                        {oficinasTop.length} oficinas
                    </span>
                </div>

                <div className="admin-panel-content">
                    {oficinasTop.length === 0 ? (
                        <div className="admin-empty-block">
                            <i className="bi bi-building" />
                            <span>
                                No hay información de oficinas.
                            </span>
                        </div>
                    ) : (
                        <div className="admin-office-grid">
                            {oficinasTop.map((oficina, index) => {
                                const porcentaje = Math.max(
                                    0,
                                    Math.min(
                                        100,
                                        toNumber(oficina.porcentaje_resolucion)
                                    )
                                );

                                const colores = [
                                    'blue',
                                    'purple',
                                    'green',
                                    'orange',
                                    'cyan',
                                ];

                                const color =
                                    colores[index % colores.length];

                                return (
                                    <article
                                        className="admin-office-card"
                                        key={oficina.id_oficina}
                                    >
                                        <div className="admin-office-card-header">
                                            <span
                                                className={`admin-office-rank ${color}`}
                                            >
                                                {index + 1}
                                            </span>

                                            <div className="admin-office-card-title">
                                                <h3>{oficina.nombre}</h3>
                                                <span>
                                                    {toNumber(oficina.tickets)} tickets
                                                </span>
                                            </div>

                                            <div
                                                className={`admin-office-percentage ${color}`}
                                            >
                                                {porcentaje.toFixed(0)}%
                                            </div>
                                        </div>

                                        <div
                                            className="admin-progress-track admin-office-track"
                                            role="progressbar"
                                            aria-valuenow={porcentaje}
                                            aria-valuemin={0}
                                            aria-valuemax={100}
                                            aria-label={`Resolución de ${oficina.nombre}`}
                                        >
                                            <div
                                                className={`admin-progress-bar ${color}`}
                                                style={{
                                                    width: `${porcentaje}%`,
                                                }}
                                            />
                                        </div>

                                        <div className="admin-office-meta">
                                            <span>
                                                <i className="bi bi-ticket-perforated" />
                                                {toNumber(oficina.tickets)} asignados
                                            </span>

                                            <span>
                                                <i className="bi bi-check-circle" />
                                                {toNumber(oficina.tickets_resueltos)} resueltos
                                            </span>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* TENDENCIA Y ACTIVIDAD */}

            <div className="admin-bottom-grid">

                <section className="admin-panel admin-trend-panel">
                    <div className="admin-panel-header">
                        <div className="admin-section-title">
                            <span className="admin-section-icon blue">
                                <i className="bi bi-graph-up-arrow" />
                            </span>

                            <div>
                                <h2>Evolución de incidencias</h2>
                                <p>
                                    Tendencia mensual de los últimos seis
                                    meses disponibles.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="admin-panel-content">
                        {tendencia.length === 0 ? (
                            <div className="admin-empty-block">
                                <i className="bi bi-bar-chart" />
                                <span>
                                    No hay información de tendencia.
                                </span>
                            </div>
                        ) : (
                            <AdminTrendChart
                                tendencia={tendencia}
                                maxTendencia={maxTendencia}
                            />
                        )}
                    </div>
                </section>

                <section className="admin-panel admin-activity-panel">
                    <div className="admin-panel-header">
                        <div className="admin-section-title">
                            <span className="admin-section-icon orange">
                                <i className="bi bi-activity" />
                            </span>

                            <div>
                                <h2>Actividad reciente</h2>
                                <p>
                                    Últimos movimientos registrados en el sistema.
                                </p>
                            </div>
                        </div>

                        <span className="admin-panel-counter">
                            {actividadReciente.length} eventos
                        </span>
                    </div>

                    {actividadReciente.length === 0 ? (
                        <div className="admin-empty-block">
                            <i className="bi bi-clock-history" />
                            <span>
                                No hay actividad reciente.
                            </span>
                        </div>
                    ) : (
                        <div className="admin-activity-list">
                            {actividadReciente.map((actividad, index) => (
                                <article
                                    className="admin-activity-item"
                                    key={`${actividad.tipo}-${actividad.referencia}-${index}`}
                                >
                                    <div
                                        className={`admin-activity-icon admin-activity-color-${index % 5}`}
                                    >
                                        <i
                                            className={obtenerIconoActividad(
                                                actividad.tipo
                                            )}
                                        />
                                    </div>

                                    <div className="admin-activity-body">
                                        <div className="admin-activity-topline">
                                            <strong>
                                                {formatearTipoActividad(
                                                    actividad.tipo
                                                )}
                                            </strong>

                                            <span className="admin-activity-reference">
                                                #{actividad.referencia}
                                            </span>
                                        </div>

                                        <p>
                                            {actividad.descripcion ||
                                                formatearCodigoActividad(
                                                    actividad.codigo
                                                )}
                                        </p>

                                        <time dateTime={actividad.fecha}>
                                            <i className="bi bi-clock" />
                                            {formatDateTimeCompleto(
                                                actividad.fecha
                                            )}
                                        </time>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

// =====================================================
// TARJETA KPI
// =====================================================

const KpiMini = ({
    icon,
    color,
    label,
    value,
    helper,
}: KpiMiniProps) => (
    <article className={`admin-dashboard-new-kpi ${color}`}>
        <div className={`admin-dashboard-new-kpi-icon ${color}`}>
            <i className={`bi ${icon}`} />
        </div>

        <div className="admin-kpi-content">
            <span className="admin-kpi-label">{label}</span>

            <strong className="admin-kpi-value">
                {value.toLocaleString('es-PE')}
            </strong>

            {helper && (
                <span className="admin-kpi-helper">{helper}</span>
            )}
        </div>

        <span className="admin-kpi-decoration" aria-hidden="true">
            <i className={`bi ${icon}`} />
        </span>
    </article>
);

// =====================================================
// BARRA DE MÉTRICA
// =====================================================

const MetricBar = ({
    label,
    value,
    total,
    color = 'blue',
}: MetricBarProps) => {
    const porcentaje =
        total > 0
            ? Math.min(100, Math.max(0, (value / total) * 100))
            : 0;

    return (
        <div className="admin-metric-item">
            <div className="admin-metric-header">
                <span className="admin-metric-name">{label}</span>

                <strong className="admin-metric-value">
                    {value.toLocaleString('es-PE')}
                </strong>
            </div>

            <div className="admin-metric-meta">
                <span>
                    {porcentaje.toFixed(1)}% del total de tickets
                </span>
            </div>

            <div className="admin-progress-track">
                <div
                    className={`admin-progress-bar ${color}`}
                    style={{ width: `${porcentaje}%` }}
                />
            </div>
        </div>
    );
};

// =====================================================
// GRÁFICO SVG DE TENDENCIA
// =====================================================

const AdminTrendChart = ({
    tendencia,
    maxTendencia,
}: AdminTrendChartProps) => {
    const width = 700;
    const height = 280;

    const paddingLeft = 45;
    const paddingRight = 24;
    const paddingTop = 28;
    const paddingBottom = 48;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const maximo = Math.max(maxTendencia, 1);

    const puntos = tendencia.map((item, index) => {
        const cantidad = toNumber(item.cantidad);

        const x =
            tendencia.length === 1
                ? paddingLeft + chartWidth / 2
                : paddingLeft +
                  (index / (tendencia.length - 1)) * chartWidth;

        const y =
            paddingTop +
            chartHeight -
            (cantidad / maximo) * chartHeight;

        return { ...item, cantidad, x, y };
    });

    const linea = puntos
        .map(punto => `${punto.x},${punto.y}`)
        .join(' ');

    const area =
        puntos.length > 0
            ? [
                  `${puntos[0].x},${paddingTop + chartHeight}`,
                  ...puntos.map(punto => `${punto.x},${punto.y}`),
                  `${puntos[puntos.length - 1].x},${paddingTop + chartHeight}`,
              ].join(' ')
            : '';

    const niveles = [0, 0.25, 0.5, 0.75, 1];

    return (
        <div className="admin-trend-container">
            <svg
                className="admin-trend-svg"
                viewBox={`0 0 ${width} ${height}`}
                role="img"
                aria-label="Gráfico de tendencia mensual de incidencias"
            >
                <defs>
                    <linearGradient
                        id="admin-trend-gradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >
                        <stop
                            offset="0%"
                            stopColor="currentColor"
                            stopOpacity="0.24"
                        />

                        <stop
                            offset="100%"
                            stopColor="currentColor"
                            stopOpacity="0.015"
                        />
                    </linearGradient>
                </defs>

                {niveles.map(nivel => {
                    const y =
                        paddingTop + chartHeight - nivel * chartHeight;

                    return (
                        <g
                            key={nivel}
                            className="admin-trend-gridline"
                        >
                            <line
                                x1={paddingLeft}
                                y1={y}
                                x2={width - paddingRight}
                                y2={y}
                            />

                            <text
                                x={paddingLeft - 10}
                                y={y + 4}
                                textAnchor="end"
                            >
                                {Math.round(maximo * nivel)}
                            </text>
                        </g>
                    );
                })}

                {area && (
                    <polygon
                        points={area}
                        className="admin-trend-area"
                        fill="url(#admin-trend-gradient)"
                    />
                )}

                {puntos.length > 1 && (
                    <polyline
                        points={linea}
                        className="admin-trend-line"
                        fill="none"
                    />
                )}

                {puntos.map((punto, index) => (
                    <g
                        key={`${punto.mes}-${index}`}
                        className="admin-trend-point-group"
                    >
                        <circle
                            cx={punto.x}
                            cy={punto.y}
                            r="5"
                            className="admin-trend-point"
                        />

                        <text
                            x={punto.x}
                            y={punto.y - 13}
                            textAnchor="middle"
                            className="admin-trend-value"
                        >
                            {punto.cantidad}
                        </text>

                        <text
                            x={punto.x}
                            y={paddingTop + chartHeight + 29}
                            textAnchor="middle"
                            className="admin-trend-label"
                        >
                            {formatMonth(punto.mes)}
                        </text>
                    </g>
                ))}
            </svg>
        </div>
    );
};

export default AdminDashboard;
