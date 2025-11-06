import OpenAI from 'openai';

interface MaintenanceAnalysis {
  isMaintenanceRequest: boolean;
  title: string;
  description: string;
  requestType: 'PLUMBING' | 'HVAC' | 'ELECTRICAL' | 'APPLIANCE' | 'GENERAL' | 'EMERGENCY' | 'PEST_CONTROL' | 'LANDSCAPING' | 'SECURITY' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
  location: string;
  unitNumber?: string;
}

export async function analyzeMaintenanceRequest(
  transcript: string,
  callerPhone: string
): Promise<MaintenanceAnalysis> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

  const prompt = `Analyze this call transcript and extract maintenance request details.

TRANSCRIPT:
${transcript}

CALLER: ${callerPhone}

Return ONLY valid JSON (no markdown):
{
  "isMaintenanceRequest": boolean,
  "title": "Brief title",
  "description": "Detailed description",
  "requestType": "PLUMBING|HVAC|ELECTRICAL|APPLIANCE|GENERAL|EMERGENCY|PEST_CONTROL|LANDSCAPING|SECURITY|OTHER",
  "priority": "LOW|MEDIUM|HIGH|EMERGENCY",
  "location": "kitchen|bathroom|etc",
  "unitNumber": "2B or null"
}

Priority: EMERGENCY=safety/flooding, HIGH=non-working essential, MEDIUM=degraded, LOW=cosmetic`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 500,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('No response');

    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('[AI] Error:', error);
    return {
      isMaintenanceRequest: true,
      title: 'Maintenance Request',
      description: transcript,
      requestType: 'GENERAL',
      priority: 'MEDIUM',
      location: 'Unknown',
    };
  }
}
