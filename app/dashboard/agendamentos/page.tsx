'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAppointmentsByDate, getDaysWithAppointments } from '../../services/api';

interface Appointment {
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

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [daysWithAppointments, setDaysWithAppointments] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

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

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await getAppointmentsByDate(selectedDate);
      setAppointments(data);
      setError(null);
    } catch (err) {
      setError('Falha ao carregar os agendamentos. Tente novamente mais tarde.');
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
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
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-gray-400">
                    Nenhum agendamento encontrado para esta data.
                  </td>
                </tr>
              ) : (
                appointments.map((appointment) => (
                  <tr key={appointment.id} className="border-b border-gray-700">
                    <td className="py-4">{formatDateTime(appointment.appointment_date)}</td>
                    <td className="py-4">{appointment.client_name}</td>
                    <td className="py-4">{appointment.service?.name}</td>
                    <td className="py-4">{appointment.service?.duration} min</td>
                    <td className="py-4">R$ {appointment.service?.price}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        appointment.status === 'scheduled' ? 'bg-blue-500' :
                        appointment.status === 'completed' ? 'bg-green-500' :
                        appointment.status === 'canceled' ? 'bg-red-500' :
                        'bg-gray-500'
                      }`}>
                        {appointment.status === 'scheduled' ? 'Agendado' :
                         appointment.status === 'completed' ? 'Concluído' :
                         appointment.status === 'canceled' ? 'Cancelado' :
                         appointment.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
