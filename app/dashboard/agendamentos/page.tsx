'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getAppointmentsByDate, getDaysWithAppointments, updateAppointment, getServiceById } from '../../services/api';

interface Appointment {
  id: string;
  client_name: string;
  service_id: string;
  appointment_date: string;
  status: string;
  total_value?: string;
  service?: {
    name: string;
    price: string;
    duration: string;
  };
}

interface EditModalProps {
  appointment: Appointment;
  onClose: () => void;
  onSave: (appointment: Appointment) => Promise<void>;
} 

const EditModal: React.FC<EditModalProps> = ({ appointment, onClose, onSave }) => {
  const [status, setStatus] = useState(appointment.status);
  const [isLoading, setIsLoading] = useState(false);
  
  console.log('appointment.appointment_date:', appointment.appointment_date);
  
  // Converter a data do formato do banco para o formato do input date
  const parts = appointment.appointment_date?.split(' ') || [];
  const dateObj = new Date(parts[0] || '');
  const formattedDate = dateObj.toISOString().split('T')[0];
  const formattedTime = parts[1]?.slice(0, 5) || '';
  
  const [date, setDate] = useState(formattedDate);
  const [time, setTime] = useState(formattedTime);
  const [totalValue, setTotalValue] = useState(appointment.total_value || appointment.service?.price || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Montar a string completa no formato YYYY-MM-DDTHH:mm:00
      const dateTimeString = `${date}T${time}:00`;
      const newDate = new Date(dateTimeString);
      // Formatar a data no formato do banco (YYYY-MM-DD HH:mm:ss)
      const formattedDate = `${date} ${time}:00`;
      const updatedAppointment = {
        ...appointment,
        status,
        appointment_date: formattedDate,
        ...(status === 'completed' && { total_value: totalValue })
      };
      await onSave(updatedAppointment);
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Editar Agendamento</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Cliente</label>
            <p className="text-gray-400">{appointment.client_name}</p>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Serviço</label>
            <p className="text-gray-400">{appointment.service?.name}</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Data</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Horário</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2"
            >
              <option value="scheduled">Agendado</option>
              <option value="completed">Concluído</option>
              <option value="canceled">Cancelado</option>
            </select>
          </div>

          {status === 'completed' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Valor Total</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">R$ </span>
                <input
                  type="text"
                  value={totalValue}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.,]/g, '');
                    setTotalValue(value);
                  }}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 pl-8"
                  placeholder="0,00"
                />
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [daysWithAppointments, setDaysWithAppointments] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    const fetchMonthAppointments = async () => {
      try {
        const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        const dates = await getDaysWithAppointments(
          firstDay.toISOString().split('T')[0],
          lastDay.toISOString().split('T')[0]
        );
        setDaysWithAppointments(dates);
      } catch (err) {
        console.error('Erro ao buscar dias com agendamentos:', err);
      }
    };

    fetchMonthAppointments();
  }, [currentMonth]);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAppointmentsByDate(selectedDate);
      
      // Fetch service details for each appointment
      const appointmentsWithServices = await Promise.all(
        data.map(async (appointment) => {
          try {
            const service = await getServiceById(appointment.service_id);
            return {
              ...appointment,
              service: {
                name: service.name,
                price: service.price,
                duration: service.duration
              }
            };
          } catch (error) {
            console.error(`Error fetching service for appointment ${appointment.id}:`, error);
            return appointment;
          }
        })
      );

      setAppointments(appointmentsWithServices);
      setError(null);
    } catch (err) {
      setError('Falha ao carregar os agendamentos. Tente novamente mais tarde.');
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEditAppointment = async (updatedAppointment: Appointment) => {
    try {
      await updateAppointment(updatedAppointment.id, updatedAppointment);
      
      // Buscar os detalhes do serviço novamente e atualizar o appointment com o valor total
      const service = await getServiceById(updatedAppointment.service_id);
      const appointmentWithService = {
        ...updatedAppointment,
        service: {
          name: service.name,
          price: updatedAppointment.total_value || service.price,
          duration: service.duration
        }
      };

      setAppointments(appointments.map(app => 
        app.id === updatedAppointment.id ? appointmentWithService : app
      ));
    } catch (error) {
      setError('Falha ao atualizar o agendamento. Tente novamente mais tarde.');
      console.error('Error updating appointment:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4 flex items-center justify-center">
        <p>Carregando agendamentos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-purple-500">Agendamentos</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-white hover:text-purple-500 transition-colors">
            Dashboard
          </Link>
        </div>
      </header>

      {/* Error Message */}      {error && (
        <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      {/* Calendar */}
      <div className="mb-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="text-gray-400 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="text-lg font-semibold">
              {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="text-gray-400 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
              <div key={day} className="text-center text-sm text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 42 }, (_, i) => {
              const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
              date.setDate(1 - date.getDay() + i);
              const dateStr = date.toISOString().split('T')[0];
              const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
              const isSelected = dateStr === selectedDate;
              const hasAppointments = daysWithAppointments.includes(dateStr);

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`
                    relative p-2 text-center rounded-lg transition-colors
                    ${isCurrentMonth ? 'text-white' : 'text-gray-600'}
                    ${isSelected ? 'bg-purple-500' : hasAppointments && isCurrentMonth ? 'bg-gray-700' : ''}
                    ${!isSelected && isCurrentMonth ? 'hover:bg-gray-700' : ''}
                  `}
                  disabled={!isCurrentMonth}
                >
                  {date.getDate()}
                  {hasAppointments && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-purple-500 rounded-full"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Agendamentos do Dia</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="pb-4">Horário</th>
                <th className="pb-4">Cliente</th>
                <th className="pb-4">Serviço</th>
                <th className="pb-4">Duração</th>
                <th className="pb-4">Valor</th>
                <th className="pb-4">Status</th>
                <th className="pb-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-gray-400">Nenhum agendamento encontrado para esta data.</td>
                </tr>
              ) : (
                appointments.map((appointment) => (
                  <tr key={appointment.id} className="border-b border-gray-700">
                    <td className="py-4">{formatDateTime(appointment.appointment_date)}</td>
                    <td className="py-4">{appointment.client_name}</td>
                    <td className="py-4">{appointment.service?.name}</td>
                    <td className="py-4">{appointment.service?.duration} min</td>
                    <td className="py-4">R$ {appointment.total_value || appointment.service?.price}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        appointment.status === 'scheduled' ? 'bg-blue-500' :
                        appointment.status === 'completed' ? 'bg-green-500' :
                        appointment.status === 'canceled' ? 'bg-red-500' :
                        'bg-gray-500'
                      }`}>{appointment.status === 'scheduled' ? 'Agendado' :
                        appointment.status === 'completed' ? 'Concluído' :
                        appointment.status === 'canceled' ? 'Cancelado' :
                        appointment.status}</span>
                    </td>
                    <td className="py-4">
                      <button onClick={() => setEditingAppointment(appointment)} className="text-sm text-purple-500 hover:text-purple-400">Editar</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingAppointment && (
        <EditModal
          appointment={editingAppointment}
          onClose={() => setEditingAppointment(null)}
          onSave={handleEditAppointment}
        />
      )}
    </div>
  );
}
