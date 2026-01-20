import React from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

interface CryptoChartProps {
  data: number[];
  color?: string;
}

const CryptoChart: React.FC<CryptoChartProps> = ({ data, color = "#10b981" }) => {
  const formattedData = data.map((val, index) => ({ index, price: val }));

  return (
    <div className="h-16 w-32">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData}>
          <YAxis domain={['dataMin', 'dataMax']} hide />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke={color} 
            strokeWidth={2} 
            dot={false} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CryptoChart;
