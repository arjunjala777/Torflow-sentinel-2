import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { TraceSession } from '../types';

interface PacketChartProps {
  trace: TraceSession;
}

const PacketChart: React.FC<PacketChartProps> = ({ trace }) => {
  const data = trace.packets.map((p, i) => ({
    name: i,
    size: p.sizeBytes,
    hop: p.hopId
  }));

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#222" />
          <XAxis 
            dataKey="name" 
            stroke="#666" 
            tick={{fontSize: 10}} 
            tickLine={false}
          />
          <YAxis 
            stroke="#666" 
            tick={{fontSize: 10}} 
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#050505', border: '1px solid #333' }}
            itemStyle={{ color: '#00ff00', fontSize: '12px', fontFamily: 'monospace' }}
            labelStyle={{ color: '#888', marginBottom: '4px' }}
          />
          <Line
            type="monotone"
            dataKey="size"
            stroke="#00ff00"
            strokeWidth={1.5}
            dot={{ r: 2, fill: '#00ff00' }}
            activeDot={{ r: 4 }}
            animationDuration={300}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PacketChart;
