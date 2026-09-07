import { Octokit } from "octokit";

// Initialize octokit without auth for public repos (rate limited to 60 requests/hour)
// If the user wants to test extensively, they should provide a token.
export const getOctokit = (token?: string) => {
  return new Octokit({ auth: token });
};

export const fetchRepoDetails = async (octokit: Octokit, owner: string, repo: string) => {
  try {
    const { data } = await octokit.rest.repos.get({
      owner,
      repo,
    });
    return data;
  } catch (error) {
    console.error("Error fetching repo details", error);
    throw error;
  }
};

export const fetchRepoLanguages = async (octokit: Octokit, owner: string, repo: string) => {
  try {
    const { data } = await octokit.rest.repos.listLanguages({
      owner,
      repo,
    });
    return data;
  } catch (error) {
    console.error("Error fetching languages", error);
    return {};
  }
};

export const fetchRecentCommits = async (octokit: Octokit, owner: string, repo: string, per_page = 5) => {
  try {
    const { data } = await octokit.rest.repos.listCommits({
      owner,
      repo,
      per_page,
    });
    return data;
  } catch (error) {
    console.error("Error fetching commits", error);
    return [];
  }
};

export const fetchIssues = async (octokit: Octokit, owner: string, repo: string, state: "open" | "closed" | "all" = "all", per_page = 10) => {
    try {
      const { data } = await octokit.rest.issues.listForRepo({
        owner,
        repo,
        state,
        per_page,
      });
      return data;
    } catch (error) {
      console.error("Error fetching issues", error);
      return [];
    }
  };

  export const fetchPullRequests = async (octokit: Octokit, owner: string, repo: string, state: "open" | "closed" | "all" = "all", per_page = 5) => {
    try {
      const { data } = await octokit.rest.pulls.list({
        owner,
        repo,
        state,
        per_page,
      });
      return data;
    } catch (error) {
      console.error("Error fetching PRs", error);
      return [];
    }
  };

export const fetchFileContent = async (octokit: Octokit, owner: string, repo: string, path: string) => {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });
    
    if ('content' in data) {
      return atob(data.content);
    }
    return "";
  } catch (error) {
    console.error(`Error fetching file ${path}`, error);
    return "";
  }
};
