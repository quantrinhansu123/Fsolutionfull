import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

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
  loading: boolean;
  error: string | null;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('project_id,name,pricing');

      if (fetchError) throw fetchError;

      if (data) {
        const mappedProjects: Project[] = data.map((p: any) => {
          return {
            id: p.project_id,
            name: p.name || 'Dự án không tên',
            revenue: Number(p.pricing) || 0,
            amc: 0
          };
        });

        setProjects(mappedProjects);
      }
    } catch (err: any) {
      console.error('Error fetching projects from Supabase:', err);
      setError(err.message || 'Không thể tải danh sách dự án');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProjects();
  }, []);

  const allProjectsData = useMemo(() => {
    return {
      id: 'all',
      name: 'Tất cả dự án',
      revenue: projects.reduce((sum, p) => sum + p.revenue, 0),
      amc: projects.reduce((sum, p) => sum + p.amc, 0),
    };
  }, [projects]);

  const selectedProject = useMemo(() => {
    if (selectedProjectId === 'all') return allProjectsData;
    return projects.find(p => p.id === selectedProjectId) || allProjectsData;
  }, [selectedProjectId, projects, allProjectsData]);

  return (
    <ProjectContext.Provider value={{ 
      projects, 
      selectedProject, 
      setSelectedProjectId,
      isAllProjects: selectedProjectId === 'all',
      loading,
      error,
      refreshProjects
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

