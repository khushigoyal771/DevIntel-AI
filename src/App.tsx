import { useState } from 'react';
import { Shield, LayoutDashboard, MessageSquare, GitPullRequest, Settings, LogOut } from 'lucide-react';
import type { RepoData } from './types';
import ConnectScreen from './components/ConnectScreen';
import Dashboard from './components/Dashboard';
import Chat from './components/Chat';
import PRIntelligence from './components/PRIntelligence';
import SettingsView from './components/SettingsView';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat' | 'pr' | 'settings'>('dashboard');
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('gemini_key') || '');
  const [githubToken, setGithubToken] = useState(localStorage.getItem('github_token') || '');

  const handleConnect = (data: RepoData) => {
    setRepoData(data);
    setIsConnected(true);
    setActiveTab('dashboard');
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setRepoData(null);
  };

  if (!isConnected || !repoData) {
    return <ConnectScreen onConnect={handleConnect} githubToken={githubToken} />;
  }

  return (
    <div className="flex h-screen bg-transparent text-slate-50 font-sans relative">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900/60 backdrop-blur-xl border-r border-white/5 flex flex-col z-20">
        <div className="p-4 border-b border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">DevIntel AI</h1>
            <p className="text-xs text-slate-400 truncate w-40">{repoData.owner}/{repoData.name}</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <NavItem 
            icon={<LayoutDashboard className="w-5 h-5" />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <NavItem 
            icon={<MessageSquare className="w-5 h-5" />} 
            label="Ask Repository" 
            active={activeTab === 'chat'} 
            onClick={() => setActiveTab('chat')} 
          />
          <NavItem 
            icon={<GitPullRequest className="w-5 h-5" />} 
            label="PR Intelligence" 
            active={activeTab === 'pr'} 
            onClick={() => setActiveTab('pr')} 
          />
        </nav>

        <div className="p-4 border-t border-white/5 space-y-1">
          <NavItem 
            icon={<Settings className="w-5 h-5" />} 
            label="Settings" 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
          />
          <button 
            onClick={handleDisconnect}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-slate-800/50 rounded-md transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Disconnect Repo
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'dashboard' && <Dashboard repoData={repoData} githubToken={githubToken} />}
        {activeTab === 'chat' && <Chat repoData={repoData} githubToken={githubToken} geminiKey={geminiKey} />}
        {activeTab === 'pr' && <PRIntelligence repoData={repoData} githubToken={githubToken} geminiKey={geminiKey} />}
        {activeTab === 'settings' && (
           <SettingsView 
             geminiKey={geminiKey} setGeminiKey={setGeminiKey} 
             githubToken={githubToken} setGithubToken={setGithubToken} 
           />
        )}
      </div>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
        active 
          ? 'bg-blue-600/10 text-blue-500' 
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

export default App;
