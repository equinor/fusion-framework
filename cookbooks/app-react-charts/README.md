# Charts Cookbook

This cookbook demonstrates how to create interactive data visualizations using Chart.js with the Fusion Framework.

## What This Shows

This cookbook illustrates how to:
- Integrate Chart.js with React
- Create different chart types (bar, line, pie)
- Use navigation to switch between chart examples
- Register Chart.js components
- Style charts with options and colors

## Key Concepts

Chart.js provides a flexible library for creating various chart types. This cookbook shows you how to:
- Register required Chart.js components
- Define data structures for charts
- Configure chart options
- Navigate between multiple chart examples

## Code Example

### Creating a Bar Chart

```typescript
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

// Register the components needed for bar charts
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export const BarChart = () => {
  // Define the chart data
  const data = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'], // X-axis labels
    datasets: [
      {
        label: 'Revenue ($)', // Legend label
        data: [12000, 19000, 3000, 5000], // Y-axis values
        backgroundColor: 'rgba(53, 162, 235, 0.6)', // Bar fill color
        borderColor: 'rgba(53, 162, 235, 1)', // Bar border color
        borderWidth: 1,
      },
    ],
  };

  // Configure chart options
  const options = {
    responsive: true, // Chart adjusts to container size
    plugins: {
      legend: {
        position: 'top' as const, // Show legend at top
      },
    },
    scales: {
      y: {
        beginAtZero: true, // Y-axis starts at 0
      },
    },
  };

  return (
    <div style={{ width: '100%', maxWidth: '600px' }}>
      <Bar data={data} options={options} />
    </div>
  );
};
```

### Creating a Line Chart

```typescript
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

// Register line-specific components
ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

export const LineChart = () => {
  const data = {
    labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    datasets: [
      {
        label: 'Site Visits',
        data: [200, 450, 300, 500, 400],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.4, // Smooth curve
        fill: true, // Fill area under line
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Visits', // Y-axis label
        },
      },
      x: {
        title: {
          display: true,
          text: 'Day of Week', // X-axis label
        },
      },
    },
  };

  return <Line data={data} options={options} />;
};
```

## Understanding Chart Structure

### Data Format

All charts use the same data structure:

```typescript
const data = {
  labels: ['Label 1', 'Label 2'], // X-axis categories
  datasets: [
    {
      label: 'Dataset Name', // Appears in legend
      data: [10, 20], // Actual values
      // ... styling properties
    },
  ],
};
```

### Chart Registration

Each chart type requires specific components to be registered:

- **Bar charts**: `BarElement`, `CategoryScale`, `LinearScale`
- **Line charts**: `LineElement`, `PointElement`, `CategoryScale`, `LinearScale`
- **Pie charts**: `ArcElement`, `Tooltip`, `Legend`

### Responsive Design

Setting `responsive: true` makes the chart automatically resize to fit its container. You can control sizing with CSS:

```typescript
<div style={{ width: '100%', maxWidth: '600px' }}>
  <Bar data={data} options={options} />
</div>
```

## Navigation in This Cookbook

This cookbook uses React Router to navigate between different chart examples. The routing setup allows you to see multiple chart types in one application.

## When to Use Charts

Charts are perfect for:
- Data dashboards
- Reporting and analytics
- Visualizing trends over time
- Comparing different metrics
- Making data more accessible to users