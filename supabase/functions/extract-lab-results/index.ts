import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ExtractedData {
  copper?: number;
  humidity?: number;
  gold?: number;
  silver?: number;
  [key: string]: number | undefined;
}

async function extractTextWithOpenAI(imageBase64: string, mimeType: string): Promise<ExtractedData> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured. Please add OPENAI_API_KEY to your edge function secrets.');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this lab results document and extract the following metal assay values. Return ONLY a JSON object with the extracted numeric values (no units, just numbers). Look for these fields:
- copper (Cu, copper percentage or grade)
- humidity (moisture content, H2O, humidity percentage)
- gold (Au, gold content in g/t, ppm, or oz/t)
- silver (Ag, silver content in g/t, ppm, or oz/t)

If a value is not found, omit it from the response. Return only valid JSON with no additional text.
Example response: {"copper": 2.5, "humidity": 8.2, "gold": 1.3, "silver": 45.6}`
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const result = await response.json();
  const content = result.choices[0]?.message?.content;

  if (!content) {
    throw new Error('No response from OpenAI');
  }

  try {
    const jsonMatch = content.match(/\{[^}]+\}/);
    if (jsonMatch) {
      const extractedData = JSON.parse(jsonMatch[0]);
      return extractedData;
    }
    return JSON.parse(content);
  } catch (e) {
    console.error('Failed to parse OpenAI response:', content);
    throw new Error('Failed to parse extracted data');
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid file type. Please upload a JPG, PNG, or PDF file.' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.slice(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }
    const base64 = btoa(binary);

    let extractedData: ExtractedData;

    if (file.type === 'application/pdf') {
      extractedData = await extractTextWithOpenAI(base64, file.type);
    } else {
      extractedData = await extractTextWithOpenAI(base64, file.type);
    }

    return new Response(
      JSON.stringify({
        success: true,
        extractedData,
        fileName: file.name,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error processing document:', error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to process document',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
