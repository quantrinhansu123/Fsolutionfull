import React from 'react';
import { ProjectSummaryCards } from './components/ProjectSummaryCards';
import { DistributionChart } from './components/DistributionChart';
import { DepartmentTable } from './components/DepartmentTable';
import { AMCTable } from './components/AMCTable';
import { useProject } from '../../context/ProjectContext';
import { ChevronDown } from 'lucide-react';

const Dashboard = () => {
  const { projects, selectedProject, setSelectedProjectId } = useProject();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header with Project Selector */}
      <section className="flex flex-col sm:flex-row justify-between sm:items-end gap-6 pb-2">
        <div>
          <p className="text-blue-600 font-bold text-xs tracking-widest uppercase mb-2">Quản trị thu nhập</p>
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Chi tiết dự án</h2>
            <div className="relative inline-block">
              <select 
                value={selectedProject.id}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="appearance-none bg-blue-50 border border-blue-200 text-blue-700 font-bold py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:bg-blue-100"
              >
                <option value="all">Tất cả dự án</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 pointer-events-none" size={16} />
            </div>
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <ProjectSummaryCards />

      {/* Main Grid: Charts and Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column: Chart */}
        <div className="xl:col-span-1">
          <DistributionChart />
        </div>

        {/* Right Column: Detailed Department Table */}
        <div className="xl:col-span-2">
          <DepartmentTable />
        </div>
      </div>

      {/* Full Width Section: AMC Table */}
      <section className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
        <AMCTable />
      </section>
    </div>
  );
};

export default Dashboard;
