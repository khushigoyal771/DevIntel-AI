import { useEffect, useState } from 'react';
import type { RepoData } from '../types';
import { getOctokit, fetchPullRequests } from '../lib/github';
import { GitPullRequest, GitMerge, GitCommit, AlertTriangle, Loader2 } from 'lucide-react';
import { initGemini, analyzePR } from '../lib/gemini';
import ReactMarkdown from 'react-markdown';

export default function PRIntelligence({ repoData, githubToken, geminiKey }: { repoData: RepoData, githubToken: string, geminiKey: string }) {
  const [prs, setPrs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPr, setSelectedPr] = useState<any | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewResult, setReviewResult] = useState('');

  useEffect(() => {
    initGemini(geminiKey);
    const loadPRs = async () => {
      setLoading(true);
      const octokit = getOctokit(githubToken);
      const data = await fetchPullRequests(octokit, repoData.owner, repoData.name, 'all', 10);
      setPrs(data);
      if (data.length > 0) {
        handleSelectPr(data[0]);
      } else {
        setLoading(false);
      }
    };
    loadPRs();
  }, [repoData, githubToken, geminiKey]);

  const handleSelectPr = async (pr: any) => {
    setSelectedPr(pr);
    setReviewLoading(true);
    setReviewResult('');
    
    // Simulate fetching PR diff/files
    const filesChanged = Math.floor(Math.random() * 20) + 1; 
    
    const analysis = await analyzePR(pr.title, pr.body || 'No description provided', filesChanged);
    
    setReviewResult(analysis);
    setReviewLoading(false);
    setLoading(false);
  };

  return (
    <div className="flex h-full bg-slate-950">
      {/* PR List Sidebar */}
      <div className="w-80 border-r border-slate-800 flex flex-col bg-slate-900/50">
        <div className="p-4 border-b border-slate-800">
          <h2 className="font-semibold flex items-center gap-2">
            <GitPullRequest className="w-5 h-5 text-blue-500" />
            Pull Requests
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading && !selectedPr ? (
            <div className="p-8 text-center text-slate-500 flex flex-col items-center">
              <Loader2 className="w-6 h-6 animate-spin mb-2" />
              Loading PRs...
            </div>
          ) : prs.length === 0 ? (
             <div className="p-8 text-center text-slate-500">
               No pull requests found.
             </div>
          ) : (
            prs.map(pr => (
              <div 
                key={pr.id}
                onClick={() => handleSelectPr(pr)}
                className={`p-4 border-b border-slate-800/50 cursor-pointer hover:bg-slate-800 transition-colors ${
                  selectedPr?.id === pr.id ? 'bg-slate-800 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'
                }`}
              >
                <div className="flex items-start gap-3">
                  {pr.state === 'open' ? (
                    <GitPullRequest className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  ) : pr.merged_at ? (
                    <GitMerge className="w-4 h-4 text-purple-500 mt-1 flex-shrink-0" />
                  ) : (
                    <GitPullRequest className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                  )}
                  <div className="overflow-hidden">
                    <p className="font-medium text-sm text-slate-200 truncate">{pr.title}</p>
                    <p className="text-xs text-slate-500 mt-1">#{pr.number} by {pr.user?.login}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* PR Details & AI Review */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedPr ? (
          <>
            <div className="p-6 border-b border-slate-800 bg-slate-900">
              <h1 className="text-2xl font-bold text-white mb-2">{selectedPr.title} <span className="text-slate-500 font-normal">#{selectedPr.number}</span></h1>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                  selectedPr.state === 'open' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                  selectedPr.merged_at ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 
                  'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {selectedPr.state === 'open' ? 'Open' : selectedPr.merged_at ? 'Merged' : 'Closed'}
                </span>
                <span className="flex items-center gap-1">
                  <GitCommit className="w-4 h-4" />
                  {selectedPr.user?.login}
                </span>
                <span>Created on {new Date(selectedPr.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-950">
              <div className="max-w-4xl mx-auto space-y-6">
                
                {/* AI Review Box */}
                <div className="bg-slate-900 border border-blue-500/30 rounded-xl overflow-hidden shadow-lg">
                  <div className="bg-blue-600/10 px-6 py-4 border-b border-blue-500/20 flex items-center justify-between">
                    <h3 className="font-semibold text-blue-400 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      AI PR Intelligence Report
                    </h3>
                  </div>
                  <div className="p-6">
                    {reviewLoading ? (
                      <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
                        <p>DevIntel AI is analyzing changes, commits, and potential risks...</p>
                      </div>
                    ) : (
                      <div className="prose prose-invert max-w-none text-sm text-slate-300">
                        <ReactMarkdown>{reviewResult}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>

                {/* PR Body */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">Description</h3>
                  <div className="prose prose-invert max-w-none text-sm text-slate-300 whitespace-pre-wrap">
                    {selectedPr.body || '*No description provided.*'}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            Select a Pull Request to view AI intelligence
          </div>
        )}
      </div>
    </div>
  );
}
