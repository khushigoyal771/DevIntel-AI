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
    <div className="flex flex-col h-full bg-slate-950 relative">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-5 h-5 text-white" />
              </div>
            )}
            
            <div className={`max-w-[80%] rounded-2xl p-4 ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-sm' 
                : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-sm'
            }`}>
              <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </div>
              
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-800/50">
                  <p className="text-xs font-medium text-slate-400 mb-2">Sources:</p>
                  <div className="flex gap-2">
                    {msg.sources.map((src, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-800 rounded text-xs text-blue-400">
                        <FileCode className="w-3 h-3" />
                        {src}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        ))}
        {loading && (
           <div className="flex gap-4">
             <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
               <Bot className="w-5 h-5 text-white" />
             </div>
             <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-sm p-4 flex items-center gap-3 text-slate-400 text-sm">
               <Loader2 className="w-4 h-4 animate-spin" />
               Analyzing repository context...
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-950 border-t border-slate-800">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
          <input
            type="text"
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl pl-4 pr-12 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-500 shadow-xl"
            placeholder="Ask anything about the codebase (e.g. 'How does authentication work?')"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button 
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 text-white rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
