import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini with explicitly server-only env secret.
// This environment variable is NEVER exposed to the client bundle.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_SECRET_KEY || '');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { goal, activityLevel, dietType, metricsJson } = body;

    // Abuse Control & Validation Check
    if (!goal || !activityLevel || !dietType) {
      return Response.json({ error: 'Missing required configuration fields.' }, { status: 400 });
    }

    const prompt = `
      You are a world-class fitness coach and nutritionist. 
      Calculate the precise daily caloric needs, macronutrient targets (Protein, Carbs, Fats), and daily water intake required for a person with the following profile:
      - Goal: ${goal}
      - Activity Level: ${activityLevel}
      - Preferred Diet: ${dietType}
      - Metrics: ${metricsJson}

      Return strictly valid JSON corresponding to this format:
      {
        "calories": (integer),
        "protein": (integer),
        "carbs": (integer),
        "fat": (integer),
        "waterCups": (integer, minimum 8),
        "coachMessage": (a short encouraging 1-sentence message based on their goal)
      }
    `;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-3-flash-preview", 
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse to validate format before sending to client
    const aiPlan = JSON.parse(responseText);

    return Response.json(aiPlan, { status: 200 });

  } catch (error: any) {
    console.error("API Route Error (Generative AI failed):", error.message);
    
    // Implement fallback safety loop on backend layer so we don't throw 500s randomly
    const fallbackPlan = {
      calories: 2200,
      protein: 160,
      carbs: 220,
      fat: 65,
      waterCups: 12,
      coachMessage: "Server fallback plan initialized so you can proceed smoothly!"
    };

    return Response.json(fallbackPlan, { status: 200 });
  }
}
