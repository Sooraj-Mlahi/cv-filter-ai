import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface CVAnalysisResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
}

export async function analyzeCVWithOpenAI(
  cvText: string,
  jobDescription: string,
  candidateName: string
): Promise<CVAnalysisResult> {
  try {
    const prompt = `You are an expert HR recruiter analyzing resumes for job positions.

Job Description:
${jobDescription}

Resume for ${candidateName}:
${cvText.substring(0, 8000)} 

Task: Analyze this resume against the job description and provide:
1. A score from 0-100 (where 100 is a perfect match)
2. 2-3 key strengths that make this candidate suitable for the role
3. 2-3 key weaknesses or gaps in their qualifications

Respond ONLY with valid JSON in this exact format:
{
  "score": <number between 0-100>,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert HR recruiter. Always respond with valid JSON only, no additional text.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    const result = JSON.parse(content);

    // Validate the response structure
    if (typeof result.score !== 'number' || 
        !Array.isArray(result.strengths) || 
        !Array.isArray(result.weaknesses)) {
      throw new Error('Invalid response format from OpenAI');
    }

    // Ensure score is within bounds
    const score = Math.max(0, Math.min(100, Math.round(result.score)));

    // Ensure we have at least 1 item in each array, max 3
    const strengths = result.strengths.slice(0, 3).filter((s: any) => typeof s === 'string' && s.trim().length > 0);
    const weaknesses = result.weaknesses.slice(0, 3).filter((w: any) => typeof w === 'string' && w.trim().length > 0);

    if (strengths.length === 0) {
      strengths.push('Candidate meets basic requirements');
    }
    if (weaknesses.length === 0) {
      weaknesses.push('No significant gaps identified');
    }

    return {
      score,
      strengths,
      weaknesses,
    };
  } catch (error) {
    console.error('OpenAI analysis error:', error);
    if (error instanceof Error && error.message.includes('JSON')) {
      throw new Error('Failed to parse AI response. Please try again.');
    }
    throw new Error('Failed to analyze resume with AI. Please check your API key and try again.');
  }
}
