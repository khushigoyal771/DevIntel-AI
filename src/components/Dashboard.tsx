import { useEffect, useState } from 'react';
import type { RepoData } from '../types';
import { getOctokit, fetchRepoLanguages } from '../lib/github';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
    <div className="flex-1 overflow-y-auto bg-slate-950 p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Repository Overview</h2>
          <p className="text-slate-400 mt-1">Analyzing {repoData.owner}/{repoData.name}</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-slate-300 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
            <Star className="w-4 h-4 text-yellow-500" />
            {repoData.stargazers_count.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-slate-300 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
            <GitFork className="w-4 h-4 text-slate-400" />
            {repoData.forks_count.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Health Score Card */}
        <div className="col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <h3 className="text-lg font-medium text-slate-300 mb-4 z-10">Health Score</h3>
          <div className="relative flex items-center justify-center z-10">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-800" />
              <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent"
                strokeDasharray={2 * Math.PI * 56}
                strokeDashoffset={2 * Math.PI * 56 * (1 - healthScores.overall / 100)}
                className="text-blue-500 transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-bold text-white">{healthScores.overall}</span>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="col-span-1 md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-medium text-slate-300 mb-6">Metrics Breakdown</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
            <MetricBar label="Security" value={healthScores.security} icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />} />
            <MetricBar label="Code Quality" value={healthScores.quality} icon={<FileCode className="w-4 h-4 text-blue-400" />} />
            <MetricBar label="Testing" value={healthScores.testing} icon={<CheckCircle className="w-4 h-4 text-purple-400" />} />
            <MetricBar label="Architecture" value={healthScores.architecture} icon={<Activity className="w-4 h-4 text-orange-400" />} />
            <MetricBar label="Documentation" value={healthScores.docs} icon={<FileCode className="w-4 h-4 text-indigo-400" />} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Language Composition */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-medium text-slate-300 mb-6">Languages</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={languages} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} width={80} />
                <Tooltip cursor={{ fill: '#1e293b' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Developer Activity Analytics (Mocked for visual appeal) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-medium text-slate-300 mb-6">Engineering Activity (Last 30 Days)</h3>
          <div className="space-y-4">
             <div className="flex justify-between items-center p-3 bg-slate-950/50 rounded-lg border border-slate-800">
               <span className="text-slate-400">Commits</span>
               <span className="text-xl font-semibold">248</span>
             </div>
             <div className="flex justify-between items-center p-3 bg-slate-950/50 rounded-lg border border-slate-800">
               <span className="text-slate-400">Pull Requests</span>
               <span className="text-xl font-semibold">42</span>
             </div>
             <div className="flex justify-between items-center p-3 bg-slate-950/50 rounded-lg border border-slate-800">
               <span className="text-slate-400">Avg PR Cycle</span>
               <span className="text-xl font-semibold">2.8 days</span>
             </div>
             <div className="flex justify-between items-center p-3 bg-slate-950/50 rounded-lg border border-slate-800">
               <span className="text-slate-400">Open Issues</span>
               <span className="text-xl font-semibold">19</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricBar({ label, value, icon }: { label: string, value: number, icon: React.ReactNode }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1 text-sm">
        <span className="flex items-center gap-2 text-slate-300">{icon}{label}</span>
        <span className="text-slate-400">{value}</span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full" 
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );
}
