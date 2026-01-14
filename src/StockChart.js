import React from 'react';
import { Line } from 'react-chartjs-2';

function StockChart({ chartData, chartOptions }) {
  if (!chartData) return null;
  return (
    <div style={{ width: '100%', maxWidth: 900, margin: '0 auto 24px' }}>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
}

export default StockChart;