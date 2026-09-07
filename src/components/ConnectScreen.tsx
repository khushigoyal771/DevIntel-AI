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
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-900/50">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">DevIntel AI</h1>
          <p className="text-slate-400">Understand your entire codebase and engineering activity.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="repo" className="block text-sm font-medium text-slate-300">
                Connect GitHub Repository
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <GitBranch className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  id="repo"
                  className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-lg bg-slate-950 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="facebook/react or https://github.com/..."
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !repoUrl.trim()}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Analyze Repository
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-500">
              DevIntel AI operates entirely in your browser using the GitHub API. No code is stored on our servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
