'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface ServiceRevenueData {
  name: string;
  value: number;
  percentage: number;
  color?: string;
}

interface ServiceRevenuePieChartProps {
  data: ServiceRevenueData[];
}

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8884d8', '#82ca9d'];

const ServiceRevenuePieChart: React.FC<ServiceRevenuePieChartProps> = ({ data }) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (        <div className="bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-700">
          <p className="text-white font-medium">{data.name || 'Sem nome'}</p>
          <p className="text-green-400">R$ {(data.value || 0).toFixed(2)}</p>
          <p className="text-blue-400">{data.percentage !== undefined ? data.percentage.toFixed(1) : '0.0'}%</p>
        </div>
      );
    }
    return null;
  };
  const renderCustomLabel = ({ name, percentage }: any) => {
    return percentage !== undefined ? `${percentage.toFixed(1)}%` : '';
  };

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={120}
            fill="#8884d8"
            label={renderCustomLabel}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />          <Legend 
            formatter={(value, entry) => (
              <span style={{ color: entry.color }}>
                {value} - R$ {(entry.payload?.value || 0).toFixed(2)}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ServiceRevenuePieChart;
