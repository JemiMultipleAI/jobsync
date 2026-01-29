import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api/middleware";
import { handleApiError } from "@/lib/api/error-handler";
import { env } from "@/lib/config/env";
import { z } from "zod";

const suggestSkillsFromExperienceSchema = z.object({
  position: z.string(),
  company: z.string(),
  responsibilities: z.array(z.string()),
  industry: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult.error) {
      return authResult.error;
    }

    const body = await request.json();
    const validatedData = suggestSkillsFromExperienceSchema.parse(body);

    // If OpenAI is available, use it for better suggestions
    if (env.OPENAI_API_KEY) {
      try {
        const openai = await import("openai");
        const client = new openai.OpenAI({
          apiKey: env.OPENAI_API_KEY,
        });

        const prompt = `Based on the following work experience, suggest 8-10 specific technical and soft skills that would be learned or used in this role. Focus on skills directly related to the position and responsibilities. Return only a comma-separated list of skills, no explanations.

Position: ${validatedData.position}
Company: ${validatedData.company}
Responsibilities:
${validatedData.responsibilities.map(r => `- ${r}`).join('\n')}

Suggest specific, relevant skills for this role.`;

        const response = await client.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a career advisor. Suggest specific skills learned from work experience. Return only a comma-separated list.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 200,
        });

        const suggestions = response.choices[0]?.message?.content
          ?.split(",")
          .map(s => s.trim())
          .filter(s => s.length > 0)
          .slice(0, 10) || [];

        return NextResponse.json({ suggestions });
      } catch (aiError) {
        console.error("OpenAI error, using fallback:", aiError);
      }
    }

    // Fallback: Generate suggestions based on common skills for the position
    const commonSkills: Record<string, string[]> = {
      electrician: ["Electrical Systems", "Wiring", "Safety Compliance", "Troubleshooting", "Installation", "Code Compliance", "Blueprint Reading"],
      engineer: ["Problem Solving", "Technical Analysis", "Project Management", "Design", "Documentation", "CAD Software", "Quality Assurance"],
      manager: ["Leadership", "Team Management", "Strategic Planning", "Budget Management", "Communication", "Performance Management"],
      developer: ["Programming", "Software Development", "Code Review", "Testing", "Version Control", "Debugging", "API Development"],
    };

    const suggestions: string[] = [];
    const positionLower = validatedData.position.toLowerCase();
    Object.keys(commonSkills).forEach(key => {
      if (positionLower.includes(key)) {
        commonSkills[key].forEach(skill => {
          if (!suggestions.includes(skill)) {
            suggestions.push(skill);
          }
        });
      }
    });

    return NextResponse.json({ 
      suggestions: suggestions.slice(0, 10) 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    return handleApiError(error);
  }
}
