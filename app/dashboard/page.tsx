'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getServices, createService, deleteService, updateService, getFinancialStats, type FinancialStats, type ServiceRevenue, type MonthlyRevenue } from '../services/api';
import ServiceRevenuePieChart from '../components/ServiceRevenuePieChart';
import MonthlyRevenueChart from '../components/MonthlyRevenueChart';

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
  
  // Estados para dados financeiros
  const [financialStats, setFinancialStats] = useState<FinancialStats | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [financialLoading, setFinancialLoading] = useState(false);

  useEffect(() => {
    fetchServices();
    fetchFinancialData();
  }, [selectedMonth, selectedYear]);
  const fetchFinancialData = async () => {
    try {
      setFinancialLoading(true);
      const data = await getFinancialStats(selectedYear, selectedMonth);
      console.log('Financial data received:', data);
      setFinancialStats(data);
    } catch (err) {
      console.error('Error fetching financial data:', err);
      setError('Falha ao carregar dados financeiros.');
      // Definir dados padrão em caso de erro
      setFinancialStats({
        totalRevenue: 0,
        totalAppointments: 0,
        averageTicket: 0,
        monthlyRevenue: [],
        serviceRevenues: []
      });
    } finally {
      setFinancialLoading(false);
    }
  };

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
      </header>      {/* Error Message */}
      {error && (
        <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Financial Dashboard */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Painel Financeiro</h2>
          <div className="flex gap-4">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-gray-700 text-white px-3 py-2 rounded-lg"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString('pt-BR', { month: 'long' })}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-gray-700 text-white px-3 py-2 rounded-lg"
            >
              {Array.from({ length: 5 }, (_, i) => (
                <option key={i} value={new Date().getFullYear() - i}>
                  {new Date().getFullYear() - i}
                </option>
              ))}
            </select>
          </div>
        </div>

        {financialLoading ? (
          <div className="flex items-center justify-center h-40">
            <p>Carregando dados financeiros...</p>
          </div>
        ) : financialStats ? (
          <>            {/* Resumo Financeiro */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-gray-400 text-sm">Receita Total</h3>
                <p className="text-2xl font-bold text-green-400">
                  R$ {(typeof financialStats.totalRevenue === 'number' ? financialStats.totalRevenue : 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-gray-400 text-sm">Total de Atendimentos</h3>
                <p className="text-2xl font-bold text-blue-400">
                  {typeof financialStats.totalAppointments === 'number' ? financialStats.totalAppointments : 0}
                </p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-gray-400 text-sm">Ticket Médio</h3>
                <p className="text-2xl font-bold text-purple-400">
                  R$ {(typeof financialStats.averageTicket === 'number' ? financialStats.averageTicket : 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-gray-400 text-sm">Período</h3>
                <p className="text-lg font-semibold text-gray-300">
                  {new Date(0, selectedMonth - 1).toLocaleString('pt-BR', { month: 'long' })} {selectedYear}
                </p>
              </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Gráfico de Receita Mensal */}
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Receita dos Últimos Meses</h3>                {financialStats.monthlyRevenue && Array.isArray(financialStats.monthlyRevenue) && financialStats.monthlyRevenue.length > 0 ? (
                  <MonthlyRevenueChart 
                    data={financialStats.monthlyRevenue.map(item => ({
                      month: item.month ? new Date(0, parseInt(item.month) - 1).toLocaleString('pt-BR', { month: 'short' }) : 'Desconhecido',
                      total: item.total || 0
                    }))}
                  />
                ) : (
                  <p className="text-gray-400 text-center py-8">Sem dados de receita mensal</p>
                )}
              </div>

              {/* Gráfico de Pizza - Receita por Serviço */}
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Receita por Serviço</h3>                {financialStats.serviceRevenues && Array.isArray(financialStats.serviceRevenues) && financialStats.serviceRevenues.length > 0 ? (
                  <ServiceRevenuePieChart 
                    data={financialStats.serviceRevenues.map(service => ({
                      name: service.service_name || 'Serviço sem nome',
                      value: service.total_revenue || 0,
                      percentage: service.percentage || 0
                    }))}
                  />
                ) : (
                  <p className="text-gray-400 text-center py-8">Sem dados de receita por serviço</p>
                )}
              </div>
            </div>

            {/* Tabela de Receita por Serviço */}
            {financialStats.serviceRevenues && Array.isArray(financialStats.serviceRevenues) && financialStats.serviceRevenues.length > 0 && (
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Detalhamento por Serviço</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b border-gray-600">
                        <th className="pb-3">Serviço</th>
                        <th className="pb-3">Qtd. Atendimentos</th>
                        <th className="pb-3">Receita Total</th>
                        <th className="pb-3">% do Total</th>
                        <th className="pb-3">Ticket Médio</th>
                      </tr>
                    </thead>
                    <tbody>                      {financialStats.serviceRevenues.map((service, index) => (
                        <tr key={index} className="border-b border-gray-600">
                          <td className="py-3 font-medium">{service.service_name || 'Serviço sem nome'}</td>
                          <td className="py-3">{service.appointment_count || 0}</td>
                          <td className="py-3 text-green-400">R$ {(service.total_revenue || 0).toFixed(2)}</td>
                          <td className="py-3">{(service.percentage || 0).toFixed(1)}%</td>
                          <td className="py-3">R$ {(service.appointment_count ? (service.total_revenue || 0) / service.appointment_count : 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">Erro ao carregar dados financeiros</p>
          </div>
        )}
      </div>

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
