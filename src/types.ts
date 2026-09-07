export interface RepoData {
  owner: string;
  name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  updated_at: string;
}

export interface AppState {
  isConnected: boolean;
  repoData: RepoData | null;
  loading: boolean;
  error: string | null;
  activeTab: 'dashboard' | 'chat' | 'pr' | 'settings';
  githubToken: string;
  geminiKey: string;
}
