import React, { useState } from 'react';
import { TicketTable } from './components/TicketTable';
import { BASummary } from './components/BASummary';
import { TicketModal } from './components/TicketModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { useProject } from '../../context/ProjectContext';
import { Plus, Filter, FileText } from 'lucide-react';

const PROJECT_FUND = 12000000;

const INITIAL_TICKETS = [
  {
    id: 1,
    ticketId: 'TK-101',
    name: 'Đặc tả nghiệp vụ module Quản lý đơn hàng',
    project: 'ERP ABC Corp',
    projectId: '1',
    docLink: 'https://docs.google.com/document/d/ba-spec1',
    status: 'Done',
    type: 'BA',
    rejected: false,
    owner: { name: 'Quý Dương', avatar: 'QD', role: 'Senior BA' },
    completedStages: ['done', 'acceptance', 'golive'],
  },
  {
    id: 2,
    ticketId: 'TK-102',
    name: 'Đặc tả luồng giao hàng & vận chuyển',
    project: 'ERP ABC Corp',
    projectId: '1',
    docLink: 'https://docs.google.com/document/d/ba-spec2',
    status: 'Done',
    type: 'BA',
    rejected: false,
    owner: { name: 'Thanh Thảo', avatar: 'TT', role: 'BA' },
    completedStages: ['done', 'acceptance'],
  },
  {
    id: 3,
    ticketId: 'TK-103',
    name: 'Đặc tả module Báo cáo tài chính',
    project: 'ERP ABC Corp',
    projectId: '1',
    docLink: null,
    status: 'Done',
    type: 'BA',
    rejected: false,
    owner: { name: 'Minh Hoàng', avatar: 'MH', role: 'SA' },
    completedStages: ['done'],
  },
  {
    id: 4,
    ticketId: 'TK-104',
    name: 'Đặc tả tích hợp cổng thanh toán',
    project: 'Dự án App X',
    projectId: '2',
    docLink: 'https://docs.google.com/document/d/ba-spec4',
    status: 'Done',
    type: 'BA',
    rejected: true,
    rejectReason: 'Thiếu kịch bản edge-case cho cổng thanh toán quốc tế',
    owner: { name: 'Quý Dương', avatar: 'QD', role: 'Senior BA' },
    completedStages: [],
  },
  {
    id: 5,
    ticketId: 'TK-105',
    name: 'Đặc tả module Quản lý kho',
    project: 'ERP ABC Corp',
    projectId: '1',
    docLink: null,
    status: 'In Progress',
    type: 'BA',
    rejected: false,
    owner: { name: 'Ngọc Mai', avatar: 'NM', role: 'BA' },
    completedStages: [],
  },
];

export default function BAPage() {
  const { projects, selectedProject, setSelectedProjectId } = useProject();
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  
  // Modals States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [deletingTicket, setDeletingTicket] = useState(null);

  const filteredTickets = tickets.filter(t => 
    selectedProject.id === 'all' || t.projectId === selectedProject.id
  );

  const handleAddTicket = () => {
    setEditingTicket(null);
    setIsModalOpen(true);
  };

  const handleEditTicket = (ticket) => {
    setEditingTicket(ticket);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (ticket) => {
    setDeletingTicket(ticket);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingTicket) {
      setTickets(tickets.filter(t => t.id !== deletingTicket.id));
      setIsDeleteModalOpen(false);
      setDeletingTicket(null);
    }
  };

  const handleSaveTicket = (formData) => {
    if (editingTicket) {
      setTickets(tickets.map(t => t.id === editingTicket.id ? {
        ...t,
        ...formData,
        project: projects.find(p => p.id === formData.projectId)?.name || t.project,
        owner: { ...t.owner, name: formData.ownerName, avatar: formData.ownerName.charAt(0).toUpperCase() }
      } : t));
    } else {
      const newTicket = {
        id: Date.now(),
        ...formData,
        project: projects.find(p => p.id === formData.projectId)?.name || 'Unknown',
        status: 'In Progress',
        type: 'BA',
        rejected: false,
        owner: { name: formData.ownerName, avatar: formData.ownerName.charAt(0).toUpperCase(), role: 'BA' },
        completedStages: [],
      };
      setTickets([newTicket, ...tickets]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Bar Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Quản lý Ticket BA</h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Filter size={16} />
            </div>
            <select 
              value={selectedProject.id}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
            >
              <option value="all">Tất cả dự án</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={handleAddTicket}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
          >
            <Plus size={18} />
            <span>Thêm Ticket BA</span>
          </button>
        </div>
      </div>

      {/* Ticket Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-base font-bold text-slate-800">Danh sách Ticket - {selectedProject.name}</h3>
          <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded uppercase">
            {filteredTickets.length} Tickets
          </span>
        </div>
        <TicketTable 
          tickets={filteredTickets} 
          projectFund={PROJECT_FUND} 
          onEdit={handleEditTicket}
          onDelete={handleOpenDeleteModal}
        />
      </div>

      {/* Summary */}
      <BASummary tickets={filteredTickets} projectFund={PROJECT_FUND} />

      {/* Modals */}
      <TicketModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTicket}
        ticket={editingTicket}
        projects={projects}
      />

      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        ticketName={deletingTicket?.name}
      />
    </div>
  );
}
