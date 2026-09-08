import { useState } from 'react';
import { GitBranch, ArrowRight, AlertCircle, Cpu, BrainCircuit, Network } from 'lucide-react';
import type { RepoData } from '../types';
import { getOctokit, fetchRepoDetails } from '../lib/github';
import { motion } from 'framer-motion';

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
      let owner = '';
      let repo = '';
      
      let cleanUrl = repoUrl.trim();
      // Remove trailing .git if present
      if (cleanUrl.endsWith('.git')) {
        cleanUrl = cleanUrl.slice(0, -4);
      }
      
      if (cleanUrl.includes('github.com')) {
        const url = new URL(cleanUrl);
        const parts = url.pathname.split('/').filter(Boolean);
        if (parts.length >= 2) {
          owner = parts[0];
          repo = parts[1];
        } else {
          throw new Error('Invalid GitHub URL');
        }
      } else {
        const parts = cleanUrl.split('/');
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
      
      {/* Animated floating background elements */}
      <motion.div 
        animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }} 
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[10%] left-[10%] text-blue-500/20"
      >
        <Cpu className="w-64 h-64 blur-[2px] transform -rotate-12" />
      </motion.div>
      <motion.div 
        animate={{ y: [0, 30, 0], opacity: [0.2, 0.5, 0.2] }} 
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[10%] right-[10%] text-purple-500/20"
      >
        <Network className="w-80 h-80 blur-[2px] transform rotate-12" />
      </motion.div>

      {/* Background glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-xl w-full space-y-10 z-10 relative"
      >
        <div className="text-center space-y-6">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
            className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl mx-auto flex items-center justify-center shadow-[0_0_60px_rgba(59,130,246,0.6)] border border-white/20 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/20 rounded-3xl blur-md group-hover:bg-white/30 transition-all duration-500" />
            <BrainCircuit className="w-12 h-12 text-white drop-shadow-md relative z-10" />
          </motion.div>
          
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-5xl font-extrabold tracking-tight text-white mb-4"
            >
              <span className="text-gradient">DevIntel AI</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-slate-300 text-xl font-light"
            >
              Understand your entire codebase and engineering activity with superhuman AI intelligence.
            </motion.p>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="glass-panel rounded-3xl p-10 relative overflow-hidden transition-all duration-500 hover:border-blue-500/30 hover:shadow-[0_0_50px_rgba(59,130,246,0.15)] group"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            <div className="space-y-3">
              <label htmlFor="repo" className="block text-sm font-semibold text-slate-200 tracking-wide uppercase">
                Connect GitHub Repository
              </label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <GitBranch className="h-6 w-6 text-slate-500 group-focus-within/input:text-blue-400 transition-colors duration-300" />
                </div>
                <input
                  type="text"
                  id="repo"
                  className="block w-full pl-14 pr-5 py-4 border border-slate-700/60 rounded-2xl bg-slate-950/60 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/60 transition-all text-lg shadow-inner"
                  placeholder="facebook/react or https://github.com/..."
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 text-red-400 text-sm bg-red-500/10 p-4 rounded-xl border border-red-500/20 shadow-sm"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading || !repoUrl.trim()}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-4 px-6 rounded-2xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.6)] transform hover:-translate-y-1 active:translate-y-0"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Launch Intelligence
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-10 pt-6 border-t border-slate-800/60 text-center relative z-10">
            <p className="text-sm text-slate-500 font-medium">
              Secure & Serverless. API requests run entirely in your browser.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
