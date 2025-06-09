'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { getServices } from "./services/api";

interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
  duration: string;
}

export default function Home() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await getServices();
        setServices(data);
      } catch (err) {
        setError('Falha ao carregar os serviços. Por favor, tente novamente mais tarde.');
        console.error('Error fetching services:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4 flex items-center justify-center">
        <p>Carregando serviços...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-purple-500">GF3W BARBER</h1>
        </div>
        <Link 
          href="/dashboard" 
          className="text-gray-400 hover:text-purple-500 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </Link>
      </header>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Welcome Section */}
      <section className="mb-8">
        <p className="text-gray-400 text-sm">Faça já o agendamento do serviço!</p>
      </section>

      {/* Services Section */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-4">SERVIÇOS DISPONÍVEIS</h3>
        <div className="grid gap-4">
          {services.map((service) => (
            <Link href={`/calendar?service=${service.id}`} key={service.id} className="block">
              <div className="bg-gray-800 rounded-lg p-4 transition-transform transform hover:scale-105">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">{service.name}</h4>
                    <p className="text-sm text-gray-400">{service.description}</p>
                    <p className="text-xs text-gray-500 mt-1">Duração: {service.duration} min</p>
                  </div>
                  <div className="text-purple-500 font-semibold">
                    R$ {service.price}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
