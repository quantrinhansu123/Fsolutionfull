import { useState } from 'react';
import { DevTicketTable } from './components/DevTicketTable';
import type { Ticket } from './components/DevTicketTable';
import { DevSummary } from './components/DevSummary';
import { PointReference } from './components/PointReference';
import { DevTicketModal } from './components/DevTicketModal';
import { useProject } from '../../context/ProjectContext';
import { Plus, Filter, Code2, Sparkles, User } from 'lucide-react';

const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'TK-101',
    name: 'Phát triển module Login & Auth',
    type: 'Module lớn',
    point: 8,
    status: 'Done',
    reopen: 0,
    isBugByDev: false,
    developedBy: 'Nguyễn Văn A',
    projectId: '1'
  },
  {
    id: 'TK-102',
    name: 'Thiết kế UI Dashboard Admin',
    type: 'Module nhỏ',
    point: 5,
    status: 'Done',
    reopen: 1,
    isBugByDev: false,
    developedBy: 'Trần Thị B',
    projectId: '1'
  },
  {
    id: 'TK-103',
    name: 'Fix bug hiển thị biểu đồ tròn',
    type: 'Bug nhỏ',
    point: 2,
    status: 'Done',
    reopen: 3,
    isBugByDev: true,
    developedBy: 'Lê Văn C',
    projectId: '2'
  },
  {
    id: 'TK-104',
    name: 'Tối ưu hóa tốc độ tải trang',
    type: 'Cải tiến',
    point: 3,
    status: 'Done',
    reopen: 0,
    isBugByDev: false,
    developedBy: 'Nguyễn Văn A',
    projectId: '1'
  },
  {
    id: 'TK-105',
    name: 'Tích hợp API thanh toán VNPay',
    type: 'Module lớn',
    point: 8,
    status: 'Done',
    reopen: 0,
    isBugByDev: false,
    developedBy: 'Trần Thị B',
    projectId: '2'
  },
];

export default function DevPage() {
  const { projects, selectedProject, setSelectedProjectId } = useProject();
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [selectedDev, setSelectedDev] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);

  // Lấy danh sách Dev duy nhất từ tickets
  const developers = Array.from(new Set(tickets.map(t => t.developedBy)));

  const filteredTickets = tickets.filter(t => {
    const matchProject = selectedProject.id === 'all' || t.projectId === selectedProject.id;
    const matchDev = selectedDev === 'all' || t.developedBy === selectedDev;
    return matchProject && matchDev;
  });

  const totalValidPoints = filteredTickets
    .filter(t => t.reopen <= 1 && !t.isBugByDev)
    .reduce((sum, t) => sum + t.point, 0);

  const totalStandardPoints = 27; // Giả sử tổng point chuẩn cho dự án là 27

  const handleSaveTicket = (formData: any) => {
    if (editingTicket) {
      setTickets(tickets.map(t => t.id === editingTicket.id ? { ...formData, projectId: t.projectId || selectedProject.id } : t));
    } else {
      const newTicket = {
        ...formData,
        projectId: selectedProject.id === 'all' ? projects[1]?.id : selectedProject.id
      };
      setTickets([newTicket, ...tickets]);
    }
    setIsModalOpen(false);
    setEditingTicket(null);
  };

  const handleDeleteTicket = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa Ticket này không?')) {
      setTickets(tickets.filter(t => t.id !== id));
    }
  };

  const handleEditTicket = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setIsModalOpen(true);
  };

  const handleAddTicket = () => {
    setEditingTicket(null);
    setIsModalOpen(true);
  };

  const projectFund = selectedProject.revenue * 0.6;
  const devFund = projectFund * 0.37;
  const pricePerPoint = totalStandardPoints > 0 ? devFund / totalStandardPoints : 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="p-5 bg-blue-600 text-white rounded-3xl shadow-2xl shadow-blue-600/20">
              <Code2 size={32} />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Tổng hợp thu nhập Dev</h2>
              <Sparkles size={20} className="text-amber-400" />
            </div>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.2em] mt-1">Development Performance</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Project Filter */}
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors">
              <Filter size={18} />
            </div>
            <select 
              value={selectedProject.id}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer appearance-none min-w-[200px]"
            >
              <option value="all">Tất cả dự án</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Dev Filter */}
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors">
              <User size={18} />
            </div>
            <select 
              value={selectedDev}
              onChange={(e) => setSelectedDev(e.target.value)}
              className="pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer appearance-none min-w-[180px]"
            >
              <option value="all">Tất cả Dev</option>
              {developers.map(dev => (
                <option key={dev} value={dev}>{dev}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={handleAddTicket}
            className="flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-blue-600 shadow-xl shadow-slate-900/10 hover:shadow-blue-600/20 transition-all transform hover:-translate-y-1 active:translate-y-0"
          >
            <Plus size={20} />
            <span>Thêm Ticket Dev</span>
          </button>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="w-full">
        <DevTicketTable 
          tickets={filteredTickets} 
          pricePerPoint={pricePerPoint}
          onEdit={handleEditTicket}
          onDelete={handleDeleteTicket}
        />
      </div>

      {/* Summary Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-full">
          <DevSummary 
            totalValidPoints={totalValidPoints} 
            totalStandardPoints={totalStandardPoints} 
          />
        </div>
        <div className="h-full">
          <PointReference />
        </div>
      </div>

      {/* Modal */}
      <DevTicketModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTicket}
        ticket={editingTicket}
      />
    </div>
  );
}
