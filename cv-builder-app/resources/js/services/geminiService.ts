
import { GoogleGenAI } from "@google/genai";
import { ResumeData } from "../types";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateResumeSummary = async (data: ResumeData): Promise<string> => {
  const ai = getAIClient();

  const prompt = `
    Act as a professional ATS-optimization expert and career coach. Write a compelling, high-impact professional summary (40-60 words) for a candidate with the following profile:
    
    Job Title: ${data.experience[0]?.jobTitle || "Professional"}
    Experience: ${data.experience.map(e => `${e.jobTitle} at ${e.company}`).join(", ")}
    Key Projects: ${data.projects.map(p => p.name).join(", ")}
    Top Skills: ${data.skills.join(", ")}
    
    Guidelines for ATS Success:
    - Use standard industry keywords found in top job descriptions.
    - Write in the first person implied (avoid "I", "Me", "My").
    - Focus on unique value proposition and key achievements.
    - Ensure the tone is professional, energetic, and concise.
    - No placeholders or generic filler text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    
    return response.text?.trim() || "Could not generate summary.";
  } catch (error) {
    console.error("Error generating summary:", error);
    throw error;
  }
};

export const generateExperienceBullets = async (
  jobTitle: string, 
  company: string, 
  currentDescription?: string,
  targetRole?: string,
  keywords?: string
): Promise<string> => {
  if (!jobTitle) return "";
  const ai = getAIClient();

  const context = `
    Job Title: ${jobTitle}
    Company: ${company}
    ${targetRole ? `Target Role Candidate is Applying For: ${targetRole}` : ""}
    ${keywords ? `Specific Keywords to include: ${keywords}` : ""}
  `;

  let prompt = "";
  if (currentDescription && currentDescription.length > 15) {
      prompt = `
        Optimize the following job description for a ${jobTitle} role at ${company} to be highly ATS-friendly.
        
        Context:
        ${context}

        Current Description:
        "${currentDescription}"
        
        ATS Optimization Guidelines:
        - Replace weak verbs with strong action verbs (e.g., "Spearheaded", "Architected", "Optimized", "Surpassed").
        - Quantify impact with numbers, percentages, or timeframes (e.g., "reduced latency by 30%", "managed budget of $50k").
        ${targetRole ? `- Tailor the description to appeal to a hiring manager for a ${targetRole} role.` : ""}
        ${keywords ? `- Naturally integrate these keywords: ${keywords}` : ""}
        - Ensure clear, concise bullet points.
        - Avoid jargon that isn't industry-standard.
        - Return ONLY 3-5 bullet points, each starting with "• ".
      `;
  } else {
      prompt = `
        Write 3-4 professional, ATS-optimized bullet points for a ${jobTitle} role at ${company}.
        
        Context:
        ${context}

        Guidelines:
        - Start each bullet with a strong action verb.
        - Focus on results and technical contributions.
        ${targetRole ? `- Highlight skills relevant to someone aiming for a ${targetRole} position.` : ""}
        ${keywords ? `- Include these specific technical keywords: ${keywords}` : ""}
        - Include keywords relevant to ${jobTitle} roles.
        - Return ONLY the bullet points, each starting with "• ".
      `;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text?.trim() || "";
  } catch (error) {
    console.error("Error generating experience:", error);
    return "";
  }
};

export const generateProjectDescription = async (
  name: string, 
  technologies: string, 
  goals?: string,
  currentDescription?: string
): Promise<string> => {
  if (!name) return "";
  const ai = getAIClient();

  const prompt = `
    Act as a professional technical resume writer. Generate high-impact, ATS-optimized bullet points for a project entry.
    
    Project Name: ${name}
    Technologies: ${technologies}
    ${goals ? `Project Goals/Context: ${goals}` : ""}
    ${currentDescription ? `Current Description: "${currentDescription}"` : ""}

    Guidelines:
    - Return 2-3 concise bullet points.
    - Start each bullet with an action verb (e.g. "Developed", "Integrated", "Optimized").
    - Focus on technical implementation and measurable impact.
    - Use industry-standard technology terms for better keyword matching.
    - Return ONLY the bullet points, each starting with "• ".
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text?.trim() || "";
  } catch (error) {
    console.error("Error generating project description:", error);
    return "";
  }
};

export const generateSkills = async (data: ResumeData): Promise<string> => {
  const ai = getAIClient();

  const jobTitle = data.experience[0]?.jobTitle || "Professional";
  const experienceContext = data.experience.map(e => `${e.jobTitle}: ${e.description}`).join("\n");
  
  const prompt = `
    Act as a technical recruiter. Suggest a comma-separated list of 12-15 relevant hard and soft skills for a ${jobTitle} based on this experience:
    
    ${experienceContext}
    
    ATS Guidelines:
    - Include a mix of specific technical tools (e.g., "React", "Docker") and core competencies (e.g., "Full-Stack Development", "System Architecture").
    - Use standard terminology.
    - Return ONLY the comma-separated list.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text?.trim() || "";
  } catch (error) {
    console.error("Error generating skills:", error);
    return "";
  }
};
