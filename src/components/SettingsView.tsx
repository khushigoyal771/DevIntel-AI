import { useState } from 'react';
import { Key, AlertCircle } from 'lucide-react';

export default function SettingsView({ 
  geminiKey, setGeminiKey, 
  githubToken, setGithubToken 
}: { 
  geminiKey: string, setGeminiKey: (s:string)=>void,
  githubToken: string, setGithubToken: (s:string)=>void
}) {
  const [localGemini, setLocalGemini] = useState(geminiKey);
  const [localGithub, setLocalGithub] = useState(githubToken);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('gemini_key', localGemini);
    localStorage.setItem('github_token', localGithub);
    setGeminiKey(localGemini);
    setGithubToken(localGithub);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="text-slate-400 mt-1">Configure your API keys for enhanced functionality.</p>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3 text-blue-200">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-400" />
          <div className="text-sm">
            <p className="font-medium text-blue-300">Privacy Notice</p>
            <p className="mt-1">Since this is a client-side only demo, API keys are stored in your browser's local storage and sent directly to the respective APIs (Google and GitHub). They are never sent to any intermediate server.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Google Gemini API Key
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="password"
                  className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-lg bg-slate-950 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="AIzaSy..."
                  value={localGemini}
                  onChange={(e) => setLocalGemini(e.target.value)}
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Required for real AI analysis. If left blank, the app will use realistic mock AI responses.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                GitHub Personal Access Token (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="password"
                  className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-lg bg-slate-950 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="ghp_..."
                  value={localGithub}
                  onChange={(e) => setLocalGithub(e.target.value)}
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Increases rate limit from 60 to 5000 requests/hour and allows fetching private repositories.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
            >
              Save Settings
            </button>
            {saved && <span className="text-sm text-green-400">Settings saved successfully!</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
