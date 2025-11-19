import mammoth from 'mammoth';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer, {
      max: 0, // No page limit
      version: 'default'
    });
    
    const extractedText = data.text?.trim();
    
    if (!extractedText || extractedText.length < 10) {
      return 'PDF text extraction completed but content appears to be empty or very short. This may be a scanned PDF or image-based document.';
    }
    
    return extractedText;
  } catch (error) {
    console.error('PDF extraction error:', error);
    return `PDF extraction failed: ${error.message}. The PDF might be password protected, corrupted, or image-based.`;
  }
}

export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error('DOCX extraction error:', error);
    throw new Error('Failed to extract text from DOCX');
  }
}

export async function extractTextFromCV(buffer: Buffer, fileType: string): Promise<string> {
  const type = fileType.toLowerCase();
  
  if (type === 'pdf' || type === 'application/pdf') {
    return extractTextFromPDF(buffer);
  } else if (type === 'docx' || type === 'doc' || type.includes('word') || type.includes('document')) {
    return extractTextFromDOCX(buffer);
  } else {
    throw new Error(`Unsupported file type: ${fileType}`);
  }
}

export function extractCandidateInfo(text: string, email: string): { name: string; email: string } {
  // Try to extract name from the first few lines
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  let name = 'Unknown Candidate';
  
  // Look for a name in the first 10 lines with improved heuristics
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i].trim();
    
    // Skip empty lines and common headers
    if (!line || /^(resume|cv|curriculum|vitae|bio|biography)$/i.test(line)) {
      continue;
    }
    
    // Look for name patterns - improved heuristics
    if (line.length >= 2 && line.length <= 60) {
      // Check if line looks like a name (has at least 2 words, starts with capital, no common keywords)
      const words = line.split(/\s+/);
      const isLikelyName = words.length >= 1 && words.length <= 4 &&
        /^[A-Z]/.test(line) && 
        !/^(profile|summary|objective|experience|education|skills|contact|phone|email|address|career|professional|personal|about|overview)/i.test(line) &&
        !line.includes('@') && // not email
        !line.includes('http') && // not URL
        !/^\d/.test(line) && // doesn't start with number
        !/[()[\]{}]/.test(line) && // no brackets
        words.every(word => /^[A-Za-z]+(['-]?[A-Za-z]+)*$/.test(word)); // only letters, apostrophes, hyphens
      
      if (isLikelyName) {
        name = line;
        break;
      }
    }
  }
  
  // If no name found in text, try to extract from email
  if (name === 'Unknown Candidate') {
    const emailMatch = email.match(/^([a-z]+)\.([a-z]+)@/i) || email.match(/^([a-z]+)_([a-z]+)@/i) || email.match(/^([a-z]+)([a-z]+)@/i);
    if (emailMatch && emailMatch[1] && emailMatch[2]) {
      name = `${emailMatch[1]} ${emailMatch[2]}`.split(' ').map(w => 
        w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
      ).join(' ');
    } else {
      // Try single name from email
      const singleNameMatch = email.match(/^([a-z]+)@/i);
      if (singleNameMatch && singleNameMatch[1].length > 2) {
        name = singleNameMatch[1].charAt(0).toUpperCase() + singleNameMatch[1].slice(1).toLowerCase();
      }
    }
  }
  
  return { name, email };
}
