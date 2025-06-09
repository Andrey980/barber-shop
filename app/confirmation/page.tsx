'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { getServiceById, createAppointment } from '../services/api';

interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
  duration: string;
}

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('service');
  const date = searchParams.get('date');
  const time = searchParams.get('time');

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientName, setClientName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchService = async () => {
      if (!serviceId) {
        setError('ID do serviço não fornecido');
        setLoading(false);
        return;
      }

      try {
        const serviceData = await getServiceById(serviceId);
        setService(serviceData);
        setError(null);
      } catch (err) {
        setError('Falha ao carregar os detalhes do serviço.');
        console.error('Error fetching service:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceId]);

  const handleConfirmAppointment = async () => {
    if (!clientName.trim()) {
      setError('Por favor, informe seu nome.');
      return;
    }

    if (!serviceId || !date || !time) {
      setError('Informações do agendamento incompletas.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const appointmentDateTime = `${date}T${time}`;

      await createAppointment({
        client_name: clientName,
        service_id: serviceId,
        appointment_date: appointmentDateTime,
        status: 'scheduled'
      });

      router.push('/?success=true');
    } catch (err) {
      setError('Falha ao confirmar o agendamento. Por favor, tente novamente.');
      console.error('Error creating appointment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4 flex items-center justify-center">
        <p>Carregando detalhes do serviço...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
          Serviço não encontrado
        </div>
        <Link 
          href="/"
          className="block w-full bg-purple-500 text-white text-center py-4 rounded-lg hover:bg-purple-600 transition-colors"
        >
          Voltar para Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Header */}
      <header className="flex items-center mb-8">
        <Link href={`/calendar?service=${serviceId}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-semibold">Confirmação</h1>
      </header>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Confirmation Details */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold text-center mb-6">Confirme seu Agendamento</h2>
        
        <div className="space-y-4">
          {/* Nome do Cliente */}
          <div>
            <p className="text-gray-400">Seu Nome *</p>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Digite seu nome completo"
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <p className="text-gray-400">Serviço</p>
            <p className="font-semibold">{service.name}</p>
            <p className="text-sm text-gray-400">{service.description}</p>
            <p className="text-xs text-gray-500 mt-1">Duração: {service.duration} min</p>
          </div>
          
          <div>
            <p className="text-gray-400">Data</p>
            <p className="font-semibold">
              {date && new Date(date).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })}
            </p>
          </div>

          <div>
            <p className="text-gray-400">Horário</p>
            <p className="font-semibold">{time}</p>
          </div>

          <div>
            <p className="text-gray-400">Valor</p>
            <p className="font-semibold text-purple-500">R$ {service.price}</p>
          </div>
        </div>
      </div>

      {/* Confirm Button */}
      <button
        onClick={handleConfirmAppointment}
        disabled={isSubmitting}
        className={`block w-full bg-purple-500 text-white text-center py-4 rounded-lg transition-colors ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-600'
        }`}
      >
        {isSubmitting ? 'Confirmando...' : 'Confirmar Agendamento'}
      </button>

      {/* Cancel Button */}
      <Link 
        href="/"
        className="block w-full text-center py-4 text-gray-400 hover:text-white transition-colors mt-4"
      >
        Cancelar
      </Link>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 text-white p-4 flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
