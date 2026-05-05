import React, { useState } from 'react';
import { CSTicketTable } from './components/CSTicketTable';
import { AMCIncome } from './components/AMCIncome';
import { CSSummary } from './components/CSSummary';
import { CSTicketModal } from './components/CSTicketModal';
import { useProject } from '../../context/ProjectContext';
import { Plus, Filter, Headphones, Sparkles } from 'lucide-react';

const INITIAL_TICKETS = [
  {
    id: '1',
    ticketId: 'TK-801',
    name: 'Cấu hình CRM & Portal khách hàng A',
    projectId: '1',
    project: 'ERP ABC Corp',
    type: 'deploy',
    customerConfirmed: true,
    hasError: false,
    owner: { name: 'Minh Hoàng', avatar: 'MH', role: 'Technical CS' },
    completedStages: ['done', 'acceptance', 'golive'],
  },
  {
    id: '2',
    ticketId: 'TK-802',
    name: 'Đào tạo vận hành cho team Sale B',
    projectId: '1',
    project: 'ERP ABC Corp',
    type: 'training',
    customerConfirmed: true,
    hasError: false,
    owner: { name: 'Thanh Thảo', avatar: 'TT', role: 'Support Specialist' },
    completedStages: ['done', 'acceptance'],
  },
  {
    id: '3',
    ticketId: 'TK-803',
    name: 'Triển khai module quản lý kho X',
    projectId: '2',
    project: 'Dự án App X',
    type: 'deploy',
    customerConfirmed: false,
    hasError: false,
    owner: { name: 'Ngọc Mai', avatar: 'NM', role: 'CS Consultant' },
    completedStages: ['done'],
  },
  {
    id: '4',
    ticketId: 'TK-804',
    name: 'Xử lý dữ liệu tồn kho đầu kỳ',
    projectId: '1',
    project: 'ERP ABC Corp',
    type: 'test',
    customerConfirmed: true,
    hasError: true,
    errorReason: 'Dữ liệu bị duplicate sau khi import',
    owner: { name: 'Thanh Thảo', avatar: 'TT', role: 'Support Specialist' },
    completedStages: ['done'],
  },
];

export default function CSPage() {
  const { projects, selectedProject, setSelectedProjectId } = useProject();
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);

  const filteredTickets = tickets.filter(t => 
    selectedProject.id === 'all' || t.projectId === selectedProject.id
  );

  const handleSaveTicket = (formData) => {
    if (editingTicket) {
      // Edit
      setTickets(tickets.map(t => t.id === editingTicket.id ? {
        ...t,
        name: formData.name,
        projectId: formData.projectId,
        type: formData.type,
        customerConfirmed: formData.customerConfirmed,
        hasError: formData.hasError,
        owner: { ...t.owner, name: formData.ownerName }
      } : t));
    } else {
      // Add
      const newTicket = {
        id: Math.random().toString(36).substr(2, 9),
        ticketId: formData.ticketId,
        name: formData.name,
        projectId: formData.projectId,
        type: formData.type,
        customerConfirmed: formData.customerConfirmed,
        hasError: formData.hasError,
        owner: { name: formData.ownerName, avatar: formData.ownerName.charAt(0), role: 'CS Specialist' },
        completedStages: ['done'],
      };
      setTickets([newTicket, ...tickets]);
    }
    setIsModalOpen(false);
    setEditingTicket(null);
  };

  const handleDeleteTicket = (ticketId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa Ticket này không?')) {
      setTickets(tickets.filter(t => t.id !== ticketId));
    }
  };

  const handleEditTicket = (ticket) => {
    setEditingTicket(ticket);
    setIsModalOpen(true);
  };

  const handleAddTicket = () => {
    setEditingTicket(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Premium Header / Top Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-600/20">
              <Headphones size={28} />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Hỗ trợ & Triển khai CS</h2>
              <Sparkles size={16} className="text-amber-400" />
            </div>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-0.5">Customer Success Operations</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors">
              <Filter size={18} />
            </div>
            <select 
              value={selectedProject.id}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="pl-12 pr-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer appearance-none min-w-[200px]"
            >
              <option value="all">Tất cả dự án</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={handleAddTicket}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-blue-600 shadow-xl shadow-slate-900/10 hover:shadow-blue-600/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus size={20} />
            <span>Tạo Ticket CS</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-8">
        {/* Full Width Ticket Table */}
        <div className="w-full">
          <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
            <div className="px-8 py-6 border-b border-slate-100/80 bg-slate-50/30 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Danh sách Ticket - {selectedProject.name}</h3>
                <p className="text-sm text-slate-500 mt-1 font-medium italic">Theo dõi tiến độ triển khai và xác nhận của khách hàng</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl">
                <span className="text-sm font-black tabular-nums">{filteredTickets.length}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Tickets</span>
              </div>
            </div>
            <CSTicketTable 
              tickets={filteredTickets} 
              onEdit={handleEditTicket}
              onDelete={handleDeleteTicket}
            />
          </div>
        </div>

        {/* AMC Income Section below the table */}
        <div className="w-full">
          <AMCIncome />
        </div>
      </div>

      {/* Summary Section */}
      <div className="pt-4">
        <CSSummary tickets={filteredTickets} />
      </div>

      {/* Modal */}
      <CSTicketModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTicket}
        ticket={editingTicket}
        projects={projects}
      />
    </div>
  );
}
