import * as pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await (pdfParse as any)(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF');
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
  
  // Look for a name in the first 5 lines
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    // Simple heuristic: if line is short (likely a name), capitalized, and doesn't contain common resume keywords
    if (line.length < 50 && line.length > 2 && 
        /^[A-Z]/.test(line) && 
        !/resume|cv|curriculum|profile|summary|objective|experience|education|skills/i.test(line)) {
      name = line;
      break;
    }
  }
  
  // If email contains a name pattern, use that
  const emailMatch = email.match(/^([a-z]+)\.([a-z]+)@/i);
  if (emailMatch && name === 'Unknown Candidate') {
    name = `${emailMatch[1]} ${emailMatch[2]}`.split(' ').map(w => 
      w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    ).join(' ');
  }
  
  return { name, email };
}
