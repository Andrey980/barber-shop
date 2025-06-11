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
