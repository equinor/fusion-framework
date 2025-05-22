import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(BarElement, ArcElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const HomePage = () => {
  const barData = {
    labels: ['Red', 'Blue', 'Yellow'],
    datasets: [
      {
        label: 'Votes',
        data: [12, 19, 3],
        backgroundColor: ['#f87171', '#60a5fa', '#facc15'],
      },
    ],
  };

  const pieData = {
    labels: ['Chrome', 'Safari', 'Firefox'],
    datasets: [
      {
        label: 'Browser Usage',
        data: [65, 25, 10],
        backgroundColor: ['#60a5fa', '#facc15', '#f87171'],
      },
    ],
  };

  return (
    <div>
      <h2> Charts Cookbook </h2>
      <section>
        <h3>Bar Chart Example</h3>
        <div style={{ width: '100%', maxWidth: '500px' }}>
          <Bar data={barData} />
        </div>
      </section>
      <section>
        <h3>Pie Chart Example</h3>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <Pie data={pieData} />
        </div>
      </section>
    </div>
  );
};

export default HomePage;
