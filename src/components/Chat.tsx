import { useState, useRef, useEffect } from 'react';
import type { RepoData } from '../types';
import { Send, Bot, User, FileCode, Loader2 } from 'lucide-react';
import { getOctokit, fetchFileContent } from '../lib/github';
import { initGemini, askRepository } from '../lib/gemini';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

export default function Chat({ repoData, githubToken, geminiKey }: { repoData: RepoData, githubToken: string, geminiKey: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I'm DevIntel AI. I have analyzed **${repoData.owner}/${repoData.name}**. What would you like to know about this repository?`,
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    initGemini(geminiKey);
  }, [geminiKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userQuery = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userQuery }]);
    setLoading(true);

    try {
      // For the demo, we fetch a few key files to build a "RAG" context
      const octokit = getOctokit(githubToken);
      let context = "No specific context could be fetched for this query in the demo mode.";
      let sources: string[] = [];
      
      // We do a basic simulated retrieval by fetching the README and package.json if it's JS/TS
      try {
        const readme = await fetchFileContent(octokit, repoData.owner, repoData.name, 'README.md');
        if (readme) {
            context = `README.md:\\n${readme.substring(0, 2000)}\\n`;
            sources.push('README.md');
        }
      } catch(e) {}

      const aiResponse = await askRepository(userQuery, context);
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: aiResponse,
        sources: sources.length > 0 ? sources : undefined
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, an error occurred while generating the response.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent relative">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 relative z-10">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-lg shadow-blue-500/20 border border-white/10">
                <Bot className="w-5 h-5 text-white" />
              </div>
            )}
            
            <div className={`max-w-[80%] rounded-2xl p-5 ${
              msg.role === 'user' 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-sm shadow-[0_0_15px_rgba(59,130,246,0.2)] border border-blue-500/50' 
                : 'glass-panel text-slate-200 rounded-tl-sm'
            }`}>
              <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </div>
              
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-700/50">
                  <p className="text-xs font-medium text-slate-400 mb-2">Sources:</p>
                  <div className="flex gap-2 flex-wrap">
                    {msg.sources.map((src, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 rounded-md text-xs text-blue-300 border border-slate-700/50 shadow-sm transition-colors hover:bg-slate-700">
                        <FileCode className="w-3.5 h-3.5 text-blue-400" />
                        {src}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0 mt-1 border border-slate-700 shadow-md">
                <User className="w-5 h-5 text-slate-300" />
              </div>
            )}
          </div>
        ))}
        {loading && (
           <div className="flex gap-4">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-lg shadow-blue-500/20 border border-white/10">
               <Bot className="w-5 h-5 text-white" />
             </div>
             <div className="glass-panel rounded-2xl rounded-tl-sm p-5 flex items-center gap-4 text-slate-300 text-sm">
               <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
               <span className="animate-pulse">DevIntel AI is analyzing repository context...</span>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 bg-slate-900/80 backdrop-blur-xl border-t border-white/5 relative z-20">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000 group-hover:opacity-50"></div>
          <input
            type="text"
            className="w-full relative bg-slate-900 border border-slate-700/50 text-white rounded-xl pl-5 pr-14 py-4 focus:outline-none focus:border-blue-500/50 placeholder-slate-500 shadow-2xl transition-all"
            placeholder="Ask anything about the codebase (e.g. 'How does authentication work?')"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button 
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg transition-colors z-10 shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
