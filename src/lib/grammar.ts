import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export interface GrammarCheck {
  corrections: {
    original: string;
    suggestion: string;
    explanation: string;
  }[];
  correctedText: string;
  overallScore: number;
}

export async function checkGrammar(content: string): Promise<GrammarCheck> {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a professional editor. Check the text for grammar, spelling, and style issues.
          You must respond with a valid JSON object in this exact format:
          {
            "corrections": [
              {
                "original": "text with error",
                "suggestion": "corrected text",
                "explanation": "explanation of the correction"
              }
            ],
            "correctedText": "the complete text with all corrections applied",
            "overallScore": number between 0-100
          }
          Do not include any other text or explanation in your response.
          Ensure all text values are properly escaped for JSON.`
        },
        {
          role: "user",
          content: content
        }
      ],
      model: "gpt-4",
      temperature: 0.7
    });

    const responseText = completion.choices[0].message.content || '{"corrections":[],"correctedText":"","overallScore":0}';
    
    try {
      const result = JSON.parse(responseText);
      
      // Validate the response structure
      if (!Array.isArray(result.corrections) || 
          typeof result.overallScore !== 'number' || 
          typeof result.correctedText !== 'string') {
        throw new Error('Invalid response format');
      }

      // Validate each correction object
      result.corrections.forEach((correction: any) => {
        if (!correction.original || !correction.suggestion || !correction.explanation) {
          throw new Error('Invalid correction format');
        }
      });

      return {
        corrections: result.corrections,
        correctedText: result.correctedText,
        overallScore: result.overallScore
      };
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      // Return a safe default if parsing fails
      return {
        corrections: [],
        correctedText: content,
        overallScore: 0
      };
    }
  } catch (error) {
    console.error('Error in checkGrammar:', error);
    throw new Error('Failed to check grammar. Please try again.');
  }
}

export async function checkPlagiarism(content: string): Promise<number> {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Analyze the text for potential plagiarism patterns and common phrases.
          You must respond with a valid JSON object in this exact format:
          {
            "originalityScore": number between 0-100
          }
          Do not include any other text or explanation in your response.`
        },
        {
          role: "user",
          content: content
        }
      ],
      model: "gpt-4",
      temperature: 0.7
    });

    const responseText = completion.choices[0].message.content || '{"originalityScore":0}';
    
    try {
      const result = JSON.parse(responseText);
      
      if (typeof result.originalityScore !== 'number') {
        throw new Error('Invalid response format');
      }

      return result.originalityScore;
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      return 0;
    }
  } catch (error) {
    console.error('Error in checkPlagiarism:', error);
    throw new Error('Failed to check plagiarism. Please try again.');
  }
}