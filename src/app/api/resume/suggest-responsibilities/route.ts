import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api/middleware";
import { handleApiError } from "@/lib/api/error-handler";
import { env } from "@/lib/config/env";
import { z } from "zod";

const suggestResponsibilitiesSchema = z.object({
  position: z.string(),
  company: z.string(),
  industry: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult.error) {
      return authResult.error;
    }

    const body = await request.json();
    const validatedData = suggestResponsibilitiesSchema.parse(body);

    // If OpenAI is available, use it for better suggestions
    if (env.OPENAI_API_KEY) {
      try {
        const openai = await import("openai");
        const client = new openai.OpenAI({
          apiKey: env.OPENAI_API_KEY,
        });

        const prompt = `Based on the position "${validatedData.position}" at "${validatedData.company}", suggest 5-7 professional resume responsibilities. Each should start with an action verb and be specific. Return only a bullet-point list, one per line, starting with "•".

Format example:
• Managed a team of 10 employees
• Developed and implemented new processes
• Achieved 20% increase in productivity`;

        const response = await client.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a professional resume writer. Suggest specific, action-oriented responsibilities for job positions. Return only bullet points.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 300,
        });

        const content = response.choices[0]?.message?.content || "";
        const suggestions = content
          .split("\n")
          .map(line => line.replace(/^[•\-\*]\s*/, "").trim())
          .filter(line => line.length > 0)
          .slice(0, 7);

        return NextResponse.json({ suggestions });
      } catch (aiError) {
        console.error("OpenAI error, using fallback:", aiError);
      }
    }

    // Fallback: Generic responsibilities based on common positions
    const genericResponsibilities = [
      `Performed ${validatedData.position.toLowerCase()} duties with attention to detail`,
      `Collaborated with team members to achieve project goals`,
      `Maintained high standards of quality and professionalism`,
      `Communicated effectively with clients and stakeholders`,
      `Followed safety protocols and company guidelines`,
    ];

    return NextResponse.json({ 
      suggestions: genericResponsibilities 
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
