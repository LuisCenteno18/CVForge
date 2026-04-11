import { GoogleGenerativeAI } from "@google/generative-ai";
import { extractTextFromFile } from "./documentParser";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || "");

// Model choices (using GPT-4o on GitHub as Gemini 1.5 Pro is not currently available via the inference API)
const GITHUB_MODEL = "gpt-4o";
const GEMINI_MODELS = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];

const EXTRACTION_PROMPT = `You are an expert HR recruitment assistant.
I am providing you with the text content extracted from one or more documents (a CV/Resume and optionally a Motivational Letter).

YOUR TASK:
1. Read and understand the provided text thoroughly.
2. Extract the candidate's full professional profile.
3. If a motivational letter is present, use it to refine the "objective" summary — blending factual experience with aspirational intent.
4. Return ONLY a valid JSON object (no markdown, no backticks, no extra text).

CRITICAL RULES:
- Extract EVERY job experience entry found.
- Extract ALL skills, education, languages, and certifications.
- The "objective" should be 2-3 compelling sentences synthesizing the profile.
- Sort experience chronologically (newest first).
- If a field is unclear, make your best inference.

REQUIRED JSON STRUCTURE:
{
  "name": "Full Name",
  "role": "Current or most recent professional title",
  "email": "email if found",
  "phone": "phone if found",
  "location": "city, country",
  "website": "personal website if found",
  "linkedin": "linkedin URL if found",
  "objective": "Synthesized summary",
  "experience": [
    { "company": "Name", "position": "Title", "duration": "Range", "description": "Details" }
  ],
  "education": [
    { "institution": "Name", "degree": "Type", "field": "Field", "duration": "Range" }
  ],
  "skills": ["skill1", "skill2"],
  "languages": [{ "name": "Language", "level": "Proficiency" }],
  "certifications": ["cert1"],
  "interests": ["interest1"]
}

Output ONLY the JSON object.`;

/**
 * Call GitHub Models API (OpenAI-compatible)
 */
async function callGithubModels(content: string, onProgress?: (msg: string) => void): Promise<string> {
  onProgress?.(`Using GitHub Models: ${GITHUB_MODEL}...`);
  
  const response = await fetch("https://models.inference.ai.azure.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GITHUB_TOKEN}`
    },
    body: JSON.stringify({
      messages: [
        { role: "system", content: EXTRACTION_PROMPT },
        { role: "user", content: content }
      ],
      model: GITHUB_MODEL,
      temperature: 0.1,
      max_tokens: 4096
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub Models API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

/**
 * Call Gemini with automatic retry and model fallback (using Google SDK)
 */
async function callGeminiWithRetry(
  parts: any[],
  onProgress?: (msg: string) => void,
  maxRetriesPerModel = 2
): Promise<string> {
  for (const modelName of GEMINI_MODELS) {
    const model = genAI.getGenerativeModel({ model: modelName });
    
    for (let attempt = 0; attempt <= maxRetriesPerModel; attempt++) {
      try {
        onProgress?.(`Using Google Gemini: ${modelName}${attempt > 0 ? ` (retry ${attempt})` : ""}...`);
        const result = await model.generateContent(parts);
        return (await result.response).text();
      } catch (error: any) {
        const msg = error?.message || String(error);
        const isRateLimit = msg.includes("429") || msg.includes("quota");
        
        if (isRateLimit && attempt < maxRetriesPerModel) {
          const wait = (attempt + 1) * 15;
          onProgress?.(`Rate limited. Waiting ${wait}s...`);
          await new Promise(r => setTimeout(r, wait * 1000));
        } else if (isRateLimit) {
          break; // Try next model
        } else {
          throw error;
        }
      }
    }
  }
  throw new Error("All AI models are exhausted or rate-limited.");
}

/**
 * Main entry point for CV extraction.
 * Switches between GitHub Models and native Gemini based on available tokens.
 */
export async function extractAndStructureCV(
  files: File[],
  onProgress?: (msg: string) => void
) {
  onProgress?.("Extracting text from documents...");
  
  const texts = [];
  for (const file of files) {
    const text = await extractTextFromFile(file, onProgress);
    texts.push(`--- CONTENT FROM FILE: ${file.name} ---\n${text}\n`);
  }
  
  const combinedText = texts.join("\n\n");
  onProgress?.("Analyzing content with AI...");

  let responseText: string;
  
  if (GITHUB_TOKEN) {
    // Priority 1: GitHub Models API (OpenAI-compatible)
    responseText = await callGithubModels(combinedText, onProgress);
  } else {
    // Priority 2: Google Gemini SDK
    // Note: We send the text instead of binary to maintain consistency and bypass file size limits
    const parts = [
      { text: EXTRACTION_PROMPT },
      { text: `DOCUMENTS CONTENT:\n${combinedText}` }
    ];
    responseText = await callGeminiWithRetry(parts, onProgress);
  }

  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    onProgress?.("✓ Extraction complete!");
    return parsed;
  } catch (error) {
    console.error("Failed to parse AI response:", responseText);
    throw new Error("AI returned invalid data format. Please try again.");
  }
}

/**
 * Scour for job opportunities based on profile.
 * Prefers GitHub Models if available.
 */
export async function scourJobOpportunities(cvData: any) {
  const prompt = `Based on this candidate profile, generate 5 diverse job opportunities.
  
CANDIDATE PROFILE:
${JSON.stringify(cvData, null, 2)}

Return ONLY JSON:
{
  "opportunities": [
    { 
      "title": "string", "company": "string", "matchReason": "string", 
      "salaryRange": "string", "platform": "LinkedIn | Indeed | Glassdoor",
      "url": "https://www.linkedin.com/jobs/search/?keywords={TITLE}&location={LOCATION}" 
    }
  ]
}`;

  if (GITHUB_TOKEN) {
    const response = await fetch("https://models.inference.ai.azure.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GITHUB_TOKEN}`
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
        model: GITHUB_MODEL,
        temperature: 0.7
      })
    });
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";
    const match = text.match(/\{[\s\S]*\}/);
    return JSON.parse(match ? match[0] : text);
  } else {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const text = (await result.response).text();
    const match = text.match(/\{[\s\S]*\}/);
    return JSON.parse(match ? match[0] : text);
  }
}
