import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// Model fallback chain — if one model hits rate limits, try the next
const MODEL_CHAIN = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];

/**
 * Convert a File object to a base64 data string for Gemini inlineData.
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Determine the MIME type for a file based on extension
 */
function getMimeType(file: File): string {
  const ext = file.name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf": return "application/pdf";
    case "docx": return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "doc": return "application/msword";
    default: return file.type || "application/octet-stream";
  }
}

/**
 * Sleep helper for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Call Gemini with automatic retry and model fallback.
 * If a model hits 429 rate limits, it tries the next model in the chain.
 * Also retries within the same model with exponential backoff.
 */
async function callGeminiWithRetry(
  parts: any[],
  onProgress?: (msg: string) => void,
  maxRetriesPerModel = 2
): Promise<string> {
  for (const modelName of MODEL_CHAIN) {
    const model = genAI.getGenerativeModel({ model: modelName });
    
    for (let attempt = 0; attempt <= maxRetriesPerModel; attempt++) {
      try {
        onProgress?.(`Using model: ${modelName}${attempt > 0 ? ` (retry ${attempt})` : ""}...`);
        console.log(`[Gemini] Trying ${modelName}, attempt ${attempt + 1}...`);
        
        const result = await model.generateContent(parts);
        const response = await result.response;
        const text = response.text();
        
        console.log(`[Gemini] Success with ${modelName}!`);
        return text;
      } catch (error: any) {
        const errorMsg = error?.message || String(error);
        const is429 = errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("rate");
        
        if (is429) {
          // Extract retry delay from error if available
          const retryMatch = errorMsg.match(/retry in ([\d.]+)s/i);
          const waitSeconds = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) : (attempt + 1) * 15;
          
          if (attempt < maxRetriesPerModel) {
            onProgress?.(`Rate limited on ${modelName}. Waiting ${waitSeconds}s before retry...`);
            console.log(`[Gemini] 429 on ${modelName}. Waiting ${waitSeconds}s...`);
            await sleep(waitSeconds * 1000);
          } else {
            onProgress?.(`${modelName} quota exhausted. Trying next model...`);
            console.log(`[Gemini] ${modelName} exhausted, falling back to next model.`);
            break; // Move to next model
          }
        } else {
          // Non-rate-limit error — throw immediately
          throw error;
        }
      }
    }
  }
  
  throw new Error("All Gemini models are rate-limited. Please wait a minute and try again.");
}

/**
 * Send the raw files directly to Gemini's multimodal API.
 * Gemini can natively read PDFs, DOCX, etc. — no client-side parsing needed.
 */
export async function extractAndStructureCV(
  files: File[],
  onProgress?: (msg: string) => void
) {
  onProgress?.("Converting files to base64...");

  // Build the content parts: the prompt text + each file as inlineData
  const parts: any[] = [];

  // Add the instruction prompt
  parts.push({
    text: `You are an expert HR recruitment assistant.
I am providing you with document files directly. One or more of these documents is a CV/Resume, and optionally one is a Motivational Letter.

YOUR TASK:
1. Read and understand ALL the provided documents thoroughly.
2. Extract the candidate's full professional profile from the CV.
3. If a motivational letter is provided, use it to refine the "objective" summary — blending the candidate's factual experience with the aspirational intent from the letter.
4. Return ONLY a valid JSON object (no markdown, no backticks, no extra text).

CRITICAL RULES:
- Extract EVERY job experience entry found in the CV, not just the most recent ones.
- Extract ALL skills mentioned, including technical skills, soft skills, languages, and tools.
- The "objective" should be 2-3 compelling sentences synthesizing the CV and letter.
- Sort experience chronologically (newest first).
- If a field is unclear, make your best inference rather than leaving it empty.

REQUIRED JSON STRUCTURE:
{
  "name": "Full Name",
  "role": "Current or most recent professional title",
  "objective": "Synthesized 2-3 sentence professional summary",
  "experience": [
    {
      "company": "Company Name",
      "position": "Job Title",
      "duration": "Start - End",
      "description": "Key responsibilities and achievements"
    }
  ],
  "skills": ["skill1", "skill2", "skill3"]
}

Output ONLY the JSON object, nothing else.`
  });

  // Add each file as inlineData
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    onProgress?.(`Processing file ${i + 1}/${files.length}: ${file.name}...`);
    console.log(`[Gemini] Converting ${file.name} (${(file.size / 1024).toFixed(1)}KB) to base64...`);

    const base64Data = await fileToBase64(file);
    const mimeType = getMimeType(file);

    console.log(`[Gemini] File ${file.name} → MIME: ${mimeType}, base64 length: ${base64Data.length}`);

    parts.push({
      inlineData: {
        mimeType: mimeType,
        data: base64Data,
      },
    });
  }

  onProgress?.("Sending documents to Gemini AI for analysis...");

  try {
    const text = await callGeminiWithRetry(parts, onProgress);

    console.log("[Gemini] Raw response:", text);
    onProgress?.("AI analysis complete! Parsing results...");

    // Parse JSON from response (handle potential markdown wrapping)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(text);
  } catch (error) {
    console.error("[Gemini] Extraction Error:", error);
    onProgress?.(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    throw error;
  }
}

/**
 * Scour for job opportunities based on the extracted profile.
 */
export async function scourJobOpportunities(cvData: any) {
  const parts = [{
    text: `Based on the following candidate profile, generate a list of 5 diverse, highly relevant job opportunities that currently exist or are trending in the market.
Include a title, company (can be a generic type or specific realistic examples), a brief "matching reason", and a projected salary range.

CANDIDATE PROFILE:
${JSON.stringify(cvData, null, 2)}

Return ONLY a valid JSON object (no markdown, no backticks):
{
  "opportunities": [
    { 
      "title": "string", 
      "company": "string", 
      "matchReason": "string", 
      "salaryRange": "string", 
      "platform": "LinkedIn | Indeed | Glassdoor | Specialized",
      "url": "https://www.linkedin.com/jobs/search/?keywords={TITLE}&location={LOCATION}" 
    }
  ]
}
PRECISION RULES:
1. Use '+' for spaces in Title/Location.
2. If the user is a Geoscientist/Geologist, vary the links to include LinkedIn and Indeed specifically for those titles.
3. Ensure the location from the profile is used if present.`
  }];

  try {
    const text = await callGeminiWithRetry(parts);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(text);
  } catch (error) {
    console.error("[Gemini] Job Scouring Error:", error);
    throw error;
  }
}
