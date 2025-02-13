import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

interface ContentParams {
  type: string;
  topic: string;
  tone: string;
  keywords: string;
  length: string;
}

export async function generateContent(params: ContentParams): Promise<string> {
  const lengthMap = {
    short: 300,
    medium: 600,
    long: 1000
  };

  const prompt = `
    Create a ${params.type} about "${params.topic}"
    Tone: ${params.tone}
    Keywords: ${params.keywords}
    Target length: ~${lengthMap[params.length as keyof typeof lengthMap]} words
    
    Please ensure the content is:
    1. Engaging and well-structured
    2. Optimized for SEO with natural keyword usage
    3. Written in the specified tone
    4. Free of plagiarism
    5. Grammatically correct
  `;

  const completion = await openai.chat.completions.create({
    messages: [
      { 
        role: "system", 
        content: "You are an expert content writer skilled in creating high-quality, engaging content in various styles and formats." 
      },
      { 
        role: "user", 
        content: prompt 
      }
    ],
    model: "gpt-4",
  });

  return completion.choices[0].message.content || '';
}