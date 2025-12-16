import { GoogleGenAI, Type } from "@google/genai";
import { Question, QuestionType } from "../types";

const apiKey = process.env.API_KEY || ''; 
// Log warning if key is missing, but don't crash yet
if (!apiKey) {
  console.warn("SmartCIA: process.env.API_KEY is missing or empty.");
}

const ai = new GoogleGenAI({ apiKey });

interface GradingResult {
  score: number;
  feedback: string;
}

export const evaluateSubjectiveAnswer = async (
  question: Question,
  studentAnswer: string
): Promise<GradingResult> => {
  if (!studentAnswer || studentAnswer.trim() === "") {
    return { score: 0, feedback: "No answer provided." };
  }

  const model = "gemini-2.5-flash";

  const prompt = `
    You are an expert academic grader. Evaluate the following student answer based on the provided question, max marks, and grading rubric/reference.
    
    Question: "${question.text}"
    Max Marks: ${question.marks}
    Reference/Rubric: "${question.rubric || question.sampleAnswer || 'Grade based on relevance and correctness'}"
    Student Answer: "${studentAnswer}"

    Provide a JSON response with:
    1. "score" (number): The score awarded (0 to ${question.marks}). Can be decimal.
    2. "feedback" (string): A concise explanation of the score (max 2 sentences).
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                score: { type: Type.NUMBER },
                feedback: { type: Type.STRING }
            },
            required: ["score", "feedback"]
        }
      }
    });

    let text = response.text;
    if (!text) throw new Error("No response from AI");
    
    // Cleanup potential markdown formatting
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const result = JSON.parse(text);
    return {
        score: Math.min(Math.max(0, result.score), question.marks), // Clamp score
        feedback: result.feedback
    };

  } catch (error: any) {
    console.error("AI Evaluation failed:", error);
    return {
      score: 0,
      feedback: `AI Grading Error: ${error.message || 'Unknown error'}. Please grade manually.`
    };
  }
};

export const generateQuestionsFromPrompt = async (
  topic: string,
  count: number = 3,
  type: 'MIXED' | 'MCQ' | 'SHORT_ANSWER' = 'MIXED'
): Promise<Question[]> => {
  const model = "gemini-2.5-flash";

  let typeInstruction = "Create a mix of Multiple Choice (MCQ) and Short Answer questions.";
  if (type === 'MCQ') typeInstruction = "Create only Multiple Choice (MCQ) questions.";
  if (type === 'SHORT_ANSWER') typeInstruction = "Create only Short Answer questions.";

  const prompt = `
    Generate ${count} exam questions about the topic: "${topic}".
    ${typeInstruction}
    
    For MCQs: Provide 4 distinct options and the 0-based index of the correct option.
    For Short Answers: Provide a specific grading rubric or key points.
    
    Return a JSON array of question objects.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING, description: "The question text" },
              type: { type: Type.STRING, enum: ["MCQ", "SHORT_ANSWER", "LONG_ANSWER"] },
              marks: { type: Type.NUMBER },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctOptionIndex: { type: Type.NUMBER },
              rubric: { type: Type.STRING, description: "Grading criteria for subjective questions" }
            },
            required: ["text", "type", "marks"]
          }
        }
      }
    });

    let text = response.text;
    if (!text) throw new Error("No response from AI");

    // Cleanup potential markdown formatting
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const rawQuestions = JSON.parse(text);
    
    // Map to ensure IDs and types match our app
    return rawQuestions.map((q: any) => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      text: q.text,
      type: q.type as QuestionType,
      marks: q.marks || 5,
      options: q.options || [],
      correctOptionIndex: q.correctOptionIndex,
      rubric: q.rubric || ""
    }));

  } catch (error: any) {
    console.error("AI Generation failed:", error);
    // Re-throw the error so the UI can catch it and display a message
    throw new Error(error.message || "Unknown AI Error");
  }
};
