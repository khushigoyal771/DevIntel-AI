import { useEffect, useState } from 'react';
import type { RepoData } from '../types';
import { getOctokit, fetchRepoLanguages } from '../lib/github';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Activity, ShieldCheck, FileCode, CheckCircle, Star, GitFork } from 'lucide-react';

export default function Dashboard({ repoData, githubToken }: { repoData: RepoData, githubToken: string }) {
  const [languages, setLanguages] = useState<any[]>([]);
  
  useEffect(() => {
    const loadData = async () => {
      const octokit = getOctokit(githubToken);
      const langs = await fetchRepoLanguages(octokit, repoData.owner, repoData.name);
      
      const formattedLangs = Object.entries(langs)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => (b.value as number) - (a.value as number))
        .slice(0, 5);
        
      setLanguages(formattedLangs);
    };
    
    loadData();
  }, [repoData, githubToken]);

  // Mock health scores for the demo
  const healthScores = {
    overall: 84,
    security: 79,
    quality: 91,
    testing: 76,
    architecture: 88,
    docs: 92
  };

  return (
    <div className="flex-1 overflow-y-auto bg-transparent p-8 space-y-8 relative">
      <div className="flex items-center justify-between relative z-10">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Repository Overview</h2>
          <p className="text-slate-400 mt-2 flex items-center gap-2">
            Analyzing <span className="font-semibold text-blue-400">{repoData.owner}/{repoData.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <div className="flex items-center gap-2 text-slate-200 glass-panel px-4 py-2 rounded-full">
            <Star className="w-4 h-4 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
            {repoData.stargazers_count.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 text-slate-200 glass-panel px-4 py-2 rounded-full">
            <GitFork className="w-4 h-4 text-slate-400" />
            {repoData.forks_count.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        {/* Health Score Card */}
        <div className="col-span-1 glass-panel rounded-2xl p-8 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-blue-400/30"></div>
          <h3 className="text-lg font-semibold text-slate-200 mb-6 z-10">Health Score</h3>
          <div className="relative flex items-center justify-center z-10">
            <svg className="w-40 h-40 transform -rotate-90 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="14" fill="transparent" className="text-slate-800/50" />
              <circle cx="80" cy="80" r="70" stroke="url(#blue-gradient)" strokeWidth="14" fill="transparent"
                strokeDasharray={2 * Math.PI * 70}
                strokeDashoffset={2 * Math.PI * 70 * (1 - healthScores.overall / 100)}
                className="transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-blue-200">{healthScores.overall}</span>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-1">out of 100</span>
            </div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="col-span-1 md:col-span-2 glass-panel rounded-2xl p-8">
          <h3 className="text-lg font-semibold text-slate-200 mb-8">Metrics Breakdown</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
            <MetricBar label="Security" value={healthScores.security} icon={<ShieldCheck className="w-5 h-5 text-emerald-400 drop-shadow-md" />} color="from-emerald-400 to-emerald-600" />
            <MetricBar label="Code Quality" value={healthScores.quality} icon={<FileCode className="w-5 h-5 text-blue-400 drop-shadow-md" />} color="from-blue-400 to-indigo-500" />
            <MetricBar label="Testing" value={healthScores.testing} icon={<CheckCircle className="w-5 h-5 text-purple-400 drop-shadow-md" />} color="from-purple-400 to-pink-500" />
            <MetricBar label="Architecture" value={healthScores.architecture} icon={<Activity className="w-5 h-5 text-orange-400 drop-shadow-md" />} color="from-orange-400 to-red-500" />
            <MetricBar label="Documentation" value={healthScores.docs} icon={<FileCode className="w-5 h-5 text-cyan-400 drop-shadow-md" />} color="from-cyan-400 to-blue-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {/* Language Composition */}
        <div className="glass-panel rounded-2xl p-8">
          <h3 className="text-lg font-semibold text-slate-200 mb-6">Languages</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={languages} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={true} vertical={false} opacity={0.5} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 13 }} width={80} />
                <Tooltip cursor={{ fill: '#1e293b', opacity: 0.4 }} contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#334155', borderRadius: '8px', backdropFilter: 'blur(8px)', color: '#f8fafc' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                  {languages.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="url(#colorUv)" />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Developer Activity Analytics */}
        <div className="glass-panel rounded-2xl p-8 flex flex-col">
          <h3 className="text-lg font-semibold text-slate-200 mb-6">Engineering Activity <span className="text-xs text-slate-500 ml-2 font-normal uppercase tracking-wider">Last 30 Days</span></h3>
          <div className="space-y-4 flex-1 flex flex-col justify-center">
             <div className="flex justify-between items-center p-4 bg-slate-900/50 hover:bg-slate-800/50 transition-colors rounded-xl border border-slate-700/50">
               <span className="text-slate-400 font-medium">Commits</span>
               <span className="text-2xl font-bold text-white">248</span>
             </div>
             <div className="flex justify-between items-center p-4 bg-slate-900/50 hover:bg-slate-800/50 transition-colors rounded-xl border border-slate-700/50">
               <span className="text-slate-400 font-medium">Pull Requests</span>
               <span className="text-2xl font-bold text-white">42</span>
             </div>
             <div className="flex justify-between items-center p-4 bg-slate-900/50 hover:bg-slate-800/50 transition-colors rounded-xl border border-slate-700/50">
               <span className="text-slate-400 font-medium">Avg PR Cycle</span>
               <span className="text-2xl font-bold text-white">2.8 <span className="text-sm text-slate-500 font-normal">days</span></span>
             </div>
             <div className="flex justify-between items-center p-4 bg-slate-900/50 hover:bg-slate-800/50 transition-colors rounded-xl border border-slate-700/50">
               <span className="text-slate-400 font-medium">Open Issues</span>
               <span className="text-2xl font-bold text-white">19</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricBar({ label, value, icon, color = "from-blue-500 to-blue-400" }: { label: string, value: number, icon: React.ReactNode, color?: string }) {
  return (
    <div className="group">
      <div className="flex justify-between items-center mb-2 text-sm">
        <span className="flex items-center gap-2 text-slate-300 font-medium">{icon}{label}</span>
        <span className="text-slate-200 font-bold">{value}%</span>
      </div>
      <div className="w-full bg-slate-800/80 rounded-full h-3 overflow-hidden border border-slate-700/50 shadow-inner">
        <div 
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-1000 ease-out group-hover:brightness-110`} 
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );
}
