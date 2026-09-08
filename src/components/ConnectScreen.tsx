import { useState } from 'react';
import { GitBranch, ArrowRight, Shield, AlertCircle } from 'lucide-react';
import type { RepoData } from '../types';
import { getOctokit, fetchRepoDetails } from '../lib/github';

interface ConnectScreenProps {
  onConnect: (data: RepoData) => void;
  githubToken: string;
}

export default function ConnectScreen({ onConnect, githubToken }: ConnectScreenProps) {
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Parse github URL or format "owner/repo"
      let owner = '';
      let repo = '';
      
      if (repoUrl.includes('github.com')) {
        const url = new URL(repoUrl);
        const parts = url.pathname.split('/').filter(Boolean);
        if (parts.length >= 2) {
          owner = parts[0];
          repo = parts[1];
        } else {
          throw new Error('Invalid GitHub URL');
        }
      } else {
        const parts = repoUrl.split('/');
        if (parts.length === 2) {
          owner = parts[0];
          repo = parts[1];
        } else {
          throw new Error('Please enter a valid format: owner/repo or full URL');
        }
      }

      const octokit = getOctokit(githubToken);
      const data = await fetchRepoDetails(octokit, owner, repo);
      onConnect(data as unknown as RepoData);
      
    } catch (err: any) {
      setError(err.message || 'Failed to fetch repository. Is it public?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full space-y-8 z-10 relative">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl mx-auto flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.4)] border border-white/10 relative">
            <div className="absolute inset-0 bg-white/20 rounded-3xl blur-md" />
            <Shield className="w-10 h-10 text-white drop-shadow-md relative z-10" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
            <span className="text-gradient">DevIntel AI</span>
          </h1>
          <p className="text-slate-400 text-lg">Understand your entire codebase and engineering activity.</p>
        </div>

        <div className="glass-panel rounded-2xl p-8 relative overflow-hidden transition-all duration-300 hover:border-white/10 hover:shadow-[0_0_40px_rgba(59,130,246,0.1)]">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label htmlFor="repo" className="block text-sm font-medium text-slate-300">
                Connect GitHub Repository
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <GitBranch className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  type="text"
                  id="repo"
                  className="block w-full pl-12 pr-4 py-3 border border-slate-700/50 rounded-xl bg-slate-950/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all sm:text-sm shadow-inner"
                  placeholder="facebook/react or https://github.com/..."
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 text-red-400 text-sm bg-red-500/10 p-4 rounded-xl border border-red-500/20 shadow-sm animate-pulse">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !repoUrl.trim()}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3 px-4 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Analyze Repository
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-slate-800/50 text-center relative z-10">
            <p className="text-xs text-slate-500">
              DevIntel AI operates entirely in your browser using the GitHub API. No code is stored on our servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
