import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useProject } from '../../../context/ProjectContext';
import { supabase } from '../../../lib/supabaseClient';

const COLORS = ['#FF8042', '#0088FE', '#00C49F', '#FFBB28', '#8884d8', '#82ca9d'];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const DEFAULT_RATES = [
  { name: 'Marketing', value: 2.5, code: 'marketing' },
  { name: 'Sale', value: 32, code: 'sale' },
  { name: 'BA', value: 8, code: 'ba' },
  { name: 'Product', value: 12, code: 'product' },
  { name: 'Dev', value: 37, code: 'dev' },
  { name: 'CS', value: 10, code: 'cs' },
];

export const DistributionChart = () => {
  const { selectedProject } = useProject();
  const [rates, setRates] = useState<any[]>(DEFAULT_RATES);
  const fund = selectedProject.revenue * 0.6;

  useEffect(() => {
    const fetchRates = async () => {
      if (selectedProject.id === 'all') {
        setRates(DEFAULT_RATES);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('income_rate_config')
          .select('bo_phan, ty_le')
          .eq('project_id', selectedProject.id);

        if (error) throw error;

        if (data && data.length > 0) {
          const mapped = DEFAULT_RATES.map(item => {
            const match = data.find(d => d.bo_phan === item.code);
            return {
              ...item,
              value: match ? Number(match.ty_le) : item.value
            };
          });
          setRates(mapped);
        } else {
          setRates(DEFAULT_RATES);
        }
      } catch (err) {
        console.error('Error fetching income rates:', err);
        setRates(DEFAULT_RATES);
      }
    };

    fetchRates();
  }, [selectedProject.id]);

  const data = rates.map(item => ({
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

