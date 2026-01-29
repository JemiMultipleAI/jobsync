import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api/middleware";
import { handleApiError } from "@/lib/api/error-handler";
import { env } from "@/lib/config/env";
import { z } from "zod";

const suggestGeneralSkillsSchema = z.object({
  workExperience: z.array(z.object({
    position: z.string(),
    company: z.string(),
    responsibilities: z.array(z.string()),
    skillsLearned: z.array(z.string()).optional(),
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
    const validatedData = suggestGeneralSkillsSchema.parse(body);

    // Collect all skills learned from experiences
    const allSkillsLearned = validatedData.workExperience
      .flatMap(exp => exp.skillsLearned || [])
      .filter((skill, index, self) => self.indexOf(skill) === index);

    // If OpenAI is available, use it for better suggestions
    if (env.OPENAI_API_KEY) {
      try {
        const openai = await import("openai");
        const client = new openai.OpenAI({
          apiKey: env.OPENAI_API_KEY,
        });

        const prompt = `Based on the following work experience and skills learned, suggest 10-12 general soft skills and transferable skills that would be valuable for a resume. Include both soft skills (like communication, teamwork) and general professional skills. Return only a comma-separated list, no explanations.

Work Experience:
${validatedData.workExperience.map(exp => 
  `- ${exp.position} at ${exp.company}: ${exp.responsibilities.join(", ")}`
).join("\n")}

Skills Learned from Experience: ${allSkillsLearned.join(", ")}

Current Skills: ${validatedData.currentSkills.join(", ")}

Suggest general soft skills and transferable professional skills that are not already in the current skills list.`;

        const response = await client.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a career advisor. Suggest general soft skills and transferable professional skills for resumes. Return only a comma-separated list.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 250,
        });

        const suggestions = response.choices[0]?.message?.content
          ?.split(",")
          .map(s => s.trim())
          .filter(s => s.length > 0 && !validatedData.currentSkills.includes(s))
          .slice(0, 12) || [];

        return NextResponse.json({ suggestions });
      } catch (aiError) {
        console.error("OpenAI error, using fallback:", aiError);
      }
    }

    // Fallback: Common soft skills
    const commonSoftSkills = [
      "Communication", "Teamwork", "Problem Solving", "Time Management", 
      "Leadership", "Adaptability", "Critical Thinking", "Attention to Detail",
      "Customer Service", "Project Management", "Collaboration", "Work Ethic"
    ];

    const suggestions = commonSoftSkills
      .filter(skill => !validatedData.currentSkills.includes(skill))
      .slice(0, 12);

    return NextResponse.json({ 
      suggestions 
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
