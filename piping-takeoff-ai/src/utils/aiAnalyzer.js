// AI Takeoff Analysis using Anthropic Claude API
// Analyzes mechanical/piping drawings and generates material takeoffs

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'

const SYSTEM_PROMPT = `You are an expert mechanical estimator specializing in piping and HVAC systems. 
Your task is to analyze construction drawings, specifications, and mechanical plans to generate accurate material takeoffs.

You understand:
- Piping systems: Carbon steel, stainless steel, copper, PVC, CPVC, HDPE pipes
- Pipe sizes (1/4" through 24"+), schedules (SCH 40, 80, 160, XXS)
- Fittings: elbows, tees, reducers, flanges, couplings, unions, caps
- Valves: gate, globe, ball, butterfly, check, pressure relief
- Hangers & supports: pipe clamps, clevis, trapeze, rod, strut
- Insulation: pipe insulation types and thicknesses
- HVAC Equipment: AHUs, FCUs, VAV boxes, chillers, boilers, pumps, cooling towers
- HVAC Ductwork: rectangular, round, oval duct in LF
- Sheet metal fittings: elbows, tees, transitions, diffusers, registers
- Mechanical equipment: heat exchangers, expansion tanks, air separators

When analyzing documents, extract ALL mentions of:
1. Pipe runs with sizes, materials, and linear footage (LF)
2. Fittings quantities by type and size
3. Valves by type, size, and quantity
4. Equipment by type, model/tag, and quantity
5. Ductwork by type, size, gauge, and LF
6. Insulation by type, thickness, and LF or SF
7. Hangers and supports by type and quantity

ALWAYS respond with a valid JSON object in this exact format:
{
  "summary": "Brief description of the project scope",
  "projectType": "Mechanical/Piping/HVAC/Combined",
  "confidence": "High/Medium/Low",
  "notes": "Any important observations or assumptions",
  "lineItems": [
    {
      "id": "unique_id",
      "category": "Piping|Fittings|Valves|HVAC Equipment|Ductwork|Insulation|Hangers & Supports|Sheet Metal|Other",
      "description": "Full description of item",
      "size": "pipe size or equipment size",
      "material": "material type",
      "unit": "LF|EA|SF|LB|TON",
      "quantity": number,
      "notes": "additional notes"
    }
  ]
}`

export async function analyzeTakeoff(pdfText, apiKey, fileName) {
  if (!apiKey) {
    throw new Error('Anthropic API key is required. Add it in Settings.')
  }

  const userPrompt = `Analyze this mechanical/piping construction document and generate a complete material takeoff.

File: ${fileName}

Document Content:
${pdfText.substring(0, 15000)} ${pdfText.length > 15000 ? '\n[...document truncated for length...]' : ''}

Generate a comprehensive mechanical material takeoff from this document. 
Include ALL piping linear footage (LF), fittings, valves, HVAC equipment, ductwork, insulation, and supports found.
If the document doesn't appear to be a mechanical drawing, still extract any relevant mechanical/piping items mentioned.
Respond ONLY with the JSON object, no other text.`

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-calls': 'true'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: userPrompt }
      ]
    })
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || `API error: ${response.status}`)
  }

  const data = await response.json()
  const content = data.content[0]?.text || ''

  try {
    // Strip any markdown fences if present
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)
    return parsed
  } catch {
    throw new Error('AI returned invalid response format. Please try again.')
  }
}

// Re-analyze with additional context or corrections
export async function refineTakeoff(originalText, userFeedback, existingItems, apiKey) {
  if (!apiKey) throw new Error('API key required')

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-calls': 'true'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Original document excerpt:\n${originalText.substring(0, 8000)}`
        },
        {
          role: 'assistant',
          content: JSON.stringify({ lineItems: existingItems })
        },
        {
          role: 'user',
          content: `Please revise the takeoff based on this feedback: ${userFeedback}\n\nReturn the complete updated JSON.`
        }
      ]
    })
  })

  if (!response.ok) throw new Error(`API error: ${response.status}`)
  const data = await response.json()
  const content = data.content[0]?.text || ''
  const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(cleaned)
}
