import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
import mammoth from 'mammoth';

// Fallback logic for worker
const initializeWorker = (version: string) => {
  try {
    // Try local Vite worker first
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
    console.log("[Parser] Using local Vite worker.");
  } catch (e) {
    // Fallback to CDN
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
    console.log("[Parser] Local worker failed, using CDN fallback.");
  }
};

initializeWorker(pdfjsLib.version);

export async function extractTextFromFile(file: File, onProgress?: (msg: string) => void): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  onProgress?.(`Starting extraction for: ${file.name}`);
  console.log(`[Parser] Processing: ${file.name} | Size: ${(file.size / 1024).toFixed(2)}KB`);

  try {
    if (extension === 'pdf') {
      return await extractTextFromPdf(file, onProgress);
    } else if (extension === 'docx') {
      return await extractTextFromDocx(file, onProgress);
    } else {
      // Basic text reader fallback
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
      });
    }
  } catch (error) {
    console.error(`[Parser] ${file.name} extraction failed:`, error);
    onProgress?.(`Critical Failed: ${error instanceof Error ? error.message : 'Unknown'}`);
    throw error;
  }
}

async function extractTextFromPdf(file: File, onProgress?: (msg: string) => void): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  console.log("[Parser] arrayBuffer load complete.");
  
  onProgress?.("Opening PDF engine...");
  const loadingTask = pdfjsLib.getDocument({ 
    data: arrayBuffer,
    disableRange: true, // Force full download to avoid range request issues
    disableAutoFetch: true
  });
  
  const pdf = await loadingTask.promise;
  onProgress?.(`PDF Engine Active. Pages: ${pdf.numPages}`);
  
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    onProgress?.(`Reading Page ${i}/${pdf.numPages}...`);
    const page = await pdf.getPage(i);
    
    // Diagnostic log of page dimensions
    const viewport = page.getViewport({ scale: 1.0 });
    console.log(`[Parser] Page ${i} viewport: ${viewport.width}x${viewport.height}`);

    const content = await page.getTextContent();
    const strings = content.items.map((item: any) => item.str);
    const pageText = strings.join(' ');
    
    console.log(`[Parser] Page ${i} extracted ${pageText.length} characters.`);
    fullText += pageText + '\n';
  }

  if (fullText.trim().length < 50) {
    console.warn("[Parser] Text output suspiciously short. Possibly a scanned image (requires OCR).");
    onProgress?.("WARNING: Low text detected. This might be a scanned PDF (Image).");
  }

  return fullText;
}

async function extractTextFromDocx(file: File, onProgress?: (msg: string) => void): Promise<string> {
  onProgress?.("Decompressing Word document...");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  console.log(`[Parser] DOCX extracted ${result.value.length} characters.`);
  return result.value;
}
