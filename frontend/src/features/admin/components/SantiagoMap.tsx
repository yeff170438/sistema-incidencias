import {
    useEffect
} from 'react';

import {
    CircleMarker,
    GeoJSON as GeoJSONLayer,
    MapContainer,
    Popup,
    TileLayer,
    Tooltip,
    useMap
} from 'react-leaflet';

import L from 'leaflet';

import 'leaflet/dist/leaflet.css';

import type {
    AdminTerritoryDistrict,
    AdminTerritoryPoint,
    AdminTerritorySector
} from '../types/admin-dashboard.types';
import '../styles/santiago-map.css';

// =====================================================
// PROPS
// =====================================================

interface SantiagoMapProps {
    distrito: AdminTerritoryDistrict | null;
    sectores: AdminTerritorySector[];
    puntos: AdminTerritoryPoint[];
}


// =====================================================
// CENTRO INICIAL
// =====================================================

const DEFAULT_CENTER: [number, number] = [
    -13.53,
    -71.98
];


// =====================================================
// CONTROL DE VISTA
// =====================================================

interface MapViewportProps {
    distrito: AdminTerritoryDistrict | null;
}

const MapViewport = ({
    distrito
}: MapViewportProps) => {

    const map = useMap();

    useEffect(() => {

        if (!distrito?.geometria) {
            return;
        }

        const geoJson = L.geoJSON(
            distrito.geometria
        );

        const bounds = geoJson.getBounds();

        if (!bounds.isValid()) {
            return;
        }

        map.fitBounds(
            bounds,
            {
                padding: [20, 20]
            }
        );

        map.setMaxBounds(
            bounds.pad(0.12)
        );

    }, [
        distrito,
        map
    ]);

    return null;
};


// =====================================================
// COLOR POR PRIORIDAD
// =====================================================

const getPriorityColor = (
    prioridad?: string | null
): string => {

    const value = (
        prioridad ?? ''
    ).toLowerCase();

    if (
        value.includes('crítica') ||
        value.includes('critica')
    ) {
        return '#dc2626';
    }

    if (
        value.includes('alta')
    ) {
        return '#ea580c';
    }

    if (
        value.includes('media')
    ) {
        return '#ca8a04';
    }

    return '#2563eb';
};


// =====================================================
// COLOR DE SECTORES
// =====================================================

const getSectorColor = (
    index: number
): string => {

    const colors = [
        '#2563eb',
        '#16a34a',
        '#dc2626',
        '#9333ea',
        '#ea580c',
        '#0891b2',
        '#ca8a04',
        '#db2777'
    ];

    return colors[
        index % colors.length
    ];
};


// =====================================================
// MAPA
// =====================================================

const SantiagoMap = ({
    distrito,
    sectores,
    puntos
}: SantiagoMapProps) => {

    return (

        <div
            style={{
                position: 'relative',
                width: '100%',
                height: '560px',
                overflow: 'hidden',
                borderRadius: '14px'
            }}
        >

            <MapContainer
                center={DEFAULT_CENTER}
                zoom={13}
                minZoom={11}
                maxZoom={19}
                scrollWheelZoom={true}
                zoomControl={true}
                maxBoundsViscosity={0.75}
                style={{
                    width: '100%',
                    height: '100%'
                }}
            >

                {/* ==================================
                    OPEN STREET MAP
                ================================== */}

                <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />


                {/* ==================================
                    AJUSTAR VISTA AL DISTRITO
                ================================== */}

                <MapViewport
                    distrito={distrito}
                />


                {/* ==================================
                    DISTRITO DE SANTIAGO
                ================================== */}

                {distrito && (

                    <GeoJSONLayer
                        data={
                            distrito.geometria
                        }

                        style={{
                            color: '#111827',
                            weight: 3,
                            fillOpacity: 0
                        }}
                    />

                )}


                {/* ==================================
                    SECTORES CATASTRALES
                ================================== */}

                {sectores.map(
                    (
                        sector,
                        index
                    ) => {

                        const color =
                            getSectorColor(index);

                        return (

                            <GeoJSONLayer
                                key={
                                    sector.id_sector
                                }

                                data={
                                    sector.geometria
                                }

                                style={{
                                    color,
                                    weight: 1.5,
                                    fillColor: color,
                                    fillOpacity: 0.10
                                }}

                                onEachFeature={(
                                    _feature,
                                    layer
                                ) => {

                                    layer.bindTooltip(
                                        sector.nombre,
                                        {
                                            sticky: true
                                        }
                                    );

                                    layer.bindPopup(
                                        `
                                        <div>
                                            <strong>
                                                ${sector.nombre}
                                            </strong>
                                            ${
                                                sector.descripcion
                                                    ? `<br>${sector.descripcion}`
                                                    : ''
                                            }
                                        </div>
                                        `
                                    );

                                }}
                            />

                        );
                    }
                )}


                {/* ==================================
                    INCIDENCIAS
                ================================== */}

                {puntos.map(
                    (punto) => {

                        const color =
                            getPriorityColor(
                                punto.prioridad
                            );

                        const latitud =
                            Number(
                                punto.latitud
                            );

                        const longitud =
                            Number(
                                punto.longitud
                            );

                        // Evita renderizar puntos con coordenadas inválidas
                        if (
                            !Number.isFinite(latitud) ||
                            !Number.isFinite(longitud)
                        ) {
                            return null;
                        }

                        return (

                            <CircleMarker
                                key={
                                    punto.id_incidencia
                                }

                                center={[
                                    latitud,
                                    longitud
                                ]}

                                radius={7}

                                pathOptions={{
                                    color: '#ffffff',
                                    weight: 2,
                                    fillColor: color,
                                    fillOpacity: 0.90
                                }}
                            >

                                {/* TOOLTIP */}
                                <Tooltip
                                    direction="top"
                                    offset={[
                                        0,
                                        -6
                                    ]}
                                >
                                    {
                                        punto.codigo_incidencia ??
                                        punto.titulo ??
                                        'Incidencia'
                                    }
                                </Tooltip>


                                {/* POPUP */}
                                <Popup>

                                    <div
                                        style={{
                                            minWidth:
                                                '240px'
                                        }}
                                    >

                                        <div
                                            style={{
                                                fontSize:
                                                    '15px',
                                                fontWeight:
                                                    700,
                                                marginBottom:
                                                    '8px'
                                            }}
                                        >
                                            {
                                                punto.titulo ??
                                                'Incidencia urbana'
                                            }
                                        </div>


                                        <div>
                                            <strong>
                                                Código:
                                            </strong>{' '}

                                            {
                                                punto.codigo_incidencia ??
                                                '—'
                                            }
                                        </div>


                                        <div>
                                            <strong>
                                                Categoría:
                                            </strong>{' '}

                                            {
                                                punto.categoria ??
                                                '—'
                                            }
                                        </div>


                                        <div>
                                            <strong>
                                                Estado:
                                            </strong>{' '}

                                            {
                                                punto.estado ??
                                                '—'
                                            }
                                        </div>


                                        <div>
                                            <strong>
                                                Prioridad:
                                            </strong>{' '}

                                            {
                                                punto.prioridad ??
                                                '—'
                                            }
                                        </div>


                                        <div>
                                            <strong>
                                                Sector:
                                            </strong>{' '}

                                            {
                                                punto.sector ??
                                                '—'
                                            }
                                        </div>


                                        <div>
                                            <strong>
                                                Oficina:
                                            </strong>{' '}

                                            {
                                                punto.oficina ??
                                                '—'
                                            }
                                        </div>


                                        <div
                                            style={{
                                                marginTop:
                                                    '8px',
                                                color:
                                                    '#64748b',
                                                fontSize:
                                                    '12px'
                                            }}
                                        >
                                            {
                                                punto.direccion_texto ??
                                                'Sin dirección registrada'
                                            }
                                        </div>

                                    </div>

                                </Popup>

                            </CircleMarker>

                        );
                    }
                )}

            </MapContainer>


            {/* ==================================
                LEYENDA
            ================================== */}

            <div
                style={{
                    position: 'absolute',
                    zIndex: 1000,
                    right: '12px',
                    bottom: '12px',
                    background:
                        'rgba(255,255,255,0.96)',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    boxShadow:
                        '0 2px 10px rgba(0,0,0,0.15)',
                    fontSize: '12px'
                }}
            >

                <div
                    style={{
                        fontWeight: 700,
                        marginBottom: '8px'
                    }}
                >
                    Prioridad
                </div>


                <LegendItem
                    color="#dc2626"
                    label="Crítica"
                />


                <LegendItem
                    color="#ea580c"
                    label="Alta"
                />


                <LegendItem
                    color="#ca8a04"
                    label="Media"
                />


                <LegendItem
                    color="#2563eb"
                    label="Baja"
                />

            </div>

        </div>
    );
};


// =====================================================
// ITEM DE LEYENDA
// =====================================================

interface LegendItemProps {
    color: string;
    label: string;
}

const LegendItem = ({
    color,
    label
}: LegendItemProps) => (

    <div
        style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '4px'
        }}
    >

        <span
            style={{
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                background: color,
                display: 'inline-block',
                marginRight: '7px'
            }}
        />

        {label}

    </div>
);


export default SantiagoMap;