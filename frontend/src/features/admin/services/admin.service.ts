import axios from 'axios';

import type {
    AdminDashboardData,
    AdminDashboardResponse
} from '../types/admin-dashboard.types';


// =====================================================
// CONFIGURACIÓN
// =====================================================

const API_URL =
    import.meta.env.VITE_API_URL ??
    'http://localhost:3000/api';


// =====================================================
// TOKEN
// =====================================================

const getToken = (): string | null => {

    return (
        localStorage.getItem('token') ??
        localStorage.getItem('accessToken') ??
        localStorage.getItem('jwt')
    );

};


// =====================================================
// OBTENER DASHBOARD
// =====================================================

export const getAdminDashboard =
    async (): Promise<AdminDashboardData> => {

        const token = getToken();


        const response =
            await axios.get<AdminDashboardResponse>(
                `${API_URL}/admin/dashboard`,
                {
                    headers: token
                        ? {
                            Authorization:
                                `Bearer ${token}`
                        }
                        : undefined
                }
            );


        return response.data.data;

    };