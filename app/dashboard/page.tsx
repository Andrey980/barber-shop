'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getServices, createService, deleteService, updateService } from '../services/api';

interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
  duration: string;
}

interface ApiError {
  message: string;
  status?: number;
}

export default function DashboardPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    price: '',
    duration: ''
  });
  const [isAddingService, setIsAddingService] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const data = await getServices();
      setServices(data);
      setError(null);
    } catch (err) {
      setError('Falha ao carregar os serviços. Tente novamente mais tarde.');
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };
  const handleAddService = async () => {
    if (newService.name && newService.description && newService.price && newService.duration) {
      try {
        setError(null);
        // Remove qualquer caractere não numérico do preço
        const formattedPrice = newService.price.replace(/[^\d]/g, '');

        const newServiceData = {
          name: newService.name,
          description: newService.description,
          price: formattedPrice,
          duration: newService.duration
        };

        await createService(newServiceData);
        await fetchServices();
        setNewService({ name: '', description: '', price: '', duration: '' });
        setIsAddingService(false);      } catch (err) {
        const error = err as ApiError;
        setError(error.message || 'Falha ao adicionar o serviço. Tente novamente.');
        console.error('Error adding service:', error);
      }
    } else {
      setError('Por favor, preencha todos os campos obrigatórios.');
    }
  };

  const handleEditService = async () => {
    if (!editingService) return;    if (editingService.name && editingService.description && editingService.price && editingService.duration) {
      try {
        setError(null);
        // Remove qualquer caractere não numérico do preço
        const formattedPrice = typeof editingService.price === 'string' 
          ? editingService.price.replace(/[^\d]/g, '')
          : editingService.price;

        const updatedServiceData = {
          name: editingService.name,
          description: editingService.description,
          price: formattedPrice,
          duration: editingService.duration
        };

        await updateService(editingService.id, updatedServiceData);
        await fetchServices();
        setEditingService(null);      } catch (err) {
        const error = err as ApiError;
        setError(error.message || 'Falha ao atualizar o serviço. Tente novamente.');
        console.error('Error updating service:', error);
      }
    } else {
      setError('Por favor, preencha todos os campos obrigatórios.');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (window.confirm('Tem certeza de que deseja excluir este serviço?')) {
      try {
        setError(null);
        await deleteService(id);
        await fetchServices(); // Atualiza a lista de serviços
      } catch (err) {
        setError('Falha ao excluir o serviço. Tente novamente.');
        console.error('Error deleting service:', err);
      }
    }
  };

  const ServiceForm = ({ service, onSubmit, onCancel }: {
    service: { name: string; description: string; price: string; duration: string };
    onSubmit: () => void;
    onCancel: () => void;
  }) => (
    <div className="mb-6 bg-gray-700 p-4 rounded-lg">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-gray-300 mb-2">Nome do Serviço *</label>
          <input
            type="text"
            value={service.name}
            onChange={(e) => {
              if (editingService) {
                setEditingService({ ...editingService, name: e.target.value });
              } else {
                setNewService({ ...newService, name: e.target.value });
              }
            }}
            className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Ex: Corte de Cabelo"
          />
        </div>
        <div>
          <label className="block text-gray-300 mb-2">Descrição *</label>
          <textarea
            value={service.description}
            onChange={(e) => {
              if (editingService) {
                setEditingService({ ...editingService, description: e.target.value });
              } else {
                setNewService({ ...newService, description: e.target.value });
              }
            }}
            className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Ex: Corte masculino com máquina e tesoura"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-gray-300 mb-2">Preço *</label>          <input
            type="text"
            value={service.price}
            onChange={(e) => {
              // Permite apenas números no input
              const value = e.target.value.replace(/[^\d]/g, '');
              if (editingService) {
                setEditingService({ ...editingService, price: value });
              } else {
                setNewService({ ...newService, price: value });
              }
            }}
            className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Ex: 50"
          />
        </div>
        <div>
          <label className="block text-gray-300 mb-2">Duração (minutos) *</label>
          <input
            type="text"
            value={service.duration}
            onChange={(e) => {
              if (editingService) {
                setEditingService({ ...editingService, duration: e.target.value });
              } else {
                setNewService({ ...newService, duration: e.target.value });
              }
            }}
            className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Ex: 30"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={onSubmit}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
          >
            {editingService ? 'Atualizar' : 'Salvar'}
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4 flex items-center justify-center">
        <p>Carregando serviços...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Header */}      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-purple-500">Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/agendamentos" className="text-white hover:text-purple-500 transition-colors">
            Agendamentos
          </Link>
          <Link href="/" className="text-white hover:text-purple-500 transition-colors">
            Início
          </Link>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Services List */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Serviços</h2>
          <button
            onClick={() => setIsAddingService(true)}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
          >
            Adicionar Serviço
          </button>
        </div>

        {/* Add/Edit Service Form */}
        {(isAddingService || editingService) && (
          <ServiceForm
            service={editingService || newService}
            onSubmit={editingService ? handleEditService : handleAddService}
            onCancel={() => {
              setIsAddingService(false);
              setEditingService(null);
              setNewService({ name: '', description: '', price: '', duration: '' });
              setError(null);
            }}
          />
        )}

        {/* Services Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="pb-4">Serviço</th>
                <th className="pb-4">Descrição</th>
                <th className="pb-4">Preço</th>
                <th className="pb-4">Duração</th>
                <th className="pb-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id} className="border-b border-gray-700">                  <td className="py-4">{service.name}</td>
                  <td className="py-4">{service.description}</td>
                  <td className="py-4">R$ {service.price}</td>
                  <td className="py-4">{service.duration} min</td>
                  <td className="py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingService(service)}
                        className="text-blue-500 hover:text-blue-400 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteService(service.id)}
                        className="text-red-500 hover:text-red-400 transition-colors"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
