'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Gera horários disponíveis com intervalos de 30 minutos
const generateTimeSlots = () => {
  const slots: string[] = [];
  const startTime = new Date();
  startTime.setHours(9, 0, 0); // Começa às 9:00
  const endTime = new Date();
  endTime.setHours(17, 0, 0); // Termina às 17:00

  while (startTime <= endTime) {
    slots.push(
      startTime.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    );
    startTime.setMinutes(startTime.getMinutes() + 30); // Adiciona 30 minutos
  }
  return slots;
};

const timeSlots = generateTimeSlots();

export default function CalendarPage() {
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('service');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Generate dates for the next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date.toISOString().split('T')[0];
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Header */}
      <header className="flex items-center mb-8">
        <Link href="/services" className="mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-semibold">Escolha a Data</h1>
      </header>

      {/* Calendar */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Datas Disponíveis</h2>
        <div className="grid grid-cols-4 gap-2">
          {dates.map((date) => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`p-3 rounded-lg text-center ${
                selectedDate === date
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-800 text-gray-300'
              }`}
            >
              {new Date(date).toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'short',
              })}
            </button>
          ))}
        </div>
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Horários Disponíveis</h2>
          <div className="grid grid-cols-3 gap-2">
            {timeSlots.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`p-3 rounded-lg text-center ${
                  selectedTime === time
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-800 text-gray-300'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Confirm Button */}
      {selectedDate && selectedTime && (
        <Link
          href={`/confirmation?service=${serviceId}&date=${selectedDate}&time=${selectedTime}`}
          className="fixed bottom-4 left-4 right-4 bg-purple-500 text-white py-4 px-6 rounded-lg text-center font-semibold"
        >
          Confirmar Agendamento
        </Link>
      )}
    </div>
  );
}
