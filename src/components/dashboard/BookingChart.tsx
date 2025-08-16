'use client';

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { useState } from 'react';
import { TrendingUpIcon, BarChart3Icon, LineChartIcon } from 'lucide-react';

const data = [
  { name: 'Jan', bookings: 65, revenue: 4200, customers: 45 },
  { name: 'Feb', bookings: 78, revenue: 5100, customers: 52 },
  { name: 'Mar', bookings: 90, revenue: 5850, customers: 62 },
  { name: 'Apr', bookings: 81, revenue: 5265, customers: 58 },
  { name: 'May', bookings: 95, revenue: 6175, customers: 68 },
  { name: 'Jun', bookings: 89, revenue: 5785, customers: 64 },
  { name: 'Jul', bookings: 103, revenue: 6695, customers: 72 },
  { name: 'Aug', bookings: 97, revenue: 6305, customers: 69 },
];

type ChartType = 'area' | 'bar' | 'line';

export default function BookingChart() {
  const [chartType, setChartType] = useState<ChartType>('area');

  const formatTooltipValue = (value: number, name: string) => {
    if (name === 'revenue') {
      return [`$${value.toLocaleString()}`, 'Revenue'];
    }
    if (name === 'bookings') {
      return [value, 'Bookings'];
    }
    if (name === 'customers') {
      return [value, 'New Customers'];
    }
    return [value, name];
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-neutral-200 rounded-lg shadow-lg">
          <p className="font-semibold text-neutral-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {formatTooltipValue(entry.value, entry.dataKey)[1]}: {formatTooltipValue(entry.value, entry.dataKey)[0]}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 10, right: 30, left: 0, bottom: 0 }
    };

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="bookingsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0176d3" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#0176d3" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              stroke="#64748b" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="#64748b" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="bookings" 
              stroke="#0176d3" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#bookingsGradient)"
              name="Bookings"
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#16a34a" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#revenueGradient)"
              name="Revenue ($)"
              yAxisId="right"
            />
          </AreaChart>
        );
      
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              stroke="#64748b" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="bookings" fill="#0176d3" radius={[4, 4, 0, 0]} name="Bookings" />
            <Bar dataKey="customers" fill="#16a34a" radius={[4, 4, 0, 0]} name="New Customers" />
          </BarChart>
        );
      
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              stroke="#64748b" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="bookings" 
              stroke="#0176d3" 
              strokeWidth={3}
              dot={{ fill: '#0176d3', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#0176d3', strokeWidth: 2 }}
              name="Bookings"
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#16a34a" 
              strokeWidth={3}
              dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#16a34a', strokeWidth: 2 }}
              name="Revenue ($)"
            />
          </LineChart>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Chart Type Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <TrendingUpIcon className="h-4 w-4 text-neutral-600" />
          <span className="text-sm font-medium text-neutral-700">Performance Analytics</span>
        </div>
        <div className="flex items-center space-x-1 bg-neutral-100 rounded-lg p-1">
          <button
            onClick={() => setChartType('area')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              chartType === 'area' 
                ? 'bg-white text-neutral-900 shadow-sm' 
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <TrendingUpIcon className="h-3 w-3" />
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              chartType === 'bar' 
                ? 'bg-white text-neutral-900 shadow-sm' 
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <BarChart3Icon className="h-3 w-3" />
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              chartType === 'line' 
                ? 'bg-white text-neutral-900 shadow-sm' 
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <LineChartIcon className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart() || <div />}
        </ResponsiveContainer>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-neutral-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-neutral-900">103</div>
          <div className="text-xs text-neutral-600">Peak Month</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">$6,695</div>
          <div className="text-xs text-neutral-600">Highest Revenue</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">18.5%</div>
          <div className="text-xs text-neutral-600">Growth Rate</div>
        </div>
      </div>
    </div>
  );
}
