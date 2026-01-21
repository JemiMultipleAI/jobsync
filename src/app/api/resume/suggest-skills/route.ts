import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api/middleware";
import { handleApiError } from "@/lib/api/error-handler";
import { env } from "@/lib/config/env";
import { z } from "zod";

const suggestSkillsSchema = z.object({
  workExperience: z.array(z.object({
    position: z.string(),
    company: z.string(),
    responsibilities: z.array(z.string()),
  })),
  currentSkills: z.array(z.string()),
});

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult.error) {
      return authResult.error;
    }

    const body = await request.json();
    const validatedData = suggestSkillsSchema.parse(body);

    // Extract keywords from work experience
    const keywords: string[] = [];
    validatedData.workExperience.forEach(exp => {
      keywords.push(exp.position);
      exp.responsibilities.forEach(resp => {
        // Extract action verbs and key terms
        const words = resp.toLowerCase().split(/\s+/);
        keywords.push(...words.filter(w => w.length > 4));
      });
    });

    // If OpenAI is available, use it for better suggestions
    if (env.OPENAI_API_KEY) {
      try {
        const openai = await import("openai");
        const client = new openai.OpenAI({
          apiKey: env.OPENAI_API_KEY,
        });

        const prompt = `Based on the following work experience, suggest 10 relevant skills for a resume. Return only a comma-separated list of skills, no explanations.

Work Experience:
${validatedData.workExperience.map(exp => 
  `- ${exp.position} at ${exp.company}: ${exp.responsibilities.join(", ")}`
).join("\n")}

Current Skills: ${validatedData.currentSkills.join(", ")}

Suggest skills that are not already in the current skills list.`;

        const response = await client.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a career advisor. Suggest relevant skills based on work experience. Return only a comma-separated list.",
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
          .filter(s => s.length > 0 && !validatedData.currentSkills.includes(s))
          .slice(0, 10) || [];

        return NextResponse.json({ suggestions });
      } catch (aiError) {
        console.error("OpenAI error, using fallback:", aiError);
      }
    }

    // Fallback: Generate suggestions based on common skills for the positions
    const commonSkills: Record<string, string[]> = {
      electrician: ["Electrical Systems", "Wiring", "Safety Compliance", "Troubleshooting", "Installation"],
      engineer: ["Problem Solving", "Technical Analysis", "Project Management", "Design", "Documentation"],
      manager: ["Leadership", "Team Management", "Strategic Planning", "Budget Management", "Communication"],
      developer: ["Programming", "Software Development", "Code Review", "Testing", "Version Control"],
    };

    const suggestions: string[] = [];
    validatedData.workExperience.forEach(exp => {
      const positionLower = exp.position.toLowerCase();
      Object.keys(commonSkills).forEach(key => {
        if (positionLower.includes(key)) {
          commonSkills[key].forEach(skill => {
            if (!validatedData.currentSkills.includes(skill) && !suggestions.includes(skill)) {
              suggestions.push(skill);
            }
          });
        }
      });
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
