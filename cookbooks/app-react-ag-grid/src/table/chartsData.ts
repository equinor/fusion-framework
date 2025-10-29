// Sample data for charts demonstration
export type SalesData = {
  region: string;
  salesQ1: number;
  salesQ2: number;
  salesQ3: number;
  salesQ4: number;
  totalSales: number;
  profit: number;
  marketShare: number;
};

export const chartsData: SalesData[] = [
  {
    region: 'North America',
    salesQ1: 250000,
    salesQ2: 280000,
    salesQ3: 320000,
    salesQ4: 380000,
    totalSales: 1230000,
    profit: 185000,
    marketShare: 32.5,
  },
  {
    region: 'Europe',
    salesQ1: 180000,
    salesQ2: 220000,
    salesQ3: 240000,
    salesQ4: 290000,
    totalSales: 930000,
    profit: 145000,
    marketShare: 28.8,
  },
  {
    region: 'Asia Pacific',
    salesQ1: 150000,
    salesQ2: 170000,
    salesQ3: 210000,
    salesQ4: 260000,
    totalSales: 790000,
    profit: 120000,
    marketShare: 24.6,
  },
  {
    region: 'South America',
    salesQ1: 120000,
    salesQ2: 140000,
    salesQ3: 160000,
    salesQ4: 180000,
    totalSales: 600000,
    profit: 95000,
    marketShare: 18.2,
  },
  {
    region: 'Middle East',
    salesQ1: 95000,
    salesQ2: 115000,
    salesQ3: 135000,
    salesQ4: 155000,
    totalSales: 500000,
    profit: 78000,
    marketShare: 15.5,
  },
  {
    region: 'Africa',
    salesQ1: 80000,
    salesQ2: 95000,
    salesQ3: 110000,
    salesQ4: 125000,
    totalSales: 410000,
    profit: 62000,
    marketShare: 12.8,
  },
  {
    region: 'Oceania',
    salesQ1: 60000,
    salesQ2: 75000,
    salesQ3: 90000,
    salesQ4: 110000,
    totalSales: 335000,
    profit: 52000,
    marketShare: 10.4,
  },
];
