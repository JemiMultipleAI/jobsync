import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import { authenticateRequest } from "@/lib/api/middleware";
import { handleApiError } from "@/lib/api/error-handler";
import { env } from "@/lib/config/env";
import { z } from "zod";

const resumeDataSchema = z.object({
  personalInfo: z.object({
    fullName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    location: z.string().optional(),
    linkedIn: z.string().optional(),
    website: z.string().optional(),
    profilePicture: z.string().optional(),
  }),
  professionalSummary: z.string().optional(),
  hobbies: z.string().optional(),
  skills: z.array(z.string()),
  workExperience: z.array(z.object({
    company: z.string(),
    position: z.string(),
    location: z.string().optional(),
    startDate: z.string(),
    endDate: z.string().optional(),
    current: z.boolean().optional(),
    responsibilities: z.array(z.string()),
    achievements: z.array(z.string()).optional(),
    skillsLearned: z.array(z.string()).optional(),
  })),
  education: z.array(z.object({
    institution: z.string(),
    degree: z.string(),
    field: z.string().optional(),
    location: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    current: z.boolean().optional(),
  })).optional(),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string(),
    date: z.string().optional(),
    certificateFile: z.string().optional(),
  })).optional(),
  template: z.enum(["modern", "classic", "creative", "minimal"]).optional(),
  references: z.array(z.object({
    name: z.string(),
    title: z.string().optional(),
    company: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    relationship: z.string().optional(),
  })).optional(),
  additionalInfo: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult.error) {
      return authResult.error;
    }

    await connectDB();

    const body = await request.json();
    const validatedData = resumeDataSchema.parse(body);

    // If OpenAI API key is not configured, use a template-based approach
    let resumeContent: string;
    if (!env.OPENAI_API_KEY) {
      resumeContent = generateResumeTemplate(validatedData);
    } else {
      // Use OpenAI to generate professional resume content
      resumeContent = await generateResumeWithAI(validatedData);
    }

    return NextResponse.json({
      resume: resumeContent,
      message: "Resume generated successfully",
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

async function generateResumeWithAI(data: z.infer<typeof resumeDataSchema>): Promise<string> {
  let openai;
  try {
    openai = await import("openai");
  } catch (importError) {
    console.error("Failed to import OpenAI:", importError);
    // Fallback to template if OpenAI is not available
    return generateResumeTemplate(data);
  }
  
  if (!openai || !env.OPENAI_API_KEY) {
    // Fallback to template if API key is not configured
    return generateResumeTemplate(data);
  }

  const client = new openai.OpenAI({
    apiKey: env.OPENAI_API_KEY,
  });

  // Build prompt for AI
  const prompt = buildResumePrompt(data);

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional resume writer specializing in creating compelling, ATS-friendly resumes for the Australian job market. Generate professional, well-formatted resume content that highlights achievements and uses action verbs.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    return response.choices[0]?.message?.content || generateResumeTemplate(data);
  } catch (error) {
    console.error("OpenAI API error:", error);
    // Fallback to template if AI fails
    return generateResumeTemplate(data);
  }
}

function buildResumePrompt(data: z.infer<typeof resumeDataSchema>): string {
  let prompt = `Create a professional resume for the following candidate:\n\n`;
  
  prompt += `PERSONAL INFORMATION:\n`;
  prompt += `Name: ${data.personalInfo.fullName}\n`;
  prompt += `Email: ${data.personalInfo.email}\n`;
  if (data.personalInfo.phone) prompt += `Phone: ${data.personalInfo.phone}\n`;
  if (data.personalInfo.location) prompt += `Location: ${data.personalInfo.location}\n`;
  if (data.personalInfo.linkedIn) prompt += `LinkedIn: ${data.personalInfo.linkedIn}\n`;
  if (data.personalInfo.website) prompt += `Website: ${data.personalInfo.website}\n`;

  if (data.professionalSummary) {
    prompt += `\nPROFESSIONAL SUMMARY:\n${data.professionalSummary}\n`;
  }

  if (data.hobbies) {
    prompt += `\nHOBBIES & INTERESTS:\n${data.hobbies}\n`;
  }

  prompt += `\nSKILLS:\n${data.skills.join(", ")}\n`;

  prompt += `\nWORK EXPERIENCE:\n`;
  data.workExperience.forEach((exp, idx) => {
    prompt += `\n${idx + 1}. ${exp.position} at ${exp.company}`;
    if (exp.location) prompt += `, ${exp.location}`;
    prompt += `\n   Period: ${exp.startDate} - ${exp.endDate || exp.current ? "Present" : exp.endDate}\n`;
    prompt += `   Responsibilities:\n`;
    exp.responsibilities.forEach(resp => {
      prompt += `   - ${resp}\n`;
    });
    if (exp.achievements && exp.achievements.length > 0) {
      prompt += `   Achievements:\n`;
      exp.achievements.forEach(ach => {
        prompt += `   - ${ach}\n`;
      });
    }
    if (exp.skillsLearned && exp.skillsLearned.length > 0) {
      prompt += `   Skills Learned: ${exp.skillsLearned.join(", ")}\n`;
    }
  });

  if (data.education && data.education.length > 0) {
    prompt += `\nEDUCATION:\n`;
    data.education.forEach(edu => {
      prompt += `${edu.degree}${edu.field ? ` in ${edu.field}` : ""} from ${edu.institution}`;
      if (edu.location) prompt += `, ${edu.location}`;
      if (edu.endDate || edu.current) {
        prompt += ` (${edu.endDate || "Present"})`;
      }
      prompt += `\n`;
    });
  }

  if (data.certifications && data.certifications.length > 0) {
    prompt += `\nCERTIFICATIONS:\n`;
    data.certifications.forEach(cert => {
      prompt += `${cert.name} from ${cert.issuer}`;
      if (cert.date) prompt += ` (${cert.date})`;
      prompt += `\n`;
    });
  }

  if (data.references && data.references.length > 0) {
    prompt += `\nREFERENCES:\n`;
    data.references.forEach(ref => {
      prompt += `${ref.name}`;
      if (ref.title) prompt += `, ${ref.title}`;
      if (ref.company) prompt += ` at ${ref.company}`;
      if (ref.email) prompt += ` - ${ref.email}`;
      if (ref.phone) prompt += ` - ${ref.phone}`;
      prompt += `\n`;
    });
  }

  prompt += `\nPlease generate a professional, well-formatted resume in plain text format. Use action verbs, quantify achievements where possible, and ensure the resume is ATS-friendly. Format it with clear sections and bullet points.`;

  return prompt;
}

function generateResumeTemplate(data: z.infer<typeof resumeDataSchema>): string {
  // Generate professional HTML resume
  const template = data.template || "modern";
  
  return generateHTMLResume(data, template);
}

function generateHTMLResume(data: z.infer<typeof resumeDataSchema>, template: string): string {
  const styles = getTemplateStyles(template);
  
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.personalInfo.fullName} - Resume</title>
  <style>
    ${styles}
  </style>
</head>
<body>
  <div class="resume-container">
    <!-- Header Section -->
    <header class="resume-header">
      ${data.personalInfo.profilePicture ? `<div class="profile-picture"><img src="${data.personalInfo.profilePicture}" alt="Profile Picture" /></div>` : ''}
      <div class="header-content">
        <h1 class="name">${escapeHtml(data.personalInfo.fullName)}</h1>
        <div class="contact-info">
          <div class="contact-item">
            <span class="icon">📧</span>
            <a href="mailto:${escapeHtml(data.personalInfo.email)}">${escapeHtml(data.personalInfo.email)}</a>
          </div>
          ${data.personalInfo.phone ? `<div class="contact-item"><span class="icon">📱</span>${escapeHtml(data.personalInfo.phone)}</div>` : ''}
          ${data.personalInfo.location ? `<div class="contact-item"><span class="icon">📍</span>${escapeHtml(data.personalInfo.location)}</div>` : ''}
          ${data.personalInfo.linkedIn ? `<div class="contact-item"><span class="icon">💼</span><a href="${escapeHtml(data.personalInfo.linkedIn)}" target="_blank">LinkedIn</a></div>` : ''}
          ${data.personalInfo.website ? `<div class="contact-item"><span class="icon">🌐</span><a href="${escapeHtml(data.personalInfo.website)}" target="_blank">Website</a></div>` : ''}
        </div>
      </div>
    </header>

    <!-- Professional Summary -->
    ${data.professionalSummary ? `
    <section class="section">
      <h2 class="section-title">Professional Summary</h2>
      <p class="summary-text">${escapeHtml(data.professionalSummary)}</p>
    </section>
    ` : ''}

    <!-- Skills Section -->
    <section class="section">
      <h2 class="section-title">Skills</h2>
      <div class="skills-container">
        ${data.skills.map(skill => `<span class="skill-badge">${escapeHtml(skill)}</span>`).join('')}
      </div>
    </section>

    <!-- Work Experience -->
    <section class="section">
      <h2 class="section-title">Work Experience</h2>
      ${data.workExperience.map((exp, idx) => `
        <div class="experience-item">
          <div class="experience-header">
            <div>
              <h3 class="job-title">${escapeHtml(exp.position)}</h3>
              <p class="company-name">${escapeHtml(exp.company)}${exp.location ? ` • ${escapeHtml(exp.location)}` : ''}</p>
            </div>
            <span class="date-range">${formatDate(exp.startDate)} - ${exp.current ? 'Present' : formatDate(exp.endDate || '')}</span>
          </div>
          <ul class="responsibilities">
            ${exp.responsibilities.map(resp => `<li>${escapeHtml(resp)}</li>`).join('')}
          </ul>
          ${exp.achievements && exp.achievements.length > 0 ? `
            <div class="achievements">
              <strong>Key Achievements:</strong>
              <ul>
                ${exp.achievements.map(ach => `<li>${escapeHtml(ach)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          ${exp.skillsLearned && exp.skillsLearned.length > 0 ? `
            <div class="skills-learned">
              <strong>Skills Learned:</strong>
              <div class="skills-learned-badges">
                ${exp.skillsLearned.map(skill => `<span class="skill-learned-badge">${escapeHtml(skill)}</span>`).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      `).join('')}
    </section>

    <!-- Education -->
    ${data.education && data.education.length > 0 ? `
    <section class="section">
      <h2 class="section-title">Education</h2>
      ${data.education.map((edu) => `
        <div class="education-item">
          <div class="education-header">
            <div>
              <h3 class="degree">${escapeHtml(edu.degree)}${edu.field ? ` in ${escapeHtml(edu.field)}` : ''}</h3>
              <p class="institution">${escapeHtml(edu.institution)}${edu.location ? ` • ${escapeHtml(edu.location)}` : ''}</p>
            </div>
            ${edu.endDate || edu.current ? `<span class="date-range">${edu.endDate ? formatDate(edu.endDate) : 'Present'}</span>` : ''}
          </div>
        </div>
      `).join('')}
    </section>
    ` : ''}

    <!-- Certifications -->
    ${data.certifications && data.certifications.length > 0 ? `
    <section class="section">
      <h2 class="section-title">Certifications</h2>
      <div class="certifications-list">
        ${data.certifications.map((cert) => `
          <div class="certification-item">
            <strong>${escapeHtml(cert.name)}</strong> - ${escapeHtml(cert.issuer)}${cert.date ? ` (${formatDate(cert.date)})` : ''}
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    <!-- Hobbies -->
    ${data.hobbies ? `
    <section class="section">
      <h2 class="section-title">Hobbies & Interests</h2>
      <p class="hobbies-text">${escapeHtml(data.hobbies)}</p>
    </section>
    ` : ''}

    <!-- References -->
    ${data.references && data.references.length > 0 ? `
    <section class="section">
      <h2 class="section-title">References</h2>
      <div class="references-list">
        ${data.references.map((ref) => `
          <div class="reference-item">
            <strong>${escapeHtml(ref.name)}</strong>
            ${ref.title ? `, ${escapeHtml(ref.title)}` : ''}
            ${ref.company ? ` at ${escapeHtml(ref.company)}` : ''}
            ${ref.email ? `<br><span class="reference-contact">Email: ${escapeHtml(ref.email)}</span>` : ''}
            ${ref.phone ? `<br><span class="reference-contact">Phone: ${escapeHtml(ref.phone)}</span>` : ''}
            ${ref.relationship ? `<br><span class="reference-contact">${escapeHtml(ref.relationship)}</span>` : ''}
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}
  </div>
</body>
</html>`;

  return html;
}

function getTemplateStyles(template: string): string {
  const baseStyles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; padding: 20px; }
    .resume-container { max-width: 900px; margin: 0 auto; background: white; padding: 50px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); border-radius: 8px; }
    .resume-header { display: flex; align-items: center; gap: 35px; padding-bottom: 35px; border-bottom: 4px solid #B260E6; margin-bottom: 35px; background: linear-gradient(135deg, rgba(178,96,230,0.05), rgba(237,132,165,0.05)); padding: 35px; border-radius: 12px; }
    .profile-picture { width: 140px; height: 140px; border-radius: 50%; overflow: hidden; flex-shrink: 0; border: 5px solid #B260E6; box-shadow: 0 4px 15px rgba(178,96,230,0.3); }
    .profile-picture img { width: 100%; height: 100%; object-fit: cover; }
    .header-content { flex: 1; }
    .name { font-size: 42px; color: #1a1a1a; margin-bottom: 18px; font-weight: 700; letter-spacing: -0.5px; }
    .contact-info { display: flex; flex-wrap: wrap; gap: 18px; }
    .contact-item { display: flex; align-items: center; gap: 10px; font-size: 15px; color: #555; }
    .contact-item a { color: #B260E6; text-decoration: none; font-weight: 500; }
    .contact-item a:hover { text-decoration: underline; color: #ED84A5; }
    .icon { font-size: 18px; }
    .section { margin-bottom: 40px; }
    .section-title { font-size: 26px; color: #B260E6; margin-bottom: 22px; padding-bottom: 12px; border-bottom: 3px solid #ED84A5; font-weight: 700; letter-spacing: -0.3px; }
    .summary-text { font-size: 16px; line-height: 1.9; color: #333; text-align: justify; }
    .skills-container { display: flex; flex-wrap: wrap; gap: 12px; }
    .skill-badge { background: linear-gradient(135deg, #B260E6, #ED84A5); color: white; padding: 10px 18px; border-radius: 25px; font-size: 14px; font-weight: 600; box-shadow: 0 2px 8px rgba(178,96,230,0.3); }
    .experience-item, .education-item { margin-bottom: 30px; padding-bottom: 30px; border-bottom: 2px solid #f0f0f0; }
    .experience-item:last-child, .education-item:last-child { border-bottom: none; }
    .experience-header, .education-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; }
    .job-title, .degree { font-size: 22px; color: #1a1a1a; margin-bottom: 6px; font-weight: 700; }
    .company-name, .institution { font-size: 17px; color: #666; font-weight: 500; }
    .date-range { font-size: 15px; color: #B260E6; font-weight: 600; white-space: nowrap; background: rgba(178,96,230,0.1); padding: 6px 12px; border-radius: 20px; }
    .responsibilities { list-style: none; padding-left: 0; margin-top: 12px; }
    .responsibilities li { padding: 8px 0; padding-left: 28px; position: relative; line-height: 1.7; color: #444; }
    .responsibilities li:before { content: "▸"; position: absolute; left: 0; color: #B260E6; font-weight: bold; font-size: 18px; }
    .achievements { margin-top: 18px; padding: 18px; background: linear-gradient(135deg, #fff5f8, #f9f9f9); border-left: 5px solid #ED84A5; border-radius: 8px; }
    .achievements ul { list-style: none; padding-left: 0; margin-top: 12px; }
    .achievements li { padding: 6px 0; padding-left: 24px; position: relative; }
    .achievements li:before { content: "✓"; position: absolute; left: 0; color: #ED84A5; font-weight: bold; font-size: 16px; }
    .skills-learned { margin-top: 18px; padding: 18px; background: linear-gradient(135deg, #f0f4ff, #f8f9ff); border-left: 5px solid #B260E6; border-radius: 8px; }
    .skills-learned strong { display: block; margin-bottom: 12px; color: #1a1a1a; font-size: 16px; }
    .skills-learned-badges { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 12px; }
    .skill-learned-badge { background: linear-gradient(135deg, #B260E6, #9a4fc7); color: white; padding: 8px 14px; border-radius: 18px; font-size: 13px; font-weight: 600; box-shadow: 0 2px 6px rgba(178,96,230,0.3); }
    .certifications-list, .references-list { display: flex; flex-direction: column; gap: 18px; }
    .certification-item, .reference-item { padding: 16px; background: linear-gradient(135deg, #f9f9f9, #ffffff); border-radius: 10px; line-height: 1.7; border: 1px solid #e0e0e0; }
    .reference-contact { font-size: 14px; color: #666; }
    .hobbies-text { font-size: 16px; line-height: 1.9; color: #333; }
    @media print { body { background: white; padding: 0; } .resume-container { box-shadow: none; border-radius: 0; } }
  `;

  return baseStyles;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

function formatDate(dateString: string): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', { year: 'numeric', month: 'short' });
  } catch {
    return dateString;
  }
}
