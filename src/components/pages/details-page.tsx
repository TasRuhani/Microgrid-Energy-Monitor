'use client';
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, Button } from '@/components/ui';
import { getDummyData, getDummyAverageData } from '@/lib/dummy-data';

interface DetailsPageProps {
  metric: { title: string; value: string; unit: string };
  onBack: () => void;
  dateRange: string;
  setDateRange: (range: string) => void;
}

interface PayloadItem {
  name: string;
  value: number;
  unit: string;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: PayloadItem[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const unit = payload[0].unit;
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-md p-3 text-sm text-white shadow-lg">
        <p className="font-bold text-blue-300">{`Date: ${label}`}</p>
        {payload.map((item, index) => (
          <p key={index} style={{ color: item.color }} className="mt-1">
            {`${item.name}: ${item.value} ${unit}`}
          </p>
        ))}
      </div>
    );
  }

  return null;
};

export const DetailsPage = ({ metric, onBack, dateRange, setDateRange }: DetailsPageProps) => {
  const days = dateRange === '7d' ? 7 : 30;
  const graphData = getDummyData(metric.title, days);
  const averageData = getDummyAverageData(metric.title, graphData);

  const combinedData = graphData.map((d, i) => ({
    ...d,
    average: averageData[i].value,
    unit: metric.unit,
  }));

  return (
    <div className="flex flex-col items-center">
      <div className="w-full flex justify-start mb-6">
        <Button onClick={onBack} variant="ghost">
          &larr; Back to Dashboard
        </Button>
      </div>
      
      <Card className="w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">{metric.title} Overview</h2>
        <div className="text-center mb-6">
          <p className="text-4xl font-bold text-blue-300">
            {metric.value} <span className="text-xl font-normal text-slate-400">{metric.unit}</span>
          </p>
        </div>
        <div className="bg-slate-700 p-4 rounded-xl shadow-inner">
          <h3 className="text-lg font-medium text-slate-300 text-center mb-2">Historical {metric.title}</h3>
          <div className="flex flex-col sm:flex-row justify-center sm:space-x-2 space-y-2 sm:space-y-0 mb-4">
            <Button variant={dateRange === '7d' ? 'primary' : 'ghost'} onClick={() => setDateRange('7d')}>
              Last 7 Days
            </Button>
            <Button variant={dateRange === '30d' ? 'primary' : 'ghost'} onClick={() => setDateRange('30d')}>
              Last 30 Days
            </Button>
          </div>
          <ResponsiveContainer width="100%" height={220} className="md:h-[300px]">
            <LineChart data={combinedData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="name" stroke="#999" tickFormatter={(tick) => `${tick}`} interval="preserveStartEnd" tickLine={false} />
              <YAxis stroke="#999" tickLine={false} label={{ value: metric.unit, angle: -90, position: 'insideLeft', fill: '#999' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#82ca9d" activeDot={{ r: 8 }} name="Value" />
              <Line type="monotone" dataKey="average" stroke="#8884d8" name="24hr Avg" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <div className="w-full sm:hidden flex justify-center py-6">
        <Button onClick={onBack} variant="primary">
          &larr; Back to Dashboard
        </Button>
      </div>
    </div>
  );
};
