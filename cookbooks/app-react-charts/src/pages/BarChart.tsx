import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { Icon } from '@equinor/eds-core-react';
import { bar_chart } from '@equinor/eds-icons';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export const BarChart = () => {
  const data = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      {
        label: 'Revenue ($)',
        data: [12000, 19000, 3000, 5000],
        backgroundColor: 'rgba(53, 162, 235, 0.6)',
        borderColor: 'rgba(53, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div style={{ width: '100%', maxWidth: '600px' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Icon data={bar_chart} size={32} color="#60a5fa" /> Bar Chart Example
      </h2>
      <Bar data={data} options={options} />
    </div>
  );
};

export default BarChart;
