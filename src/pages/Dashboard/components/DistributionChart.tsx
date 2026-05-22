import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useProject } from '../../../context/ProjectContext';

const COLORS = ['#FF8042', '#0088FE', '#00C49F', '#FFBB28', '#8884d8', '#82ca9d'];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

export const DistributionChart = () => {
  const { selectedProject } = useProject();
  const fund = selectedProject.revenue * 0.6;

  const data = [
    { name: 'Marketing', value: 2.5 },
    { name: 'Sale', value: 32 },
    { name: 'BA', value: 8 },
    { name: 'Product', value: 12 },
    { name: 'Dev', value: 37 },
    { name: 'CS', value: 10 },
  ].map(item => ({
    ...item,
    amount: (fund * item.value) / 100
  }));

  return (
    <div className="bg-white p-6 border border-slate-200 shadow-sm h-[400px]">
      <h3 className="font-bold text-slate-800 mb-6">Phân phối quỹ thu nhập (%)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="40%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name, item) => {
              const num = Number(value ?? 0);
              const amount = (item?.payload as { amount?: number })?.amount ?? 0;
              return [`${num}% (${formatCurrency(amount)})`, String(name ?? '')];
            }}
          />
          <Legend layout="vertical" align="right" verticalAlign="middle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
