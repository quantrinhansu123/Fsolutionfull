import { useState } from 'react';
import { Layout } from './components/layout/Layout';
import { ProjectProvider } from './context/ProjectContext';
import Dashboard from './pages/Dashboard';
import BAPage from './pages/BA/index.jsx';
import SalePage from './pages/Sale/index.jsx';
import MarketingPage from './pages/Marketing/index.jsx';
import CSPage from './pages/CS/index.jsx';
import DevPage from './pages/Dev';
import SettingsPage from './pages/Settings/index.jsx';
import BaoGiaPage from './pages/BaoGia';
import LoginPage from './pages/Login';

function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <Dashboard />;
      case 'BA/SA':
        return <BAPage />;
      case 'Sale':
        return <SalePage />;
      case 'BaoGia':
        return <BaoGiaPage />;
      case 'Marketing':
        return <MarketingPage />;
      case 'CS':
        return <CSPage />;
      case 'Dev':
        return <DevPage />;
      case 'Settings':
        return <SettingsPage />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 bg-white rounded-xl border border-slate-200 border-dashed">
            <h2 className="text-xl font-bold mb-2">{activeTab} Section</h2>
            <p className="text-sm">Nội dung cho mục này đang được cập nhật...</p>
          </div>
        );
    }
  };

  return (
    <ProjectProvider>
      <Layout 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onLogout={() => {
          if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            setIsAuthenticated(false);
          }
        }}
      >
        {renderContent()}
      </Layout>
    </ProjectProvider>
  );
}

export default App;
