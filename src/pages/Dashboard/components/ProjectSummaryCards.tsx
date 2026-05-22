import { useProject } from '../../../context/ProjectContext';
import { TrendingUp, CreditCard, PieChart, Wallet } from 'lucide-react';
import { cn } from '../../../lib/utils';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(value);
};

export const ProjectSummaryCards = () => {
  const { selectedProject } = useProject();
  
  const cost = selectedProject.revenue * 0.1;
  const profit = selectedProject.revenue * 0.3;
  const fund = selectedProject.revenue * 0.6;

  const cards = [
    { 
      title: 'Doanh thu phần mềm', 
      value: selectedProject.revenue, 
      icon: TrendingUp, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50/50',
      border: 'border-blue-100/50',
      shadow: 'hover:shadow-blue-500/10'
    },
    { 
      title: 'Chi phí chung (10%)', 
      value: cost, 
      icon: CreditCard, 
      color: 'text-orange-600', 
      bg: 'bg-orange-50/50',
      border: 'border-orange-100/50',
      shadow: 'hover:shadow-orange-500/10'
    },
    { 
      title: 'Lợi nhuận kỳ vọng (30%)', 
      value: profit, 
      icon: PieChart, 
      color: 'text-purple-600', 
      bg: 'bg-purple-50/50',
      border: 'border-purple-100/50',
      shadow: 'hover:shadow-purple-500/10'
    },
    { 
      title: 'Quỹ còn lại để chia', 
      value: fund, 
      icon: Wallet, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50/50',
      border: 'border-emerald-100/50',
      shadow: 'hover:shadow-emerald-500/10',
      highlight: true
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div 
          key={index} 
          className={cn(
            "relative group p-6 bg-white rounded-3xl border shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1",
            card.border,
            card.shadow,
            card.highlight ? "bg-gradient-to-br from-white to-emerald-50/30" : ""
          )}
        >
          {/* Subtle Background Pattern */}
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
            <card.icon size={80} />
          </div>

          <div className="relative">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300",
              card.bg, 
              card.color
            )}>
              <card.icon size={24} strokeWidth={2.5} />
            </div>
            
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">{card.title}</p>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight tabular-nums">
              {formatCurrency(card.value)}
            </h3>
            
            {/* Progress indicator or simple bar */}
            <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={cn("h-full rounded-full transition-all duration-1000 ease-out", card.color.replace('text', 'bg'))}
                style={{ width: card.highlight ? '100%' : '60%', opacity: 0.7 }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
