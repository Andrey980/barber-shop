'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface ServiceType {
  name: string;
  price: string;
}

const services: Record<string, ServiceType> = {
  '1': { name: 'Corte', price: 'R$ 50' },
  '2': { name: 'Luzes', price: 'R$ 150' },
  '3': { name: 'Progressiva', price: 'R$ 200' }
};

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('service');
  const date = searchParams.get('date');
  const time = searchParams.get('time');

  const service = serviceId ? services[serviceId] : null;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Header */}
      <header className="flex items-center mb-8">
        <Link href="/" className="mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-semibold">Confirmação</h1>
      </header>

      {/* Confirmation Details */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold text-center mb-6">Agendamento Confirmado!</h2>
        
        <div className="space-y-4">
          <div>
            <p className="text-gray-400">Serviço</p>
            <p className="font-semibold">{service?.name}</p>
          </div>
          
          <div>
            <p className="text-gray-400">Data</p>
            <p className="font-semibold">
              {date && new Date(date).toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          
          <div>
            <p className="text-gray-400">Horário</p>
            <p className="font-semibold">{time}</p>
          </div>
          
          <div>
            <p className="text-gray-400">Valor</p>
            <p className="font-semibold text-purple-500">{service?.price}</p>
          </div>
        </div>
      </div>

      {/* Return to Home Button */}
      <Link
        href="/"
        className="block w-full bg-purple-500 text-white py-4 px-6 rounded-lg text-center font-semibold"
      >
        Voltar para o Início
      </Link>
    </div>
  );
}
