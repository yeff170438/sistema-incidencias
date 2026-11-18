import {
    useCallback,
    useEffect,
    useState
} from 'react';

import {
    getAdminDashboard
} from '../services/admin.service';

import type {
    AdminDashboardData
} from '../types/admin-dashboard.types';


// =====================================================
// HOOK
// =====================================================

export const useAdminDashboard = () => {

    const [data, setData] =
        useState<AdminDashboardData | null>(null);


    const [loading, setLoading] =
        useState<boolean>(true);


    const [error, setError] =
        useState<string | null>(null);


    // =================================================
    // CARGAR DATOS
    // =================================================

    const loadDashboard =
        useCallback(async () => {

            try {

                setLoading(true);

                setError(null);


                const result =
                    await getAdminDashboard();


                setData(result);

            } catch (err: unknown) {

                console.error(
                    'Error cargando dashboard:',
                    err
                );


                if (
                    axiosErrorMessage(err)
                ) {

                    setError(
                        axiosErrorMessage(err)
                    );

                } else {

                    setError(
                        'No se pudo cargar el dashboard.'
                    );

                }

            } finally {

                setLoading(false);

            }

        }, []);


    // =================================================
    // CARGA INICIAL
    // =================================================

    useEffect(() => {

        loadDashboard();

    }, [loadDashboard]);


    return {

        data,

        loading,

        error,

        reload: loadDashboard

    };

};


// =====================================================
// MENSAJE DE ERROR
// =====================================================

const axiosErrorMessage =
    (error: unknown): string | null => {

        if (
            typeof error === 'object' &&
            error !== null &&
            'response' in error
        ) {

            const response =
                (
                    error as {
                        response?: {
                            data?: {
                                message?: string;
                            };
                        };
                    }
                ).response;


            return (
                response?.data?.message ??
                null
            );

        }


        return null;
    };