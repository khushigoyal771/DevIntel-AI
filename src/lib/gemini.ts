import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

export const initGemini = (apiKey: string) => {
  genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};

export const askRepository = async (prompt: string, context: string): Promise<string> => {
  if (!model) {
    // Fallback to mock data if no API key is provided
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`[Mock AI Response] Based on the repository context, here is the answer to your query: "${prompt}".\n\nThe codebase indicates that authentication is handled via JWT tokens in the \`auth\` module. The primary middleware intercepts requests to validate the token before allowing access to protected routes. \n\nSuggested files to review: \`src/auth/jwt.ts\`, \`src/middleware/auth.ts\`.`);
      }, 1500);
    });
  }

  try {
    const fullPrompt = `You are DevIntel AI, an expert software engineering assistant. Use the following repository context to answer the user's question.\n\nRepository Context:\n${context}\n\nUser Question: ${prompt}\n\nAnswer format: Use markdown, be concise, cite specific files if possible.`;
    const result = await model.generateContent(fullPrompt);
    return result.response.text();
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Sorry, I encountered an error while processing your request. Please check your API key or network connection.";
  }
};

export const analyzePR = async (prTitle: string, prBody: string, filesChanged: number): Promise<string> => {
   if (!model) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(`[Mock AI PR Review] \n\n**Risk Score:** Medium (65/100)\n\n**Summary:** This PR refactors the core authentication logic. \n\n**Potential Issues:**\n- Ensure backward compatibility is maintained.\n- Check if token expiration is handled correctly in the new flow.\n\n**Recommendations:**\n- Add unit tests for the expired token scenario.\n- Review the impact on session timeout behavior.`);
        }, 1500);
      });
   }
   
   try {
    const prompt = `You are an AI code reviewer. Review the following Pull Request details and provide a risk score (out of 100), a short summary, potential issues, and recommendations.\n\nTitle: ${prTitle}\nBody: ${prBody}\nFiles Changed: ${filesChanged}\n\nFormat output in Markdown.`;
    const result = await model.generateContent(prompt);
    return result.response.text();
   } catch (error) {
       console.error(error);
       return "Failed to analyze PR.";
   }
}
