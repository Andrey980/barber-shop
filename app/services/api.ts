interface ApiError {
  message: string;
  status?: number;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
  duration: string;
}

export interface Appointment {
  id: string;
  client_name: string;
  service_id: string;
  appointment_date: string;
  status: string;
  service?: {
    name: string;
    price: string;
    duration: string;
  };
}

// Interfaces para dados financeiros
export interface MonthlyRevenue {
  month: string;
  year: number;
  total: number;
}

export interface ServiceRevenue {
  service_id: string;
  service_name: string;
  total_revenue: number;
  appointment_count: number;
  percentage: number;
}

export interface FinancialStats {
  totalRevenue: number;
  totalAppointments: number;
  averageTicket: number;
  monthlyRevenue: MonthlyRevenue[];
  serviceRevenues: ServiceRevenue[];
}

const API_URL = 'http://localhost:8080/api';
// const API_URL = 'https://barber-shop-backend-production.up.railway.app/api';

export const getServices = async (): Promise<Service[]> => {
  try {
    const response = await fetch(`${API_URL}/services`);
    if (!response.ok) {
      throw new Error('Failed to fetch services');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
};

export const createService = async (service: Omit<Service, 'id'>): Promise<Service> => {
  try {
    const response = await fetch(`${API_URL}/services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(service),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create service');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
};

export const deleteService = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/services/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete service');
    }
  } catch (error) {
    console.error('Error deleting service:', error);
    throw error;
  }
};

export const updateService = async (id: string, service: Omit<Service, 'id'>): Promise<Service> => {
  try {
    const response = await fetch(`${API_URL}/services/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(service),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to update service' }));
      throw new Error(errorData.message || 'Failed to update service');
    }
    
    const updatedService = await response.json();
    return updatedService;  } catch (error) {
    const apiError = error as ApiError;
    console.error('Error updating service:', apiError);
    throw new Error(apiError.message || 'Failed to update service');
  }
};

export const createAppointment = async (appointment: Omit<Appointment, 'id'>): Promise<Appointment> => {
  try {
    const response = await fetch(`${API_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointment),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to create appointment' }));
      throw new Error(errorData.message || 'Failed to create appointment');
    }
    
    return response.json();  } catch (error) {
    const apiError = error as ApiError;
    console.error('Error creating appointment:', apiError);
    throw new Error(apiError.message || 'Failed to create appointment');
  }
};

export const getServiceById = async (id: string): Promise<Service> => {
  try {
    const response = await fetch(`${API_URL}/services/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch service');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching service:', error);
    throw error;
  }
};

export const getAppointments = async (date: string): Promise<Appointment[]> => {
  try {
    const response = await fetch(`${API_URL}/appointments?date=${date}`);
    if (!response.ok) {
      throw new Error('Failed to fetch appointments');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
};

export const getDaysWithAppointments = async (startDate: string, endDate: string): Promise<string[]> => {
  try {
    const response = await fetch(`${API_URL}/appointments/days-with-appointments?start=${startDate}&end=${endDate}`);
    if (!response.ok) {
      throw new Error('Failed to fetch days with appointments');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching days with appointments:', error);
    throw error;
  }
};

export const getAppointmentsByDate = async (date: string): Promise<Appointment[]> => {
  try {
    const response = await fetch(`${API_URL}/appointments/by-date/${date}`);
    if (!response.ok) {
      throw new Error('Failed to fetch appointments');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
};

export const updateAppointment = async (id: string, appointment: Partial<Appointment>): Promise<Appointment> => {
  try {
    const response = await fetch(`${API_URL}/appointments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointment),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Falha ao atualizar agendamento' }));
      throw new Error(errorData.message || 'Falha ao atualizar agendamento');
    }
    
    return response.json();
  } catch (error) {
    const apiError = error as ApiError;
    console.error('Error updating appointment:', apiError);
    throw new Error(apiError.message || 'Falha ao atualizar agendamento');
  }
};

// Buscar receita mensal
export const getMonthlyRevenue = async (year?: number, month?: number): Promise<MonthlyRevenue[]> => {
  try {
    const currentDate = new Date();
    const targetYear = year || currentDate.getFullYear();
    const targetMonth = month || currentDate.getMonth() + 1;
    
    const response = await fetch(`${API_URL}/appointments/revenue/monthly?year=${targetYear}&month=${targetMonth}`);
    if (!response.ok) {
      throw new Error('Falha ao buscar receita mensal');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching monthly revenue:', error);
    throw error;
  }
};

// Buscar receita por serviço
export const getServiceRevenue = async (year?: number, month?: number): Promise<ServiceRevenue[]> => {
  try {
    const currentDate = new Date();
    const targetYear = year || currentDate.getFullYear();
    const targetMonth = month || currentDate.getMonth() + 1;
    
    const response = await fetch(`${API_URL}/appointments/revenue/services?year=${targetYear}&month=${targetMonth}`);
    if (!response.ok) {
      throw new Error('Falha ao buscar receita por serviço');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching service revenue:', error);
    throw error;
  }
};

// Buscar estatísticas financeiras completas
export const getFinancialStats = async (year?: number, month?: number): Promise<FinancialStats> => {
  try {
    const currentDate = new Date();
    const targetYear = year || currentDate.getFullYear();
    const targetMonth = month || currentDate.getMonth() + 1;
    
    // Buscar as estatísticas básicas
    const statsResponse = await fetch(`${API_URL}/appointments/stats?year=${targetYear}&month=${targetMonth}`);
    if (!statsResponse.ok) {
      throw new Error('Falha ao buscar estatísticas financeiras');
    }
    
    // Buscar receita mensal dos últimos meses
    const monthlyRevenueResponse = await fetch(`${API_URL}/appointments/revenue/monthly?year=${targetYear}&month=${targetMonth}`);
    if (!monthlyRevenueResponse.ok) {
      throw new Error('Falha ao buscar receita mensal');
    }
    
    // Buscar receita por serviço
    const serviceRevenueResponse = await fetch(`${API_URL}/appointments/revenue/services?year=${targetYear}&month=${targetMonth}`);
    if (!serviceRevenueResponse.ok) {
      throw new Error('Falha ao buscar receita por serviço');
    }
    
    // Processar os dados
    const statsData = await statsResponse.json();
    let monthlyRevenue: MonthlyRevenue[] = [];
    try {
      monthlyRevenue = await monthlyRevenueResponse.json();
    } catch (e) {
      console.error('Erro ao processar dados de receita mensal:', e);
    }
    
    let serviceRevenues: ServiceRevenue[] = [];
    try {
      serviceRevenues = await serviceRevenueResponse.json();
    } catch (e) {
      console.error('Erro ao processar dados de receita por serviço:', e);
    }
    
    // Calcular receita total a partir dos dados de serviço, caso não venha da API
    let totalRevenue = 0;
    if (serviceRevenues && serviceRevenues.length > 0) {
      totalRevenue = serviceRevenues.reduce((sum, service) => sum + (service.total_revenue || 0), 0);
    }
    
    console.log('API Stats Response:', statsData);
    
    // Transformar os dados para o formato esperado pelo frontend
    return {
      totalRevenue: totalRevenue,
      totalAppointments: statsData.total_appointments || 0,
      averageTicket: statsData.average_value || 0,
      monthlyRevenue: monthlyRevenue || [],
      serviceRevenues: serviceRevenues || []
    };
  } catch (error) {
    console.error('Error fetching financial stats:', error);
    throw error;
  }
};
