import React, { createContext, useState, useContext, useMemo } from 'react';

export interface Project {
  id: string;
  name: string;
  revenue: number;
  amc: number;
}

interface ProjectContextType {
  projects: Project[];
  selectedProject: Project;
  setSelectedProjectId: (id: string) => void;
  isAllProjects: boolean;
}

const mockProjects: Project[] = [
  { id: '1', name: 'Dự án A', revenue: 20000000, amc: 1000000 },
  { id: '2', name: 'Dự án B', revenue: 35000000, amc: 2000000 },
];

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');

  const allProjectsData = useMemo(() => {
    return {
      id: 'all',
      name: 'Tất cả dự án',
      revenue: mockProjects.reduce((sum, p) => sum + p.revenue, 0),
      amc: mockProjects.reduce((sum, p) => sum + p.amc, 0),
    };
  }, []);

  const selectedProject = useMemo(() => {
    if (selectedProjectId === 'all') return allProjectsData;
    return mockProjects.find(p => p.id === selectedProjectId) || allProjectsData;
  }, [selectedProjectId, allProjectsData]);

  return (
    <ProjectContext.Provider value={{ 
      projects: mockProjects, 
      selectedProject, 
      setSelectedProjectId,
      isAllProjects: selectedProjectId === 'all'
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
