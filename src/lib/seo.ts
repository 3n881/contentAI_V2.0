import OpenAI from 'openai';
import { db } from './firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export interface SEOSuggestions {
  title: string;
  metaDescription: string;
  keywords: string[];
  readabilityScore: number;
}

export async function analyzeSEO(content: string): Promise<SEOSuggestions> {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an SEO expert. Analyze the content and provide SEO suggestions. 
          IMPORTANT: Your response must be a valid JSON object with exactly these fields:
          {
            "title": "An SEO-optimized title (max 60 chars)",
            "metaDescription": "A compelling meta description (max 160 chars)",
            "keywords": ["keyword1", "keyword2", "keyword3"],
            "readabilityScore": number between 0-100
          }
          Do not include any other text or explanation in your response.`
        },
        {
          role: "user",
          content: `Analyze this content and provide SEO suggestions: ${content}`
        }
      ],
      model: "gpt-4",
      temperature: 0.7
    });

    const suggestions = JSON.parse(completion.choices[0].message.content || '{"title":"","metaDescription":"","keywords":[],"readabilityScore":0}');
    
    // Validate the response structure
    if (!suggestions.title || !suggestions.metaDescription || !Array.isArray(suggestions.keywords)) {
      throw new Error('Invalid response format from OpenAI');
    }

    return {
      title: suggestions.title,
      metaDescription: suggestions.metaDescription,
      keywords: suggestions.keywords,
      readabilityScore: suggestions.readabilityScore || 0
    };
  } catch (error) {
    console.error('Error in analyzeSEO:', error);
    throw new Error('Failed to analyze content. Please try again.');
  }
}

export async function generateKeywordSuggestions(topic: string): Promise<string[]> {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a keyword research expert. Generate 10 relevant keywords for the given topic.
          IMPORTANT: Your response must be a valid JSON object in this exact format:
          {
            "keywords": ["keyword1", "keyword2", "keyword3", ...]
          }
          Do not include any other text or explanation in your response.`
        },
        {
          role: "user",
          content: `Generate keywords for: ${topic}`
        }
      ],
      model: "gpt-4",
      temperature: 0.7
    });

    const response = JSON.parse(completion.choices[0].message.content || '{"keywords":[]}');
    
    if (!response.keywords || !Array.isArray(response.keywords)) {
      throw new Error('Invalid response format from OpenAI');
    }

    return response.keywords;
  } catch (error) {
    console.error('Error in generateKeywordSuggestions:', error);
    throw new Error('Failed to generate keyword suggestions. Please try again.');
  }
}